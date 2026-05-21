# v0.1.24 Release Notes

This release adds an `api` preset for backend API projects.

## Added

- `jester config init --preset api`.
- `jester bootstrap --preset api`.
- `jester start --preset api`.
- API-sensitive domains for auth middleware, authorization, sessions, CORS, CSRF, rate limits, webhooks, database writes, migrations, admin routes, tenants, request validation, and OpenAPI specs.
- Custom API rules for broad CORS, auth bypasses, disabled rate limiting, raw SQL from request input, unsigned webhooks, and destructive migrations.

## Unchanged

- No MCP behavior changed.
- No config schema changed.
- Existing presets keep their current behavior.
- The `api` preset preserves the default risk tolerance and hook failure threshold.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js config presets
node .\dist\cli.js config init --preset api --path jester-api.config.json
node .\dist\cli.js config validate --config jester-api.config.json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.24 api preset"
```
