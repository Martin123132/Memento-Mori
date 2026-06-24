# Memento Mori Jester v0.1.108

## Summary

This hotfix corrects the v0.1.107 post-publish smoke guidance. The audit gate is a repo-checkout maintainer safeguard because `npm audit` needs a lockfile; installed npm packages do not ship this repo's lockfile.

## Changes

- Replaced the installed-package `npm explore ... npm run audit:high` smoke suggestion with a registry tarball pack check.
- Clarified README and Getting Started wording so `npm run audit:high` is described as a maintainer check from a repo checkout.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, workflow, licence, or runtime behavior changes.
- Documentation-only correction for release and first-reader guidance.

## Release Validation

```powershell
npm.cmd run audit:high
npm.cmd test
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.108 audit smoke guidance hotfix"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest start
npm.cmd pack memento-mori-jester@0.1.108 --json --ignore-scripts
```
