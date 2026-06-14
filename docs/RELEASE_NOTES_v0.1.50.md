# v0.1.50 Release Notes

This release adds clearer public support intake so bug reports, false-positive reports, feature requests, and security reports arrive with the context maintainers need.

## What Changed

- Added `SECURITY.md` with vulnerability reporting guidance, scope, and safe redaction expectations.
- Added GitHub issue templates for bug reports, false positives/noisy rules, and feature requests.
- Added GitHub issue-template contact links for security reports and getting-started docs.
- Updated README and production-readiness docs so `jester doctor --json` and issue templates are part of the support contract.
- Expanded `npm run production:check` so future releases keep the security policy and issue templates in place.

## Behavior Notes

- No CLI, MCP, config, rule, playground, GitHub Action runtime, or release automation behavior changed.
- `SECURITY.md` is now included in the npm package file list.

## Release Validation

```powershell
npm.cmd test
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.50 support intake"
```
