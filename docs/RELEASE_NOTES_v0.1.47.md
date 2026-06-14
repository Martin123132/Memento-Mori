# v0.1.47 Release Notes

This is a docs-only onboarding release. It makes the first README path clearer without changing CLI behavior, review behavior, MCP tools, config, playground runtime, GitHub Actions, or release automation.

## Changed

- Reworked README Start Here into four steps:
  - try Jester without writing files,
  - add it to a project with the recommended preset,
  - connect Codex, Claude Code, or a generic MCP client,
  - add hooks or GitHub code scanning when ready.
- Updated Getting Started to follow the same order and mention the playground sample buttons.
- Updated the roadmap with the shipped README polish and the next demo/onboarding idea.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js start
node .\dist\cli.js config recommend
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.47 README onboarding polish"
```
