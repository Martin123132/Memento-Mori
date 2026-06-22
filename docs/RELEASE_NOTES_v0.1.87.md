# Memento Mori Jester v0.1.87

## Summary

This patch fixes the new consumer quickstart check's registry-package mode. The v0.1.86 local packed-package smoke passed, but the post-publish `--package memento-mori-jester@latest` smoke exposed that full npm specs were being written as dependency versions.

## What Changed

- Updated `scripts/check-consumer-quickstart.mjs` to install package specs with `npm install --save-dev <spec>`.
- Kept the same minimal consumer fixture and command checks.
- Updated changelog, roadmap, and release notes for the patch.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- Maintainer script behavior fix only: `npm run consumer:quickstart:check -- --package memento-mori-jester@latest` now works.

## Release Validation

```powershell
npm.cmd test
npm.cmd run consumer:quickstart:check
npm.cmd run consumer:quickstart:check -- --package memento-mori-jester@latest
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.87 consumer quickstart registry smoke"
```

Expected:

- local packed-package consumer quickstart smoke passes,
- registry-spec consumer quickstart smoke passes,
- GitHub Release and npm Publish complete from the `v0.1.87` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npm.cmd run consumer:quickstart:check -- --package memento-mori-jester@latest
```
