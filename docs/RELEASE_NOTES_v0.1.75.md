# Memento Mori Jester v0.1.75

This release adds a Markdown export for the fixture coverage report so maintainers can paste stable quality snapshots into release notes, GitHub issues, and project updates. Review behavior is unchanged.

## What Changed

- Added `npm run fixtures:report -- --markdown`.
- Added Markdown sections for:
  - summary totals.
  - verdict, kind, and preset counts.
  - rule-family slices.
  - preset slices.
  - gap sections.
  - quiet-pass rule coverage.
  - quiet-pass fixture samples.
  - curation-next guidance.
  - next commands.
- Added a guard that rejects combining `--json` and `--markdown`.
- Updated maintainer docs, release docs, demo docs, README support notes, and production-readiness checks.

## Public Interface

- New maintainer script mode: `npm run fixtures:report -- --markdown`.
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
npm.cmd run fixtures:report -- --markdown
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
node .\dist\cli.js tune risky-domain --json --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.75 markdown fixture report export"
```
