# Memento Mori Jester v0.1.68

This release strengthens the AI preset fixture slice with concrete tool-dispatch examples. It keeps review behavior unchanged and only improves the evidence used by fixture reports and tuning context.

## What Changed

- Added 4 fixture cases, growing the corpus from 166 to 170 fixtures.
- Added two caution fixtures for `custom-ai-user-controlled-tool-dispatch`:
  - Tool names taken from request body input.
  - Tool names taken from URL search parameters.
- Added quiet-pass AI near-misses for:
  - Explicit tool allowlists.
  - Schema validation of model data instead of executing model output.
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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.68 AI tool-dispatch fixtures"
```
