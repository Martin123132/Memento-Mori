# Getting Started

This is the shortest path for a normal project.

For the wider docs map, including CI, tuning, support, release, and licence references, see [Documentation Index](INDEX.md).

## Names And Safety Notes

- **Memento Mori Jester** is the product name.
- **`memento-mori-jester`** is the npm package; **`jester`** is the short CLI command.
- **`Memento-Mori`** is the GitHub repository slug used in links and GitHub Action examples.
- **MCP** is the local tool protocol used by Codex, Claude Code, and other agent clients.

The first-run commands below are local-first. They review text you provide and do not publish packages, create releases, push git changes, or change repository privacy. Maintainer commands run from a repo checkout, such as `npm run audit:high`, are safety gates for CI and releases; they are not publish commands.

## 1. Try It Without Writing Files

For a guided checklist:

```powershell
npx -y memento-mori-jester@latest start
```

Or run the first check directly:

```powershell
npx -y memento-mori-jester@latest doctor
```

You should see four `PASS` lines.

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

That should return `BLOCK`. Nothing dangerous is run; the command is only reviewed as text.

To see which rule fired and what to inspect next:

```powershell
npx -y memento-mori-jester@latest summary --kind command "git reset --hard"
```

For the local browser version:

```powershell
npx -y memento-mori-jester@latest playground
```

The playground starts on `127.0.0.1` and includes sample buttons for command, plan, diff, and final-answer reviews.

If a rule feels noisy, ask for tuning advice before disabling it:

```powershell
npx -y memento-mori-jester@latest tune risky-domain
```

## 2. Add It To A Project

Run this from the folder of the project you want protected:

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset>
```

Use `--preset ai` for LLM, MCP, and agent apps, `--preset api` for backend APIs, `--preset web` for frontend/browser apps, `--preset infra` for deployment or cloud infrastructure repos, or `--preset security` for a stricter general policy.

`config recommend` is read-only. It scans local repo file names and dependency manifests, reports the strongest preset match with detected stack details, and prints the next commands without creating config files or installing hooks.

That creates:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

Existing files are kept. Add `--force` only when you want to overwrite the starter files.

## 3. Agent Instruction

For exact Codex, Claude Code, or generic MCP snippets:

```powershell
npx -y memento-mori-jester@latest setup
npx -y memento-mori-jester@latest setup --agent codex
npx -y memento-mori-jester@latest setup --agent claude
```

Put this in your agent rules or custom instructions:

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

## 4. Optional Git Hooks

To make git call the Jester before commits:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset> --hook pre-commit
```

To also check before pushing:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset <recommended-preset> --hook pre-commit --hook pre-push
```

## What To Share With Someone Else

For most people, this is enough:

```powershell
npx -y memento-mori-jester@latest config recommend
npx -y memento-mori-jester@latest bootstrap --preset node
```

Then tell them to open `MEMENTO_MORI.md`.

For copy-paste agent and hook examples, see [examples](../examples). For stack-specific config examples, see [preset example packs](../examples/presets) for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos. For copy-paste CI workflows, see [framework CI examples](../examples/ci). For concrete pass, caution, and block cases, see [review fixtures](../examples/fixtures). For first trustworthy output examples, see the checked [report gallery](../examples/reports). For stack-shaped noisy-rule reports, see [framework tuning examples](FRAMEWORK_TUNING.md) and the checked [framework tuning cookbook](../examples/tuning).

## Need Help?

Run this before opening a bug report:

```powershell
npx -y memento-mori-jester@latest doctor --json
```

Use the GitHub false-positive template for noisy rules and include `jester tune <rule-id> --json` when possible. For vulnerabilities, private code exposure, or credential-handling concerns, follow [SECURITY.md](../SECURITY.md) instead of posting sensitive details publicly.

For where this is going next, see [ROADMAP.md](../ROADMAP.md).
