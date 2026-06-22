# Maintainer Triage Playbook

This playbook shows how to handle sanitized adopter reports without turning every surprise into an immediate rule change. It pairs with [docs/MAINTAINER_TRIAGE.md](../../docs/MAINTAINER_TRIAGE.md), the [report gallery feedback template](../reports/feedback-template.md), and the GitHub issue templates.

The checked source is [triage-playbook.json](triage-playbook.json). It covers three common support outcomes:

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

## Checks

Run this after editing support docs, issue templates, or the playbook:

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
