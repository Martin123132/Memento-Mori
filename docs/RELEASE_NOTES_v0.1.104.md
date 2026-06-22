# Memento Mori Jester v0.1.104

## Summary

This release adds checked installed-package support provenance so maintainers can verify and use the support examples from the npm package, not only from a repo checkout.

## Changes

- Added `examples/support/installed-package-support.md`.
- Added `examples/support/installed-package-support.json`.
- Linked the installed-package support note from the support examples index and support README.
- Extended `npm run support:check` to validate the installed-package note, package-relative artifacts, `npm explore` verification command, and repo-only path exclusions.
- Extended `npm run pack:contents:check` so dry-run package contents prove the installed-package note and referenced support artifacts are included.
- Updated README, maintainer triage docs, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/installed-package-support.md`
  - `examples/support/installed-package-support.json`

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.104 installed-package support provenance"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run pack:contents:check
```
