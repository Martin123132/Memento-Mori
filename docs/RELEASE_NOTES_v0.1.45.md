# v0.1.45 Release Notes

This release improves the fixture evidence behind `jester tune` and `jester tune coverage`. It does not change review matching, scoring, verdicts, config, MCP tools, or GitHub Action behavior.

## Changed

- Added focused fixtures for `risky-domain`, `missing-verification-step`, `confidence-theater`, and `done-without-evidence`.
- Marked intentional overlaps in existing fixtures so the coverage report can distinguish real surprise matches from expected multi-rule risk.
- Raised built-in and structural rule coverage to medium-or-better confidence in the default coverage report.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --json --no-config
node .\dist\cli.js tune risky-domain --no-config
node .\dist\cli.js tune missing-verification-step --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.45 fixture curation"
```
