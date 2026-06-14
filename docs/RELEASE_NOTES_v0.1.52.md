# v0.1.52 Release Notes

This release adds a fixture authoring validator so noisy-rule reports become clean, deterministic fixture coverage instead of fragile JSON edits.

## What Changed

- Added `scripts/check-fixtures.mjs`.
- Added `npm run fixtures:check`.
- Wired `fixtures:check` into `npm test`.
- The validator checks:
  - duplicate fixture IDs,
  - valid preset, kind, verdict, and rule-id metadata,
  - missing `expectedRuleIds` / `absentRuleIds` intent,
  - invalid `weight` / `edgeCase` values,
  - duplicate content for the same preset and kind,
  - unsafe-looking fixture content such as private keys, provider tokens, and absolute home-directory paths.
- Updated maintainer triage docs, fixture docs, release docs, roadmap, changelog, and production readiness checks.

## Behavior Notes

- No CLI, MCP, config, rule, playground, GitHub Action runtime, or release automation behavior changed.
- Existing review fixture expectations remain unchanged.

## Release Validation

```powershell
npm.cmd test
npm.cmd run fixtures:check
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.52 fixture authoring validator"
```
