# Memento Mori Jester v0.1.73

This release follows the fixture report's web/AI curation guidance. It adds practical quiet-pass examples only; review behavior is unchanged.

## What Changed

- Added 6 fixture cases, growing the corpus from 196 to 202 fixtures.
- Added web quiet-pass examples for:
  - safe `textContent` rendering.
  - allowlisted target path selection.
  - public analytics identifiers.
- Added AI quiet-pass examples for:
  - model-check commands.
  - tool allowlist checks.
  - public model-name config.
- Raised the web and AI preset slices from 15 to 18 fixtures each.
- Kept thin rule coverage, quiet-pass gaps, feasible pass-case gaps, and preset/kind gaps at zero.

## Public Interface

- No CLI command changes.
- No config schema changes.
- No rule matching, scoring, or verdict behavior changes.
- No MCP, playground, GitHub Action, or npm publishing changes.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
node .\dist\cli.js tune risky-domain --json --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.73 web and AI quiet-pass curation"
```
