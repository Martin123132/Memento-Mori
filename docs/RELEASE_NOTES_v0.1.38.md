# v0.1.38 Release Notes

This release extends `jester tune` precision signals by adding review-kind coverage to fixture evidence, making tuning triage faster to trust.

## Added

- `ruleFixtureEvidence` now tracks matched fixture counts by review kind and includes them in `fixtureEvidence.byKind`:
  - `command`
  - `plan`
  - `diff`
  - `final`
- `renderFixtureEvidence` now prints the kind split in CLI output for quick interpretation of fixture provenance.
- Tune fixtures remain weighted and deterministic, with existing verdict buckets, coverage fields, and expectation decomposition unchanged.
- Updated `docs/CLI.md`, `docs/DEMO.md`, and `ROADMAP.md` to describe the precision signal refinement.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.38 tune kind-aware fixture signal"
```
