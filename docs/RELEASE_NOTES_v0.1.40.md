# v0.1.40 Release Notes

This release is a precision-tuning maintenance update for `jester tune`, adding a few deterministic fixture cases so sparse-rule guidance is less jumpy.

## Added

- Added additional `preset-review-cases.json` fixtures for tune evidence:
  - `diff-ts-ignore-pass-2`
  - `diff-temporary-marker-pass-2`
  - `diff-package-install-script-pass-2`
  - `command-wildcard-file-operation-pass-2`
- Updated `docs/DEMO.md` fixture counters to match the current fixture corpus.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
```

## Highlights

- No review behavior changes.
- No CLI command surface changes.
- No release/workflow behavior changes.
