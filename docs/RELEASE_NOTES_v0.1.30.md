# v0.1.30 Release Notes

This release removes the GitHub Actions Node 20 deprecation warnings by moving the repo workflows, generated workflow examples, and composite action runtime to Node 24-era Actions versions.

## Changed

- CI now uses `actions/checkout@v6`, `actions/setup-node@v6`, and `node-version: 24`.
- The GitHub Release workflow now uses `actions/checkout@v6`.
- The composite action now uses `actions/setup-node@v6` and `node-version: 24`.
- `jester github-action`, GitHub Actions docs, and example workflows now use `actions/checkout@v6`.

## Unchanged

- No CLI command behavior changed.
- No MCP, config schema, review rule, playground, or npm publish behavior changed.
- SARIF output, job summaries, and `fail-on` exit behavior are preserved.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js github-action
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.30 Node 24 GitHub Actions cleanup"
```
