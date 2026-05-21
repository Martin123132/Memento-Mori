# Codex Setup

## Generate The Config

```powershell
npx -y memento-mori-jester@latest setup --agent codex
npx -y memento-mori-jester@latest init --agent codex
npx -y memento-mori-jester@latest mcp-config --agent codex --mode npx
```

`setup --agent codex` prints the `mcpServers` block, the suggested `AGENTS.md` instruction, smoke checks, and the docs pointer in one place. Copy the generated `mcpServers` block into your Codex MCP configuration.

## Project Starter Kit

Inside a repo:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node
```

This creates `memento-mori.mcp.json` and `MEMENTO_MORI.md`. Use the generated agent instruction from `MEMENTO_MORI.md` in your Codex rules.

Use `--preset ai` for LLM apps, MCP servers, agent tools, and prompt-driven workflows. Use `--preset api` for backend APIs.

## Suggested Codex Rule

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

## Local Development From This Repo

```powershell
npm.cmd install
npm.cmd run build
node .\dist\cli.js init --mode local --agent codex
node .\dist\cli.js setup --mode local --agent codex
```
