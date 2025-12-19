# Architecture Decision Records (ADRs)

Architecture Decision Records (ADRs) are short text documents that capture an important architectural decision made along with its context and consequences. We use ADRs to keep track of the history of our decisions and the reasoning behind them.

## File Location

All ADRs must be placed in the [doc](https://github.com/distributed-timetable-assistant/doc/tree/master/src/en/architecture/adr/) project.

## Naming Convention

ADR files should be named using a sequential number and a short descriptive title, separated by a hyphen. The format is `NNNNNN-title-of-the-decision.md`.

Example: `000001-record-architecture-decisions.md`

## Statuses

An ADR can have one of the following statuses:

- **Proposed**: The decision is being discussed and has not yet been agreed upon.
- **Accepted**: The decision has been agreed upon and should be implemented.
- **Rejected**: The decision was proposed and discussed but was not accepted. The record is kept for historical context.
- **Deprecated**: The decision was accepted in the past but is no longer applicable or recommended.
- **Superseded**: The decision has been replaced by a newer decision. The new ADR should reference the superseded one.

## Template

Use the following template for new ADRs:

```markdown
# NNNNNN. Title of the Decision

Date: YYYY-MM-DD

## Status

[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.
```

## How to Submit

1.  Create a new branch for your ADR.
2.  Add the new ADR file in [doc](https://github.com/distributed-timetable-assistant/doc/tree/master/src/en/adr/) project.
3.  Ensure the file name uses the next available number.
4.  Submit a Pull Request for review.
