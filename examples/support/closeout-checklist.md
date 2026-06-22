# Support Closeout Checklist

Use this checklist after a maintainer has classified a sanitized support report and sent a response snippet. It records what happened next without changing rule behavior or exposing private project details.

The checked source is [closeout-checklist.json](closeout-checklist.json). Keep closeout outcomes aligned with the [triage playbook](triage-playbook.json) and [response snippets](response-snippets.md):

- `docs-example`
- `fixture-backlog`
- `rule-review-candidate`

## Closeout Record

Every public closeout should include:

- outcome,
- public-safe summary,
- shipped or queued status,
- link placeholder for the docs change, fixture backlog item, or rule-review issue,
- next command for the user or maintainer,
- evidence that secrets, private code, private paths, customer data, full logs, and exploitable details were not included.

## Docs Clarification

Use when behavior was expected and the right follow-up is clearer wording.

```text
Outcome: docs-example
Status: shipped-or-queued
Public summary: Clarified the checked report-gallery wording so the expected block verdict is easier to understand.
Follow-up: <docs-pr-or-commit>
Next command: npm run reports:check
```

## Fixture Backlog

Use when the report describes a plausible safe boundary but behavior should not change until fixture evidence exists.

```text
Outcome: fixture-backlog
Status: backlog-created
Public summary: Created a redacted fixture backlog item for a plausible quiet-pass boundary.
Follow-up: <fixture-backlog-issue>
Next command: npm run fixtures:report
```

## Rule Review Candidate

Use when repeated sanitized reports suggest guidance or matching may need review.

```text
Outcome: rule-review-candidate
Status: candidate-opened
Public summary: Opened a rule-review candidate after repeated sanitized reports suggested a possible guidance or matching boundary.
Follow-up: <rule-review-issue>
Next command: node .\dist\cli.js tune <rule-id> --json
```

## Checks

Run this after editing closeout records or support docs:

```powershell
npm run support:check
```

Run fixture checks before closing a fixture-backed issue:

```powershell
npm run fixtures:check
npm run fixtures:report
npm run fixtures:report -- --markdown
```

Do not include secrets, tokens, private repository code, private paths, customer data, full CI logs, unredacted SARIF, or exploitable security details in a public closeout. Use [SECURITY.md](../../SECURITY.md) for sensitive reports.
