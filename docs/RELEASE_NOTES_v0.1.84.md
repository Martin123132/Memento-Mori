# Memento Mori Jester v0.1.84

## Summary

This release adds a consumer-style doctor for the framework tuning cookbook. The cookbook was already checked for doc and fixture alignment; now maintainers can prove the cookbook's tune commands execute through the built CLI with generated preset configs.

## What Changed

- Added `scripts/doctor-framework-tuning.mjs`.
- Added `npm run framework:tuning:doctor`.
- Wired the doctor into `npm test` and production-readiness checks.
- Updated README, CLI docs, demo docs, release docs, production-readiness docs, roadmap, changelog, and the tuning cookbook docs.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action or release workflow changes.
- New maintainer/package script: `npm run framework:tuning:doctor`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run framework:tuning:check
npm.cmd run framework:tuning:doctor
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.84 framework tuning doctor"
```

Expected:

- `framework:tuning:check` passes for five recipes,
- `framework:tuning:doctor` runs 10 executable tune commands,
- fixture report still shows `Fixtures: 222`,
- no thin rule coverage,
- no preset/kind gaps,
- no rules without quiet-pass coverage,
- GitHub Release and npm Publish complete from the `v0.1.84` tag.
