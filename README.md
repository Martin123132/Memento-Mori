# Memento Mori Jester

[![CI](https://github.com/Martin123132/Memento-Mori/actions/workflows/ci.yml/badge.svg)](https://github.com/Martin123132/Memento-Mori/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/memento-mori-jester.svg)](https://www.npmjs.com/package/memento-mori-jester)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](LICENSE)

A local court-jester sidecar for AI coding agents. It reviews plans, shell commands, diffs, and final answers before they get too pleased with themselves.

It roasts the reasoning, not the human.

## Demo

[![Memento Mori Jester terminal demo](docs/demo-terminal.svg)](docs/DEMO.md)

See the full [demo transcript](docs/DEMO.md), or use the [promo/share kit](promo) for X post copy, stills, and a 30-second demo script.
There is also a lightweight repo-local [landing page](site/index.html) for sharing the project in one screen.

## Start Here

### 1. Try It Without Writing Files

```powershell
npx -y memento-mori-jester@latest start
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest command "git reset --hard"
npx -y memento-mori-jester@latest playground
```

`start` prints the guided checklist. `playground` opens the local browser UI with sample buttons for commands, plans, diffs, and final answers.

### 2. Add It To A Project

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset>
```

That writes:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

Common presets are `node`, `python`, `web`, `api`, `infra`, `ai`, and `security`.

### 3. Connect Your Agent

```powershell
npx -y memento-mori-jester@latest setup
npx -y memento-mori-jester@latest setup --agent codex
npx -y memento-mori-jester@latest setup --agent claude
```

Use the generated MCP snippet and agent instruction in Codex, Claude Code, or another MCP-capable client.

### 4. Add Hooks Or CI When Ready

```powershell
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset> --hook pre-commit
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset> --hook pre-commit --hook pre-push
```

Add it to GitHub code scanning:

```powershell
npx -y memento-mori-jester@latest github-action --write
```

The generated workflow uploads SARIF for code scanning and adds a readable Jester summary to the GitHub Actions run.

For a first read-only CI smoke, copy [examples/ci/adoption-smoke.yml](examples/ci/adoption-smoke.yml). It runs `doctor`, `summary --kind command "git reset --hard"`, and the published package's `framework:tuning:doctor` without requiring code-scanning permissions.

Maintainers can prove that fresh-project path with [examples/consumer-quickstart](examples/consumer-quickstart) and `npm run consumer:quickstart:check`, which installs the package into a temporary project and runs the same quickstart commands from there.

For trust-building output examples, see [examples/reports](examples/reports). `npm run reports:check` installs the package into a temporary project and proves the gallery's `doctor`, `summary`, and blocked-command reports stay current.

If one of those reports is confusing or stale, use the public-safe [report gallery feedback template](examples/reports/feedback-template.md). It asks for version, nearest gallery example, sanitized command/output summaries, and redacted diagnostics without private repo code or secrets.

Expected vibe:

```text
Jester verdict: BLOCK (100/100)
A dazzling command, if the desired outcome is court-sponsored regret.
```

## What It Does

| Surface | Example | What it catches |
| --- | --- | --- |
| Plans | `jester plan "I will just refactor auth and ship it"` | overconfidence, missing verification, risky domains |
| Commands | `jester command "git reset --hard"` | destructive shell commands and broad file operations |
| Diffs | `git diff \| jester diff --fail-on block` | removed tests, install scripts, env/config risks |
| Final answers | `jester final --file final.txt` | done/fixed claims without evidence |
| Explanations | `jester explain command "git reset --hard"` | plain-language teaching notes for verdicts |
| Summary | `git diff \| jester summary` | rule hit counts and next tuning commands |
| Start | `jester start` | guided first-run checklist for setup, bootstrap, validation, and smoke checks |
| Playground | `jester playground` | local paste-in checks for commands, plans, diffs, and final answers |
| Examples | `jester examples` | copy-paste commands and links for new users |
| Config Recommend | `jester config recommend` | local preset and stack recommendation from repo files |
| Rules | `jester rules --kind diff` | visible rule catalog for built-in and project checks |
| Tuning | `jester tune risky-domain` | read-only advice before muting a noisy rule |
| GitHub Actions | `jester github-action --write` | SARIF workflow plus Actions job summary |
| Agents | `jester setup --agent codex` | exact MCP snippets and agent instructions for Codex, Claude Code, and generic clients |

## Try It Locally

Installed globally:

```powershell
npm install -g memento-mori-jester
jester command "Remove-Item .\dist -Recurse -Force"
```

From a local checkout:

```powershell
git clone https://github.com/Martin123132/Memento-Mori.git
cd Memento-Mori
npm.cmd install
npm.cmd run build
node .\dist\cli.js doctor
```

## Setup Wizard

For exact Codex, Claude Code, and generic MCP setup snippets:

```powershell
npx -y memento-mori-jester@latest start
npx -y memento-mori-jester@latest setup
npx -y memento-mori-jester@latest setup --agent codex
npx -y memento-mori-jester@latest setup --agent claude
```

For a copy-pasteable MCP config and suggested agent instruction:

```powershell
npx -y memento-mori-jester@latest init
```

For a starter kit that writes project files:

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset node
```

For this local checkout:

```powershell
node .\dist\cli.js init --mode local
node .\dist\cli.js bootstrap --mode local --preset node
```

`bootstrap` writes:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

It keeps existing files by default. Use `--force` to overwrite them, and `--hook pre-commit` or `--hook pre-push` to install managed git hooks at the same time.

Modes:

- `npx`: MCP clients launch the package through `npx -y memento-mori-jester@latest mcp-server`.
- `global`: MCP clients launch `memento-mori-jester-mcp`, assuming the package is globally installed.
- `local`: MCP clients launch the built `dist/server.js` in this checkout.

## CLI

```powershell
jester plan "I will just refactor auth and ship it"
jester command "git reset --hard"
git diff | jester diff --fail-on block
git diff | jester diff --sarif > jester.sarif
git diff | jester summary
jester summary --kind command "git reset --hard"
jester final --file .\final-answer.txt --tone professional
jester explain command "git reset --hard"
jester start
jester doctor
jester doctor --json
jester playground
jester setup
jester setup --agent codex
jester examples
jester rules
jester rule destructive-git-history
jester tune risky-domain
jester tune coverage
jester github-action --write
jester bootstrap --preset node
jester config init
jester policy init --level team
jester install-hook pre-commit
jester mcp-config --mode npx
jester mcp-config --agent claude --mode npx
```

`jester playground` includes one-click samples for command, plan, diff, and final-answer reviews, so you can see a block, caution, or evidence check without inventing input first.
`jester doctor --json` is the best first artifact to share in a bug report because it includes package, config, MCP, hook, and GitHub Action diagnostics.

The package-name binary works too:

```powershell
memento-mori-jester plan "This should probably work"
```

Tones:

- `gentle_stoic`
- `court_jester`
- `absolute_menace`
- `professional`

Risk tolerance:

- `low`
- `medium`
- `high`

## Project Config

Create a config file in your repo:

```powershell
jester config init
```

The CLI and MCP server automatically search upward for `jester.config.json` or `.jester.json`.

Example:

```json
{
  "tone": "court_jester",
  "intensity": 3,
  "riskTolerance": "medium",
  "hookFailOn": "block",
  "disabledRules": [],
  "blockedCommands": [
    "git reset --hard",
    "git clean -fd"
  ],
  "sensitiveDomains": [
    "auth",
    "billing",
    "payments",
    "production",
    "customer data"
  ],
  "customRules": [
    {
      "id": "no-force-push-main",
      "pattern": "git\\s+push\\s+--force(?:-with-lease)?\\s+origin\\s+main",
      "severity": 5,
      "title": "Force-push to main",
      "detail": "This project treats force-pushing main as a stop-and-think event.",
      "suggestedCheck": "Create a branch or use --force-with-lease only after confirming the protected branch policy.",
      "kinds": ["command", "plan"]
    }
  ]
}
```

Useful config commands:

```powershell
jester config recommend
jester config recommend --json
jester config show
jester config show --json
jester config init --force
jester config init --preset node
jester config init --preset python
jester config init --preset web
jester config init --preset api
jester config init --preset infra
jester config init --preset ai
jester config init --preset security
jester config presets
jester config validate
jester config validate --json
jester plan "I will deploy-prod now" --config .\jester.config.json
jester command "git reset --hard" --no-config
```

Structured output. SARIF is available in `v0.1.10` and later:

```powershell
jester command "git reset --hard" --json
jester summary --kind command "git reset --hard" --json
jester command "git reset --hard" --sarif
git diff | jester diff --sarif > jester.sarif
```

Rule hit summaries:

```powershell
git diff | jester summary
jester summary --kind plan "I will just refactor auth and ship it"
jester summary --kind command "git reset --hard" --json
```

`jester summary` reviews the input and groups the resulting issues by rule id, then suggests the next `jester tune <id>` command for the noisiest rule.

Rule transparency:

```powershell
jester rules
jester rules --kind diff
jester rules --json
jester rule destructive-git-history
jester tune risky-domain
jester tune risky-domain --json
jester tune coverage
jester tune coverage --json
```

`jester rule <id>` explains why a rule exists, when it may be noisy, what safer move to make, and how to tune it.

`jester tune <id>` turns that into a practical mute checklist with exact `disable-rule`, `enable-rule`, and validation commands. It does not edit config files.

`jester tune coverage` shows the fixture support and confidence signal for every rule, including suggested next actions such as adding coverage, reviewing surprise matches, checking quiet-pass boundaries, or leaving a healthy signal alone.

For stack-shaped noise, see [Framework Tuning Examples](docs/FRAMEWORK_TUNING.md). It maps common Next.js, Vite React, FastAPI, Terraform/Kubernetes, security-scan, and AI/MCP false-positive reports to the `jester tune <rule>` command and fixture IDs worth checking first. The checked [framework tuning cookbook](examples/tuning) turns those rows into copy-paste recipes and a machine-readable JSON file, and `npm run framework:tuning:doctor` proves those recipes execute through the built CLI.

Disable a noisy rule by adding its id to `disabledRules` in `jester.config.json`:

```json
{
  "disabledRules": ["console-log"]
}
```

Or let the CLI edit the config:

```powershell
jester config disable-rule console-log
jester config enable-rule console-log
```

If no config exists yet, `disable-rule` creates a minimal `jester.config.json`.

Presets layer extra rules on top of the default config:

- `node`: npm lifecycle scripts, publish/unpublish, package metadata.
- `python`: dependency files, migrations, pickle, eval/exec.
- `web`: browser storage, client-exposed config, unsafe HTML, redirect risks.
- `api`: auth bypasses, CORS, rate limits, webhooks, raw SQL, and destructive migrations.
- `infra`: Terraform, Kubernetes, Helm, IAM, and public exposure risks.
- `ai`: LLM apps, MCP servers, agent tools, prompt injection, evals, and model-output execution.
- `security`: lower risk tolerance, TLS/CORS checks, token/permission-sensitive areas.

Policy templates are stricter project configs for teams. They are available in `v0.1.9` and later:

```powershell
jester policy init --level team
jester policy init --level strict
jester policy show --level strict
```

## Git Hooks

Install a pre-commit hook that reviews staged changes:

```powershell
jester install-hook pre-commit
```

Install a pre-push hook that reviews unpushed changes:

```powershell
jester install-hook pre-push
```

Hook commands:

```powershell
jester hook-status
jester install-hook pre-commit --fail-on caution
jester install-hook pre-commit --mode local --force
jester uninstall-hook pre-commit
```

Hooks refuse to overwrite or remove non-jester hooks unless you pass `--force`.

## MCP Server

The MCP server exposes:

- `jester_review_plan`
- `jester_check_command`
- `jester_review_diff`
- `jester_final_answer_roast`

Generate config:

```powershell
jester mcp-config --mode npx
jester mcp-config --agent codex --mode npx
jester mcp-config --agent claude --mode npx
jester mcp-config --mode global
jester mcp-config --mode local
```

Default `npx` config:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": [
        "-y",
        "memento-mori-jester@latest",
        "mcp-server"
      ]
    }
  }
}
```

Suggested agent instruction:

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

More setup examples:

- [Getting Started](docs/GETTING_STARTED.md)
- [CLI Setup](docs/CLI.md)
- [Codex Setup](docs/CODEX.md)
- [Claude Code Setup](docs/CLAUDE_CODE.md)
- [Agent Setup](docs/AGENTS.md)
- [MCP Tool Reference](docs/MCP_TOOLS.md)
- [GitHub Actions](docs/GITHUB_ACTIONS.md)
- [Framework Tuning Examples](docs/FRAMEWORK_TUNING.md)
- [Framework Tuning Cookbook](examples/tuning)
- [Demo Script](docs/DEMO.md)
- [Promo Share Kit](promo)
- [Examples](examples)
- [Preset Example Packs](examples/presets)
- [Review Fixtures](examples/fixtures)
- [Framework CI Examples](examples/ci)
- [Adoption Smoke CI](examples/ci/adoption-smoke.yml)
- [Consumer Quickstart Smoke](examples/consumer-quickstart)
- [Real-World Report Gallery](examples/reports)
- [Report Gallery Feedback Template](examples/reports/feedback-template.md)
- [Security Policy](SECURITY.md)
- [Maintainer Triage](docs/MAINTAINER_TRIAGE.md)
- [Changelog](CHANGELOG.md)
- [Roadmap](ROADMAP.md)
- [Trusted npm Publishing](docs/TRUSTED_PUBLISHING.md)

Preset example packs:

- [Next.js](examples/presets/nextjs)
- [Vite React](examples/presets/vite-react)
- [Express API](examples/presets/express-api)
- [FastAPI](examples/presets/fastapi)
- [Terraform Kubernetes](examples/presets/terraform-k8s)
- [AI MCP](examples/presets/ai-mcp)

Framework CI examples:

- [Adoption Smoke CI](examples/ci/adoption-smoke.yml)
- [Consumer Quickstart Smoke](examples/consumer-quickstart)
- [Real-World Report Gallery](examples/reports)
- [Report Gallery Feedback Template](examples/reports/feedback-template.md)
- [Next.js CI](examples/ci/nextjs.yml)
- [Vite React CI](examples/ci/vite-react.yml)
- [Express API CI](examples/ci/express-api.yml)
- [FastAPI CI](examples/ci/fastapi.yml)
- [Terraform Kubernetes CI](examples/ci/terraform-k8s.yml)
- [AI MCP CI](examples/ci/ai-mcp.yml)

## Installer Scripts

People can run the scripts from the repo or raw GitHub URLs.

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

From GitHub:

```powershell
iwr https://raw.githubusercontent.com/Martin123132/Memento-Mori/main/scripts/install.ps1 -OutFile install-jester.ps1
powershell -ExecutionPolicy Bypass -File .\install-jester.ps1
```

macOS/Linux:

```bash
bash ./scripts/install.sh
```

From GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/Martin123132/Memento-Mori/main/scripts/install.sh | bash
```

