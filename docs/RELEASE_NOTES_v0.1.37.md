# v0.1.37 Release Notes

This release is a small stabilization pass for fixture-backed tuning behavior after the precision update in v0.1.36.

## Fixed

- Updated fixture expectation files for current rule behavior in `examples/fixtures/preset-review-cases.json`.
- Adjusted fixture sample assertions in `src/cli.test.ts` to validate fixture-based evidence stably without fragile exact-text coupling.
- Kept existing public command behavior intact while preserving deterministic tune outputs.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.37 post-release fixture stability"
```