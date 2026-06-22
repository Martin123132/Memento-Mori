# Framework Tuning Examples

Use this when a rule is noisy in a real project and you want the smallest evidence-backed next step before muting it.

For copy-pasteable recipes, see [examples/tuning](../examples/tuning). The machine-readable cookbook is [framework-tuning-cookbook.json](../examples/tuning/framework-tuning-cookbook.json). `npm run framework:tuning:check` keeps it aligned with this guide and the fixture suite, while `npm run framework:tuning:doctor` runs the cookbook's tune commands through the built CLI with temporary preset configs.

Start with the rule that actually fired:

```powershell
jester summary --kind <command|plan|diff|final> "<redacted minimal input>"
jester tune <rule-id> --json
```

Then compare the output with the nearest fixture-backed examples below. If your case is closer to the safe examples than the risky examples, add a redacted fixture before changing a rule.

| Cookbook recipe | Stack | Common noisy rule | Useful tune command | Safe fixture examples |
| --- | --- | --- | --- | --- |
| `next-vite-public-config` | Next.js / Vite React | Public but non-secret frontend names or harmless workspace commands | `jester tune custom-web-public-secret-name --json` or `jester tune custom-node-install-script-change --json` | `web-public-analytics-env-command-pass`, `node-next-lint-command-pass` |
| `fastapi-python-execution-boundary` | FastAPI / Python | Typed dependency injection, schema parsing, or locked dependency sync being confused with dynamic execution | `jester tune custom-python-eval-exec --json` or `jester tune custom-python-pickle-load --json` | `python-fastapi-dependency-diff-pass`, `python-pydantic-parse-diff-pass`, `python-uv-sync-frozen-command-pass` |
| `terraform-kubernetes-docs-only` | Terraform / Kubernetes / Helm | Docs-only infrastructure guidance mentioning sensitive tool names | `jester tune risky-domain --json` or `jester tune configured-sensitive-domain-terraform --json` | `infra-terraform-plan-docs-pass`, `infra-helm-values-docs-pass`, `infra-kubectl-describe-command-pass` |
| `security-scan-reporting` | Security scanning | Redacted scanner output or SBOM/report generation being confused with secret material | `jester tune secret-material --json` or `jester tune custom-insecure-tls-disabled --json` | `sec-gitleaks-redacted-command-pass`, `sec-sbom-command-pass`, `sec-vulnerability-report-docs-pass` |
| `ai-mcp-tooling` | AI / MCP tools | Static allowlists, model checks, or public model names being confused with unsafe tool dispatch or provider keys | `jester tune custom-ai-user-controlled-tool-dispatch --json` or `jester tune custom-ai-public-provider-key --json` | `ai-tool-registry-allowlist-diff-pass`, `ai-model-regression-command-pass`, `ai-public-model-env-diff-pass` |

## What To Do With The Result

- If `fixtureEvidence.quietPassFixtures` already contains a close match, prefer a local config mute over changing global rules.
- If the safe case is missing but the report is minimal and redacted, add a new pass fixture with `absentRuleIds`.
- If the rule fired on a genuinely dangerous command, secret, broad permission, production-impacting change, or user-controlled execution path, fix the underlying change instead of muting it.
- If the example depends on private code, customer data, credentials, or internal URLs, redact it before adding a fixture or opening a public issue.
