# Memento Mori Jester v0.1.98

## Summary

This release adds a compact checked support lifecycle map so maintainers can scan the full public-safe support path without reading every support artifact first.

## Changes

- Added `examples/support/support-lifecycle-map.md` for the at-a-glance support chain:
  `report -> triage -> response -> closeout -> prioritization -> backlog-record -> backlog-review`.
- Added `examples/support/support-lifecycle-map.json` as the deterministic source for stage order, stage artifacts, outcome summaries, and privacy guardrails.
- Extended `npm run support:check` and `npm run production:check` so the compact map stays aligned with the full lifecycle overview.
- Updated README, maintainer triage docs, support examples, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/support-lifecycle-map.md`
  - `examples/support/support-lifecycle-map.json`

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.98 support lifecycle map"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
```
