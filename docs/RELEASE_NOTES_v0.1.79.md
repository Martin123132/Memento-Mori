# Memento Mori Jester v0.1.79

## Summary

This release adds a repo-local promo freshness check so maintainers can verify the current demo video, stills, docs, and fixture evidence numbers before posting or refreshing public assets.

## What Changed

- Added `scripts/check-promo-freshness.mjs`.
- Added `npm run promo:check`.
- Wired `promo:check` into `npm test`.
- Updated production-readiness checks so the promo freshness guard cannot silently disappear.
- Updated README, release docs, production-readiness docs, promo docs, roadmap, changelog, and release notes.

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
npm.cmd run promo:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.79 promo freshness check"
```

For a future same-version promo refresh, maintainers can run:

```powershell
npm.cmd run promo:check -- --require-package-version
```

This release does not require that strict mode because the current public demo snapshot remains `x-demo-v0.1.78`.

Expected:

- default `promo:check` passes for the current published demo snapshot,
- `--require-package-version` is available for intentional same-version promo refreshes,
- GitHub Release and npm Publish complete from the `v0.1.79` tag.
