# Support Lifecycle Worksheet

Use this public-safe worksheet while reviewing one support report. It turns the [support lifecycle map](support-lifecycle-map.md) into a stage-by-stage checklist.

The checked source is [support-lifecycle-worksheet.json](support-lifecycle-worksheet.json). Use [support-examples-index.md](support-examples-index.md) when choosing between the map, blank worksheet, and filled example. Use [support-lifecycle-filled-example.md](support-lifecycle-filled-example.md) for a synthetic completed example, and use [support-lifecycle.md](support-lifecycle.md) for the outcome table after the worksheet identifies the right path.

## Report

- [ ] Confirm the issue uses a redacted report, false-positive, bug, or report-gallery feedback template.
- [ ] Confirm the report includes a package version, nearest checked example or minimal input, and redacted `doctor --json` output when useful.
- [ ] Confirm no secrets, private code, private paths, customer data, full logs, unredacted SARIF, or exploitable details are present.

Record: `source issue`, `package version`, `sanitized summary`, and `safe to discuss publicly`.

Stop and route through [SECURITY.md](../../SECURITY.md) if the report includes sensitive material or exploitable detail.

## Triage

- [ ] Reproduce or compare the smallest public-safe summary against `latest` or local `main`.
- [ ] Identify whether the report is expected docs behavior, a plausible fixture boundary, or a repeated rule-review pattern.
- [ ] Choose exactly one lifecycle outcome: `docs-example`, `fixture-backlog`, or `rule-review-candidate`.

Record: `selected outcome`, `rule id or report id`, and `why the outcome fits`.

Stop if the report cannot be reproduced or reduced without private material.

## Response

- [ ] Pick the matching checked response snippet for the selected outcome.
- [ ] Ask only for redacted diagnostics such as `doctor --json`, `summary`, or `tune <rule-id> --json`.
- [ ] Give the reporter one next command or one public-safe follow-up link.

Record: `snippet id`, `next command`, and `public-safe follow-up link`.

Stop if the response would require secrets, private repo code, full logs, or private paths.

## Closeout

- [ ] Record whether the docs clarification shipped or queued, fixture backlog was created, or rule-review candidate was opened.
- [ ] Link only public-safe artifacts, placeholders, or sanitized issue references.
- [ ] Keep rule behavior unchanged unless a separate checked rule-review change exists.

Record: `closeout id`, `decision status`, and `follow-up link placeholder`.

Stop if the closeout cannot explain the decision without private context.

## Prioritization

- [ ] Use the outcome prioritization guide to set low, medium, or high priority.
- [ ] Confirm the minimum evidence threshold for the selected outcome is met.
- [ ] Confirm there is enough public-safe evidence before opening follow-up work.

Record: `priority`, `minimum evidence`, and `not enough evidence guardrail`.

Stop if the priority depends on private reports that cannot be summarized safely.

## Backlog Record

- [ ] Create a public-safe backlog record only after closeout and prioritization agree.
- [ ] Include the source closeout, public title, public summary, expected next action, and required checks.
- [ ] Include privacy review notes showing the artifact is redacted and safe to keep public.

Record: `backlog record id`, `backlog type`, `next action`, and `required checks`.

Stop if the backlog item would reveal private code, customer data, or a live exploit path.

## Backlog Review

- [ ] Revisit whether the item remains docs clarification, fixture backlog, or rule-review candidate.
- [ ] Close as `closed-no-action` when evidence is stale, duplicated, private, security-sensitive, or already resolved.
- [ ] Confirm current checks still pass before keeping or closing the item.

Record: `review decision`, `review cadence`, `next action`, and `checks run`.

Stop if the review uncovers sensitive details that belong in the private security flow.

## Required Checks

```powershell
npm run support:check
npm run production:check
```
