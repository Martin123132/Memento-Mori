# Review Fixtures

These fixtures are small, real-usage-shaped examples for preset tuning. They are used by the test suite so changes to rule behavior have a visible pass, caution, or block expectation.

The fixture file is [preset-review-cases.json](preset-review-cases.json).

## What They Cover

- Documentation-only diffs that should stay quiet.
- Web preset client-exposed key and browser-storage risks.
- API preset CORS and raw SQL risks.
- Infra preset public exposure risks.
- AI preset eval-skipping and model-output execution risks.
- Fixture metadata like `weight` and `edgeCase` to support precision-weighted tuning evidence.

## Local Check

```powershell
npm.cmd test
```

For one-off manual review, paste a fixture `content` value into:

```powershell
npx -y memento-mori-jester@latest playground
```
