# Support Examples Index

This public-safe index tells maintainers which checked support artifact to use during a report review. It keeps the compact map, blank worksheet, and filled synthetic example together so a support issue can move from first report to backlog review without guessing.

The checked source is [support-examples-index.json](support-examples-index.json). It points at the [support lifecycle map](support-lifecycle-map.md), [support lifecycle worksheet](support-lifecycle-worksheet.md), and [filled lifecycle worksheet example](support-lifecycle-filled-example.md).

## Which Artifact To Use

| Artifact | Use when | Required public-safe markers |
| --- | --- | --- |
| [support-lifecycle-map.md](support-lifecycle-map.md) | You need the shortest scan of the support path before reading details. | Stage order, outcome scan, `SECURITY.md`, and `npm run support:check`. |
| [support-lifecycle-worksheet.md](support-lifecycle-worksheet.md) | You are actively reviewing one public support report and need fields to record. | Stage checklist, record fields, stop conditions, `SECURITY.md`, and `npm run support:check`. |
| [support-lifecycle-filled-example.md](support-lifecycle-filled-example.md) | You want to compare the active report with one completed synthetic `docs-example` path. | `synthetic-report-gallery-docs-example`, placeholder links, privacy review notes, `SECURITY.md`, and `npm run support:check`. |

## Quick Maintainer Path

| Stage | Maintainer question | Use this artifact | Record |
| --- | --- | --- | --- |
| `report` | Is the report redacted, minimal, and safe to discuss publicly? | [feedback-template.md](../reports/feedback-template.md) | source issue, package version, sanitized summary, safe to discuss publicly |
| `triage` | Is this expected docs behavior, fixture backlog, or rule-review work? | [triage-playbook.json](triage-playbook.json) | selected outcome, rule id or report id, why the outcome fits |
| `response` | Which checked public-safe reply should go back to the reporter? | [response-snippets.md](response-snippets.md) | snippet id, next command, public-safe follow-up link |
| `closeout` | Did the immediate support decision ship, queue, or open follow-up? | [closeout-checklist.md](closeout-checklist.md) | closeout id, decision status, follow-up link placeholder |
| `prioritization` | Is the follow-up low-priority docs, medium fixture work, or high rule review? | [outcome-prioritization.md](outcome-prioritization.md) | priority, minimum evidence, not enough evidence guardrail |
| `backlog-record` | Is there a public-safe backlog artifact with evidence and checks? | [backlog-records.md](backlog-records.md) | backlog record id, backlog type, next action, required checks |
| `backlog-review` | Does the item remain active, or should it close with no action? | [backlog-review.md](backlog-review.md) | review decision, review cadence, next action, checks run |

## Public-Safe Markers

Keep every public support artifact aligned with these markers:

- say when an example is synthetic,
- use placeholders for issue links and follow-up links,
- include the `SECURITY.md` redirect for sensitive reports,
- avoid secrets, private code, private paths, customer data, full logs, unredacted SARIF, package publishing credentials, MCP data exposure, or exploitable security details,
- keep rule behavior unchanged unless a separate checked rule-review change exists.

## Checks

```powershell
npm run support:check
npm run production:check
```
