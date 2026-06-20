# Memento Mori Jester v0.1.80

## Summary

This release adds a deterministic social preview card for GitHub, X, and project-update links. It keeps the promo work local and reviewable while making shared links look intentional.

## What Changed

- Added `promo/share-kit/social-card.svg`.
- Added `scripts/render-social-card.mjs`.
- Added `npm run promo:card` and `npm run promo:card:check`.
- Extended `npm run promo:check` to verify the social card exists, has 1200x630 dimensions, includes the product name, and includes the `npx` start command.
- Updated promo docs, release docs, production-readiness docs, roadmap, changelog, and release notes.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, or verdict behavior changes.
- No GitHub Action behavior changes.
- `promo/` remains outside the npm package `files` list.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.80 social preview card"
```

Expected:

- `promo/share-kit/social-card.svg` is deterministic and current,
- default `promo:check` includes social-card validation,
- GitHub Release and npm Publish complete from the `v0.1.80` tag.
