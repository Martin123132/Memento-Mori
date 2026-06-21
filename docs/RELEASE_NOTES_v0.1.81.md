# Memento Mori Jester v0.1.81

## Summary

This release adds a lightweight repo-local landing page that reuses the existing demo video, social card, install command, and public project links. It gives maintainers a one-page share surface without adding a framework or hosting dependency.

## What Changed

- Added `site/index.html`.
- Added `scripts/check-site.mjs`.
- Added `npm run site:check`.
- Wired `site:check` into `npm test` and production-readiness checks.
- Updated README, promo docs, release docs, production-readiness docs, roadmap, changelog, and release notes.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, or verdict behavior changes.
- No GitHub Action behavior changes.
- `site/` and `promo/` remain outside the npm package `files` list.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.81 landing page"
```

Expected:

- `site/index.html` opens as a static page with the current start command, demo video, social card, repo, release, and npm links,
- `site/` remains repo-local and is not included in the npm tarball,
- GitHub Release and npm Publish complete from the `v0.1.81` tag.
