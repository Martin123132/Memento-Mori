# v0.1.49 Release Notes

This release makes `jester doctor` useful as a support and automation artifact. It keeps the existing text command, adds stable JSON diagnostics, and makes the command report more of the state users need when setup goes sideways.

## Added

- `jester doctor --json`.
- Structured diagnostics for:
  - package name/version and package.json path,
  - Node version,
  - MCP server file path,
  - review-engine smoke verdict,
  - config mode/path,
  - managed git hook status,
  - generated GitHub Action workflow status.

## Changed

- Text `jester doctor` now includes package version, hook status, and GitHub Action status in addition to the existing Node, MCP, review-engine, and config checks.
- Production readiness docs now treat `doctor --json` as the first support artifact.

## Release Validation

```powershell
npm.cmd test
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.49 doctor diagnostics"
```
