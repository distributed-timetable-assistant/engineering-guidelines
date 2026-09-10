# Rust Service Configuration

All DiTA Rust backend services must follow this configuration loading pattern.

Configuration loading must be implemented under the infrastructure layer:

```text
src/
└── infrastructure/
    └── config_loader.rs
```

The implementation must use the [`config`](https://docs.rs/config) crate for configuration sources and `serde` for typed deserialization.

## Default Configuration

The default configuration must be embedded into the binary using `include_str!`:

```rust
static DEFAULT_YAML: &str = include_str!("../../config.yaml");
```

It must be registered as the first configuration source:

```rust
Config::builder()
    .add_source(File::from_str(DEFAULT_YAML, FileFormat::Yaml))
```

The default configuration therefore does not depend on the presence of the file at runtime.

## Configuration Files

Configuration files are loaded after the embedded defaults.

The environment is determined by `APP_ENV`:

```rust
let env = env::var("APP_ENV").unwrap_or_else(|_| "dev".into());
```

If no explicit configuration path is provided, the loader must consider these paths in order:

```text
./config.yml
./config-{APP_ENV}.yml
/etc/{application-name}/config.yml
```

The application name must be obtained from Cargo:

```rust
let app_name = env!("CARGO_PKG_NAME");
```

The default paths are optional:

```rust
File::from(path.to_path_buf()).required(false)
```

An explicitly provided configuration path must be required:

```rust
File::from(path.to_path_buf()).required(true)
```

## Environment Variables

Environment variables must be loaded after all configuration files:

```rust
.add_source(
    Environment::with_prefix("APP")
        .separator("__")
)
```

The `APP` prefix is common to all services.

Nested configuration fields must use `__` as the separator. For example:

```text
APP_DATABASE__HOST=localhost
APP_DATABASE__PORT=5432
```

corresponds to:

```yaml
database:
  host: localhost
  port: 5432
```

Because environment variables are added last, they have the highest precedence.

The resulting precedence is:

```text
Embedded defaults
        ↓
Configuration files
        ↓
Environment variables
```

## Typed Configuration

The final configuration must be deserialized into a service-specific type:

```rust
#[derive(Debug, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
}
```

The loader must use a generic deserialization interface:

```rust
pub fn load<C>(conf_path: &Option<String>) -> C
where
    C: DeserializeOwned + Debug,
```

Application and domain code must use the resulting typed configuration rather than reading environment variables directly.

## Error Handling

Configuration loading and deserialization must fail fast.

The loader must log failures using `tracing` before terminating:

```rust
.inspect_err(|error| {
    error!("Config Load -> FAILED: error=({})", error)
})
.unwrap()
```

and:

```rust
.inspect_err(|error| {
    error!("Config Deserialize -> FAILED: error=({})", error)
})
.unwrap();
```

A service must not start with an invalid or incomplete configuration.

## Logging

Successful configuration loading should be logged:

```rust
info!(
    "Config Load -> SUCCESS: [path, required]=({:?}), config=({:?})",
    conf_paths, config
);
```

Configuration values must not be logged if their `Debug` representation can expose secrets such as passwords, tokens, API keys, or private keys.

## Implementation

The configuration loader should follow this implementation pattern:

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

This implementation pattern must be used consistently across Rust backend services.
