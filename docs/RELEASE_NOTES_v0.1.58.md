# Memento Mori Jester v0.1.58

This release adds quiet-pass evidence for thin preset/config-derived rules. The goal is better tuning guidance: maintainers can now see safe near-misses for many custom preset rules, configured sensitive-domain checks, and preset blocked commands instead of only seeing examples where those rules fire.

## Changes

- Added 22 quiet-pass fixtures covering safe near-misses for:
  - preset blocked commands such as forced npm publish, Terraform destroy, Prisma reset, broad chmod, and break-system pip installs,
  - configured sensitive-domain checks such as CORS, IAM, postinstall, session, webhook, eval, and public secret wording,
  - custom stack rules across node, python, web, API, infra, AI, and security presets.
- Updated fixture-report regression coverage so thin custom/config-derived rules cannot silently return to zero quiet-pass coverage.
- Refreshed demo and fixture docs for the 112-fixture corpus.

## Public Interface Changes

- No CLI command, MCP tool, config schema, GitHub Action, release workflow, rule matching, or verdict behavior changed.
- Fixture evidence changes are data-only: `jester tune` and `fixtures:report` now have more safe near-miss evidence to report.

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
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.58 quiet-pass precision fixtures"
```

## Post-Release Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor --no-config
npx.cmd -y memento-mori-jester@latest tune coverage --no-config
```
