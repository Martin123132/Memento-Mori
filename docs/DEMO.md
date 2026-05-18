# Demo Transcript

This is a short script for showing what Memento Mori Jester does.

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
Jester verdict: CAUTION

Concerns:
- Confidence theater
- No verification step
- High-risk domain touched
```

The exact wording varies by tone, but the point should be clear: add evidence before marching onward.

## 4. Bootstrap A Project

Command:

```powershell
mkdir jester-demo
cd jester-demo
npx -y memento-mori-jester@latest bootstrap --preset node
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

## 5. Final Answer Check

Command:

```powershell
npx -y memento-mori-jester@latest final "Implemented the fix, but tests not run."
```

Typical output:

```text
Jester verdict: CAUTION

Concerns:
- [S3] Final answer says tests were not run

Suggested checks:
- State what remains unverified and the exact command or manual check someone should run next.
```

## 6. MCP Setup Preview

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
