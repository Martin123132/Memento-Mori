# Memento Mori Jester v0.1.86

## Summary

This release adds a minimal consumer-project smoke path. The adoption CI example already proves copied workflow commands from GitHub Actions; this release proves the same first commands after installing the package into a clean temporary project.

## What Changed

- Added `examples/consumer-quickstart/package.json`.
- Added `examples/consumer-quickstart/README.md`.
- Added `scripts/check-consumer-quickstart.mjs`.
- Added `npm run consumer:quickstart:check`.
- Wired the consumer quickstart checker into `npm test` and production-readiness checks.
- Updated README, GitHub Actions docs, CI example docs, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- New maintainer/package script: `npm run consumer:quickstart:check`.
- New checked example fixture: `examples/consumer-quickstart`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run framework:tuning:check
npm.cmd run framework:tuning:doctor
npm.cmd run ci:adoption:check
npm.cmd run consumer:quickstart:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js summary --kind command "git reset --hard"
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.86 consumer quickstart smoke"
```

Expected:

- `consumer:quickstart:check` installs the package into a temporary minimal project,
- `jester:doctor` passes from that project,
- `jester:summary` blocks `git reset --hard` from that project,
- packaged `framework:tuning:check` and `framework:tuning:doctor` pass from the installed dependency,
- fixture report still shows `Fixtures: 222`,
- GitHub Release and npm Publish complete from the `v0.1.86` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run consumer:quickstart:check -- --package memento-mori-jester@latest
```
