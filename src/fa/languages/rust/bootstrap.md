# راه‌اندازی سرویس Rust

تمام سرویس‌های بک‌اند Rust در DiTA باید از یک الگوی استاندارد برای راه‌اندازی (Bootstrap) پیروی کنند.

نقطه‌ی ورود برنامه باید حداقلی باقی بماند. مقداردهی اولیه‌ی سرویس، پردازش خط فرمان، بارگذاری تنظیمات، ساخت وضعیت برنامه، مقداردهی اولیه‌ی Router و راه‌اندازی سرور باید توسط لایه‌ی Bootstrap در لایه‌ی زیرساخت (Infrastructure) مدیریت و هماهنگ شوند.

## معماری

جریان Bootstrap باید از ساختار زیر پیروی کند:

```text
src/
├── main.rs
├── infrastructure/
│   ├── bootstrap.rs
│   └── cli.rs
└── shared/
    ├── config.rs
    └── state.rs
```

مسئولیت این ماژول‌ها به شرح زیر است:

| ماژول                         | مسئولیت                             |
| ----------------------------- | ----------------------------------- |
| `main.rs`                     | نقطه‌ی ورود برنامه                  |
| `infrastructure/bootstrap.rs` | هماهنگ‌سازی فرایند Bootstrap برنامه |
| `infrastructure/cli.rs`       | تعریف و پردازش رابط خط فرمان        |
| `shared/config.rs`            | مدل تنظیمات برنامه                  |
| `shared/state.rs`             | وضعیت مشترک برنامه                  |

## نقطه‌ی ورود برنامه

فایل `main.rs` باید تنها شامل حداقل کد موردنیاز برای نقطه‌ی ورود برنامه باشد و فرایند راه‌اندازی را به لایه‌ی Bootstrap واگذار کند.

```rust
async fn main() -> AppResult<()> {
    bootstrap::start().await
}
```

منطق کسب‌وکار، پردازش تنظیمات، ساخت Router یا مقداردهی اولیه‌ی زیرساخت نباید مستقیماً در `main.rs` پیاده‌سازی شود.

## رابط خط فرمان

