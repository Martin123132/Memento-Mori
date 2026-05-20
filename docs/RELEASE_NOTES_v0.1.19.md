# v0.1.19 Release Notes

This release adds a local paste-in playground so people can try Memento Mori Jester in a browser before wiring it into an agent or hook.

## Added

- `jester playground`, which starts a local-only server on `127.0.0.1`.
- A browser UI for reviewing commands, plans, diffs, and final answers.
- A local `/api/review` endpoint backed by the same deterministic review engine as the CLI and MCP server.
- Playground tests for the HTML shell, review API, project config rules, and empty input handling.

## Changed

- README, CLI docs, getting-started docs, demo transcript, roadmap, and changelog now mention the playground path.
- Roadmap marks the local paste-in playground as shipped and points the next product idea toward an agent setup chooser.

## Unchanged

- No rule matching, config schema, MCP tools, GitHub Action behavior, or release workflow behavior changed.

## Useful Commands

```powershell
npm.cmd test
node .\dist\cli.js playground
npx.cmd -y memento-mori-jester@latest playground
```
