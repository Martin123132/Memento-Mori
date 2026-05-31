# Vite React Example

Use this shape for browser-first React apps built with Vite, especially apps that touch auth tokens, redirects, public config, or raw HTML rendering.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset web
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "Vite React diff"
git diff | npx -y memento-mori-jester@latest summary
```
