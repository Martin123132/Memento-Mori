# Memento Mori Jester v0.1.71

## Summary

This release continues fixture-report curation for the Node preset and adds a repo-local X demo video asset. Review behavior, rule matching, scoring, MCP behavior, and release automation are unchanged.

## Changes

- Added six Node quiet-pass fixtures:
  - `npm audit --audit-level=high`
  - `npm outdated --long`
  - `npm ci --ignore-scripts`
  - `NODE_ENV=development npm test`
  - package export map diffs
  - workspace test script diffs
- Grew the fixture corpus from 184 to 190 examples.
- Added editable HyperFrames source and a final vertical MP4 under `promo/x-demo-v0.1.70`.
- Kept `promo/` outside the npm package `files` list so the published CLI remains small.

## Public Interface

- No CLI command changes.
- No config schema changes.
- No rule matching, scoring, or verdict behavior changes.
- No MCP, playground, GitHub Action, or npm publishing changes.
- New repo-local promo files live under `promo/`, which is not included in the npm package.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
node .\dist\cli.js tune risky-domain --json --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.71 node quiet-pass curation and promo asset"
```
