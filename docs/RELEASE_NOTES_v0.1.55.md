# Memento Mori Jester v0.1.55

This release adds the first targeted quiet-pass fixture batch so noisy-rule tuning has safer boundary evidence, not just examples where a rule fires.

## Changes

- Added 10 quiet-pass fixtures covering safe near-misses for:
  - `risky-domain`
  - `done-without-evidence`
  - `package-install-script`
  - `secret-material`
  - `sensitive-env-change`
  - `test-removal`
  - `skip-tests`
  - `vibes-based-plan`
  - `chmod-777`
  - `privileged-command`
- Extended `jester tune` text and JSON fixture evidence with quiet-pass counts, weights, fixture records, and samples.
- Extended `npm run fixtures:report` with:
  - `rulesWithoutQuietPassCoverage`
  - `quietPassRuleCoverage`
  - per-rule quiet-pass counts in the existing gap summaries.
- Updated docs and readiness checks so fixture maintenance now tracks quiet-pass boundaries explicitly.

## Public Interface Changes

- `jester tune <rule-id> --json` now includes additional `fixtureEvidence` fields:
  - `quietPassCount`
  - `quietPassWeight`
  - `quietPassFixtures`
  - `quietPassSamples`
- No review matching, verdict scoring, MCP tools, config schema, GitHub Action behavior, or release automation changed.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain
node .\dist\cli.js tune risky-domain --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.55 quiet-pass fixture evidence"
```

## Post-Release Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest tune risky-domain
npx.cmd -y memento-mori-jester@latest tune risky-domain --json
```
