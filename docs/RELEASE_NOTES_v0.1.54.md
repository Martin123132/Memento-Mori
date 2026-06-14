# v0.1.54 Release Notes

This release adds a fixture coverage report generator so maintainers can see which rules, presets, review kinds, and verdicts need stronger fixture coverage.

## What Changed

- Added `scripts/report-fixtures.mjs`.
- Added `npm run fixtures:report`.
- Added `npm run fixtures:report -- --json` for stable structured output.
- Wired fixture reporting into `npm test`.
- The report shows:
  - total fixtures, weighted fixtures, and edge-case fixtures,
  - coverage by verdict, review kind, and preset,
  - rule coverage from `expectedRuleIds`,
  - rules without pass-case coverage,
  - thin rule coverage,
  - preset/kind gaps,
  - quiet pass fixtures.
- Updated maintainer triage docs, fixture docs, release docs, roadmap, changelog, and production readiness checks.

## Behavior Notes

- No CLI, MCP, config, rule, playground, GitHub Action runtime, or release automation behavior changed.
- Existing review fixture expectations remain unchanged.

## Release Validation

```powershell
npm.cmd test
npm.cmd run fixtures:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.54 fixture coverage report"
```
