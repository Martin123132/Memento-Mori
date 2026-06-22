# Support Lifecycle Map

This is the compact public-safe map for maintainers who need the whole support chain without reading every checklist first.

The checked source is [support-lifecycle-map.json](support-lifecycle-map.json). Use the [support lifecycle worksheet](support-lifecycle-worksheet.md) during an active review, and use the full [support lifecycle overview](support-lifecycle.md) when you need the outcome table and per-stage artifact references.

```text
report
  -> triage
  -> response
  -> closeout
  -> prioritization
  -> backlog-record
  -> backlog-review
```

## Stage Scan

| Stage | Artifact | Maintainer question |
| --- | --- | --- |
| `report` | [feedback-template.md](../reports/feedback-template.md) | Is the report redacted, minimal, and safe to discuss publicly? |
| `triage` | [triage-playbook.json](triage-playbook.json) | Is this a docs example, fixture backlog item, or rule-review candidate? |
| `response` | [response-snippets.md](response-snippets.md) | Which public-safe reply should go back to the reporter? |
| `closeout` | [closeout-checklist.md](closeout-checklist.md) | Was the immediate support decision recorded with a safe next link? |
| `prioritization` | [outcome-prioritization.md](outcome-prioritization.md) | Is the follow-up low-priority docs, medium-priority fixture work, or high-priority rule review? |
| `backlog-record` | [backlog-records.md](backlog-records.md) | Is there a sanitized backlog artifact with evidence and checks? |
| `backlog-review` | [backlog-review.md](backlog-review.md) | Does the item remain active, or should it close as `closed-no-action`? |

## Outcome Scan

| Outcome | Backlog record | Review decision |
| --- | --- | --- |
| `docs-example` | `docs-clarification-backlog-record` | `remains-docs-clarification` or `closed-no-action` |
| `fixture-backlog` | `fixture-backlog-record` | `remains-fixture-backlog` or `closed-no-action` |
| `rule-review-candidate` | `rule-review-candidate-backlog-record` | `remains-rule-review-candidate` or `closed-no-action` |

## Guardrail

If the report includes secrets, private code, private paths, customer data, full logs, unredacted SARIF, package publishing credentials, MCP data exposure, or exploitable security details, stop using the public lifecycle and route through [SECURITY.md](../../SECURITY.md).

Run after editing this map:

```powershell
npm run support:check
npm run production:check
```
