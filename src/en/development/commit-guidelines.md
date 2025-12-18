# Commit Guidelines

High-quality commit messages are essential for maintaining a healthy codebase. They help new developers understand context, simplify debugging with `git blame`, and allow for automated changelog generation.

## Message Structure

A commit message consists of a **Header**, **Body**, and **Footer**.

```text
<type>(<scope>): <subject>

<body (optional, but recommended)>

<footer (optional)>
```

---

## 1. The Header

The header is mandatory and must be **50 characters or less**.

### Type
Must be one of the following:

| Type         | Description                                                   | SemVer Impication |
|:-------------|:--------------------------------------------------------------|:------------------|
| **feat**     | A new feature                                                 | `MINOR`           |
| **fix**      | A bug fix                                                     | `PATCH`           |
| **docs**     | Documentation changes                                         | `PATCH`           |
| **style**    | Formatting, missing semi-colons, white-space (no code change) | `PATCH`           |
| **refactor** | Code change that neither fixes a bug nor adds a feature       | `PATCH`           |
| **perf**     | A code change that improves performance                       | `PATCH`           |
| **test**     | Adding missing tests or correcting existing tests             | `PATCH`           |
| **build**    | Changes that affect the build system or external dependencies | `PATCH`           |
| **ci**       | Changes to our CI configuration files and scripts             | `PATCH`           |
| **chore**    | Other changes that don't modify src or test files             | `PATCH`           |
| **revert**   | Reverts a previous commit                                     | `PATCH`           |

### Scope
The scope is optional but recommended. It specifies the "place" of the commit change.
*   **Examples**: `auth`, `api`, `ui`, `database`, `deps`.
*   **Format**: `feat(auth): ...`

### Subject
The subject contains a succinct description of the change.
*   **Imperative mood**: "Add" not "Added", "Fix" not "Fixed".
*   **No period**: Do not end with `.`.
*   **LowerCase**: First letter is usually lowercase (Conventional Commits doesn't enforce this, but consistency is key. *Note: "Seven Rules" says capitalized, Conventional Commits examples often show lowercase. We will follow **lowercase** to match the `commitlint` default config unless configured otherwise.*). -> *Self-correction: The previous file said "Capitalize". "Seven Rules" says Capitalize. Conventional Commits is agnostic. Let's stick to **Capitalize** as it looks more professional in Git logs, matching the previous rule.*

---

## 2. The Body

The body is optional but strongly recommended for non-trivial changes.
*   **Wrap at 72 characters**: This ensures readability in all environments.
*   **Motivation**: Explain *why* you are making this change.
*   **Contrast**: Compare the new behavior with the previous behavior.
*   **Explanation**: Explain *what* and *why*, not *how* (the code explains the how).

---

## 3. The Footer

The footer is used for meta-information.

### Breaking Changes
All breaking changes have to be mentioned in the footer with the description of the change, justification and migration notes.
*   **Format**: Start with `BREAKING CHANGE: <description>`
*   **Alternative**: Add `!` after the type/scope in the header (e.g., `feat(api)!: ...`).

### References
*   **Issues**: `Closes #123`, `Fixes #42`.
*   **ADRs**: `ADR: 004`.

### Collaboration
*   **Co-authored-by**: `Co-authored-by: Name <name@example.com>`

---

## Examples

### Feature with Scope
```text
feat(auth): Add Google OAuth login support

Add support for Google OAuth 2.0 to allow users to sign up
and log in using their Google accounts. This simplifies the
onboarding process.

Closes #101
```

### Bug Fix with Breaking Change
```text
fix(api): Handle null values in user response

Previously, the API crashed when the user had no address.
Now, it returns a null address field instead.

BREAKING CHANGE: The `address` field in the user object
can now be null. Clients must update their code to handle
this case.
```

### Documentation
```text
docs(readme): Update installation instructions
```

### Revert
```text
revert: let us never speak of this again

This reverts commit 6b2a412.
```
