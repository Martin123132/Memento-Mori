# v0.1.7 Release Notes

This release makes the public package easier to try, explain, and wire into agent clients.

## Added

- `jester examples`, a quick command that prints copy-paste CLI checks, setup commands, and example links.
- MCP tool reference docs covering inputs, shared options, output shape, verdicts, and suggested agent rules.

## Improved Docs

- README start-here path now focuses on the shortest useful npm commands.
- Demo transcript now shows a fuller end-to-end flow.
- CLI docs now mention the new examples command and its JSON output.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest examples
npx -y memento-mori-jester@latest command "git reset --hard"
npx -y memento-mori-jester@latest mcp-config --mode npx
```
