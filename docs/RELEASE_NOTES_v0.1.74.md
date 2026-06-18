# Memento Mori Jester v0.1.74

This release follows the fixture report's API curation guidance. It adds practical quiet-pass examples only; review behavior is unchanged.

## What Changed

- Added 6 fixture cases, growing the corpus from 202 to 208 fixtures.
- Added API quiet-pass examples for:
  - schema parsing request bodies.
  - query-builder filters with validated IDs.
  - enabled rate limiting.
  - read-only Prisma migration diffs.
  - signed-webhook documentation.
  - OpenAPI schema documentation.
- Raised the API preset slice from 16 to 22 fixtures.
- Kept thin rule coverage, quiet-pass gaps, feasible pass-case gaps, and preset/kind gaps at zero.

## Public Interface

- No CLI command changes.
- No config schema changes.
- No rule matching, scoring, or verdict behavior changes.
- No MCP, playground, GitHub Action, or npm publishing changes.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune coverage --no-config
node .\dist\cli.js tune risky-domain --json --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.74 API quiet-pass curation"
```
