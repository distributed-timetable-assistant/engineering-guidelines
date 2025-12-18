# ساختار پروژه راست — `rust-project-structure.md`

در زیر یک طرح پیشنهادی مخزن برای سرویس‌های راست آورده شده است که از اصول **Clean Architecture** و سبک **برنامه‌نویسی تابعی** پیروی می‌کند.
بعد از ساختار درختی، هدف و محتوای پذیرفته‌شده هر بخش را شرح می‌دهم تا نگهداری‌کنندگان و مشارکت‌کنندگان بدانند هر چیزی به کجا تعلق دارد.

```
/                                 # ریشه مخزن
├── .github/                      # پایپ‌لاین‌های CI/CD
│   └── workflows/
│       ├── common.yml
│       ├── feature.yml
│       ├── dev.yml
│       ├── master.yml
│       └── release.yml
│
├── docker/                       # کانتکست ساخت داکر (چند مرحله‌ای، ایمیج‌های تست، کمک‌کننده‌های compose)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── proto/                        # قراردادهای مشترک gRPC (فایل‌های .proto)
│   ├── student.proto
│   ├── instructor.proto
│   └── common.proto
│
├── config/                       # پیکربندی مختص محیط
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-stage.yml
│   └── application-prod.yml
│
├── scripts/                      # اسکریپت‌های کمکی توسعه و عملیات (مهاجرت، سید، اجرای محلی)
│   ├── migrate.sh
│   ├── seed.sh
│   ├── local-run.sh
│   └── README.md
│
├── migrations/                   # مهاجرت‌های SQL (برای sqlx / refinery)
│   ├── 0001_init.sql
│   ├── 0002_add_instructor_table.sql
│   └── README.md
│
├── src/
│   ├── main.rs                   # نقطه ورود بوت‌استرپ: بارگذاری پیکربندی، راه‌اندازی تلمتری، شروع ران‌تایم
│   │
│   ├── bin/                      # باینری‌های اختیاری (مثلاً worker، migrate، consumer)
│   │   ├── migrate.rs
│   │   └── consumer.rs
│   │
│   ├── core/                     # ❖ دامین و موارد استفاده — خالص، قابل تست، بدون فریم‌ورک
│   │   ├── domain/               # موجودیت‌ها، ValueObjectها، خطاهای دامین، رویدادهای دامین
│   │   │   ├── student.rs
│   │   │   ├── instructor.rs
│   │   │   ├── errors.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── ports/                # تریت‌های انتزاعی (ریپازیتوری‌ها، مسیج بروکرها، کش)
│   │   │   ├── student_repository.rs
│   │   │   ├── instructor_repository.rs
│   │   │   ├── message_broker.rs
│   │   │   └── mod.rs
│   │   │
│   │   └── usecases/             # ارکستراسیون لایه اپلیکیشن
│   │       ├── enroll_student/
│   │       │   ├── command.rs
│   │       │   ├── query.rs
│   │       │   └── tests.rs
│   │       │
│   │       ├── assign_instructor/
│   │       │   ├── command.rs
│   │       │   ├── query.rs
│   │       │   └── tests.rs
│   │       │
│   │       └── mod.rs
│   │   
│   ├── adapters/                 # ❖ آداپتورها — پیاده‌سازی مرزهای خارجی (زیرساخت)
│   │   ├── http/                 # کنترلر‌های Axum + تعریف روت‌ها
│   │   │   ├── routes.rs
│   │   │   └── handlers/
│   │   │       ├── student_handler.rs
│   │   │       ├── instructor_handler.rs
│   │   │       └── mod.rs
│   │   │
│   │   ├── grpc/                 # پیاده‌سازی‌های سرور و کلاینت tonic
│   │   │   ├── student_grpc.rs
│   │   │   ├── instructor_grpc.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── persistence/          # ریپازیتوری‌های SQLx (پستگرس)
│   │   │   ├── student_repository.rs
│   │   │   ├── instructor_repository.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── kafka/                # تولیدکننده‌ها و مصرف‌کنندگان rdkafka
│   │   │   ├── producer.rs
│   │   │   ├── consumer.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── cache/                # آداپتورهای ردیس (deadpool-redis)
│   │   │   ├── redis_cache.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── auth/                 # میان‌افزار JWT / OIDC
│   │   │   ├── jwt.rs
│   │   │   └── mod.rs
│   │   │
│   │   └── external/             # یکپارچه‌سازی‌های HTTP/gRPC شخص ثالث
│   │       ├── payment_service.rs
│   │       ├── logging_service.rs
│   │       └── mod.rs
│   │   
│   ├── infrastructure/           # ❖ ریشه ترکیب: سیم‌کشی + سازنده‌ها + تنظیمات ران‌تایم
│   │   ├── bootstrap.rs          # ارکستراسیون شروع برنامه
│   │   ├── config/               # بارگذاری پیکربندی با استفاده از crate ِ config (YAML + متغیرهای محیطی)
│   │   │   ├── loader.rs
│   │   │   └── mod.rs
│   │   ├── db.rs                 # سازنده اتصال پستگرس
│   │   ├── cache.rs              # سازنده استخر ردیس
│   │   ├── kafka.rs              # تنظیمات کافکا
│   │   ├── server/               # سازنده‌های سرور Axum + Tonic
│   │   │   ├── http_server.rs
│   │   │   ├── grpc_server.rs
│   │   │   └── mod.rs
│   │   ├── telemetry/            # تریسینگ، otel، صادرکنندگان prometheus
│   │   │   ├── tracing.rs
│   │   │   ├── metrics.rs
│   │   │   └── mod.rs
│   │   └── mod.rs
│   │   
│   ├── shared/                   # ابزارهای رایج مشترک در لایه‌ها (کمک‌کننده‌های خالص)
│   │   ├── error.rs              # نوع خطای یکپارچه برنامه
│   │   ├── json.rs               # کمک‌کننده‌های serde/json
│   │   ├── time.rs               # کمک‌کننده‌های chrono/date
│   │   └── result.rs             # ترکیب‌کننده‌های Result تابعی / آداپتورهای خطا
│   │   
│   ├── tests/                    # تست‌های یکپارچه‌سازی و E2E
│   │   ├── integration/
│   │   │   ├── db_integration_test.rs
│   │   │   ├── kafka_integration_test.rs
│   │   │   └── mod.rs
│   │   └── e2e/
│   │       ├── user_flow_test.rs
│   │       └── mod.rs
│   │   
│   └── lib.rs                    # اختیاری اگر سرویس توابع کتابخانه داخلی را در معرض قرار دهد
│
├── Cargo.toml
└── README.md
```