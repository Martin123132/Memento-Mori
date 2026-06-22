# Memento Mori Jester v0.1.82

## Summary

This release continues the core quality track after the landing-page release. It adds a small fixture-backed false-positive batch and a framework tuning guide so maintainers can compare real noisy reports with safe examples before muting or changing rules.

## What Changed

- Added six quiet-pass fixtures, growing the corpus from 216 to 222 cases:
  - `python-fastapi-dependency-diff-pass`
  - `python-uv-sync-frozen-command-pass`
  - `infra-terraform-plan-docs-pass`
  - `infra-helm-values-docs-pass`
  - `sec-gitleaks-redacted-command-pass`
  - `node-next-lint-command-pass`
- Added `docs/FRAMEWORK_TUNING.md`.
- Linked framework tuning guidance from README, CLI docs, and getting-started docs.
- Refreshed demo, promo-source evidence counts, site proof count, fixture docs, changelog, and roadmap.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action or release workflow changes.
- Fixture/tuning evidence changes only because the corpus is larger.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run site:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json --no-config
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.82 framework tuning fixtures"
```

Expected:

- fixture report shows `Fixtures: 222`,
- no thin rule coverage,
- no preset/kind gaps,
- no rules without quiet-pass coverage,
- `promo:check` passes with 222 fixtures and 8 risky-domain quiet-pass examples,
- GitHub Release and npm Publish complete from the `v0.1.82` tag.
