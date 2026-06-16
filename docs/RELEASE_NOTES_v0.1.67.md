# Memento Mori Jester v0.1.67

This release continues the fixture-report curation track. It adds practical quiet-pass examples for the lowest preset slices after v0.1.66 while keeping review behavior unchanged.

## What Changed

- Added 6 fixture cases, growing the corpus from 160 to 166 fixtures.
- Added security preset quiet-pass examples for:
  - Static analysis scan commands.
  - Checksum verification commands.
- Added web preset quiet-pass examples for:
  - Accessible button markup.
  - Static internal route links.
- Added node and python quiet-pass examples for:
  - Node lint commands.
  - Python ruff checks.
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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.67 preset quiet-pass fixtures"
```
