# Memento Mori Jester v0.1.62

This release continues the fixture precision work from v0.1.61, focusing on the remaining AI/API custom-rule thin examples surfaced by `npm run fixtures:report`. It does not change review logic, scoring, matching, CLI output shape, MCP tools, GitHub Action behavior, or release automation.

## What Changed

- Added 4 fixture cases, growing the corpus from 134 to 138 fixtures.
- Added second firing examples for:
  - `custom-ai-model-output-execution`
  - `custom-ai-public-provider-key`
  - `custom-api-raw-sql-user-input`
  - `custom-api-webhook-signature-disabled`
- Reduced total thin fixture coverage from 21 rules to 16.
- Removed the AI/API custom-rule items from the custom-rule thin coverage list.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.62 AI/API fixture precision"
```
