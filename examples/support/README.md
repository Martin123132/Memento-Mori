# Maintainer Triage Playbook

This playbook shows how to handle sanitized adopter reports without turning every surprise into an immediate rule change. It pairs with [docs/MAINTAINER_TRIAGE.md](../../docs/MAINTAINER_TRIAGE.md), the [report gallery feedback template](../reports/feedback-template.md), and the GitHub issue templates.

Start with the checked [support examples quickstart](support-examples-quickstart.md) during a live maintainer handoff, or the checked [support examples index](support-examples-index.md) when you need to choose the right artifact. Use [installed-package-support.md](installed-package-support.md) when proving those support examples from an installed npm package rather than a repo checkout, use [release-support-provenance.md](release-support-provenance.md) during release closeout so the installed-package verification is recorded after npm publish, and use [post-release-evidence-ledger.md](post-release-evidence-ledger.md) when you need the final public-safe evidence record for later review. Use the compact checked [support lifecycle map](support-lifecycle-map.md) when you need a quick scan of the path: report, triage, response, closeout, prioritization, backlog record, and backlog review. Use the checked [support lifecycle worksheet](support-lifecycle-worksheet.md) during an active review so every stage has concrete checks and record fields, and compare against the synthetic [filled worksheet example](support-lifecycle-filled-example.md) when you need to see one completed `docs-example` path. Use the full checked [support lifecycle overview](support-lifecycle.md) when you need the outcome table in one place. The lifecycle sources are [post-release-evidence-ledger.json](post-release-evidence-ledger.json), [release-support-provenance.json](release-support-provenance.json), [installed-package-support.json](installed-package-support.json), [support-examples-quickstart.json](support-examples-quickstart.json), [support-examples-index.json](support-examples-index.json), [support-lifecycle-map.json](support-lifecycle-map.json), [support-lifecycle-worksheet.json](support-lifecycle-worksheet.json), [support-lifecycle-filled-example.json](support-lifecycle-filled-example.json), and [support-lifecycle.json](support-lifecycle.json). Use [outcome-prioritization.md](outcome-prioritization.md) after closeout to decide whether follow-up work should become docs, fixture backlog, or rule-review work. Use [backlog-records.md](backlog-records.md) to turn that decision into a public-safe backlog artifact, then use [backlog-review.md](backlog-review.md) to decide whether the item stays active or closes with no action.

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
