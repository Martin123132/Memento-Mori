# Memento Mori Jester v0.1.61

This release uses the new `fixtures:report` curation-next output from v0.1.60 to add a focused fixture precision batch. It does not change review logic, scoring, matching, CLI output shape, MCP tools, GitHub Action behavior, or release automation.

## What Changed

- Added 9 fixture cases, growing the corpus from 125 to 134 fixtures.
- Added second firing examples for all preset blocked-command rules:
  - `blocked-command-npm-publish-force`
  - `blocked-command-pip-install-break-system-packages`
  - `blocked-command-prisma-migrate-reset-force`
  - `blocked-command-terraform-destroy`
  - `blocked-command-chmod-r-777`
- Added second examples for selected stack-specific sensitive-domain/custom-rule coverage:
  - API wildcard CORS
  - Web unsafe HTML rendering
  - Infra IAM wildcard resources
  - Node `npm publish` and `postinstall` surfaces
- Reduced total thin fixture coverage from 37 rules to 21.
- Removed blocked-command thin coverage entirely in `npm run fixtures:report`.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.61 curation-next fixture batch"
```
