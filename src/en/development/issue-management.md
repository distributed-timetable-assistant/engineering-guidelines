# Issue Management

Properly linking Git activity to issues ensures a transparent history and automated workflow states.

## Linking in Commits

Reference issues in your commit footer.

### Closing Issues
To automatically close an issue when the commit is merged:
```text
Closes #123
```
Or for multiple issues:
```text
Closes #123, #245
```

### Referencing Issues
To simply reference an issue without closing it (e.g., "See also"):
```text
Refs #123
```

## Linking in Pull Requests

In the description of your Pull Request, you can also use keywords to link issues.
-   "Closes #123"
-   "Fixes #123"
-   "Resolves #123"

This creates a link in GitHub and automatically closes the issue when the PR is merged into the default branch.
