# v0.1.14 Release Notes

This release makes rule tuning possible without hand-editing JSON.

## Added

- `jester config disable-rule <id>` to add a rule id to `disabledRules`.
- `jester config enable-rule <id>` to remove a rule id from `disabledRules`.
- `--json` support for both commands.
- Automatic minimal `jester.config.json` creation when disabling a rule in a repo without config.
- Tests proving disabling a rule changes the verdict and enabling it restores the original block.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest config disable-rule console-log
npx -y memento-mori-jester@latest config enable-rule console-log
npx -y memento-mori-jester@latest config disable-rule destructive-git-history --json
npx -y memento-mori-jester@latest rule destructive-git-history
```
