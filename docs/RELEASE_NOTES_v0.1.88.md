# Memento Mori Jester v0.1.88

## Summary

This release adds a small checked report gallery. The goal is to make the project easier to trust from concrete public examples without changing rule behavior: a fresh `doctor` report, a destructive-command `summary`, and a full blocked command review.

## What Changed

- Added `examples/reports/report-gallery.json`.
- Added `examples/reports/README.md`.
- Added `scripts/check-report-gallery.mjs`.
- Added `npm run reports:check`.
- Wired the report gallery checker into `npm test` and production-readiness checks.
- Updated README, getting-started docs, maintainer triage docs, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- New maintainer/package script: `npm run reports:check`.
- New checked example gallery: `examples/reports`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run reports:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
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
node .\dist\cli.js command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.88 checked report gallery"
```

Expected:

- `reports:check` installs the package into a temporary minimal project,
- `fresh-install-doctor` passes against installed `jester doctor`,
- `destructive-command-summary` passes against installed `jester summary --kind command "git reset --hard"`,
- `blocked-command-review` passes against installed `jester command "git reset --hard"`,
- fixture report still shows `Fixtures: 222`,
- GitHub Release and npm Publish complete from the `v0.1.88` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
