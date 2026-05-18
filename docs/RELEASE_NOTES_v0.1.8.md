# v0.1.8 Release Notes

This release makes the Jester more helpful when users want to understand a verdict, and smoother to wire into Claude Code.

## Added

- `jester explain`, which turns a normal review verdict into a short teaching note with the reason and next check.
- JSON output for `jester explain`, including both the original review and the human explanation.
- `jester mcp-config --agent claude`, which emits Claude Code's top-level MCP config shape.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest explain command "git reset --hard"
npx -y memento-mori-jester@latest mcp-config --agent claude --mode npx
npx -y memento-mori-jester@latest mcp-config --agent codex --mode npx
```
