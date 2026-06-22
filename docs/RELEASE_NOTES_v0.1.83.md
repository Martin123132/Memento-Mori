# Memento Mori Jester v0.1.83

## Summary

This release makes the framework tuning guide easier to execute from real repos. It adds a tiny checked cookbook that maps common stack-shaped noisy-rule reports to exact `jester tune <rule-id> --json` commands and fixture IDs.

## What Changed

- Added `examples/tuning/framework-tuning-cookbook.json`.
- Added `examples/tuning/README.md` with copy-paste recipes for:
  - Next.js / Vite React,
  - FastAPI / Python,
  - Terraform / Kubernetes / Helm,
  - security scanning,
  - AI / MCP tools.
- Added `npm run framework:tuning:check`.
- Wired the cookbook checker into `npm test` and production-readiness checks.
- Linked the cookbook from README, CLI docs, getting-started docs, demo docs, release docs, production-readiness docs, and `docs/FRAMEWORK_TUNING.md`.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action or release workflow changes.
- Fixture count remains `222`; this release adds checked cookbook assets, not new review cases.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run framework:tuning:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.83 framework tuning cookbook"
```

Expected:

- `framework:tuning:check` passes for five recipes,
- fixture report still shows `Fixtures: 222`,
- no thin rule coverage,
- no preset/kind gaps,
- no rules without quiet-pass coverage,
- GitHub Release and npm Publish complete from the `v0.1.83` tag.
