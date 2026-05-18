# Release Guide

This project is published as a one-command package on npm.

## 1. Publish To npm

```powershell
npm login
npm test
npm run pack:dry
npm publish
```

If npm asks for browser authentication, approve it in the browser window that opens.

For the less painful route, configure trusted publishing once using [TRUSTED_PUBLISHING.md](TRUSTED_PUBLISHING.md), then run the `npm Publish` workflow in GitHub Actions.

The package publishes these bins:

- `jester`: human CLI
- `memento-mori-jester`: human CLI, useful for `npx`
- `memento-mori-jester-mcp`: MCP stdio server

## 2. Smoke Test Published Package

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest examples
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

## 3. MCP Copy-Paste

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

## 4. Repository Metadata

The package is configured for:

```text
https://github.com/Martin123132/Memento-Mori
```

If the repo moves, update `repository`, `homepage`, and `bugs` in `package.json`, plus the raw installer URLs in `README.md`.

## 5. Post-Release Workflow Check

In a throwaway git repo:

```powershell
npx -y memento-mori-jester@latest config init
npx -y memento-mori-jester@latest install-hook pre-commit
npx -y memento-mori-jester@latest hook-status
```

Then stage a risky diff and confirm the hook blocks or cautions according to `hookFailOn`.

## 6. GitHub Release

Pushing a `v*` tag now creates a GitHub Release automatically. If `docs/RELEASE_NOTES_<tag>.md` exists, those notes are used; otherwise GitHub-generated notes are used.
