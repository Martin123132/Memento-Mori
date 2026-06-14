# v0.1.46 Release Notes

This release makes the local playground easier to try by adding one-click sample inputs for each review kind. It does not change review matching, scoring, verdicts, config, MCP tools, GitHub Action behavior, or release automation.

## Changed

- Added playground sample buttons:
  - `Hard reset`
  - `Overconfident plan`
  - `Public token diff`
  - `Untested final`
- Sample buttons switch the active review kind and populate the subject/content fields.
- Added tests that the rendered playground exposes all sample buttons and keeps sample review-kind coverage deterministic.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js playground
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.46 playground sample buttons"
```
