# Memento Mori Jester v0.1.72

This release follows the fixture report's lowest-count preset guidance. It adds practical quiet-pass Python and security examples only; review behavior is unchanged.

## What Changed

- Added 6 fixture cases, growing the corpus from 190 to 196 fixtures.
- Added Python quiet-pass examples for:
  - Bandit scans.
  - pip-audit dependency checks.
  - coverage/pytest runs.
- Added security quiet-pass examples for:
  - Trivy filesystem scans.
  - npm audit checks.
  - TLS verification explicitly kept enabled.
- Raised the Python and security preset slices from 14 to 17 fixtures each.
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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.72 python and security quiet-pass curation"
```
