# Memento Mori Jester v0.1.85

## Summary

This release adds a narrow adoption smoke workflow for real repos. It gives teams a read-only GitHub Actions recipe that checks the package health, proves a summary review path, and verifies the published framework tuning cookbook scripts before they enable heavier code-scanning workflows.

## What Changed

- Added `examples/ci/adoption-smoke.yml`.
- Added `scripts/check-ci-adoption.mjs`.
- Added `npm run ci:adoption:check`.
- Wired the adoption checker into `npm test` and production-readiness checks.
- Updated README, GitHub Actions docs, CI example docs, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- New maintainer/package script: `npm run ci:adoption:check`.
- New checked example workflow: `examples/ci/adoption-smoke.yml`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run framework:tuning:check
npm.cmd run framework:tuning:doctor
npm.cmd run ci:adoption:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js summary --kind command "git reset --hard"
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.85 adoption smoke CI"
```

Expected:

- `ci:adoption:check` passes for `examples/ci/adoption-smoke.yml`,
- `framework:tuning:doctor` still runs 10 executable tune commands,
- fixture report still shows `Fixtures: 222`,
- no thin rule coverage,
- no preset/kind gaps,
- no rules without quiet-pass coverage,
- GitHub Release and npm Publish complete from the `v0.1.85` tag.
