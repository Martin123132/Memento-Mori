# Memento Mori Jester v0.1.105

## Summary

This release adds a checked release support provenance gate so maintainers record installed-package support verification after npm publish, using only package-relative artifacts and public-safe release closeout notes.

## Changes

- Added `examples/support/release-support-provenance.md`.
- Added `examples/support/release-support-provenance.json`.
- Linked the gate from the support examples README and support examples index.
- Extended `npm run support:check` to validate the post-publish gate, required record fields, package-relative artifact list, repo-only exclusions, and privacy guidance.
- Extended `npm run pack:contents:check` so dry-run package contents prove the release provenance gate and referenced support artifacts are included.
- Updated README, release docs, maintainer triage docs, production-readiness docs, roadmap, and changelog.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, GitHub Action, or release automation changes.
- New package docs/examples only:
  - `examples/support/release-support-provenance.md`
  - `examples/support/release-support-provenance.json`

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.105 release support provenance gate"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd explore memento-mori-jester -- npm run pack:contents:check
```