Both scripts check Node 20+, run a smoke `doctor`, and print MCP config.

## What It Catches

- Destructive commands such as recursive forced deletes, risky git cleanup, pipe-to-shell installs, broad database deletion, and over-broad permissions.
- Agent overconfidence in plans: "just", "obvious", "probably", "should work", and plans with no verification step.
- Diffs with removed tests, type suppressions, debug logs, unfinished marker comments, sensitive env/config changes, npm install scripts, sensitive domains, and large deletions.
- Final answers with "done/fixed/works" claims that do not mention evidence, or that admit tests were not run.
- Project-specific commands, domains, and regex rules from `jester.config.json`.

## Support

When filing a bug, include redacted `jester doctor --json` output. The GitHub issue templates ask for the command, workflow step, config, and observed output so support does not start with guesswork.

Use the false-positive template for noisy cautions or blocks. Include `jester summary` and `jester tune <rule-id> --json` output when possible so rule changes can be backed by evidence.

Maintainers can use [docs/MAINTAINER_TRIAGE.md](docs/MAINTAINER_TRIAGE.md) to turn useful false-positive reports into redacted fixtures.
Run `npm run fixtures:check` before merging fixture changes; it catches duplicate IDs, missing rule metadata, weak descriptions, unsafe-looking content, and duplicate content.
Run `npm run fixtures:report` to see fixture coverage by rule, rule family, preset slice, kind, verdict, quiet-pass boundaries, feasible pass-case gaps, and curation-next guidance before choosing the next fixture. Use `npm run fixtures:report -- --markdown` when you want a paste-ready summary for release notes or GitHub issues.
Run `npm run reports:check` after editing [examples/reports](examples/reports); it verifies the public report gallery against an installed package in a temporary consumer project.
Run `npm run support:check` after editing issue templates, support docs, or the report gallery feedback path; it verifies the public report template asks for useful redacted context without inviting secrets or private code.
Run `npm run promo:card` to regenerate the repo-local social preview card after changing its copy or design.
Run `npm run promo:check` after editing promo assets; it checks the current demo video, stills, docs, and fixture evidence numbers stay in sync.
Run `npm run site:check` after editing the repo-local landing page; it verifies the start command, demo links, social card, repo, release, and npm links.

For vulnerabilities, private code exposure, or credential-handling concerns, follow [SECURITY.md](SECURITY.md) instead of opening a public issue with sensitive details.

## Publishing

Release checklist:

```powershell
npm.cmd test
npm.cmd run consumer:quickstart:check
npm.cmd run reports:check
npm.cmd run promo:check
npm.cmd run production:check
npm.cmd run pack:dry
git tag -a v0.1.x -m "Memento Mori Jester v0.1.x"
git push origin main
git push origin v0.1.x
```

Pushing a `v*` tag creates the GitHub Release and publishes the matching package version to npm through trusted publishing.

The production readiness bar is documented in [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md).

GitHub: <https://github.com/Martin123132/Memento-Mori>

See [docs/RELEASE.md](docs/RELEASE.md).
