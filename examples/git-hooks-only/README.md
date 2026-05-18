# Git Hooks Only

Use this if you do not want MCP yet and only want local git checks.

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node --hook pre-commit
```

For stricter push checks too:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset security --hook pre-commit --hook pre-push
```

Check hook status:

```powershell
npx -y memento-mori-jester@latest hook-status
```

Remove a managed hook:

```powershell
npx -y memento-mori-jester@latest uninstall-hook pre-commit
```
