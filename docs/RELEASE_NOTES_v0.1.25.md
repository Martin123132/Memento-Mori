# v0.1.25 Release Notes

This release adds a read-only preset recommendation command for choosing a starter config profile from local repo files.

## Added

- `jester config recommend`.
- `jester config recommend --json`.
- Local deterministic scoring for `node`, `python`, `web`, `api`, `infra`, `ai`, `security`, and `default`.
- Advisory existing-config reporting when `jester.config.json` or `.jester.json` is present.
- Next-command guidance for `jester start`, `jester config init`, and `jester bootstrap`.

## Unchanged

- No config schema changed.
- No review verdict behavior changed.
- No MCP tools, playground behavior, or release automation changed.
- The command does not write files, install hooks, or make network calls.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js config recommend
node .\dist\cli.js config recommend --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.25 preset recommendation"
```
