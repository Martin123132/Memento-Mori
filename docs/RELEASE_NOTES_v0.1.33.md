# v0.1.33 Release Notes

This release adds framework-specific GitHub Actions examples so teams can pair preset configs with copy-paste CI workflows.

## Added

- `examples/ci/nextjs.yml`
- `examples/ci/vite-react.yml`
- `examples/ci/express-api.yml`
- `examples/ci/fastapi.yml`
- `examples/ci/terraform-k8s.yml`
- `examples/ci/ai-mcp.yml`
- `examples/ci/README.md`
- `jester examples` links for the new CI examples.

## Workflow Shape

- Uses `actions/checkout@v6`.
- Uses the Memento Mori composite action.
- Writes SARIF to `jester.sarif`.
- Uploads SARIF with `github/codeql-action/upload-sarif@v3`.
- Enables readable GitHub Actions job summaries.
- Uses `fail-on: caution` for Terraform/Kubernetes and `fail-on: block` for the other stacks.

## Unchanged

- No CLI command behavior changed.
- No config schema or review rule behavior changed.
- No MCP, playground, release automation, or npm publish behavior changed.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js examples
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.33 framework CI examples"
```
