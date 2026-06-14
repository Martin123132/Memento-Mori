# v0.1.53 Release Notes

This patch fixes the newly added fixture authoring validator so it works from the published npm package, not only from a source checkout.

## What Changed

- Made `scripts/check-fixtures.mjs` self-contained by removing its source-file reads.
- Added a production-readiness guard that prevents `fixtures:check` from depending on `src/config.ts` or `src/types.ts`.

## Behavior Notes

- No CLI, MCP, config, rule, playground, GitHub Action runtime, or release automation behavior changed.
- Review fixture expectations remain unchanged.

## Release Validation

```powershell
npm.cmd test
npm.cmd run fixtures:check
npm.cmd run production:check
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.53 published fixture validator fix"
```

Post-publish smoke:

```powershell
npm.cmd exec --yes --package memento-mori-jester@latest -- npm run fixtures:check --prefix <published-package-path>
```
