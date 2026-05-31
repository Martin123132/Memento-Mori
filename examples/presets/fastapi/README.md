# FastAPI Example

Use this shape for FastAPI services with dependency-based auth, SQLAlchemy, Alembic migrations, and webhook or background-job entrypoints.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset api
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "FastAPI diff"
git diff | npx -y memento-mori-jester@latest summary
```
