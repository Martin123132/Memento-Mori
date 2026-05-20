# v0.1.23 Release Notes

This release adds an `ai` preset for teams building LLM apps, MCP servers, agent tools, and prompt-driven workflows.

## Added

- `jester config init --preset ai`.
- `jester bootstrap --preset ai`.
- `jester start --preset ai`.
- AI-specific sensitive domains for prompts, tool calls, MCP, agents, retrieval, vector stores, evals, and transcripts.
- Custom rules for client-exposed AI provider keys, prompt-injection shaped changes, user-controlled tool dispatch, skipped evals, and model-output execution.

## Unchanged

- No MCP behavior changed.
- No config schema changed.
- Existing presets keep their current behavior.
- The `ai` preset preserves the default risk tolerance and hook failure threshold.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js config presets
node .\dist\cli.js config init --preset ai --path jester-ai.config.json
node .\dist\cli.js config validate --config jester-ai.config.json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.23 ai preset"
```
