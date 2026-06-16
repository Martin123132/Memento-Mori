# Memento Mori Jester v0.1.60

This release makes `npm run fixtures:report` a more useful maintenance dashboard for fixture curation. It does not change review behavior, rule matching, MCP tools, presets, or release automation.

## What Changed

- Added `ruleFamilySlices` to fixture report JSON and a `By rule family` section to text output.
- Added `presetSlices` to fixture report JSON and a `Preset slices` section to text output.
- Added `curationNext` guidance so maintainers can quickly see whether to add thin-rule, no-pass, rule-family, or lower-count preset examples next.
- Updated fixture-report tests and maintainer docs around the richer report output.

## Public Interface

- No CLI review behavior changes.
- No config schema changes.
- No MCP, playground, GitHub Action, or npm publishing changes.
- `npm run fixtures:report -- --json` now includes additional stable fields: `ruleFamilySlices`, `presetSlices`, and `curationNext`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.60 fixture report curation slices"
```
