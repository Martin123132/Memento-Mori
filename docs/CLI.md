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
git diff | jester diff --fail-on block
jester examples
```

## Examples

Print a compact list of copy-paste commands and setup links. This command is available in local checkouts now and will be available through `npx` after the next npm release:

```powershell
jester examples
jester examples --agent codex --mode npx
jester examples --json
```

## Bootstrap A Repo

```powershell
jester bootstrap --preset node
```

Presets:

- `node`: npm/package rules.
- `python`: Python dependency and dynamic execution rules.
- `security`: stricter TLS, CORS, secrets, and permission checks.

## JSON Output

Use `--json` when another tool needs to parse the result:

```powershell
jester command "git reset --hard" --json
jester config validate --json
jester bootstrap --preset node --json
```
