# v0.1.16 Release Notes

This release makes the trusted publishing path automatic now that the workflow has successfully published a release.

## Added

- `npm Publish` now runs automatically when a `v*` tag is pushed.
- The publish workflow checks that the tag matches `package.json` before publishing.
- The publish workflow runs `npm run pack:dry` before `npm publish`.
- Manual workflow dispatch remains available as a fallback.

## Changed

- Release docs now lead with the tag-push release flow instead of local `npm login`.
- Trusted publishing docs now describe the working setup and manual fallback.
- Roadmap no longer lists trusted publishing as future work.

## Unchanged

- No CLI, MCP, config, or rule behavior changed.
- The existing GitHub Release workflow still creates releases from `docs/RELEASE_NOTES_<tag>.md`.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run pack:dry
git tag -a v0.1.16 -m "Memento Mori Jester v0.1.16"
git push origin main
git push origin v0.1.16
```
