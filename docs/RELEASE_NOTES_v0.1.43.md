# v0.1.43 Release Notes

This maintenance release makes `jester tune` fixture support and confidence scoring more useful for sparse but well-curated rule families.

## Improved

- Support/confidence scoring now rewards rule-specific expected fixture coverage instead of measuring every rule against the full fixture corpus size.
- Clean sparse rule evidence can now show `limited` support and `medium` confidence.
- Well-covered low-surprise rule evidence can now show `strong` support and `high` confidence.
- Broad/noisy rules with many surprise matches still stay `thin` / `low`.

## Release Validation

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js tune console-log --json --no-config
node .\dist\cli.js tune package-install-script --json --no-config
node .\dist\cli.js tune risky-domain --json --no-config
```
