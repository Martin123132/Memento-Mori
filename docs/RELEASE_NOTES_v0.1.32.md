# v0.1.32 Release Notes

This release adds a real-usage review fixture suite so preset tuning changes have concrete pass, caution, and block examples in CI.

## Added

- `examples/fixtures/preset-review-cases.json`.
- `examples/fixtures/README.md`.
- Tests that run every fixture through the real review engine with the matching built-in preset.
- `jester examples` now links to the review fixtures.

## Fixture Coverage

- Documentation-only diffs that should stay quiet.
- Web preset public key and browser-storage cases.
- API preset CORS and raw SQL cases.
- Infra preset public exposure and destructive command cases.
- AI preset eval-skipping and model-output execution cases.

## Unchanged

- No config schema changed.
- No review verdict behavior intentionally changed.
- No MCP, playground, GitHub Action, or release automation behavior changed.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js examples
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.32 review fixtures"
```
