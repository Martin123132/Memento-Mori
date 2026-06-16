# Memento Mori Jester v0.1.64

This release completes the current thin-rule fixture precision pass. It adds second firing examples for the remaining built-in destructive-command rules, final-answer tone rules, and the configured billing-domain rule. It does not change review logic, scoring, matching, CLI output shape, MCP tools, GitHub Action behavior, or release automation.

## What Changed

- Added 7 fixture cases, growing the corpus from 145 to 152 fixtures.
- Added second firing examples for:
  - `database-destruction`
  - `destructive-git-history`
  - `handwave-final`
  - `pipe-to-shell`
  - `recursive-force-delete`
  - `untested-final`
  - `configured-sensitive-domain-billing`
- Cleared all remaining thin rule coverage in `npm run fixtures:report`.
- Updated fixture docs, demo transcript, roadmap, and changelog for the 152-fixture corpus.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.64 final fixture precision"
```
