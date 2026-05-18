# v0.1.9 Release Notes

This release adds stricter project policy templates for teams that want the Jester to be less forgiving around releases, production, secrets, and destructive commands.

## Added

- `jester policy init --level team`, a stronger default project config for shared repos.
- `jester policy init --level strict`, a stricter policy with secret, infra, and rollback checks.
- `jester policy show` and `jester policy levels` for previewing policy templates before writing files.

## Useful Commands

```powershell
npx -y memento-mori-jester@latest policy levels
npx -y memento-mori-jester@latest policy show --level strict
npx -y memento-mori-jester@latest policy init --level team
npx -y memento-mori-jester@latest config validate
```
