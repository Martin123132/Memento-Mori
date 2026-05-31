# Preset Examples

These are copy-pasteable starting points for common repo shapes. Each folder contains a valid `jester.config.json` and a short README with the recommended commands.

Use `jester config recommend` first when you are inside a real project. These examples are for teams that want to see what a stack-focused config looks like before bootstrapping.

## Packs

- [Next.js](nextjs) uses the `web` preset shape for app-router, middleware, browser storage, and public environment variable risks.
- [Vite React](vite-react) uses the `web` preset shape for client-side apps, public config, HTML injection, and storage risks.
- [Express API](express-api) uses the `api` preset shape for CORS, auth bypasses, raw SQL, webhooks, and destructive migrations.
- [FastAPI](fastapi) uses the `api` and Python-oriented shape for dependency, auth, SQL, and Alembic migration risks.
- [Terraform Kubernetes](terraform-k8s) uses the `infra` preset shape for Terraform, Kubernetes, IAM, and public exposure risks.
- [AI MCP](ai-mcp) uses the `ai` preset shape for MCP tools, prompts, evals, provider keys, and model-output execution risks.

## Commands

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset web
git diff | npx -y memento-mori-jester@latest summary
```