تنظیمات مربوط به Bootstrap برنامه باید از طریق یک رابط خط فرمان که با استفاده از [`clap`](https://docs.rs/clap) پیاده‌سازی شده است، انجام شود.

تعریف CLI باید در لایه‌ی زیرساخت قرار داشته باشد:

```text
src/
└── infrastructure/
    └── cli.rs
```

CLI باید از `clap::Parser` استفاده کند:

```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "<app name>")]
#[command(about = "<App Description>", long_about = None)]
pub struct Cli {
    #[arg(short, long, global = true)]
    pub config: Option<String>,

    // ...
}
```

در فرایند Bootstrap، `Cli::parse()` باید نقطه‌ی ورود پردازش آرگومان‌های خط فرمان باشد.

سرویس‌ها می‌توانند متناسب با مسئولیت خود آرگومان‌های خط فرمان دیگری نیز ارائه کنند، اما گزینه‌های CLI باید صرفاً به راه‌اندازی و ملاحظات عملیاتی برنامه محدود باشند.

## بارگذاری تنظیمات

آرگومان‌های پردازش‌شده‌ی CLI باید برای تعیین منبع تنظیمات برنامه استفاده شوند.

بارگذاری تنظیمات باید از تعریف CLI مستقل باشد و از سازوکار استاندارد بارگذاری تنظیمات پروژه استفاده کند.

مدل تنظیمات باید به‌صورت مستقل تعریف شود:

```rust
use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    pub listen_addr: SocketAddr,

    // ...
}
```

لایه‌ی Bootstrap مسئول اتصال مسیر تنظیمات دریافت‌شده از CLI به Configuration Loader است:

```rust
let cli = Cli::parse();
let conf_path = cli.config;
let config: Config = config_loader::load(&conf_path);
```

مدل تنظیمات نباید به `clap` وابسته باشد و مدل CLI نیز نباید شامل وضعیت Runtime برنامه باشد.

## هماهنگ‌سازی Bootstrap

تمام عملیات مربوط به راه‌اندازی سرویس باید توسط `infrastructure/bootstrap.rs` هماهنگ شوند.

تابع Bootstrap باید مقداردهی اولیه را با ترتیب مشخص زیر انجام دهد:

1. پردازش آرگومان‌های خط فرمان.
2. بارگذاری تنظیمات برنامه.
3. ایجاد وضعیت برنامه.
4. مقداردهی اولیه‌ی اجزای برنامه و وابستگی‌های زیرساختی.
5. ساخت Router و Middlewareها.
6. Bind کردن Listener سرور.
7. راه‌اندازی سرور HTTP.

یک پیاده‌سازی معمول به شکل زیر است:

```rust
pub async fn start() -> AppResult<()> {
    telemetry::init();
    info!("Starting <service name>...");

    let cli = Cli::parse();
    let conf_path = cli.config;
    let config: Config = config_loader::load(&conf_path);

    let state = AppState {
        config: config.clone(),
        // ...
    };

    let app = router()
        .with_state(Arc::new(state))
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&config.listen_addr).await?;

    info!(
        "Listening -> SUCCESS: listen_addr=({})",
        config.listen_addr
    );

    axum::serve(listener, app).await?;

    info!(
        "Axum Serve -> SUCCESS: listen_addr=({})",
        config.listen_addr
    );

    Ok(())
}
```

وظیفه‌ی تابع Bootstrap صرفاً هماهنگ‌سازی این مراحل است. این تابع نباید به محلی برای قرار دادن منطق کسب‌وکار یا رفتارهای اختصاصی دامنه‌ی برنامه تبدیل شود.

## وضعیت مشترک برنامه

وضعیت Runtime سراسری برنامه باید توسط `AppState` نمایش داده شود و به‌صورت جداگانه از پیاده‌سازی Bootstrap تعریف شود:

```text
src/
└── shared/
    └── state.rs
```

نمونه:

```rust
pub struct AppState {
    pub config: Config,

    // ...
}
```

لایه‌ی Bootstrap وضعیت اولیه‌ی `AppState` را ایجاد کرده و آن را در اختیار اجزای برنامه‌ای که به وضعیت مشترک نیاز دارند قرار می‌دهد.

`AppState` باید شامل وابستگی‌های Runtime و داده‌های مشترک برنامه باشد و نباید شامل دغدغه‌های مربوط به پردازش خط فرمان باشد.

## مرزهای وابستگی

مرزهای زیر باید حفظ شوند:

```text
main.rs
   │
   ▼
bootstrap.rs
   │
   ├──► cli.rs
   ├──► config_loader
   ├──► Config
   ├──► AppState
   └──► application infrastructure
```

CLI، مدل تنظیمات و وضعیت برنامه هرکدام مسئولیت مستقلی دارند:

* `cli.rs` نحوه‌ی ارائه‌ی پارامترهای راه‌اندازی را تعریف می‌کند.
* `config.rs` تنظیمات Runtime برنامه را تعریف می‌کند.
* `state.rs` وضعیت Runtime مشترک برنامه را تعریف می‌کند.
* `bootstrap.rs` این اجزا را به یکدیگر متصل کرده و سرویس را راه‌اندازی می‌کند.

## راه‌اندازی سرور HTTP

ساخت و راه‌اندازی سرور HTTP باید توسط لایه‌ی Bootstrap انجام شود.

برای سرویس‌های مبتنی بر Axum:

```rust
let listener = tokio::net::TcpListener::bind(&config.listen_addr).await?;
axum::serve(listener, app).await?;
```

آدرس Listener باید از تنظیمات برنامه تأمین شود و نباید به‌صورت Hard-coded در پیاده‌سازی Bootstrap قرار گیرد.

## خطاهای Bootstrap

خطاهای مربوط به Bootstrap باید از طریق نوع استاندارد نتیجه‌ی برنامه‌ی سرویس منتقل شوند:

```rust
pub async fn start() -> AppResult<()> {
    // ...
}
```

خطاهایی که هنگام بارگذاری تنظیمات، ساخت زیرساخت، Bind کردن Listener یا راه‌اندازی سرور رخ می‌دهند نباید نادیده گرفته شوند.

## قوانین طراحی

تمام سرویس‌های بک‌اند Rust در DiTA باید از قوانین زیر پیروی کنند:

* `main.rs` باید یک نقطه‌ی ورود حداقلی و نازک (Thin Entry Point) باقی بماند.
* برای پردازش آرگومان‌های خط فرمان باید از `clap` استفاده شود.
* تعریف CLI باید در `infrastructure/cli.rs` قرار داشته باشد.
* هماهنگ‌سازی Bootstrap باید در `infrastructure/bootstrap.rs` قرار داشته باشد.
* تنظیمات Runtime باید توسط یک نوع مستقل به نام `Config` نمایش داده شوند.
* وابستگی‌های Runtime مشترک باید توسط `AppState` نمایش داده شوند.
* بارگذاری تنظیمات باید از پردازش CLI مستقل باقی بماند.
* منطق کسب‌وکار نباید در لایه‌ی Bootstrap پیاده‌سازی شود.
* آدرس سرور و سایر پارامترهای Runtime باید از تنظیمات برنامه تأمین شوند و نباید Hard-coded باشند.
* خطاهای Bootstrap باید از طریق سازوکار استاندارد مدیریت خطای سرویس منتقل شوند.

این الگو یک قرارداد یکسان برای راه‌اندازی تمام سرویس‌های بک‌اند Rust در DiTA فراهم می‌کند و در عین حال نقطه‌ی ورود برنامه، CLI، تنظیمات، مدیریت State و مقداردهی اولیه‌ی زیرساخت را از یکدیگر به‌صورت شفاف جدا نگه می‌دارد.
