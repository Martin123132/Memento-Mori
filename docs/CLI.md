# CLI Setup

Use the CLI when you want quick checks without wiring an agent yet.

## Run Without Installing

```powershell
npx -y memento-mori-jester@latest start
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest command "git reset --hard"
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
npx -y memento-mori-jester@latest playground
npx -y memento-mori-jester@latest setup
```

## Install Globally

```powershell
npm install -g memento-mori-jester
jester doctor
```

After that, use `jester` directly:

```powershell
jester start
jester command "Remove-Item .\dist -Recurse -Force"
jester final --file .\final-answer.txt --tone professional
jester explain command "git reset --hard"
git diff | jester diff --fail-on block
git diff | jester diff --sarif > jester.sarif
jester examples
jester playground
jester setup --agent codex
jester rules --kind diff
jester github-action --write
```

## Playground

Start a local-only paste-in playground:

```powershell
jester playground
jester playground --port 4919
```

The playground listens on `127.0.0.1`, loads the same project config as the CLI, and reviews commands, plans, diffs, and final answers through the same rule engine.

## Start

Print a read-only first-run checklist:

```powershell
jester start
jester start --preset ai --agent codex
jester start --preset api --agent codex
jester start --preset web --agent codex
jester start --preset infra --agent claude --hook pre-commit
jester start --json
```

`start` does not write files or install hooks. It prints the commands for `doctor`, `playground`, agent setup, `bootstrap`, config validation, and a sample destructive-command review.

## Agent Setup

Print exact setup snippets for supported agent clients:

```powershell
jester setup
jester setup --agent codex
jester setup --agent claude
jester setup --agent generic
jester setup --agent codex --mode local
jester setup --json
```

`setup` prints the MCP config shape, the instruction file to update, the agent instruction text, smoke checks, and a docs link. Codex and generic clients use the standard `mcpServers` shape. Claude Code uses its top-level server config shape.

## Examples

Print a compact list of copy-paste commands and setup links:

```powershell
jester examples
jester examples --agent codex --mode npx
jester examples --json
```

## GitHub Action Generator

Print a copy-paste workflow that reviews pull request diffs as SARIF and uploads the result to GitHub code scanning:

```powershell
jester github-action
```

Write it into the standard workflow location:

```powershell
jester github-action --write
jester github-action --write --force
jester github-action --write --path .github/workflows/jester.yml
```

Use `--fail-on caution`, `--subject`, or `--ref` to tune the generated workflow.

## Rules

List the checks the Jester can apply:

```powershell
jester rules
jester rules --kind command
jester rules --kind diff --json
jester rule destructive-git-history
```

`rules` includes built-in regex checks, structural heuristics, and any active `jester.config.json` rules. Use `--no-config` to see only the built-in catalog, or `--config <path>` to inspect a specific project config.

Use `jester rule <id>` before muting a rule. It explains why the rule exists, common false positives, safer alternatives, and how to tune it.

If a rule is too noisy for a repo, add its id to `disabledRules` in `jester.config.json`:

```json
{
  "disabledRules": ["console-log"]
}
```

Disabled rules still appear in `jester rules` as `[disabled]`, but they no longer affect review verdicts.

The CLI can edit `disabledRules` for you:

```powershell
jester config disable-rule console-log
jester config enable-rule console-log
jester config disable-rule destructive-git-history --json
```

If no config exists, `disable-rule` creates a minimal `jester.config.json` with only `disabledRules`.

## Explain

Turn a review verdict into a short teaching note:

```powershell
jester explain command "git reset --hard"
jester explain plan "I will just refactor auth and ship it"
jester explain final --file .\final-answer.txt --json
```

`explain` accepts the same review options as `plan`, `command`, `diff`, and `final`.

## Bootstrap A Repo

If you are unsure which preset fits, ask for a local read-only recommendation first:

```powershell
jester config recommend
jester config recommend --json
```

It scans repo file paths, ignores generated folders such as `node_modules`, `dist`, `build`, `.next`, virtualenv folders, and `vendor`, then recommends one preset with evidence and next commands. If it finds an existing `jester.config.json` or `.jester.json`, it reports the path but keeps the recommendation advisory.

```powershell
jester bootstrap --preset node
```

Presets:

- `node`: npm/package rules.
- `python`: Python dependency and dynamic execution rules.
- `web`: browser storage, client-exposed config, unsafe HTML, and redirect rules.
- `api`: backend auth, CORS, rate limiting, webhooks, raw SQL, and migration rules.
- `infra`: deployment, cloud, container, IAM, and public exposure rules.
- `ai`: LLM apps, MCP servers, agent tools, prompt-injection, eval, and model-output execution rules.
- `security`: stricter TLS, CORS, secrets, and permission checks.

## Policy Init

Available in `v0.1.9` and later, `policy init` writes stricter project defaults for teams:

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

Use `--json` when another tool needs the review result:

```powershell
jester command "git reset --hard" --json
jester explain command "git reset --hard" --json
jester policy init --level strict --json
jester config recommend --json
jester config validate --json
jester bootstrap --preset node --json
```

Available in `v0.1.10` and later, use `--sarif` when CI or code-scanning tooling needs SARIF 2.1.0:

```powershell
jester command "git reset --hard" --sarif
git diff | jester diff --sarif > jester.sarif
git diff | jester diff --sarif --fail-on block > jester.sarif
```
