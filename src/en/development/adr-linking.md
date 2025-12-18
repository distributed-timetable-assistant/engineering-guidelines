# ADR Linking

Architecture Decision Records (ADRs) explain the "why" behind significant changes. It is crucial to link code changes to the decisions that authorized them.

## Linking ADRs in Commits

If a commit implements a specific ADR, reference it in the footer of the commit message, similar to issues.

Format:
```text
ADR: <ADR-Number>
```

Example:
```text
feat(database): migrate to postgres

We are migrating to Postgres to support better transaction handling as decided.

Closes #45
ADR: 0012
```

## Linking ADRs in Issues/PRs

When opening an Issue or PR that relates to an architectural decision, include a link to the ADR file in the description.

Example:
> Implements [ADR-0012: Use Postgres](../architecture/decisions/0012-use-postgres.md)
