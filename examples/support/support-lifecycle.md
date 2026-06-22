# Support Lifecycle Overview

This index shows the public-safe support path at a glance:

```text
report -> triage -> response -> closeout -> prioritization -> backlog-record -> backlog-review
```

The support examples index is [support-examples-index.md](support-examples-index.md), backed by [support-examples-index.json](support-examples-index.json). The compact map is [support-lifecycle-map.md](support-lifecycle-map.md), backed by [support-lifecycle-map.json](support-lifecycle-map.json). The active review worksheet is [support-lifecycle-worksheet.md](support-lifecycle-worksheet.md), backed by [support-lifecycle-worksheet.json](support-lifecycle-worksheet.json), with a synthetic completed example in [support-lifecycle-filled-example.md](support-lifecycle-filled-example.md) and [support-lifecycle-filled-example.json](support-lifecycle-filled-example.json). The checked source for the full outcome table is [support-lifecycle.json](support-lifecycle.json). It ties together the [report gallery feedback template](../reports/feedback-template.md), [triage playbook](triage-playbook.json), [response snippets](response-snippets.md), [closeout checklist](closeout-checklist.md), [outcome prioritization guide](outcome-prioritization.md), [backlog records](backlog-records.md), and [backlog review checklist](backlog-review.md).

## Outcomes

| Outcome | Report | Triage | Response | Closeout | Prioritization | Backlog Record | Backlog Review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `docs-example` | `report-gallery-feedback` | `gallery-expected-block-docs` | `docs-example-response` | `docs-clarification-closeout` | `docs-example` | `docs-clarification-backlog-record` | `docs-clarification-review` |
| `fixture-backlog` | `false-positive` | `false-positive-fixture-backlog` | `fixture-backlog-response` | `fixture-backlog-closeout` | `fixture-backlog` | `fixture-backlog-record` | `fixture-backlog-review` |
| `rule-review-candidate` | `false-positive` | `repeated-risky-domain-rule-review` | `rule-review-candidate-response` | `rule-review-closeout` | `rule-review-candidate` | `rule-review-candidate-backlog-record` | `rule-review-candidate-review` |

## Audit Checklist

For each public support issue, confirm:

- the report asks for redacted `doctor --json` output and the smallest sanitized reproduction,
- the triage outcome is one of `docs-example`, `fixture-backlog`, or `rule-review-candidate`,
- the response snippet matches the chosen outcome,
- the closeout record says whether the docs clarification shipped or queued, fixture backlog was created, or rule-review candidate was opened,
- the prioritization record says whether follow-up is low-priority docs, medium-priority fixture backlog, or high-priority rule review,
- the backlog record captures the public-safe follow-up artifact without changing rule behavior first,
- the backlog review keeps the item active as docs, fixture, or rule-review work only while evidence still holds, otherwise it closes as `closed-no-action`,
- no secrets, private code, private paths, customer data, full logs, unredacted SARIF, or exploitable security details appear in the public record.

## Checks

Run this after editing the lifecycle overview or any support artifact it links:

```powershell
npm run support:check
```

Run report or fixture checks for the matching outcome:

```powershell
npm run reports:check
npm run fixtures:check
npm run fixtures:report
npm run fixtures:report -- --markdown
```

Use [SECURITY.md](../../SECURITY.md) instead of a public issue for credential exposure, private code disclosure, command execution risk, package publishing concerns, MCP data exposure, or exploitable vulnerability details.
