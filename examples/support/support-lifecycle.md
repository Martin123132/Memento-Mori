# Support Lifecycle Overview

This index shows the public-safe support path at a glance:

```text
report -> triage -> response -> closeout
```

The checked source is [support-lifecycle.json](support-lifecycle.json). It ties together the [report gallery feedback template](../reports/feedback-template.md), [triage playbook](triage-playbook.json), [response snippets](response-snippets.md), and [closeout checklist](closeout-checklist.md).

## Outcomes

| Outcome | Report | Triage | Response | Closeout |
| --- | --- | --- | --- | --- |
| `docs-example` | `report-gallery-feedback` | `gallery-expected-block-docs` | `docs-example-response` | `docs-clarification-closeout` |
| `fixture-backlog` | `false-positive` | `false-positive-fixture-backlog` | `fixture-backlog-response` | `fixture-backlog-closeout` |
| `rule-review-candidate` | `false-positive` | `repeated-risky-domain-rule-review` | `rule-review-candidate-response` | `rule-review-closeout` |

## Audit Checklist

For each public support issue, confirm:

- the report asks for redacted `doctor --json` output and the smallest sanitized reproduction,
- the triage outcome is one of `docs-example`, `fixture-backlog`, or `rule-review-candidate`,
- the response snippet matches the chosen outcome,
- the closeout record says whether the docs clarification shipped or queued, fixture backlog was created, or rule-review candidate was opened,
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
