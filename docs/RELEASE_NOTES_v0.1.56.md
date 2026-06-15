# Memento Mori Jester v0.1.56

This release fills the largest preset-kind fixture gap left by the coverage report: `node`, `python`, and `security` now each have plan, command, diff, and final review examples.

## Changes

- Added 12 preset fixtures:
  - node plan, command, diff, and final cases,
  - python plan, command, diff, and final cases,
  - security plan, command, diff, and final cases.
- Covered stack-specific rules such as:
  - `custom-node-env-production-change`
  - `blocked-command-npm-publish-force`
  - `custom-node-install-script-change`
  - `custom-python-pickle-load`
  - `blocked-command-pip-install-break-system-packages`
  - `custom-python-eval-exec`
  - `custom-insecure-tls-disabled`
  - `blocked-command-chmod-r-777`
  - `custom-broad-cors`
- Updated fixture report regression tests so `node`, `python`, and `security` cannot silently return to empty preset-kind coverage.
- Refreshed demo and fixture docs for the 80-fixture corpus.

## Public Interface Changes

- No CLI command, MCP tool, config schema, GitHub Action, release workflow, rule matching, or verdict behavior changed.
- Fixture evidence changes are data-only: `jester tune` and `fixtures:report` now have more preset-backed examples to report.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain
node .\dist\cli.js tune coverage
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.56 stack preset fixture coverage"
```

## Post-Release Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest tune risky-domain
npx.cmd -y memento-mori-jester@latest tune coverage
```
