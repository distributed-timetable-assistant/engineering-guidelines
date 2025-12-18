# Branching Strategy

We use a strategy allowing for parallel development using short-lived branches. The repository has two persistent branches: `main` and `dev`.

## Core Branches

-   **main**: The production-ready state. Contains stable code.
-   **dev**: The main development branch. All new features are merged here first.

## Branch Naming & Strategy

### Feature Branches
Used for adding new functionality.

-   **Source Branch**: `dev`
-   **Naming Convention**: Must include the issue number.
-   **Format**: `feat/issue-<number>/<short-description>`
-   **Example**: `feat/issue-42/add-login-page`

### Bug Fix Branches
Used for fixing critical bugs or incidents in production.

-   **Source Branch**: `main` (preferred for hotfixes/incidents)
-   **Naming Convention**: Must include the incident number.
-   **Format**: `fix/incident-<number>/<short-description>`
-   **Example**: `fix/incident-808/resolve-memory-leak`

### Other Branches
For documentation, refactoring, or chores.

-   **Source Branch**: `dev` (usually)
-   **Format**: `type/<scope>/<short-description>` or `type/issue-<number>/<short-description>`
-   **Example**: `docs/readme/update-setup`

_Branches should be deleted after merging._
