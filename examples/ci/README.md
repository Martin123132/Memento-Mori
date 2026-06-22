# Framework CI Examples

These workflow examples pair the GitHub Action with stack-specific preset configs. They assume you have already committed a `jester.config.json` from one of the built-in presets or from the matching [preset example pack](../presets).

## Before Copying A Workflow

Run the closest preset setup in your project:

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset web
```

Then copy the workflow that best matches your stack into `.github/workflows/memento-mori.yml`.

If you want a first CI smoke before enabling code scanning, copy [Adoption Smoke](adoption-smoke.yml). It runs:

- `npx -y memento-mori-jester@latest doctor`
- `npx -y memento-mori-jester@latest summary --kind command "git reset --hard"`
- `npm run framework:tuning:check` and `npm run framework:tuning:doctor` from the published package tarball

Maintainers can prove those commands from a minimal installed project with [Consumer Quickstart Smoke](../consumer-quickstart) and `npm run consumer:quickstart:check`.

## Workflows

- [Adoption Smoke](adoption-smoke.yml): read-only setup check for doctor, summary, and framework tuning cookbook commands.
- [Consumer Quickstart Smoke](../consumer-quickstart): minimal installed-project fixture for the adoption commands.
- [Next.js](nextjs.yml): app-router, middleware, redirects, public env, and browser-rendered UI.
- [Vite React](vite-react.yml): browser storage, public config, redirects, and unsafe HTML surfaces.
- [Express API](express-api.yml): CORS, auth bypasses, raw SQL, webhooks, and migrations.
- [FastAPI](fastapi.yml): dependency-based auth, SQLAlchemy, Alembic, and request validation.
- [Terraform Kubernetes](terraform-k8s.yml): Terraform, Kubernetes, Helm, IAM, and public exposure.
- [AI MCP](ai-mcp.yml): MCP tools, prompts, evals, provider keys, and model-output execution.

## Notes

- Workflows upload SARIF and add a readable Actions job summary.
- The adoption smoke workflow is read-only and does not upload SARIF.
- Most stacks fail CI only on `BLOCK`.
- The Terraform/Kubernetes example uses `fail-on: caution` because infra repos often want lower tolerance for risky changes.
