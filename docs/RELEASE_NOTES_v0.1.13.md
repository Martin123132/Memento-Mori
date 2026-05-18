# v0.1.13 Release Notes

This release gives teams a simple tuning knob for noisy rules without changing the Jester's defaults for everyone else.

## Added

- `disabledRules` in `jester.config.json` for disabling checks by rule id.
- Disabled rules are marked as `[disabled]` in `jester rules` and `jester rule <id>`.
- Disabled rules no longer affect review verdicts, risk scores, or suggested checks.
- Custom rules can be disabled by either their generated id, such as `custom-payroll-needs-review`, or their raw id, such as `payroll-needs-review`.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest rules
npx -y memento-mori-jester@latest rule console-log
npx -y memento-mori-jester@latest config show
npx -y memento-mori-jester@latest command "git reset --hard" --config .\jester.config.json
```
