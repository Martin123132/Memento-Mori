# v0.1.31 Release Notes

This release adds stack-focused preset example packs so users can inspect a realistic `jester.config.json` before bootstrapping their own repo.

## Added

- `examples/presets/nextjs`
- `examples/presets/vite-react`
- `examples/presets/express-api`
- `examples/presets/fastapi`
- `examples/presets/terraform-k8s`
- `examples/presets/ai-mcp`
- An `examples/presets` index README.
- `jester examples` links for the new preset packs.

## Unchanged

- No config schema changed.
- No review verdict behavior changed.
- No MCP, playground, GitHub Action, or release automation behavior changed.
- Built-in presets keep their existing behavior.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js examples
node .\dist\cli.js config validate --config examples\presets\nextjs\jester.config.json
node .\dist\cli.js config validate --config examples\presets\ai-mcp\jester.config.json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.31 framework preset examples"
```
