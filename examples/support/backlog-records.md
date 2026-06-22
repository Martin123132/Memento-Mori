# Support Backlog Records

Use this after the [support lifecycle overview](support-lifecycle.md), [outcome prioritization guide](outcome-prioritization.md), and [closeout checklist](closeout-checklist.md) have identified follow-up work. The checked source is [backlog-records.json](backlog-records.json).

These records show how a closed, prioritized, public-safe support outcome becomes a backlog artifact without changing rule behavior first.

| Outcome | Priority | Backlog record | Destination | Required checks |
| --- | --- | --- | --- | --- |
| `docs-example` | low | `docs-clarification-backlog-record` | docs clarification | `npm run reports:check`, `npm run support:check` |
| `fixture-backlog` | medium | `fixture-backlog-record` | pass or quiet-pass fixture | `npm run fixtures:check`, `npm run fixtures:report`, `npm run support:check` |
| `rule-review-candidate` | high | `rule-review-candidate-backlog-record` | rule-review candidate | `npm run fixtures:report -- --markdown`, `npm run support:check` |

## Docs Clarification

Use `docs-clarification-backlog-record` when the behavior is expected but the checked report, README, or guide made it hard to compare local output with the known-good example.

Enough evidence:

- nearest checked report or docs page,
- observed output summary,
- confirmation that no rule behavior change is requested before clearer wording is tried.

Next action: open or update a docs issue with the public-safe wording change and link the matching checked report.

## Fixture Backlog

Use `fixture-backlog-record` when a minimized false-positive report looks safe but should be protected by a pass or quiet-pass fixture before any matcher changes are considered.

Enough evidence:

- smallest sanitized command, plan, diff, or final-answer text,
- candidate rule id plus redacted `jester tune <rule-id> --json` evidence,
- confirmation that no existing pass or quiet-pass fixture covers the safe boundary.

Next action: open a fixture backlog item with the candidate rule id, expected verdict, and `absentRuleIds` or `expectedRuleIds`.

## Rule-Review Candidate

Use `rule-review-candidate-backlog-record` when repeated sanitized reports point at the same rule boundary and a docs clarification or single fixture backlog item is not enough.

Enough evidence:

- at least two sanitized reports or checked examples,
- fixture report or tune evidence for the rule,
- a short explanation of why the decision needs rule-review attention.

Next action: open a rule-review candidate issue linking the sanitized examples, fixture evidence, and current guidance.

## Privacy

Do not create a public backlog record when the report includes secrets, private code, private paths, customer data, full CI logs, unredacted SARIF, credential-handling details, command-execution vulnerability details, package publishing compromise, or MCP data exposure. Use [SECURITY.md](../../SECURITY.md) instead.

Run this after editing support backlog records:

```powershell
npm run support:check
```
