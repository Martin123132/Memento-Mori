# Release Guide

This project is ready to become a one-command package.

## 1. Create The Repo

Suggested repo name:

```text
Memento-Mori
```

After creating it:

```powershell
git remote add origin https://github.com/Martin123132/Memento-Mori.git
git branch -M main
git push -u origin main
```

## 2. Confirm Package Name

The name was available on 2026-05-17:

```powershell
npm view memento-mori-jester version
```

An npm 404 means the name is still unclaimed.

## 3. Publish To npm

```powershell
npm login
npm test
npm run pack:dry
npm publish
```

The package publishes these bins:

- `jester`: human CLI
- `memento-mori-jester`: human CLI, useful for `npx`
- `memento-mori-jester-mcp`: MCP stdio server

## 4. Smoke Test Published Package

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest command "git reset --hard"
npx -y memento-mori-jester@latest init
npx -y memento-mori-jester@latest bootstrap --preset node
npx -y memento-mori-jester@latest config init
npx -y memento-mori-jester@latest config init --preset security --path jester-security.config.json
npx -y memento-mori-jester@latest config validate --config jester-security.config.json
```

If this machine is not logged in to npm yet:

```powershell
npm login
npm whoami
```

Then run the publish commands again.

## 5. MCP Copy-Paste

The lowest-friction config uses `npx`:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": [
        "-y",
        "memento-mori-jester@latest",
        "mcp-server"
      ]
    }
  }
}
```

For users who install globally:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "memento-mori-jester-mcp",
      "args": []
    }
  }
}
```

## 6. Repository Metadata

The package is configured for:

```text
https://github.com/Martin123132/Memento-Mori
```

If the repo moves, update `repository`, `homepage`, and `bugs` in `package.json`, plus the raw installer URLs in `README.md`.

## 7. Post-Release Workflow Check

In a throwaway git repo:

```powershell
npx -y memento-mori-jester@latest config init
npx -y memento-mori-jester@latest install-hook pre-commit
npx -y memento-mori-jester@latest hook-status
```

Then stage a risky diff and confirm the hook blocks or cautions according to `hookFailOn`.
