# AI MCP Example

Use this shape for MCP servers, agent tools, prompt-driven workflows, eval harnesses, and LLM apps with tool calls.

Recommended built-in preset:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset ai
```

Useful checks:

```powershell
npx -y memento-mori-jester@latest config recommend
git diff | npx -y memento-mori-jester@latest diff --fail-on block --subject "AI MCP diff"
git diff | npx -y memento-mori-jester@latest summary
```
