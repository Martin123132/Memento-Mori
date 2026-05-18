# v0.1.11 Release Notes

This release makes the GitHub setup path much easier: one command now prints or writes a SARIF code-scanning workflow.

## Added

- `jester github-action`, which prints a ready-to-copy GitHub Actions workflow.
- `jester github-action --write`, which creates `.github/workflows/memento-mori.yml` without overwriting existing files unless `--force` is used.
- `examples/github-code-scanning.yml`, a complete SARIF upload workflow.
- Docs for using the generated workflow with GitHub code scanning.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest github-action
npx -y memento-mori-jester@latest github-action --write
npx -y memento-mori-jester@latest github-action --write --force
npx -y memento-mori-jester@latest github-action --fail-on caution --subject "AI agent diff"
```
