# CLI Setup

Use the CLI when you want quick checks without wiring an agent yet.

## Run Without Installing

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest command "git reset --hard"
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
```

## Install Globally

```powershell
npm install -g memento-mori-jester
jester doctor
```

After that, use `jester` directly:

```powershell
jester command "Remove-Item .\dist -Recurse -Force"
jester final --file .\final-answer.txt --tone professional
jester explain command "git reset --hard"
git diff | jester diff --fail-on block
jester examples
```

## Examples

Print a compact list of copy-paste commands and setup links:

```powershell
jester examples
jester examples --agent codex --mode npx
jester examples --json
```

## Explain

Turn a review verdict into a short teaching note:

```powershell
jester explain command "git reset --hard"
jester explain plan "I will just refactor auth and ship it"
jester explain final --file .\final-answer.txt --json
```

`explain` accepts the same review options as `plan`, `command`, `diff`, and `final`.

## Bootstrap A Repo

```powershell
jester bootstrap --preset node
```

Presets:

- `node`: npm/package rules.
- `python`: Python dependency and dynamic execution rules.
- `security`: stricter TLS, CORS, secrets, and permission checks.

## Policy Init

Available on `main` now and in the next npm release, `policy init` writes stricter project defaults for teams:

```powershell
jester policy init --level team
jester policy init --level strict
jester policy show --level strict
jester policy levels
```

Levels:

- `team`: lower risk tolerance, caution-level hook failures, production/deploy rules.
- `strict`: team policy plus stronger secret, destructive infra, and rollback expectations.

## JSON Output

Use `--json` when another tool needs to parse the result:

```powershell
jester command "git reset --hard" --json
jester explain command "git reset --hard" --json
jester policy init --level strict --json
jester config validate --json
jester bootstrap --preset node --json
```
