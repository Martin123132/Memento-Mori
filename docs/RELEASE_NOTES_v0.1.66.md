# Memento Mori Jester v0.1.66

This release follows the fixture report's real-world preset curation guidance. It adds practical examples for low-count node, python, infra, and AI slices while preserving the cleaned-up coverage baseline from v0.1.64 and v0.1.65.

## What Changed

- Added 6 fixture cases, growing the corpus from 154 to 160 fixtures.
- Added quiet real-world examples for:
  - Node focused test commands.
  - Python focused pytest commands.
  - AI retrieved-context schema validation plans.
- Added infra Kubernetes delete coverage for:
  - `blocked-command-kubectl-delete`
  - `custom-infra-production-change`
- Added a read-only `kubectl get` near-miss so the new infra rules immediately have quiet-pass boundary evidence.
- Kept thin rule coverage, quiet-pass gaps, and feasible pass-case gaps at zero.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.66 low-count preset fixtures"
```
