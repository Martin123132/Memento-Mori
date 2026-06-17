# Review Fixtures

These fixtures are small, real-usage-shaped examples for preset tuning. They are used by the test suite so changes to rule behavior have a visible pass, caution, or block expectation.

The fixture file is [preset-review-cases.json](preset-review-cases.json).

Maintainer triage guidance lives in [docs/MAINTAINER_TRIAGE.md](../../docs/MAINTAINER_TRIAGE.md).

## What They Cover

- Documentation-only diffs that should stay quiet.
- Plan, command, diff, and final coverage for every built-in preset.
- Web preset client-exposed key and browser-storage risks.
- API preset CORS, raw SQL, webhook, and migration-command risks.
- Infra preset public exposure, IAM wildcard, and destructive command risks.
- AI preset eval-skipping and model-output execution risks.
- AI preset user-controlled tool-dispatch risks and safe allowlist/schema boundaries.
- Quiet-pass boundaries for thin custom, configured sensitive-domain, and preset blocked-command rules.
- Quiet-pass boundaries for built-in and structural rules such as missing verification, TypeScript suppressions, large removals, wildcard operations, destructive commands, and untested finals.
- Matched-pass examples for low-severity rules where a single finding should stay below caution.
- Second firing examples for preset blocked-command rules and high-value stack-specific sensitive-domain rules.
- Second firing examples for AI and API custom rules around provider keys, model-output execution, raw SQL, and webhook signature checks.
- Second firing examples for remaining framework custom rules across security, infra, node, python, and web presets.
- Second firing examples for remaining built-in and configured sensitive-domain thin rules, leaving no thin coverage gaps.
- Real-world low-count preset examples for node, python, web, infra, AI, and security workflows.
- Quiet-pass examples for typechecking, prebuild scripts, mypy, dataclass parsing, CodeQL, Dependabot limits, form validation, and accessibility copy.
- Quiet-pass examples for read-only Kubernetes inspection, Docker disk usage, Terraform linting, and public-IP hardening changes.
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

`npm run fixtures:report` summarizes coverage by rule, rule family, preset slice, review kind, verdict, and quiet-pass rule boundaries. Use it to find rules without pass-case coverage, pass-eligible rules without pass-case coverage, rules without quiet-pass coverage, thin rule coverage, preset/kind gaps, quiet pass fixtures, and the next curation target.

The `Curation next` section is a maintainer shortcut: start there when deciding whether the next fixture batch should focus on thin rules, feasible pass-case evidence, a specific rule family, or lower-count presets. The `--json` output includes the same `ruleFamilySlices`, `presetSlices`, `passEligibleRulesWithoutPassCases`, and `curationNext` fields for scripts.
