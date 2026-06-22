# Memento Mori Jester v0.1.97

## Summary

This release updates the checked support lifecycle overview so it reflects the full public-safe support chain: report, triage, response, closeout, prioritization, backlog record, and backlog review.

## What Changed

- Extended `examples/support/support-lifecycle.md` to show the full seven-stage lifecycle.
- Extended `examples/support/support-lifecycle.json` so every support outcome links to prioritization, backlog record, and backlog review artifacts.
- Updated `scripts/check-support-triage.mjs` to validate the seven lifecycle stages and artifact references.
- Extended production-readiness checks for the full lifecycle index.
- Updated support docs, maintainer triage docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- Support docs and package examples now include the full checked support lifecycle index.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.97 full support lifecycle overview"
```

Expected:

- `support:check` verifies issue templates, feedback templates, the full support lifecycle overview, outcome prioritization guide, backlog records, backlog review checklist, maintainer triage playbook, response snippets, and closeout checklist.
- `reports:check` still verifies the installed-package report gallery.
- fixture report still shows `Fixtures: 222`.
- GitHub Release and npm Publish complete from the `v0.1.97` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
