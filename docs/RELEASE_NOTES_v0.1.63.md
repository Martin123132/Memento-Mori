# Memento Mori Jester v0.1.63

This release completes the current custom-rule fixture precision pass. It adds second firing examples for the remaining framework custom-rule thin cases surfaced by `npm run fixtures:report`. It does not change review logic, scoring, matching, CLI output shape, MCP tools, GitHub Action behavior, or release automation.

## What Changed

- Added 7 fixture cases, growing the corpus from 138 to 145 fixtures.
- Added second firing examples for:
  - `custom-broad-cors`
  - `custom-infra-public-exposure`
  - `custom-insecure-tls-disabled`
  - `custom-node-env-production-change`
  - `custom-python-eval-exec`
  - `custom-python-pickle-load`
  - `custom-web-storage-sensitive-value`
- Cleared custom-rule thin coverage entirely in `npm run fixtures:report`.
- Reduced total thin fixture coverage from 16 rules to 7.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.63 framework fixture precision"
```
