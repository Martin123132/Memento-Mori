# Framework CI Examples

These workflow examples pair the GitHub Action with stack-specific preset configs. They assume you have already committed a `jester.config.json` from one of the built-in presets or from the matching [preset example pack](../presets).

## Before Copying A Workflow

Run the closest preset setup in your project:

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset web
```

Then copy the workflow that best matches your stack into `.github/workflows/memento-mori.yml`.

## Workflows

- [Next.js](nextjs.yml): app-router, middleware, redirects, public env, and browser-rendered UI.
- [Vite React](vite-react.yml): browser storage, public config, redirects, and unsafe HTML surfaces.
- [Express API](express-api.yml): CORS, auth bypasses, raw SQL, webhooks, and migrations.
- [FastAPI](fastapi.yml): dependency-based auth, SQLAlchemy, Alembic, and request validation.
- [Terraform Kubernetes](terraform-k8s.yml): Terraform, Kubernetes, Helm, IAM, and public exposure.
- [AI MCP](ai-mcp.yml): MCP tools, prompts, evals, provider keys, and model-output execution.

## Notes

- Workflows upload SARIF and add a readable Actions job summary.
- Most stacks fail CI only on `BLOCK`.
- The Terraform/Kubernetes example uses `fail-on: caution` because infra repos often want lower tolerance for risky changes.
