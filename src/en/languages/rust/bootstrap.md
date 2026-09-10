# Rust Service Bootstrap

All DiTA Rust backend services must follow a standardized bootstrap pattern.

The application entry point must remain minimal. Service initialization, command-line parsing, configuration loading, application state construction, router initialization, and server startup must be orchestrated by the infrastructure bootstrap layer.

## Architecture

The bootstrap flow must follow this structure:

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

The responsibilities of these modules are:

| Module                        | Responsibility                                |
| ----------------------------- | --------------------------------------------- |
| `main.rs`                     | Application entry point                       |
| `infrastructure/bootstrap.rs` | Application bootstrap orchestration           |
| `infrastructure/cli.rs`       | Command-line interface definition and parsing |
| `shared/config.rs`            | Application configuration model               |
| `shared/state.rs`             | Shared application state                      |

## Application Entry Point

`main.rs` must contain only the minimal application entry point and delegate startup to the bootstrap layer.

```rust
async fn main() -> AppResult<()> {
    bootstrap::start().await
}
```

Business logic, configuration parsing, router construction, or infrastructure initialization must not be implemented directly in `main.rs`.

## Command-Line Interface

Application bootstrap configuration must be initiated through a command-line interface implemented with [`clap`](https://docs.rs/clap).

The CLI definition must reside under the infrastructure layer:

```text
src/
└── infrastructure/
    └── cli.rs
```

The CLI must use `clap::Parser`:

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

`Cli::parse()` must be the entry point for command-line argument parsing during bootstrap.

Services may expose additional command-line arguments as required by their responsibilities, but CLI options must remain limited to application startup and operational concerns.

## Configuration Loading

The parsed CLI arguments must be used to determine the configuration source.

Configuration loading must remain separate from the CLI definition and must use the project's standardized configuration-loading mechanism.

The configuration model must be defined independently:

```rust
use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Clone, Debug, Deserialize)]
pub struct Config {
    pub listen_addr: SocketAddr,

    // ...
}
```

The bootstrap layer is responsible for connecting the CLI configuration path to the configuration loader:

```rust
let cli = Cli::parse();
let conf_path = cli.config;
let config: Config = config_loader::load(&conf_path);
```

The configuration model must not depend on `clap`, and the CLI model must not contain application runtime state.

## Bootstrap Orchestration

All service startup operations must be orchestrated by `infrastructure/bootstrap.rs`.

The bootstrap function must perform initialization in a defined sequence:

1. Parse command-line arguments.
2. Load application configuration.
3. Initialize application state.
4. Initialize application components and infrastructure dependencies.
5. Construct the router and middleware.
6. Bind the server listener.
7. Start the HTTP server.

A typical implementation is:

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

The bootstrap function is responsible for orchestration only. It must not become a container for business logic or domain-specific application behavior.

## Shared Application State

Application-wide runtime state must be represented by `AppState` and defined separately from the bootstrap implementation:

```text
src/
└── shared/
    └── state.rs
```

Example:

```rust
pub struct AppState {
    pub config: Config,

    // ...
}
```

The bootstrap layer constructs the initial `AppState` and provides it to the application components that require shared state.

`AppState` must contain runtime dependencies and shared application data, not command-line parsing concerns.

## Dependency Boundaries

The following boundaries must be maintained:

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

The CLI, configuration model, and application state have distinct responsibilities:

* `cli.rs` defines how startup parameters are provided.
* `config.rs` defines the application's runtime configuration.
* `state.rs` defines shared runtime state.
* `bootstrap.rs` connects these components and starts the service.

## HTTP Server Startup

HTTP server construction and startup must be performed by the bootstrap layer.

For Axum-based services:

```rust
let listener = tokio::net::TcpListener::bind(&config.listen_addr).await?;
axum::serve(listener, app).await?;
```

The listener address must originate from application configuration rather than being hard-coded in the bootstrap implementation.

## Bootstrap Errors

Bootstrap failures must be propagated through the service's standard application result type:

```rust
pub async fn start() -> AppResult<()> {
    // ...
}
```

Errors encountered while loading configuration, constructing infrastructure, binding the listener, or starting the server must not be silently ignored.

## Design Rules

All DiTA Rust backend services must follow these rules:

* `main.rs` must remain a thin entry point.
* `clap` must be used for command-line parsing.
* CLI definitions must reside in `infrastructure/cli.rs`.
* Bootstrap orchestration must reside in `infrastructure/bootstrap.rs`.
* Runtime configuration must be represented by a dedicated `Config` type.
* Shared runtime dependencies must be represented by `AppState`.
* Configuration loading must remain separate from CLI parsing.
* Business logic must not be implemented in the bootstrap layer.
* Server addresses and other runtime parameters must come from configuration rather than hard-coded values.
* Bootstrap failures must be propagated through the service's standard error handling mechanism.

This pattern provides a consistent startup contract across all DiTA Rust backend services while keeping the application entry point, CLI, configuration, state management, and infrastructure initialization clearly separated.
