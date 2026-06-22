# Support Examples Quickstart

Use this 60-second public-safe handoff card when an incoming support report needs a maintainer decision before anyone reads the full playbook.

The checked source is [support-examples-quickstart.json](support-examples-quickstart.json). It pairs with the [support examples index](support-examples-index.md), [support lifecycle map](support-lifecycle-map.md), [support lifecycle worksheet](support-lifecycle-worksheet.md), [filled synthetic example](support-lifecycle-filled-example.md), [support backlog records](backlog-records.md), and [support backlog review checklist](backlog-review.md).

## 60-Second Path

| Time | Action | Artifact | Decision |
| --- | --- | --- | --- |
| `0-10s` | Check whether the incoming report is public-safe. | [feedback-template.md](../reports/feedback-template.md) | If it has secrets, private code, private paths, full logs, or exploitable details, stop and route through [SECURITY.md](../../SECURITY.md). |
| `10-20s` | Scan the lifecycle shape. | [support-lifecycle-map.md](support-lifecycle-map.md) | Confirm the report can move through report, triage, response, closeout, prioritization, backlog record, and backlog review. |
| `20-35s` | Open the blank worksheet. | [support-lifecycle-worksheet.md](support-lifecycle-worksheet.md) | Record the stage fields and stop conditions for the active report. |
| `35-45s` | Compare with the filled synthetic example. | [support-lifecycle-filled-example.md](support-lifecycle-filled-example.md) | Use `synthetic-report-gallery-docs-example` only as a public-safe shape, not as user evidence. |
| `45-55s` | Create or skip the backlog record. | [backlog-records.md](backlog-records.md) | Create a public-safe backlog artifact only when closeout and prioritization agree. |
| `55-60s` | Schedule the review decision. | [backlog-review.md](backlog-review.md) | Keep it active only while public evidence still holds; otherwise close as `closed-no-action`. |

## Lifecycle Prompts

| Stage | Ask | Artifact |
| --- | --- | --- |
| `report` | Is it redacted, minimal, and safe to discuss publicly? | [feedback-template.md](../reports/feedback-template.md) |
| `triage` | Is this docs clarification, fixture backlog, or rule-review work? | [triage-playbook.json](triage-playbook.json) |
| `response` | Which checked reply gives one next command or safe link? | [response-snippets.md](response-snippets.md) |
| `closeout` | Was the immediate support decision recorded? | [closeout-checklist.md](closeout-checklist.md) |
| `prioritization` | Is follow-up low, medium, or high priority? | [outcome-prioritization.md](outcome-prioritization.md) |
| `backlog-record` | Is there a redacted backlog artifact with required checks? | [backlog-records.md](backlog-records.md) |
| `backlog-review` | Does the item remain active or close with no action? | [backlog-review.md](backlog-review.md) |

## Public-Safe Handoff Rules

- Treat this quickstart as a routing card, not a place to paste report details.
- Keep examples synthetic or placeholder-based.
- Use only sanitized summaries, redacted diagnostics, and public issue links.
- Do not include secrets, private code, private paths, customer data, full logs, unredacted SARIF, package publishing credentials, MCP data exposure, or exploitable security details.
- Route sensitive reports through [SECURITY.md](../../SECURITY.md).

## Checks

```powershell
npm run support:check
npm run production:check
```
