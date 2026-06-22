# Memento Mori Jester v0.1.99

## Summary

This release adds a checked public-safe support lifecycle worksheet so maintainers can turn the compact lifecycle map into an active review checklist for one support report.

## Changes

- Added `examples/support/support-lifecycle-worksheet.md` with stage-by-stage checks for:
  `report -> triage -> response -> closeout -> prioritization -> backlog-record -> backlog-review`.
- Added `examples/support/support-lifecycle-worksheet.json` as the deterministic source for stage order, checklist items, record fields, stop conditions, outcomes, privacy guardrails, and required checks.
- Extended `npm run support:check` and `npm run production:check` so the worksheet stays aligned with the support lifecycle map and overview.
- Updated README, maintainer triage docs, support examples, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/support-lifecycle-worksheet.md`
  - `examples/support/support-lifecycle-worksheet.json`

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run support:check
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.99 support lifecycle worksheet"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
```
