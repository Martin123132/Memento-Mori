# Memento Mori Jester v0.1.96

## Summary

This release adds a checked public-safe support backlog review checklist. It helps maintainers revisit backlog records over time and decide whether each item remains a docs clarification, fixture backlog item, rule-review candidate, or closes with no action.

## What Changed

- Added `examples/support/backlog-review.md`.
- Added `examples/support/backlog-review.json`.
- Extended `scripts/check-support-triage.mjs` to validate review decisions, source records, cadence, criteria, required checks, and privacy review guidance.
- Extended production-readiness checks for the backlog review checklist.
- Updated README, maintainer triage docs, support examples, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- Support docs and package examples now include checked backlog aging review guidance.

## Release Validation

```powershell
npm.cmd test
npm.cmd run support:check
npm.cmd run reports:check
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.96 checked support backlog review"
```

Expected:

- `support:check` verifies issue templates, feedback templates, the support lifecycle overview, outcome prioritization guide, backlog records, backlog review checklist, maintainer triage playbook, response snippets, and closeout checklist.
- `reports:check` still verifies the installed-package report gallery.
- fixture report still shows `Fixtures: 222`.
- GitHub Release and npm Publish complete from the `v0.1.96` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
