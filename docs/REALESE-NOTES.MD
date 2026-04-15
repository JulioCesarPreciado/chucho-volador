# Release Notes — Format Guide

Reference for the standard release note format

Notes are generated automatically by `release.sh` from the commit history.

---

## Structure

```markdown
## ✨ What's Changed
- <change description>
- <change description>

## 🐛 Bug Fixes
- <fix description>
- <fix description>
```

> The GitHub release title is: **Version X.Y.Z**

---

## Which commits are included?

Only two commit types are picked from the history:

| Commit prefix          | Section in the release |
| ---------------------- | ---------------------- |
| `feat: description`    | What's Changed         |
| `fix: description`     | Bug Fixes              |

All other prefixes (`📝 docs:`, `🔨 refactor:`, `📤 build:`, etc.) are **not included** in the public release notes.

---

## Example release note

> This is what consumers of the library would see on GitHub.

---

### Version 0.5.0

## ✨ What's Changed

- Add `GuestLayout` component with documentation and prop types
- Add `BaseButton` component and prop types
- Add `useSearch` hook for search functionality
- Add `SearchBox` component and prop types
- Add `IconRender` and `MenuCard` components with types

## 🐛 Bug Fixes

No bug fixes.

---

## Best practices for commit messages

### ✅ Good

```text
✨ feat: add disabled prop to BaseButton component
🐛 fix: correct icon alignment in MenuCard when no label is provided
```

### ❌ Avoid

```text
✨ feat: fix
✨ feat: update
🐛 fix: bug
```

The commit description **is what the team sees** in the release note.
Be specific — mention the component, prop, or behavior affected.
