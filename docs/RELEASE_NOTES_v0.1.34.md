# v0.1.34 Release Notes

This release improves false-positive tuning by adding fixture-backed evidence to `jester tune`, making each noisy rule recommendation easier to verify and safer to decide.

## Added

- Added `src/fixtures.ts` to evaluate `examples/fixtures/preset-review-cases.json` against presets for stable rule evidence.
- Added fixture-backed evidence to `jester tune` outputs:
  - total fixtures reviewed,
  - matched fixture count,
  - per-verdict breakdown,
  - deterministic sample fixture IDs and descriptions,
  - explicit coverage miss messages for rules without fixture support.
- Extended `--json` tune output with `fixtureEvidence` while preserving existing keys.
- Updated docs (`docs/CLI.md`, `docs/DEMO.md`) to describe fixture guidance.
- Moved roadmap tuning work item from Near Term to Recently Shipped and added the next precision idea.
- Bumped to `0.1.34`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
node .\dist\cli.js diff --fail-on block --subject "v0.1.34 fixture-aware tune reports"
```
