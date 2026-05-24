# v0.1.27 Release Notes

This release adds a read-only tuning helper for deciding whether a noisy rule should be muted.

## Added

- `jester tune <rule-id>`.
- `jester tune <rule-id> --json`.
- Practical tuning output with:
  - why the rule exists
  - when it may be noisy
  - the safer move
  - a before-muting checklist
  - exact inspect, disable, validate, and re-enable commands
- Support for built-in, structural, disabled, and project-config rules.

## Unchanged

- No config schema changed.
- No review verdict behavior changed.
- No MCP tools, playground behavior, or release automation changed.
- The command does not write files or disable anything by itself.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js tune risky-domain
node .\dist\cli.js tune risky-domain --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.27 rule tuning helper"
```
