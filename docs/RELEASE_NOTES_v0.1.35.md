# v0.1.35 Release Notes

This release adds a precision layer to `jester tune` evidence so users can better judge fixture-driven guidance before muting a rule.

## Added

- Evaluated fixture support now includes per-match expectation metadata in `src/fixtures.ts`:
  - `expectedMatch` (fixture explicitly expects the rule)
  - `unexpectedMatch` (rule fired when fixture did not expect it)
- Added a deterministic confidence signal to fixture evidence:
  - `none`, `low`, `medium`, or `high`
- Extended tune advice output (text + JSON) so `fixtureEvidence` now reports the confidence signal and match expectation details.
- Updated CLI and demo docs to describe confidence and fixture evidence expectations.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.35 precision tuning signals"
```