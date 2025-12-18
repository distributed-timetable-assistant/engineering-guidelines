# Rust Engineering Guidelines

This section details the standards and best practices for Rust development at Dita. Our goal is to leverage Rust's safety guarantees while maintaining readable and maintainable code.

## Core Principles

1.  **Safety First**: Avoid `unsafe` code unless absolutely necessary and strictly isolated/documented.
2.  **Idiomatic Rust**: Follow standard conventions. If "fighting the borrow checker", reconsider the design.
3.  **Documentation**: All public APIs must be documented.

## Tooling

*   **Formatter**: We use `rustfmt` with the standard configuration.
*   **Linter**: We use `clippy`. CI pipelines should fail on clippy warnings.

## Topics

*   [Project Structure](./structure.md) (To be added)
*   [Error Handling](./error-handling.md) (To be added)
*   [Testing](./testing.md) (To be added)
*   [Async/Await](./async.md) (To be added)
