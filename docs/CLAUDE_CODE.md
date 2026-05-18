# Claude Code Setup

## Generate The Config

```powershell
npx -y memento-mori-jester@latest init --agent claude
```

Copy the generated command and args into Claude Code's MCP configuration.

The default server command is:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "memento-mori-jester@latest",
    "mcp-server"
  ]
}
```

## Project Starter Kit

Inside a repo:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node
```

This creates:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

## Suggested Claude Instruction

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```
