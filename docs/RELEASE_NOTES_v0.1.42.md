# v0.1.42 Release Notes

This maintenance release tightens `jester tune` fixture evidence so it stays deterministic and easier to interpret in repos with local project config.

## Fixed

- Built-in and structural rule evidence now evaluates each fixture with the fixture's own preset config.
- Project-config rules now explicitly report no generic fixture coverage instead of accidentally matching preset fixtures through local `blockedCommands`, `sensitiveDomains`, or custom rules.
- Added regression coverage for a local blocked command that overlaps existing fixture content.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune risky-domain --json --no-config
node .\dist\cli.js tune console-log --no-config
```
