# v0.1.15 Release Notes

This release makes individual rule pages more useful before anyone reaches for the mute button.

## Added

- Practical guidance on `jester rule <id>`:
  - why the rule exists
  - when it may be noisy
  - what safer move to make
  - how to tune or disable it
- `guidance` metadata in `jester rules --json` for automation and docs tooling.
- Authored guidance for built-in and structural rules.
- Generic guidance for project-config and custom rules.
- Tests proving disabled rules still show `[disabled]` while keeping their explanation text.

## Unchanged

- Review verdicts, scores, matching, and disabled-rule behavior are unchanged.
- `jester rules` text output stays compact.
- No new command was added.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest rule destructive-git-history
npx -y memento-mori-jester@latest rules --kind command --json
npx -y memento-mori-jester@latest config disable-rule console-log
```
