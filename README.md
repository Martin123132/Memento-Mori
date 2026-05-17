# Memento Mori Jester

[![CI](https://github.com/Martin123132/Memento-Mori/actions/workflows/ci.yml/badge.svg)](https://github.com/Martin123132/Memento-Mori/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/memento-mori-jester.svg)](https://www.npmjs.com/package/memento-mori-jester)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A local court-jester sidecar for AI coding agents. It reviews plans, shell commands, diffs, and final answers for overconfidence, missing verification, and obvious footguns.

It roasts the reasoning, not the human.

## Try It

Run directly from GitHub now:

```powershell
npx -y github:Martin123132/Memento-Mori command "git reset --hard"
```

After npm publish:

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

Installed globally:

```powershell
npm install -g memento-mori-jester
jester command "Remove-Item .\dist -Recurse -Force"
```

From a local checkout:

```powershell
git clone https://github.com/Martin123132/Memento-Mori.git
cd Memento-Mori
npm.cmd install
npm.cmd run build
node .\dist\cli.js command "git reset --hard"
```

Expected vibe:

```text
Jester verdict: BLOCK (100/100)
A dazzling command, if the desired outcome is court-sponsored regret.
```

## Setup Wizard

For a copy-pasteable MCP config and suggested agent instruction:

```powershell
npx -y github:Martin123132/Memento-Mori init
```

After npm publish:

```powershell
npx -y memento-mori-jester@latest init
```

For this local checkout before npm publish:

```powershell
node .\dist\cli.js init --mode local
```

Modes:

- `npx`: MCP clients launch the package through `npx -y memento-mori-jester@latest mcp-server`.
- `global`: MCP clients launch `memento-mori-jester-mcp`, assuming the package is globally installed.
- `local`: MCP clients launch the built `dist/server.js` in this checkout.

## CLI

```powershell
jester plan "I will just refactor auth and ship it"
jester command "git reset --hard"
git diff | jester diff --fail-on block
jester final --file .\final-answer.txt --tone professional
jester doctor
jester config init
jester install-hook pre-commit
jester mcp-config --mode npx
```

The package-name binary works too:

```powershell
memento-mori-jester plan "This should probably work"
```

Tones:

- `gentle_stoic`
- `court_jester`
- `absolute_menace`
- `professional`

Risk tolerance:

- `low`
- `medium`
- `high`

## Project Config

Create a config file in your repo:

```powershell
jester config init
```

The CLI and MCP server automatically search upward for `jester.config.json` or `.jester.json`.

Example:

```json
{
  "tone": "court_jester",
  "intensity": 3,
  "riskTolerance": "medium",
  "hookFailOn": "block",
  "blockedCommands": [
    "git reset --hard",
    "git clean -fd"
  ],
  "sensitiveDomains": [
    "auth",
    "billing",
    "payments",
    "production",
    "customer data"
  ],
  "customRules": [
    {
      "id": "no-force-push-main",
      "pattern": "git\\s+push\\s+--force(?:-with-lease)?\\s+origin\\s+main",
      "severity": 5,
      "title": "Force-push to main",
      "detail": "This project treats force-pushing main as a stop-and-think event.",
      "suggestedCheck": "Create a branch or use --force-with-lease only after confirming the protected branch policy.",
      "kinds": ["command", "plan"]
    }
  ]
}
```

Useful config commands:

```powershell
jester config show
jester config show --json
jester config init --force
jester plan "I will deploy-prod now" --config .\jester.config.json
jester command "git reset --hard" --no-config
```

## Git Hooks

Install a pre-commit hook that reviews staged changes:

```powershell
jester install-hook pre-commit
```

Install a pre-push hook that reviews unpushed changes:

```powershell
jester install-hook pre-push
```

Hook commands:

```powershell
jester hook-status
jester install-hook pre-commit --fail-on caution
jester install-hook pre-commit --mode local --force
jester uninstall-hook pre-commit
```

Hooks refuse to overwrite or remove non-jester hooks unless you pass `--force`.

## MCP Server

The MCP server exposes:

- `jester_review_plan`
- `jester_check_command`
- `jester_review_diff`
- `jester_final_answer_roast`

Generate config:

```powershell
jester mcp-config --mode npx
jester mcp-config --mode global
jester mcp-config --mode local
```

Default `npx` config:

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

Suggested agent instruction:

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

More setup examples:

- [Agent Setup](docs/AGENTS.md)
- [GitHub Actions](docs/GITHUB_ACTIONS.md)

## Installer Scripts

People can run the scripts from the repo or raw GitHub URLs.

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

From GitHub:

```powershell
iwr https://raw.githubusercontent.com/Martin123132/Memento-Mori/main/scripts/install.ps1 -OutFile install-jester.ps1
powershell -ExecutionPolicy Bypass -File .\install-jester.ps1
```

macOS/Linux:

```bash
bash ./scripts/install.sh
```

From GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/Martin123132/Memento-Mori/main/scripts/install.sh | bash
```

Both scripts check Node 20+, run a smoke `doctor`, and print MCP config.

## What It Catches

- Destructive commands such as recursive forced deletes, risky git cleanup, pipe-to-shell installs, broad database deletion, and over-broad permissions.
- Agent overconfidence in plans: "just", "obvious", "probably", "should work", and plans with no verification step.
- Diffs with removed tests, type suppressions, debug logs, temporary markers, sensitive domains, and large deletions.
- Final answers with "done/fixed/works" claims that do not mention evidence.
- Project-specific commands, domains, and regex rules from `jester.config.json`.

## Publishing

The npm package name `memento-mori-jester` was available when checked on 2026-05-17.

Release checklist:

```powershell
npm login
npm test
npm run pack:dry
npm publish
```

GitHub: <https://github.com/Martin123132/Memento-Mori>

See [docs/RELEASE.md](docs/RELEASE.md).
