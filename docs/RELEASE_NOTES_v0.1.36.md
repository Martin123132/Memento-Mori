# v0.1.36 Release Notes

This release takes the precision pass a step farther by adding fixture-weighted signal quality to `jester tune`, while keeping tune behavior read-only and stable.

## Added

- Added weighted fixture metadata support in `src/fixtures.ts`:
  - optional fixture `weight` values (1–3),
  - optional `edgeCase` markers with reduced signal strength.
- `ruleFixtureEvidence` now reports weighted diagnostics:
  - total weighted fixtures,
  - weighted match totals,
  - expected-match and unexpected-match weighted totals,
  - edge-case match counts,
  - and a stable `coverage` object.
- Expanded `jester tune` output (text + JSON) to surface the new weighted fixture evidence fields without changing existing advice keys or commands.
- Added new high-signal fixture cases around secrets and sensitive environment changes to strengthen tuning confidence.
- Updated `docs/CLI.md`, `docs/DEMO.md`, and `ROADMAP.md` for the precision pass direction.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.36 fixture precision tuning"
```

