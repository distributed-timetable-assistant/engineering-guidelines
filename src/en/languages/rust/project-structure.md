# Rust project structure — `rust-project-structure.md`

Below is a recommended repository layout for a Rust service that follows **Clean Architecture** principles and a **functional-programming-friendly** style.
After the tree I describe the purpose and accepted contents of each entry so maintainers and contributors know what belongs where.

```
/                                 # repo root
├── .github/                      # CI/CD pipelines
│   └── workflows/
│       ├── common.yml
│       ├── feature.yml
│       ├── dev.yml
│       ├── master.yml
│       └── release.yml
│
├── docker/                       # Docker build context (multi-stage, test images, compose helpers)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
├── proto/                        # Shared gRPC contracts (.proto files)
│   ├── student.proto
│   ├── instructor.proto
│   └── common.proto
│
├── config/                       # Environment-specific configuration
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-stage.yml
│   └── application-prod.yml
│
├── scripts/                      # Dev & Ops helper scripts (migrate, seed, local-run)
│   ├── migrate.sh
│   ├── seed.sh
│   ├── local-run.sh
│   └── README.md
│
├── migrations/                   # SQL migrations (for sqlx / refinery)
│   ├── 0001_init.sql
│   ├── 0002_add_instructor_table.sql
│   └── README.md
│
├── src/
│   ├── main.rs                   # Bootstrap entry: load config, init telemetry, start runtime
│   │
│   ├── bin/                      # Optional binaries (e.g., worker, migrate, consumer)
│   │   ├── migrate.rs
│   │   └── consumer.rs
│   │
│   ├── core/                     # ❖ Domain & Use Cases — pure, testable, framework-free
│   │   ├── domain/               # Entities, ValueObjects, domain errors, domain events
│   │   │   ├── student.rs
│   │   │   ├── instructor.rs
│   │   │   ├── errors.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── ports/                # Abstract traits (repositories, message brokers, cache)
│   │   │   ├── student_repository.rs
│   │   │   ├── instructor_repository.rs
│   │   │   ├── message_broker.rs
│   │   │   └── mod.rs
│   │   │
│   │   └── usecases/             # Application layer orchestration
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
│   ├── adapters/                 # ❖ Adapters — implementing external boundaries (infra)
│   │   ├── http/                 # Axum controllers + route definitions
│   │   │   ├── routes.rs
│   │   │   └── handlers/
│   │   │       ├── student_handler.rs
│   │   │       ├── instructor_handler.rs
│   │   │       └── mod.rs
│   │   │
│   │   ├── grpc/                 # tonic server + client implementations
│   │   │   ├── student_grpc.rs
│   │   │   ├── instructor_grpc.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── persistence/          # SQLx repositories (Postgres)
│   │   │   ├── student_repository.rs
│   │   │   ├── instructor_repository.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── kafka/                # rdkafka producers & consumers
│   │   │   ├── producer.rs
│   │   │   ├── consumer.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── cache/                # Redis adapters (deadpool-redis)
│   │   │   ├── redis_cache.rs
│   │   │   └── mod.rs
│   │   │
│   │   ├── auth/                 # JWT / OIDC middleware
│   │   │   ├── jwt.rs
│   │   │   └── mod.rs
│   │   │
│   │   └── external/             # third-party HTTP/gRPC integrations
│   │       ├── payment_service.rs
│   │       ├── logging_service.rs
│   │       └── mod.rs
│   │
│   ├── infrastructure/           # ❖ Composition root: wiring + builders + runtime setup
│   │   ├── bootstrap.rs          # app startup orchestration
│   │   ├── config/               # config loader using `config` crate (YAML + env)
│   │   │   ├── loader.rs
│   │   │   └── mod.rs
│   │   ├── db.rs                 # Postgres connection builder
│   │   ├── cache.rs              # Redis pool builder
│   │   ├── kafka.rs              # Kafka setup
│   │   ├── server/               # Axum + Tonic server builders
│   │   │   ├── http_server.rs
│   │   │   ├── grpc_server.rs
│   │   │   └── mod.rs
│   │   ├── telemetry/            # tracing, otel, prometheus exporters
│   │   │   ├── tracing.rs
│   │   │   ├── metrics.rs
│   │   │   └── mod.rs
│   │   └── mod.rs
│   │
│   ├── shared/                   # Common utils shared across layers (pure helpers)
│   │   ├── error.rs              # unified AppError type
│   │   ├── json.rs               # serde/json helpers
│   │   ├── time.rs               # chrono/date helpers
│   │   └── result.rs             # functional Result combinators / error adapters
│   │
│   ├── tests/                    # Integration & E2E tests
│   │   ├── integration/
│   │   │   ├── db_integration_test.rs
│   │   │   ├── kafka_integration_test.rs
│   │   │   └── mod.rs
│   │   └── e2e/
│   │       ├── user_flow_test.rs
│   │       └── mod.rs
│   │
│   └── lib.rs                    # Optional if the service exposes internal lib functions
│
├── Cargo.toml
└── README.md
```