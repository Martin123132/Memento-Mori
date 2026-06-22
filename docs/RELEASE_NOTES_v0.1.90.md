# Memento Mori Jester v0.1.90

## Summary

This release adds a checked maintainer triage playbook for sanitized support reports. The goal is to make report handling deterministic after users submit public-safe report-gallery feedback or false-positive reports: first response, classification, and follow-up outcome are now documented and checked.

## What Changed

- Added `examples/support/README.md`.
- Added `examples/support/triage-playbook.json`.
- Extended `scripts/check-support-triage.mjs` to validate the playbook.
- Extended production-readiness checks for the playbook.
- Updated README, report gallery docs, maintainer triage docs, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- Support docs and package examples now include a checked maintainer playbook.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.90 checked maintainer triage playbook"
```

Expected:

- `support:check` verifies issue templates, feedback templates, and the maintainer triage playbook.
- `reports:check` still verifies the installed-package report gallery.
- fixture report still shows `Fixtures: 222`.
- GitHub Release and npm Publish complete from the `v0.1.90` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
