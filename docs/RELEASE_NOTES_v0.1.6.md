# v0.1.6 Release Notes

This release adds copy-paste examples and sharpens the default review rules.

## Added

- Codex example MCP config and agent rule.
- Claude Code example MCP config and rule.
- Generic MCP config example.
- Git-hooks-only example.
- `CHANGELOG.md`.

## Improved Checks

- Final answers now warn when they say tests were not run.
- Diffs now warn on npm install lifecycle scripts such as `postinstall`.
- Diffs now warn on sensitive env/config changes such as `.env` files or `DATABASE_URL`.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest bootstrap --preset node
git diff | npx -y memento-mori-jester@latest diff --fail-on block
```
