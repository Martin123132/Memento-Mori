# Memento Mori Jester v0.1.106

## Summary

This release adds a checked post-release evidence ledger so maintainers can review the public-safe release closeout later without reopening workflow logs, npm output, or local terminal history.

## Changes

- Added `examples/support/post-release-evidence-ledger.md`.
- Added `examples/support/post-release-evidence-ledger.json`.
- Linked the ledger from the support examples README, support examples index, and release support provenance gate.
- Extended `npm run support:check` to validate required evidence fields, workflow statuses, public smoke commands, tarball file count, private-ish path exclusions, required checks, and privacy guidance.
- Extended `npm run pack:contents:check` so dry-run package contents prove the ledger ships in the npm package.
- Updated README, release docs, maintainer triage docs, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/post-release-evidence-ledger.md`
  - `examples/support/post-release-evidence-ledger.json`

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run support:check
npm.cmd run pack:contents:check
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.106 post-release evidence ledger"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd explore memento-mori-jester -- npm run pack:contents:check
npm.cmd pack memento-mori-jester@0.1.106 --json --ignore-scripts
```
