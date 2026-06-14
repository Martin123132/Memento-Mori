# v0.1.44 Release Notes

This release adds a read-only tune coverage report so maintainers can see which rules have healthy fixture evidence and which ones need more examples.

## Added

- `jester tune coverage`
- `jester tune coverage --json`
- Per-rule fixture support, confidence, match count, expected weight, unexpected weight, sample snippets, suggested action, and next `jester tune <rule>` command.
- Project-config rules are included when config is loaded, while still reporting no generic fixture coverage.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage
node .\dist\cli.js tune coverage --json --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.44 tune coverage report"
```
