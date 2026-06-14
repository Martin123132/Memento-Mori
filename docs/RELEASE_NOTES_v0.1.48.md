# v0.1.48 Release Notes

This release adds a production-readiness bar and a static guard to keep the public package, workflows, docs, and release metadata aligned as the project grows.

## Added

- `docs/PRODUCTION_READINESS.md`, covering:
  - npm package expectations,
  - GitHub Action behavior,
  - MCP and agent setup,
  - git hooks,
  - documentation and release metadata,
  - support and recovery paths.
- `npm run production:check`, which validates version/release-note coverage, package metadata, public package files, workflow runtime expectations, action summary support, and onboarding docs.

## Changed

- `npm test` now runs the production readiness check after the TypeScript build and unit suite.
- README and release docs now mention the production readiness check.

## Release Validation

```powershell
npm.cmd test
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.48 production readiness audit"
```
