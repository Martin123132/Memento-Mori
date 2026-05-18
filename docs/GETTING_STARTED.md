# Getting Started

This is the shortest path for a normal project.

## 1. Check It Runs

```powershell
npx -y memento-mori-jester@latest doctor
```

You should see four `PASS` lines.

## 2. See The Point

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

That should return `BLOCK`. Nothing dangerous is run; the command is only reviewed as text.

## 3. Add It To A Project

Run this from the folder of the project you want protected:

```powershell
npx -y memento-mori-jester@latest bootstrap --preset node
```

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
