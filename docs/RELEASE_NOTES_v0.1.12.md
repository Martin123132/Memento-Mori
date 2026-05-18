# v0.1.12 Release Notes

This release makes the Jester easier to trust by showing the checks it actually runs.

## Added

- `jester rules`, a visible catalog of built-in regex checks, structural heuristics, and active project-config checks.
- `jester rules --kind <plan|command|diff|final>` for filtering the catalog by review surface.
- `jester rules --json` for agents and tools that want structured rule metadata.
- `jester rule <id>` for inspecting one rule, including matcher detail.
- `.github/workflows/memento-mori.yml`, so this repo dogfoods the generated SARIF workflow on pull requests.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest rules
npx -y memento-mori-jester@latest rules --kind command
npx -y memento-mori-jester@latest rules --kind diff --json
npx -y memento-mori-jester@latest rule destructive-git-history
```
