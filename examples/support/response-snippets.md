# Maintainer Response Snippets

These public-safe snippets reduce maintainer response friction after a report has been classified with the [triage playbook](triage-playbook.json). They are intentionally generic: no private repository names, no customer data, no full logs, and no real credentials.

The checked source is [response-snippets.json](response-snippets.json). Keep the outcome IDs aligned with the playbook:

- `docs-example`
- `fixture-backlog`
- `rule-review-candidate`

## Docs Example Response

Use for `docs-example` outcomes when behavior is expected but wording or examples could be clearer.

```markdown
Thanks for the report. This looks like expected behavior for the checked example, but the wording can be clearer.

Please do not paste private repo code, full logs, secrets, or private paths. If your local output differs from the checked example, share redacted `jester doctor --json` output and the smallest sanitized command summary.

Maintainer next step: update the report gallery wording or docs example, then run `npm run reports:check` and `npm run support:check`.
```

## Fixture Backlog Response

Use for `fixture-backlog` outcomes when a minimized false-positive report looks like a safe boundary worth preserving.

```markdown
Thanks, this looks like a plausible safe boundary. Please keep the reproduction minimal and redacted, then share `jester tune <rule-id> --json`, redacted `jester doctor --json`, and the smallest command, plan, diff, or final-answer text that reproduces the result.

We will not loosen the rule from one report. If the reduced example is valid, the next step is a pass or quiet-pass fixture with `expectedRuleIds` or `absentRuleIds`.

Maintainer next step: add the fixture backlog item, then run `npm run fixtures:check`, `npm run fixtures:report`, and `npm run support:check`.
```

## Rule Review Candidate Response

Use for `rule-review-candidate` outcomes when repeated sanitized reports suggest a rule boundary or guidance may need review.

```markdown
Thanks. This may be expected caution for now, but repeated sanitized reports can become a rule-review candidate.

Please share redacted `jester doctor --json`, redacted `jester tune <rule-id> --json`, and the smallest public-safe input that reproduces the surprise. Do not paste secrets, private project details, full logs, or private paths.

Maintainer next step: collect at least two sanitized examples, compare `fixtureEvidence`, and only then decide whether this is docs, fixture backlog, guidance, or rule-matching work.
```

Run the guard after editing snippets:

```powershell
npm run support:check
```
