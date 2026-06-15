# Memento Mori Jester v0.1.57

This release completes the preset-kind fixture grid left after v0.1.56. Every built-in preset now has plan, command, diff, and final review examples in the fixture suite.

## Changes

- Added 10 preset fixtures:
  - web plan, command, and final cases,
  - API plan, command, and final cases,
  - infra plan and final cases,
  - AI command and final cases.
- Covered stack-specific rules such as:
  - `custom-web-unsafe-html-injection`
  - `custom-web-public-secret-name`
  - `custom-api-webhook-signature-disabled`
  - `blocked-command-prisma-migrate-reset-force`
  - `custom-infra-iam-wildcard-permission`
  - `custom-ai-public-provider-key`
  - `custom-ai-evals-skipped`
- Updated fixture report regression tests so any future preset-kind gap is caught directly.
- Refreshed demo and fixture docs for the 90-fixture corpus.

## Public Interface Changes

- No CLI command, MCP tool, config schema, GitHub Action, release workflow, rule matching, or verdict behavior changed.
- Fixture evidence changes are data-only: `jester tune` and `fixtures:report` now have fuller preset-backed examples to report.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --no-config
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.57 remaining preset fixture coverage"
```

## Post-Release Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor --no-config
npx.cmd -y memento-mori-jester@latest tune coverage --no-config
```
