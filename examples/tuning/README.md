# Framework Tuning Cookbook

These small recipes pair the [Framework Tuning Examples](../../docs/FRAMEWORK_TUNING.md) guide with checked, fixture-backed commands. Use them when a real repo reports a noisy rule and you want the smallest evidence-backed next step before changing config.

The machine-readable source is [framework-tuning-cookbook.json](framework-tuning-cookbook.json). It is checked by `npm run framework:tuning:check`, so recipe commands and fixture IDs stay aligned with the public guide and fixture suite.

Run `npm run framework:tuning:doctor` after `npm run build` when you want a consumer-style smoke check. It generates temporary preset configs with the built CLI, runs every cookbook `jester tune <rule-id> --json` command, validates the JSON advice shape, and confirms each recipe's fixture IDs are present in the packaged fixture suite.

## Recipes

| Recipe | Stack | Preset | Tune commands | Fixture examples |
| --- | --- | --- | --- | --- |
| `next-vite-public-config` | Next.js / Vite React | `web` | `jester tune custom-web-public-secret-name --json`; `jester tune custom-node-install-script-change --json` | `web-public-analytics-env-command-pass`, `node-next-lint-command-pass` |
| `fastapi-python-execution-boundary` | FastAPI / Python | `python` | `jester tune custom-python-eval-exec --json`; `jester tune custom-python-pickle-load --json` | `python-fastapi-dependency-diff-pass`, `python-pydantic-parse-diff-pass`, `python-uv-sync-frozen-command-pass` |
| `terraform-kubernetes-docs-only` | Terraform / Kubernetes / Helm | `infra` | `jester tune risky-domain --json`; `jester tune configured-sensitive-domain-terraform --json` | `infra-terraform-plan-docs-pass`, `infra-helm-values-docs-pass`, `infra-kubectl-describe-command-pass` |
| `security-scan-reporting` | Security scanning | `security` | `jester tune secret-material --json`; `jester tune custom-insecure-tls-disabled --json` | `sec-gitleaks-redacted-command-pass`, `sec-sbom-command-pass`, `sec-vulnerability-report-docs-pass` |
| `ai-mcp-tooling` | AI / MCP tools | `ai` | `jester tune custom-ai-user-controlled-tool-dispatch --json`; `jester tune custom-ai-public-provider-key --json` | `ai-tool-registry-allowlist-diff-pass`, `ai-model-regression-command-pass`, `ai-public-model-env-diff-pass` |

## How To Use A Recipe

1. Run `jester summary --kind <command|plan|diff|final> "<redacted minimal input>"` and copy the rule id that fired.
2. Run the nearest recipe command, such as `jester tune custom-ai-user-controlled-tool-dispatch --json`.
3. Compare `fixtureEvidence.quietPassFixtures` and sample fixture descriptions with the local hit.
4. If the local case is safe but missing from the fixture suite, add a redacted pass fixture before loosening a rule.
5. If the local case includes a real secret, destructive command, broad permission, skipped eval, or user-controlled execution path, fix the change instead of muting the rule.

Maintainer smoke check:

```powershell
npm.cmd run framework:tuning:doctor
```
