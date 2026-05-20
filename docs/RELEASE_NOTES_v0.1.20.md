# v0.1.20 Release Notes

This release makes agent wiring less guessy by adding one setup chooser for Codex, Claude Code, and generic MCP clients.

## Added

- `jester setup`, which prints exact setup sections for supported agents.
- `jester setup --agent codex`, `--agent claude`, and `--agent generic` for one-agent output.
- `jester setup --json` for structured setup details.
- Smoke-check commands and docs pointers in the setup output.

## Changed

- README, CLI docs, getting-started docs, agent docs, roadmap, and changelog now point to the setup chooser.
- `jester examples` now includes setup commands in the setup section.

## Unchanged

- No MCP tool behavior, rule matching, config schema, GitHub Action behavior, playground behavior, or release workflow behavior changed.

## Useful Commands

```powershell
npm.cmd test
node .\dist\cli.js setup
node .\dist\cli.js setup --agent claude --json
npx.cmd -y memento-mori-jester@latest setup --agent codex
```
