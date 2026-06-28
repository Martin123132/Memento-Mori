# Memento Mori Jester v0.1.110

## Summary

This release polishes the first-user path. `jester start` now includes the same read-only preset recommendation step that the README and Getting Started guide already recommend before writing starter files.

## Changes

- Added a `Choose a preset` step to `jester start`.
- Added a stable `recommend` step id to `jester start --json`.
- Updated README, CLI docs, Getting Started, and demo transcript so onboarding follows one sequence: `doctor`, `playground`, `config recommend`, setup, `bootstrap`, config validation, and a sample destructive-command review.
- Kept the change local and deterministic: no new commands, config fields, MCP behavior, rule behavior, scoring, GitHub Action behavior, workflow behavior, or licence changes.

## Public Interface Changes

- `jester start` text output now includes `config recommend`.
- `jester start --json` now includes a `recommend` step before `agent-setup`.

## Release Validation

```powershell
npm.cmd run audit:high
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js start
node .\dist\cli.js start --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.110 first-user start flow polish"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest start
npx.cmd -y memento-mori-jester@latest start --json
npx.cmd -y memento-mori-jester@latest doctor
```
