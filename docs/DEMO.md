# Demo Transcript

This is a short script for showing what Memento Mori Jester does. The README image is generated from the same product story by `scripts/render-demo-svg.mjs`.

## 1. Health Check

Command:

```powershell
npx -y memento-mori-jester@latest doctor
```

Typical output:

```text
Memento Mori Jester doctor

PASS node-version: Node v24.15.0; required >=20.
PASS mcp-server-file: ...\node_modules\memento-mori-jester\dist\server.js
PASS review-engine: Dangerous git command is blocked.
PASS config: No config file found; using built-in defaults.

The fool is fit for court.
```

## 2. Dangerous Command Review

Command:

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

Typical output:

```text
Jester verdict: BLOCK (100/100)
A dazzling command, if the desired outcome is court-sponsored regret.

Concerns:
- [S5] Destructive git operation: This can discard local work or remove untracked files. Evidence: git reset --hard

Suggested checks:
- Inspect `git status`, confirm the target branch, and make a backup or stash before running it.
```

## 3. Overconfident Plan Review

Command:

```powershell
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
```

Typical output:

```text
Jester verdict: CAUTION (40/100)

Concerns:
- [S2] Confidence theater: Words like simple, obvious, or definitely often hide unpriced complexity.
- [S2] No verification step: The plan changes behavior but does not say how the result will be checked.
- [S3] High-risk domain touched: Auth, billing, production, migrations, or security-sensitive areas deserve extra evidence.
```

The exact jab varies by tone, but the point should be clear: add evidence before marching onward.

## 4. Local Playground

Command:

```powershell
npx -y memento-mori-jester@latest playground
```

Typical output:

```text
Memento Mori Jester playground

Open http://127.0.0.1:4818/
Config: built-in defaults
Press Ctrl+C to stop.
```

## 5. Preset Preview

Command:

```powershell
npx -y memento-mori-jester@latest config presets
```

Output:

```text
default
node
python
web
infra
security
```

Use `web` for frontend/browser apps, `infra` for deployment or cloud infrastructure repos, and `security` for a stricter general policy.

## 6. Bootstrap A Project

Command:

```powershell
mkdir jester-demo
cd jester-demo
npx -y memento-mori-jester@latest bootstrap --preset web
```

Typical output:

```text
Memento Mori Jester bootstrap

Files:
  wrote ...\jester.config.json
  wrote ...\memento-mori.mcp.json
  wrote ...\MEMENTO_MORI.md

Next:
  npx -y memento-mori-jester@latest doctor
  npx -y memento-mori-jester@latest config validate
  Add memento-mori.mcp.json to your MCP client, or copy the command and args from it.
```

## 7. MCP Setup Preview

Command:

```powershell
npx -y memento-mori-jester@latest mcp-config --mode npx
```

Output:

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

## 8. Agent Setup Chooser

Command:

```powershell
npx -y memento-mori-jester@latest setup --agent codex
```

Typical output includes:

```text
Codex
Config target: Codex MCP config
Instruction target: AGENTS.md

MCP config:
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": ["-y", "memento-mori-jester@latest", "mcp-server"]
    }
  }
}
```
