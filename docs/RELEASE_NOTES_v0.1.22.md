# v0.1.22 Release Notes

This release reduces noisy cautions when a diff only changes documentation, examples, changelogs, release notes, or roadmap text.

## Changed

- Docs-only diffs no longer warn just because broad domain words like `auth`, `security`, or `production` appear in documentation text.
- Project-config sensitive-domain matches are also suppressed for docs-only diffs.
- Code diffs and mixed docs-plus-code diffs still warn on the same broad domain words.

## Still Active

- Secret-looking material.
- Destructive commands.
- Package install script changes.
- Sensitive environment changes.
- Custom project rules.
- Structural checks such as large removals.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.22 docs-only noise tuning"
```
