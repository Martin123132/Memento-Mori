# Memento Mori Jester v0.1.59

This release completes the quiet-pass coverage pass for the fixture suite. After v0.1.58 covered thin custom and preset/config-derived rules, v0.1.59 adds safe near-misses for the remaining sparse built-in and structural rules.

## Changes

- Added 13 quiet-pass fixtures covering safe near-misses for:
  - `missing-verification-step`
  - `confidence-theater`
  - `temporary-marker`
  - `ts-ignore`
  - `console-log`
  - `large-removal`
  - `wildcard-file-operation`
  - `database-destruction`
  - `destructive-git-history`
  - `handwave-final`
  - `pipe-to-shell`
  - `recursive-force-delete`
  - `untested-final`
- Updated fixture-report regression coverage so `rulesWithoutQuietPassCoverage` must stay empty.
- Refreshed demo and fixture docs for the 125-fixture corpus.

## Public Interface Changes

- No CLI command, MCP tool, config schema, GitHub Action, release workflow, rule matching, or verdict behavior changed.
- Fixture evidence changes are data-only: `jester tune` and `fixtures:report` now have safe near-miss evidence for every rule family.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --no-config
node .\dist\cli.js tune coverage --no-config
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.59 built-in quiet-pass fixtures"
```

## Post-Release Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor --no-config
npx.cmd -y memento-mori-jester@latest tune coverage --no-config
```
