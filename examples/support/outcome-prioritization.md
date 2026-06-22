# Support Outcome Prioritization

Use this guide after a support report has been closed out and maintainers need to decide what follow-up work deserves a backlog item. It keeps the public support lifecycle useful without turning every report into a rule change.

The checked source is [outcome-prioritization.json](outcome-prioritization.json). It pairs with the [support lifecycle overview](support-lifecycle.md), [triage playbook](triage-playbook.json), [response snippets](response-snippets.md), and [closeout checklist](closeout-checklist.md).

## Priority Rows

| Outcome | Priority | Backlog Destination | Enough Evidence |
| --- | --- | --- | --- |
| `docs-example` | `low` | docs clarification or report-gallery wording | checked behavior is correct, but wording or context confused someone |
| `fixture-backlog` | `medium` | pass or quiet-pass fixture backlog item | minimal public-safe reproduction plus `jester tune <rule-id> --json` evidence |
| `rule-review-candidate` | `high` | rule-review candidate issue | at least two sanitized reports point at the same rule boundary |

## Evidence Thresholds

### `docs-example`

Use when the report matches current checked behavior and mainly needs clearer docs, report-gallery wording, or severity context.

Enough evidence:

- nearest checked report or docs page is identified,
- observed output matches current behavior or differs only in wording/context,
- no rule behavior change is requested before a clearer explanation is tried.

### `fixture-backlog`

Use when the report describes a plausible safe boundary, but maintainers should prove it with a pass or quiet-pass fixture before changing behavior.

Enough evidence:

- smallest sanitized command, plan, diff, or final-answer text is available,
- rule id and redacted `jester tune <rule-id> --json` evidence are available,
- the safe boundary is not already covered by an existing pass or quiet-pass fixture.

### `rule-review-candidate`

Use when repeated public-safe reports suggest the guidance or matching boundary may need deliberate review.

Enough evidence:

- at least two sanitized reports or checked examples point at the same rule boundary,
- redacted `jester tune <rule-id> --json` or fixture report evidence is referenced,
- the candidate explains why docs clarification or a single fixture backlog item is not enough.

## Do Not Prioritize Publicly

Do not create a public backlog item when the report includes secrets, private code, private paths, customer data, full CI logs, unredacted SARIF, credential-handling details, command-execution vulnerability details, package publishing compromise, or MCP data exposure. Use [SECURITY.md](../../SECURITY.md) instead.

## Checks

Run this after editing prioritization guidance or support lifecycle files:

```powershell
npm run support:check
```

Run the checks for the chosen outcome:

```powershell
npm run reports:check
npm run fixtures:check
npm run fixtures:report
npm run fixtures:report -- --markdown
```
