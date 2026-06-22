# Maintainer Triage

This guide turns support reports into repeatable maintenance work. The goal is simple: every useful bug or false-positive report should either become a clearer answer, a better fixture, or a focused code change.

## First Response

Ask for redacted diagnostics when they are missing:

```powershell
npx -y memento-mori-jester@latest doctor --json
```

For noisy rule reports, also ask for:

```powershell
npx -y memento-mori-jester@latest summary --kind <command|plan|diff|final> "<minimal input>"
npx -y memento-mori-jester@latest tune <rule-id> --json
```

For users who just need to understand what a healthy report looks like, point them at the checked [report gallery](../examples/reports). Maintainers can run `npm run reports:check` to prove those examples still match the current package output.

For users who say a gallery report is confusing, stale, or hard to compare with their local output, point them at [examples/reports/feedback-template.md](../examples/reports/feedback-template.md) or the GitHub [report gallery feedback issue template](../.github/ISSUE_TEMPLATE/report_gallery_feedback.yml). It asks for the nearest checked example, sanitized command and output summaries, version, and redacted diagnostics without asking for private code.

When a report has enough public-safe detail to triage, compare it with the checked [support triage playbook](../examples/support). The playbook walks sanitized report-gallery and false-positive reports through first response, classification, and a follow-up outcome.

Do not ask users to paste secrets, private code, customer data, live credentials, complete CI logs, or unredacted SARIF. If the report involves credential exposure, command execution, unexpected network access, private code disclosure, package publishing, or MCP data exposure, route it through [SECURITY.md](../SECURITY.md).

## Triage Labels

Use a small, boring label vocabulary:

- `bug`: behavior is broken or misleading.
- `false-positive`: Jester warned or blocked when the minimal example should probably pass.
- `rules`: rule matching, severity, fixture evidence, or tuning behavior.
- `docs`: documentation is unclear or missing.
- `enhancement`: a new command, preset, workflow, or larger product idea.
- `security`: only for public tracking with no sensitive details; private details belong in the security report flow.

## False-Positive Decision Tree

1. Confirm the minimal input reproduces on `latest` or local `main`.
2. Identify the rule id from `summary` output.
3. Run `jester tune <rule-id> --json` and inspect `fixtureEvidence`.
4. Decide whether the current behavior is:
   - expected and should be explained,
   - noisy but acceptable with tuning guidance,
   - a fixture gap,
   - a rule bug,
   - or a preset mismatch.

If the user has a safe example that should pass, prefer adding a pass or quiet-pass fixture before loosening a rule. If the example should still caution but the wording is confusing, update the rule guidance or docs instead of changing matching behavior.

## Report Gallery Feedback

Use report-gallery feedback when the issue is about understanding installed-package output, not changing a rule. Good outcomes are:

- a clearer gallery explanation,
- a new stable output fragment in `report-gallery.json`,
- a small docs update,
- or a redacted fixture only if the report exposes a reusable rule boundary.

Use the playbook outcomes consistently:

- `docs-example`: the behavior is expected but the report or wording is unclear.
- `fixture-backlog`: the reduced report looks safe and should become a pass or quiet-pass fixture.
- `rule-review-candidate`: repeated sanitized reports suggest guidance or matching may need review, but not from a single report.

After editing report support docs or issue templates, run:

```powershell
npm.cmd run support:check
npm.cmd run reports:check
```

## Converting Reports Into Fixtures

Add a fixture when the report is minimal, redacted, realistic, and captures a rule behavior worth preserving.

Good fixture candidates:

- use the smallest command, plan, diff, or final answer that reproduces the behavior,
- identify the preset or default config needed to reproduce it,
- include the expected verdict,
- include `expectedRuleIds` when the fixture should cover specific rules,
- include `absentRuleIds` when a quiet fixture protects against noisy matches,
- include `weight` when the case should strongly influence tuning confidence,
- set `edgeCase: true` when the example is useful but unusual.

Avoid fixtures that:

- contain secrets, private paths, private code, customer data, or identifiable logs,
- depend on network calls, local machine state, dates, or npm/GitHub availability,
- encode a one-off project preference as a global default,
- duplicate an existing fixture without adding a new rule, preset, kind, or edge case.

## Fixture Workflow

1. Add or edit a case in [examples/fixtures/preset-review-cases.json](../examples/fixtures/preset-review-cases.json).
2. Keep fixture IDs stable and descriptive, for example `web-localstorage-token-pass-2`.
3. Prefer deterministic content over full real-world excerpts.
4. Run:

```powershell
npm.cmd test
npm.cmd run fixtures:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
node .\dist\cli.js tune <rule-id>
node .\dist\cli.js tune <rule-id> --json
node .\dist\cli.js tune coverage
```

5. Fix any duplicate IDs, missing expected rule metadata, weak descriptions, unsafe content, or duplicate content reported by `fixtures:check`.
6. Use `fixtures:report` to check whether the change improves feasible pass-case, quiet-pass, preset, kind, rule-family, or verdict coverage. Start with the report's `Curation next` section when deciding which fixture batch to add first, and use `fixtures:report -- --markdown` when you need a paste-ready snapshot for an issue or release note.
7. Check whether support/confidence changed in the expected direction.
8. If the fixture changes verdict behavior, mention the exact rule impact in `CHANGELOG.md`.

## When To Change A Rule

Change rule logic only when fixtures show the current matcher is broadly wrong or too blunt. Keep the change small:

- preserve existing JSON output shapes unless the release explicitly changes them,
- add pass and caution/block fixtures around the boundary,
- update `jester rule <id>` guidance when the safe alternative or tuning advice changes,
- keep docs-only noise suppression conservative,
- never suppress project custom rules globally.

## Closing Notes

Close with the command users can run next. Good closes include:

```powershell
npx -y memento-mori-jester@latest tune <rule-id>
npx -y memento-mori-jester@latest config disable-rule <rule-id>
npx -y memento-mori-jester@latest config validate
```

If the report produced a fixture, mention the fixture ID in the issue. That gives future maintainers a trail from user pain to test coverage.
