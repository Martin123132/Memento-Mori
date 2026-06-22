# Maintainer Triage Playbook

This playbook shows how to handle sanitized adopter reports without turning every surprise into an immediate rule change. It pairs with [docs/MAINTAINER_TRIAGE.md](../../docs/MAINTAINER_TRIAGE.md), the [report gallery feedback template](../reports/feedback-template.md), and the GitHub issue templates.

Start with the checked [support lifecycle overview](support-lifecycle.md) when you need the whole path in one place. The lifecycle source is [support-lifecycle.json](support-lifecycle.json). Use [outcome-prioritization.md](outcome-prioritization.md) after closeout to decide whether follow-up work should become docs, fixture backlog, or rule-review work. Use [backlog-records.md](backlog-records.md) to turn that decision into a public-safe backlog artifact, then use [backlog-review.md](backlog-review.md) to decide whether the item stays active or closes with no action.

The checked source is [triage-playbook.json](triage-playbook.json). Use [response-snippets.md](response-snippets.md) for copy-paste replies after a report is classified. The snippet source is [response-snippets.json](response-snippets.json). Use [closeout-checklist.md](closeout-checklist.md) to record what happened after the response. The closeout source is [closeout-checklist.json](closeout-checklist.json). The backlog source is [backlog-records.json](backlog-records.json). The review source is [backlog-review.json](backlog-review.json).

| ID | Source | Classification | Follow-up |
| --- | --- | --- | --- |
| `gallery-expected-block-docs` | report-gallery feedback | expected docs clarification | docs example |
| `false-positive-fixture-backlog` | false-positive report | plausible safe boundary | fixture backlog |
| `repeated-risky-domain-rule-review` | false-positive report | repeated surprise pattern | rule-review candidate |

## Maintainer Flow

1. Confirm the report is public-safe. If it includes secrets, private code, full CI logs, exploitable details, package publishing concerns, MCP data exposure, or credential handling, route it through [SECURITY.md](../../SECURITY.md).
2. Ask for the smallest redacted reproduction plus `jester doctor --json`.
3. For noisy rules, ask for `jester tune <rule-id> --json`.
4. Classify the report as `docs`, `false-positive`, `rules`, `bug`, or `security`.
5. Choose one follow-up outcome:
   - `docs-example`: improve wording or a checked report example.
   - `fixture-backlog`: add a pass or quiet-pass fixture before changing behavior.
   - `rule-review-candidate`: collect repeated sanitized reports before changing guidance or matching.
6. Close with the next command the user can run.
7. Use the matching response snippet so replies stay public-safe and consistent.
8. Record the closeout with the matching checklist entry: docs clarification shipped or queued, fixture backlog created, or rule-review candidate opened.
9. If follow-up work remains, create the matching backlog record: docs clarification, fixture backlog item, or rule-review candidate.
10. Review backlog records over time as `remains-docs-clarification`, `remains-fixture-backlog`, `remains-rule-review-candidate`, or `closed-no-action`.

## Checks

Run this after editing support docs, issue templates, the lifecycle overview, outcome prioritization, backlog records, backlog review, the playbook, response snippets, or closeout checklist:

```powershell
npm run support:check
```

Run these when a report becomes fixture work:

```powershell
npm run fixtures:check
npm run fixtures:report
npm run fixtures:report -- --markdown
```

The playbook is intentionally synthetic and public. Do not add private repository names, private paths, tokens, customer data, or full logs.
