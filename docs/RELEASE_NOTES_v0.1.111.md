# Memento Mori Jester v0.1.111

## Summary

This release makes `jester start` smarter while keeping it read-only. When no preset is supplied, `start` now uses the same local repo detection as `jester config recommend`, shows the recommendation evidence, and places the recommended preset into the later `bootstrap` command.

## Changes

- `jester start` now auto-selects the recommended preset when `--preset` is omitted.
- `jester start --preset <name>` remains an explicit override and still shows the local recommendation for comparison.
- `jester start --json` now includes:
  - `presetSource`
  - `recommendation.recommendedPreset`
  - `recommendation.confidence`
  - `recommendation.reasons`
  - `recommendation.detectedStacks`
  - `recommendation.configPath`
- Updated README, CLI docs, Getting Started, demo transcript, roadmap, changelog, and tests.

## Public Interface Changes

- Text output now shows preset source, recommendation confidence, and detected stack.
- JSON output adds compact recommendation metadata.
- No new commands, config fields, MCP tools, rule behavior, scoring behavior, GitHub Action behavior, workflow behavior, or licence changes.

## Release Validation

```powershell
npm.cmd run audit:high
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js start
node .\dist\cli.js start --preset web --agent codex --hook pre-commit
node .\dist\cli.js start --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.111 smart start preset recommendation"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest start
npx.cmd -y memento-mori-jester@latest start --json
npx.cmd -y memento-mori-jester@latest doctor
```
