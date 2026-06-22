# Memento Mori Jester v0.1.103

## Summary

This release adds a checked package contents smoke so maintainers can prove the npm package surface still ships the support examples index, quickstart, lifecycle map, blank worksheet, and filled synthetic example while keeping repo-local/private-ish files out.

## Changes

- Added `scripts/check-package-contents.mjs`.
- Added `npm run pack:contents:check`.
- Updated `npm run pack:dry` so the normal dry-pack path also verifies package contents.
- Wired the package contents check into `npm test` and `npm run production:check`.
- Updated README, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New maintainer script:
  - `npm run pack:contents:check`

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run support:check
npm.cmd run production:check
npm.cmd run pack:contents:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.103 package contents support manifest smoke"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run pack:contents:check
```
