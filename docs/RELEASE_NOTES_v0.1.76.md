# Memento Mori Jester v0.1.76

## Summary

This release expands the real-world quiet-pass fixture corpus for the lowest-count preset slices: `python`, `security`, `web`, and `ai`.

## What Changed

- Added eight pass fixtures, growing the fixture suite from 208 to 216 cases.
- Added python safe-boundary examples for Pydantic model validation and Pyright type checks.
- Added security safe-boundary examples for SBOM generation and vulnerability-report documentation.
- Added web safe-boundary examples for escaped React rendering and docs-only session-cookie guidance.
- Added AI safe-boundary examples for model regression checks and static action allowlists.
- Refreshed the fixture docs, demo transcript, changelog, and roadmap.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, or verdict behavior changes.
- Fixture reports now reflect 216 total fixtures and the updated preset counts.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.76 real-world preset quiet-pass curation"
```

Expected fixture report checks:

- `Fixtures: 216`
- no thin rule coverage
- no preset/kind gaps
- no rules without quiet-pass coverage
- deterministic `Curation next` guidance
