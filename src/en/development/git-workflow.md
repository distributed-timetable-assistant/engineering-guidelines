# Git Workflow

This section outlines our Git workflow, integrating branching, committing, and issue management.

1.  **Branching**: Create a new branch for each task. See [Branching Strategy](./branching-strategy.md).
2.  **Committing**: Write clear, conventional commit messages. See [Commit Guidelines](./commit-guidelines.md).
3.  **Issues**: Link your work to specific issues. See [Issue Management](./issue-management.md).
4.  **ADRs**: Reference architectural decisions if applicable. See [ADR Linking](./adr-linking.md).

## Workflow Steps

1.  Pick an issue (or create one).
2.  Create a branch from `dev` (for new features) or `master` (for incident fixes).
3.  Implement changes.
4.  Commit changes following the [Commit Guidelines](./commit-guidelines.md).
5.  Push branch and open a Pull Request.
6.  Ensure CI checks (including `commitlint`) pass.
