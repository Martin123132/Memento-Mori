# Memento Mori Jester v0.1.65

This release makes fixture curation more precise. The report no longer asks maintainers to add impossible matched-pass examples for hard-block or high-severity rules. It also adds real matched-pass examples for the two low-severity rules that still needed them.

## What Changed

- Added 2 fixture cases, growing the corpus from 152 to 154 fixtures.
- Added matched-pass examples for:
  - `vibes-based-plan`
  - `handwave-final`
- Added `gaps.passEligibleRulesWithoutPassCases` to `npm run fixtures:report -- --json`.
- Updated `Curation next` so pass-case coverage only appears when pass-eligible low-severity rules still need examples.
- With the new fixtures, feasible pass-case gaps are now empty and curation moves to real-world preset collection.

## Public Interface

- No CLI command changes.
- No config schema changes.
- No rule matching, scoring, or verdict behavior changes.
- No MCP, playground, GitHub Action, or npm publishing changes.
- Fixture report JSON includes one additional stable gap field: `passEligibleRulesWithoutPassCases`.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.65 feasible pass-case curation"
```
