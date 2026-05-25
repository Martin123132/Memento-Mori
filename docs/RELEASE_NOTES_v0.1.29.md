# v0.1.29 Release Notes

This release makes GitHub Actions runs easier to read by adding a human-friendly Jester summary beside the existing SARIF/code-scanning output.

## Added

- Composite action input `summary`, defaulting to `true`.
- GitHub Actions job summaries for action runs when `$GITHUB_STEP_SUMMARY` is available.
- Generated workflows now include `summary: true`.

## Summary Output

The summary includes:

- verdict and risk score
- review kind and subject
- total issue count
- grouped rule hits
- highest-severity rule
- suggested next commands such as `jester tune <rule-id>` and `jester rule <rule-id>`

## Unchanged

- SARIF output still works through `format: sarif` and `output-file`.
- `fail-on` exit behavior is preserved.
- No CLI review behavior changed.
- No MCP, config schema, rule matching, playground, or release automation changed.
- No PR comments or extra GitHub write permissions are required.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js github-action
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.29 GitHub Action summary output"
```
