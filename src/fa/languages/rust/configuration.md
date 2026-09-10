# پیکربندی سرویس‌های Rust

تمام سرویس‌های بک‌اند Rust در DiTA باید از این الگوی بارگذاری پیکربندی پیروی کنند.

پیاده‌سازی بارگذاری پیکربندی باید در لایه‌ی Infrastructure قرار داشته باشد:

```text
src/
└── infrastructure/
    └── config_loader.rs
```

پیاده‌سازی باید برای منابع پیکربندی از crate‌ی [`config`](https://docs.rs/config) و برای deserialization تایپ‌شده از `serde` استفاده کند.

## پیکربندی پیش‌فرض

پیکربندی پیش‌فرض باید با استفاده از `include_str!` درون باینری قرار گیرد:

```rust
static DEFAULT_YAML: &str = include_str!("../../config.yaml");
```

این پیکربندی باید به‌عنوان اولین منبع پیکربندی ثبت شود:

```rust
Config::builder()
    .add_source(File::from_str(DEFAULT_YAML, FileFormat::Yaml))
```

بنابراین وجود فایل پیکربندی پیش‌فرض در زمان اجرا الزامی نیست.

## فایل‌های پیکربندی

فایل‌های پیکربندی پس از پیکربندی پیش‌فرض داخلی بارگذاری می‌شوند.

محیط اجرا از طریق `APP_ENV` تعیین می‌شود:

```rust
let env = env::var("APP_ENV").unwrap_or_else(|_| "dev".into());
```

اگر مسیر پیکربندی به‌صورت صریح مشخص نشده باشد، loader باید مسیرهای زیر را به‌ترتیب بررسی کند:

```text
./config.yml
./config-{APP_ENV}.yml
/etc/{application-name}/config.yml
```

نام application باید از Cargo دریافت شود:

```rust
let app_name = env!("CARGO_PKG_NAME");
```

مسیرهای پیش‌فرض اختیاری هستند:

```rust
File::from(path.to_path_buf()).required(false)
```

مسیر پیکربندی که به‌صورت صریح مشخص شده است باید الزامی باشد:

```rust
File::from(path.to_path_buf()).required(true)
```

## متغیرهای محیطی

متغیرهای محیطی باید پس از تمام فایل‌های پیکربندی بارگذاری شوند:

```rust
.add_source(
    Environment::with_prefix("APP")
        .separator("__")
)
```

پیشوند `APP` برای تمام سرویس‌ها یکسان است.

فیلدهای تو‌در‌تو در پیکربندی باید با استفاده از `__` از یکدیگر جدا شوند. برای مثال:

```text
APP_DATABASE__HOST=localhost
APP_DATABASE__PORT=5432
```

معادل پیکربندی زیر است:

```yaml
database:
  host: localhost
  port: 5432
```

از آنجا که متغیرهای محیطی در آخر اضافه می‌شوند، بالاترین اولویت را دارند.

اولویت منابع پیکربندی به این ترتیب است:

```text
پیکربندی پیش‌فرض داخلی
        ↓
فایل‌های پیکربندی
        ↓
متغیرهای محیطی
```

## پیکربندی تایپ‌شده

پیکربندی نهایی باید در یک type اختصاصی سرویس deserialize شود:

```rust
#[derive(Debug, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
}
```

loader باید از یک رابط generic برای deserialization استفاده کند:

```rust
pub fn load<C>(conf_path: &Option<String>) -> C
where
    C: DeserializeOwned + Debug,
```

کدهای Application و Domain باید از پیکربندی تایپ‌شده‌ی حاصل استفاده کنند و مستقیماً متغیرهای محیطی را نخوانند.

## مدیریت خطا

بارگذاری و deserialization پیکربندی باید به‌صورت fail-fast انجام شود.

loader باید قبل از خاتمه‌ی سرویس، خطاها را با استفاده از `tracing` ثبت کند:

```rust
.inspect_err(|error| {
    error!("Config Load -> FAILED: error=({})", error)
})
.unwrap()
```

و:

```rust
.inspect_err(|error| {
    error!("Config Deserialize -> FAILED: error=({})", error)
})
.unwrap();
```

سرویس نباید با پیکربندی نامعتبر یا ناقص اجرا شود.

## Logging

بارگذاری موفق پیکربندی باید ثبت شود:

```rust
info!(
    "Config Load -> SUCCESS: [path, required]=({:?}), config=({:?})",
    conf_paths, config
);
```

اگر نمایش `Debug` پیکربندی می‌تواند اطلاعات محرمانه‌ای مانند password، token، API key یا private key را آشکار کند، مقادیر پیکربندی نباید log شوند.

## پیاده‌سازی

loader پیکربندی باید از الگوی پیاده‌سازی زیر پیروی کند:

```rust
use config::{Config, Environment, File, FileFormat};
use serde::de::DeserializeOwned;
use std::env;
use std::fmt::Debug;
use std::path::PathBuf;
use tracing::{error, info};

static DEFAULT_YAML: &str = include_str!("../../config.yaml");

pub fn load<C>(conf_path: &Option<String>) -> C
where
    C: DeserializeOwned + Debug,
{
    let conf_paths = get_config_paths(conf_path);

    let config = conf_paths
        .iter()
        .map(|(path, required)| File::from(path.to_path_buf()).required(required.clone()))
        .fold(
            Config::builder().add_source(File::from_str(DEFAULT_YAML, FileFormat::Yaml)),
            |builder, file| builder.add_source(file),
        )
        .add_source(Environment::with_prefix("APP").separator("__"))
        .build()
        .inspect_err(|error| error!("Config Load -> FAILED: error=({})", error))
        .unwrap()
        .try_deserialize()
        .inspect_err(|error| error!("Config Deserialize -> FAILED: error=({})", error))
        .unwrap();

    info!(
        "Config Load -> SUCCESS: [path, required]=({:?}), config=({:?})",
        conf_paths, config
    );

    config
}

fn get_config_paths(conf_path: &Option<String>) -> Vec<(PathBuf, bool)> {
    let env = env::var("APP_ENV").unwrap_or_else(|_| "dev".into());

    let cwd = env::current_dir()
        .inspect_err(|error| {
            error!("Get Current Working Directory -> FAILED. error=({})", error)
        })
        .unwrap();

    let app_name = env!("CARGO_PKG_NAME");

    match conf_path {
        None => vec![
            (cwd.join("config.yml"), false),
            (cwd.join(format!("config-{}.yml", env)), false),
            (cwd.join(format!("/etc/{}/config.yml", app_name)), false),
        ],
        Some(path) => vec![(cwd.join(path), true)],
    }
}
```

این الگوی پیاده‌سازی باید در تمام سرویس‌های بک‌اند Rust به‌صورت یکسان استفاده شود.
