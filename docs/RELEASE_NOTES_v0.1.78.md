# Memento Mori Jester v0.1.78

## Summary

This release refreshes the repo-local X demo video and share-kit stills so public promo assets show the current release number and fixture evidence.

## What Changed

- Added `promo/x-demo-v0.1.78` as the current editable HyperFrames demo source.
- Rendered `promo/x-demo-v0.1.78/renders/memento-mori-jester-x-demo-v0.1.78.mp4`.
- Updated the share-kit stills from the fresh render.
- Updated promo docs, demo transcript, roadmap, changelog, and release notes for the refreshed demo asset.

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
Push-Location promo\x-demo-v0.1.78
npm.cmd run check
Pop-Location
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.78 fresh demo render"
```

Additional media checks:

```powershell
$ffprobe = Resolve-Path promo\x-demo-v0.1.78\node_modules\ffprobe-static\bin\win32\x64\ffprobe.exe
& $ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=noprint_wrappers=1 promo\x-demo-v0.1.78\renders\memento-mori-jester-x-demo-v0.1.78.mp4
```

Expected:

- video is 1080x1920, 42 seconds, 30fps,
- share-kit stills render clearly with `v0.1.78`, 216 fixtures, and 6 quiet-pass examples,
- promo files are tracked in Git,
- promo files are not included in the npm tarball,
- GitHub Release and npm Publish complete from the `v0.1.78` tag.
