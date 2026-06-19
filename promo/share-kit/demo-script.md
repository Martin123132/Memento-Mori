# 30-Second Demo Script

Use this when recording a short post, replying to questions, or walking someone through the video.

## One-Line Pitch

Memento Mori Jester is a local safety sidecar for AI coding agents: it reviews commands, plans, diffs, and final answers before confidence outruns evidence.

## 30-Second Flow

### 0-5s: Hook

Say:

```text
AI coding agents are useful, but they need a little court jester before the big mistake.
```

Show:

```powershell
npx -y memento-mori-jester@latest doctor
```

Point:

```text
It is local, quick, and checks that the review engine is alive.
```

### 5-12s: Hard Stop

Show:

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

Say:

```text
For obvious foot-guns, it blocks and explains the safer move.
```

### 12-20s: Soft Warning

Show:

```powershell
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
```

Say:

```text
For vague plans, it asks for verification before the agent gets too pleased with itself.
```

### 20-26s: Tuning Evidence

Show:

```powershell
npx -y memento-mori-jester@latest tune risky-domain
```

Say:

```text
When a rule is noisy, tuning is backed by fixtures and quiet-pass examples.
```

### 26-30s: CTA

Show:

```powershell
npx -y memento-mori-jester@latest start
```

Say:

```text
It works as a CLI, MCP server, git hook helper, and GitHub Action.
```

## 10-Second Reply Version

```text
It is a local CLI/MCP sidecar for AI coding agents. It blocks risky commands, cautions on weak plans, reviews diffs/final answers, and gives fixture-backed tuning evidence when a rule gets noisy.
```
