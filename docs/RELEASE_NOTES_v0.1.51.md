# v0.1.51 Release Notes

This release adds a maintainer triage guide so support reports can feed back into better fixture coverage and rule tuning.

## What Changed

- Added `docs/MAINTAINER_TRIAGE.md`.
- Documented the first-response diagnostic commands for bug and false-positive reports.
- Added a false-positive decision tree for deciding between explanation, tuning guidance, fixture coverage, rule fixes, and preset fixes.
- Updated `examples/fixtures/README.md` with guidance for converting safe reports into redacted fixture cases.
- Updated README, demo docs, roadmap, changelog, release docs, and production readiness docs.
- Expanded `npm run production:check` so maintainer triage and fixture-conversion guidance remain part of the release contract.

## Behavior Notes

- No CLI, MCP, config, rule, playground, GitHub Action runtime, or release automation behavior changed.
- This is a support and maintenance release.

## Release Validation

```powershell
npm.cmd test
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.51 maintainer triage"
```
