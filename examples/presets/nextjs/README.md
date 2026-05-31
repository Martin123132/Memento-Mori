# Next.js Example

Use this shape for Next.js apps with app-router routes, middleware, server actions, public environment variables, and browser-rendered UI.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset web
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "Next.js app diff"
git diff | npx -y memento-mori-jester@latest summary
```
