# Express API Example

Use this shape for Express, Fastify, Nest, or similar Node API services that handle auth, webhooks, raw SQL, CORS, and migrations.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset api
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "Express API diff"
git diff | npx -y memento-mori-jester@latest summary
```
