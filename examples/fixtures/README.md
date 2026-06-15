# Review Fixtures

These fixtures are small, real-usage-shaped examples for preset tuning. They are used by the test suite so changes to rule behavior have a visible pass, caution, or block expectation.

The fixture file is [preset-review-cases.json](preset-review-cases.json).

Maintainer triage guidance lives in [docs/MAINTAINER_TRIAGE.md](../../docs/MAINTAINER_TRIAGE.md).

## What They Cover

- Documentation-only diffs that should stay quiet.
- Node, Python, and security preset plan/command/diff/final coverage.
- Web preset client-exposed key and browser-storage risks.
- API preset CORS and raw SQL risks.
- Infra preset public exposure risks.
- AI preset eval-skipping and model-output execution risks.
- Fixture metadata like `weight` and `edgeCase` to support precision-weighted tuning evidence.

## Local Check

```powershell
npm.cmd test
npm.cmd run fixtures:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
```

For one-off manual review, paste a fixture `content` value into:

```powershell
npx -y memento-mori-jester@latest playground
```

## Adding A Fixture From A Report

Use the smallest redacted example that still reproduces the behavior. A good fixture records:

- the review `kind`,
- the preset or config needed to reproduce it,
- the expected verdict,
- the rule ids that should match in `expectedRuleIds`,
- noisy rules that must stay absent in `absentRuleIds`,
- and whether the case is an unusual `edgeCase`.

Do not add secrets, private code, customer data, complete logs, or machine-specific paths. If a false-positive report is safe but broad, add a passing fixture before loosening a rule.

`npm run fixtures:check` validates duplicate IDs, missing expected rule metadata, weak descriptions, unsafe-looking fixture content, and duplicate content before the fixture suite becomes tuning evidence.

`npm run fixtures:report` summarizes coverage by rule, preset, review kind, verdict, and quiet-pass rule boundaries. Use it to find rules without pass-case coverage, rules without quiet-pass coverage, thin rule coverage, preset/kind gaps, and quiet pass fixtures.
