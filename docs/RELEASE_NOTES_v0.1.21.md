# v0.1.21 Release Notes

This release adds a read-only first-run guide so new users can see the exact next commands before writing any project files.

## Added

- `jester start`, a guided checklist for doctor, playground, agent setup, bootstrap, config validation, and a sample review.
- `jester start --json`, with stable step ids and commands for tools or docs.
- `--preset`, `--agent`, `--mode`, and repeated `--hook` support on `start`.

## Changed

- README, getting-started docs, CLI docs, demo transcript, roadmap, and changelog now lead with the guided first-run path.

## Unchanged

- `jester start` does not write files or install hooks.
- No MCP, config schema, rule matching, playground, GitHub Action, or release workflow behavior changed.

## Useful Commands

```powershell
npm.cmd test
node .\dist\cli.js start
node .\dist\cli.js start --preset web --agent codex --hook pre-commit
node .\dist\cli.js start --json
```
