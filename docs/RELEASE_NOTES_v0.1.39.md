# v0.1.39 Release Notes

This release adds one more precision step to `jester tune` so rule-based tuning evidence is clearer about fixture support strength while staying read-only and non-blocking.

## Added

- Added a deterministic fixture `support` signal to `ruleFixtureEvidence` and `jester tune --json` with levels:
  - `none`
  - `thin`
  - `limited`
  - `strong`
- `tune` now prints the support level in the fixture evidence section alongside existing confidence, coverage, and verdict data.
- `ruleFixtureEvidence` now accepts optional project config input for project-config/custom tuning requests, with disabled rules kept comparable by evaluating fixtures against a non-disabled copy.
- Docs and roadmap were updated to reflect the new support signal and next precision step.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
node .\dist\cli.js tune console-log
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.39 fixture support signal"
```

## Highlights

- No review rule behavior changes.
- No MCP schema changes.
- No workflow behavior changes.

