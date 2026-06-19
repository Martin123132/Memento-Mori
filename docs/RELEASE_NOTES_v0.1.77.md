# Memento Mori Jester v0.1.77

## Summary

This release adds a repo-local promo/share kit so Memento Mori Jester is easier to explain and post publicly without changing runtime behavior.

## What Changed

- Added [promo/README.md](../promo/README.md) as the entry point for sharing assets.
- Added [promo/share-kit/README.md](../promo/share-kit/README.md) with still-image guidance, alt text, thread order, and a posting checklist.
- Added [promo/share-kit/x-posts.md](../promo/share-kit/x-posts.md) with short, medium, builder-focused, and thread-style X copy.
- Added [promo/share-kit/demo-script.md](../promo/share-kit/demo-script.md) with a 30-second walkthrough and a 10-second reply version.
- Added four vertical stills extracted from the existing X demo video.
- Linked the promo kit from the README.

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
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.77 promo share kit"
```

Additional checks:

```powershell
git ls-files promo
npm.cmd pack --dry-run | Select-String "promo/"
```

Expected:

- promo files are tracked in Git,
- promo files are not included in the npm tarball,
- GitHub Release and npm Publish complete from the `v0.1.77` tag.
