# v0.1.41 Release Notes

This maintenance pass adds fixture-backed precision improvements for `jester tune` so sparse/noisy families have broader deterministic guidance coverage.

## Added

- Added additional deterministic fixtures to `examples/fixtures/preset-review-cases.json`:
  - `universal-privileged-command-plan`
  - `plan-skip-tests-2`
  - `plan-vibes-based-plan-2`
  - `diff-test-removal-caution-2`
  - `diff-ts-ignore-pass-3`
  - `diff-temporary-marker-pass-3`
  - `diff-console-debug-pass`
  - `diff-package-install-script-pass-3`
  - `command-chmod-777-pass`
  - `diff-large-removal-pass-2`
- Updated demo fixture counters in `docs/DEMO.md` for the expanded suite.
- No review logic or CLI behavior changes.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json
node .\dist\cli.js tune risky-domain
```
