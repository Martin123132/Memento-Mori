# Agent Setup

Memento Mori Jester is an MCP stdio server plus a normal CLI. The safest pattern is:

1. Add the MCP server to the agent.
2. Add the suggested instruction to the agent's rules or custom instructions.
3. Keep a `jester.config.json` in project repos that need local rules.

## Quick MCP Config

After npm publish, use the `npx` config:

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

For a global install:

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

For local development from this repo:

```powershell
npm.cmd install
npm.cmd run build
node .\dist\cli.js mcp-config --mode local
```

## Suggested Agent Instruction

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

## Codex

Use:

```powershell
jester init --agent codex
```

Then paste the generated `mcpServers` block wherever your Codex MCP configuration is kept. For local development before npm publish:

```powershell
node .\dist\cli.js init --mode local --agent codex
```

## Claude Code

Use:

```powershell
jester init --agent claude
```

Then paste the generated `mcpServers` block into Claude Code's MCP configuration. If Claude Code asks for a command and args separately, keep the generated values exactly.

## Generic MCP Clients

Use:

```powershell
jester mcp-config --mode npx
```

If the client does not support `npx`, install globally:

```powershell
npm install -g memento-mori-jester
jester mcp-config --mode global
```

## Project Rules

Create a project config:

```powershell
jester config init
```

Use a preset for common stacks:

```powershell
jester config init --preset node
jester config init --preset python
jester config init --preset security
```

Agents do not need to pass the config manually. The MCP server searches upward from the current working directory for:

- `jester.config.json`
- `.jester.json`

If an agent invokes tools outside the project directory, pass `configPath` to the MCP tool.
