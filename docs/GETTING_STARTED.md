# Getting Started

This is the shortest path for a normal project.

## 1. Check It Runs

For a guided checklist:

```powershell
npx -y memento-mori-jester@latest start
```

Or run the first check directly:

```powershell
npx -y memento-mori-jester@latest doctor
```

You should see four `PASS` lines.

## 2. See The Point

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

That should return `BLOCK`. Nothing dangerous is run; the command is only reviewed as text.

For the local browser version:

```powershell
npx -y memento-mori-jester@latest playground
```

## 3. Add It To A Project

Run this from the folder of the project you want protected:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node
```

Use `--preset ai` for LLM, MCP, and agent apps, `--preset api` for backend APIs, `--preset web` for frontend/browser apps, `--preset infra` for deployment or cloud infrastructure repos, or `--preset security` for a stricter general policy.

That creates:

- `jester.config.json`
- `memento-mori.mcp.json`
- `MEMENTO_MORI.md`

Existing files are kept. Add `--force` only when you want to overwrite the starter files.

## 4. Optional Git Hooks

To make git call the Jester before commits:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node --hook pre-commit
```

To also check before pushing:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node --hook pre-commit --hook pre-push
```

## 5. Agent Instruction

For exact Codex, Claude Code, or generic MCP snippets:

```powershell
npx -y memento-mori-jester@latest setup
```

Put this in your agent rules or custom instructions:

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```

## What To Share With Someone Else

For most people, this is enough:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node
```

Then tell them to open `MEMENTO_MORI.md`.

For copy-paste agent and hook examples, see [examples](../examples).

For where this is going next, see [ROADMAP.md](../ROADMAP.md).
