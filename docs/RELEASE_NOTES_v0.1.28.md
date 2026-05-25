# v0.1.28 Release Notes

This release adds a rule-hit summary command so users can see what actually made a review noisy before tuning individual rules.

## Added

- `jester summary`.
- `jester summary --json`.
- Support for the same review inputs as the existing review commands:
  - piped diffs, defaulting to `--kind diff`
  - `--kind plan|command|diff|final`
  - `--file`
  - `--config` and `--no-config`
- Grouped rule-hit counts, highest-severity issue, and suggested next commands:
  - `jester tune <rule-id>`
  - `jester rule <rule-id>`

## Unchanged

- No config schema changed.
- No review verdict behavior changed.
- No MCP tools, playground behavior, or release automation changed.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js summary --kind command "git reset --hard"
node .\dist\cli.js summary --kind command "git reset --hard" --json
git diff | node .\dist\cli.js summary
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.28 rule hit summary"
```
