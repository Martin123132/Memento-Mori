# Support Backlog Review

Use this when maintainers review public-safe backlog records over time. The checked source is [backlog-review.json](backlog-review.json). It pairs with [backlog-records.md](backlog-records.md), [outcome-prioritization.md](outcome-prioritization.md), and the [support lifecycle overview](support-lifecycle.md).

The review decision should keep each item in one of four states:

| Review decision | Source record | Keep when | Required checks |
| --- | --- | --- | --- |
| `remains-docs-clarification` | `docs-clarification-backlog-record` | wording or a checked report is still confusing | `npm run reports:check`, `npm run support:check` |
| `remains-fixture-backlog` | `fixture-backlog-record` | a minimized safe boundary still needs a pass or quiet-pass fixture | `npm run fixtures:check`, `npm run fixtures:report`, `npm run support:check` |
| `remains-rule-review-candidate` | `rule-review-candidate-backlog-record` | repeated sanitized reports still point at the same rule boundary | `npm run fixtures:report -- --markdown`, `npm run support:check` |
| `closed-no-action` | any backlog record | evidence is stale, duplicated, private, security-sensitive, or already resolved | `npm run support:check` |

## Review Flow

1. Re-read the original public-safe backlog record.
2. Confirm the linked docs, report-gallery example, fixture evidence, or rule guidance still exists.
3. Re-run the required checks for the current decision.
4. Choose one review decision: `remains-docs-clarification`, `remains-fixture-backlog`, `remains-rule-review-candidate`, or `closed-no-action`.
5. Record only the public-safe summary, next action, and check result.

## Decision Notes

Use `remains-docs-clarification` when current behavior is correct but the wording still makes a checked example hard to compare with local output.

Use `remains-fixture-backlog` when the smallest sanitized reproduction still describes a safe boundary worth preserving and no existing pass or quiet-pass fixture covers it.

Use `remains-rule-review-candidate` when at least two sanitized reports or checked examples still point at the same rule boundary and fixture evidence should be compared before any behavior change.

Use `closed-no-action` when the report no longer reproduces on the current package, has been resolved by another checked artifact, is too thin to act on, or should be routed through [SECURITY.md](../../SECURITY.md) instead of public backlog review.

## Privacy

Do not include secrets, private code, private paths, customer data, full CI logs, unredacted SARIF, credential-handling details, command-execution vulnerability details, package publishing compromise, or MCP data exposure in public backlog review notes. Use placeholders such as `<repo>`, `<path>`, or `<redacted>`, and route sensitive reports through [SECURITY.md](../../SECURITY.md).

Run this after editing support backlog review records:

```powershell
npm run support:check
```
