# MCP Tool Reference

Memento Mori Jester runs as an MCP stdio server:

```powershell
npx -y memento-mori-jester@latest mcp-server
```

Generate a copy-paste MCP config:

```powershell
npx -y memento-mori-jester@latest mcp-config --mode npx
```

## Shared Options

All tools accept these optional fields:

| Field | Type | Notes |
| --- | --- | --- |
| `subject` | string | Short label for what is being reviewed. |
| `context` | string | Extra project or task context. |
| `tone` | string | `gentle_stoic`, `court_jester`, `absolute_menace`, or `professional`. |
| `intensity` | number | Integer from `1` to `5`. |
| `riskTolerance` | string | `low`, `medium`, or `high`. |
| `configPath` | string | Explicit path to `jester.config.json` or `.jester.json`. |
| `noConfig` | boolean | Ignore project config discovery. |

By default, the MCP server searches upward from the current working directory for:

- `jester.config.json`
- `.jester.json`

## `jester_review_plan`

Reviews an agent plan before implementation.

Required input:

```json
{
  "plan": "I will just refactor auth and ship it."
}
```

Good moments to call it:

- before large edits
- before migrations
- before release/deploy work
- when the plan sounds confident but light on verification

## `jester_check_command`

Reviews a shell command as text before it is run.

Required input:

```json
{
  "command": "git reset --hard"
}
```

Good moments to call it:

- before destructive git commands
- before recursive file operations
- before `curl | sh` style install commands
- before production or database commands

## `jester_review_diff`

Reviews a code diff.

Required input:

```json
{
  "diff": "diff --git a/package.json b/package.json\n..."
}
```

Good moments to call it:

- before committing
- before pushing
- before summarizing risky code changes
- when tests, config, secrets, auth, billing, or package scripts were touched

## `jester_final_answer_roast`

Reviews a final answer before an agent sends it.

Required input:

```json
{
  "answer": "Implemented the fix, but tests not run."
}
```

Good moments to call it:

- before claiming something is fixed
- before saying tests passed
- before handing off unverified work
- when the answer should mention limitations clearly

## Output Shape

Each tool returns a human-readable text review and structured content with this shape:

```json
{
  "kind": "command",
  "subject": "shell command",
  "verdict": "block",
  "riskScore": 100,
  "tone": "court_jester",
  "intensity": 3,
  "jab": "A dazzling command, if the desired outcome is court-sponsored regret.",
  "memento": "Memento mori: every shortcut sends an invoice eventually.",
  "issues": [
    {
      "id": "destructive-git-history",
      "severity": 5,
      "title": "Destructive git operation",
      "detail": "This can discard local work or remove untracked files.",
      "suggestedCheck": "Inspect `git status`, confirm the target branch, and make a backup or stash before running it.",
      "evidence": "git reset --hard"
    }
  ],
  "suggestedChecks": [
    "Inspect `git status`, confirm the target branch, and make a backup or stash before running it."
  ]
}
```

Verdicts:

- `pass`: no obvious concern found
- `caution`: proceed only with a concrete check
- `block`: change the plan or command before continuing

Severity runs from `1` to `5`, where `5` is the highest risk.

## Suggested Agent Rule

```text
Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.
```
