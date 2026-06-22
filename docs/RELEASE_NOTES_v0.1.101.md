# Memento Mori Jester v0.1.101

## Summary

This release adds a checked public-safe support examples index so maintainers can quickly choose between the lifecycle map, blank worksheet, and filled synthetic example.

## Changes

- Added `examples/support/support-examples-index.md` with:
  - artifact use-cases for the lifecycle map, blank worksheet, and filled synthetic example,
  - required public-safe markers for each artifact,
  - a quick maintainer path for report, triage, response, closeout, prioritization, backlog record, and backlog review.
- Added `examples/support/support-examples-index.json` as the deterministic manifest for artifact links, use-cases, markers, stage records, privacy guardrails, and required checks.
- Extended `npm run support:check` and `npm run production:check` so the index stays aligned with the support lifecycle artifacts.
- Updated README, maintainer triage docs, support examples, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/support-examples-index.md`
  - `examples/support/support-examples-index.json`

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.101 support examples index"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
```
