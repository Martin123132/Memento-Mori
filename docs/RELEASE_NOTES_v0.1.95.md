# Memento Mori Jester v0.1.95

## Summary

This release adds checked public-safe support backlog records. It helps maintainers turn a closed and prioritized support outcome into a docs clarification, fixture backlog item, or rule-review candidate without changing rule behavior first.

## What Changed

- Added `examples/support/backlog-records.md`.
- Added `examples/support/backlog-records.json`.
- Extended `scripts/check-support-triage.mjs` to validate backlog record IDs, outcome mapping, source closeouts, evidence thresholds, required checks, and privacy review guidance.
- Extended production-readiness checks for the backlog records.
- Updated README, maintainer triage docs, support examples, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- Support docs and package examples now include checked follow-up backlog records.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.95 checked support backlog records"
```

Expected:

- `support:check` verifies issue templates, feedback templates, the support lifecycle overview, outcome prioritization guide, backlog records, maintainer triage playbook, response snippets, and closeout checklist.
- `reports:check` still verifies the installed-package report gallery.
- fixture report still shows `Fixtures: 222`.
- GitHub Release and npm Publish complete from the `v0.1.95` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
