# Demo Transcript

This is a short script for showing what Memento Mori Jester does. The README image is generated from the same product story by `scripts/render-demo-svg.mjs`.

## 1. Health Check

Command:

```powershell
npx -y memento-mori-jester@latest doctor
```

Typical output:

```text
Memento Mori Jester doctor

PASS node-version: Node v24.15.0; required >=20.
PASS mcp-server-file: ...\node_modules\memento-mori-jester\dist\server.js
PASS review-engine: Dangerous git command is blocked.
PASS config: No config file found; using built-in defaults.

The fool is fit for court.
```

## 2. Dangerous Command Review

Command:

```powershell
npx -y memento-mori-jester@latest command "git reset --hard"
```

Typical output:

```text
Jester verdict: BLOCK (100/100)
A dazzling command, if the desired outcome is court-sponsored regret.

Concerns:
- [S5] Destructive git operation: This can discard local work or remove untracked files. Evidence: git reset --hard

Suggested checks:
- Inspect `git status`, confirm the target branch, and make a backup or stash before running it.
```

## 3. Overconfident Plan Review

Command:

```powershell
npx -y memento-mori-jester@latest plan "I will just refactor auth and ship it"
```

Typical output:

```text
Jester verdict: CAUTION (40/100)

Concerns:
- [S2] Confidence theater: Words like simple, obvious, or definitely often hide unpriced complexity.
- [S2] No verification step: The plan changes behavior but does not say how the result will be checked.
- [S3] High-risk domain touched: Auth, billing, production, migrations, or security-sensitive areas deserve extra evidence.
```

The exact jab varies by tone, but the point should be clear: add evidence before marching onward.

## 4. Local Playground

Command:

```powershell
npx -y memento-mori-jester@latest playground
```

Typical output:

```text
Memento Mori Jester playground

Open http://127.0.0.1:4818/
Config: built-in defaults
Press Ctrl+C to stop.
```

The browser playground includes sample buttons for:

- `Hard reset`
- `Overconfident plan`
- `Public token diff`
- `Untested final`

## 5. Preset Recommendation And Preview

Command:

```powershell
npx -y memento-mori-jester@latest config recommend
```

Typical output:

```text
Memento Mori Jester config recommendation

Recommended preset: web
Confidence: high
Detected stack: Vite + React + Component UI
Existing config: none
Note: no files were changed.

Why:
- Found Vite config
- Found React dependency

Candidates:
- web: 11 [Vite + React + Component UI] (Found Vite config; Found React dependency; Found component source files)
- node: 5 [Node.js] (Found package.json)

Next:
  jester start --preset web
  jester config init --preset web
  jester bootstrap --preset web
```

Command:

```powershell
npx -y memento-mori-jester@latest config presets
```

Output:

```text
default
node
python
web
api
infra
ai
security
```

Use `ai` for LLM apps and agent tooling, `api` for backend APIs, `web` for frontend/browser apps, `infra` for deployment or cloud infrastructure repos, and `security` for a stricter general policy.

## 6. Summarize Rule Hits

Command:

```powershell
npx -y memento-mori-jester@latest summary --kind command "git reset --hard"
```

Typical output:

```text
Memento Mori Jester summary

Verdict: BLOCK (100/100)
Kind: command
Issues: 1

Rules hit:
- destructive-git-history: 1 hit [S5] Destructive git history operation

Suggested next:
  jester tune destructive-git-history
  jester rule destructive-git-history
```

## 7. Tune A Noisy Rule

Command:

```powershell
npx -y memento-mori-jester@latest tune risky-domain
```

Typical output:

```text
Memento Mori Jester tuning advice

Rule: risky-domain [enabled]
Title: High-risk domain touched
Severity: S3
Source: built-in
Kinds: plan, command, diff, final
Project config: none loaded

Why it exists:
Auth, billing, production, migrations, and similar domains have outsized user or business impact.

When it may be noisy:
It can be noisy in docs, release notes, or rule text that merely mentions a sensitive word.

Safer move:
Add targeted tests, a manual verification note, or a rollback path for the sensitive area.

Recommendation:
If repeated hits are harmless for this repo, disable the rule and validate the config.

Before muting:
- Confirm the latest hit is harmless, documentation-only, example-only, or already covered by another guard.
- Prefer fixing the risky change or adding verification when the rule found real risk.
- Prefer muting only after repeated false positives in this repo.

Fixture tuning evidence:
Support: limited
Confidence: medium
Total fixtures checked: 222
Weighted fixtures checked: 421.8
Matching fixtures: 11
Weighted matches: 23
Expected-match weight: 18
Unexpected-match weight: 5
Edge-case matches: 0
Quiet-pass fixtures: 8
Quiet-pass weight: 5.55
By kind: command 0, plan 5, diff 5, final 1
Fixture coverage: 11/222 (5.5% weighted)
By verdict: pass 0, caution 3, block 8
Matched fixture samples:
  infra-public-ingress-block: Public ingress should block in low-risk-tolerance infra repos.
  node-plan-production-mode-block: Node production-mode planning should cover node-specific and sensitive-domain signals.
  plan-missing-verification-step: Implementation plan without verification steps should trigger the structural rule.
  sec-secret-material-openai: Hard-coded OpenAI-like token should map to the secret-material rule.
  universal-risky-domain-auth-caution-2: Auth callback changes should keep the broad risky-domain signal covered when verification is present.
Quiet-pass fixture samples:
  ai-docs-only-transcript-pass: Docs-only AI setup notes should stay quiet when they do not include concrete dangerous patterns.
  api-docs-only-auth-pass: Docs-only API setup notes should not warn just because they mention auth and production.
  infra-helm-values-docs-pass: Docs-only Helm values guidance should stay quiet around infra sensitive-domain warnings.
  infra-terraform-plan-docs-pass: Docs-only Terraform plan review guidance should not trip infra sensitive-domain warnings.
  sec-final-dependency-notes-pass: A verified dependency-note final answer should give the security preset a quiet final case.

Commands:
  jester rule risky-domain
  jester config disable-rule risky-domain
  jester config validate
  jester config enable-rule risky-domain
```

## 8. Bootstrap A Project

Command:

```powershell
mkdir jester-demo
cd jester-demo
npx -y memento-mori-jester@latest bootstrap --preset web
```

Typical output:

```text
Memento Mori Jester bootstrap

Files:
  wrote ...\jester.config.json
  wrote ...\memento-mori.mcp.json
  wrote ...\MEMENTO_MORI.md

Next:
  npx -y memento-mori-jester@latest doctor
  npx -y memento-mori-jester@latest config validate
  Add memento-mori.mcp.json to your MCP client, or copy the command and args from it.
```

## 9. MCP Setup Preview

Command:

```powershell
npx -y memento-mori-jester@latest mcp-config --mode npx
```

Output:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": [
        "-y",
        "memento-mori-jester@latest",
        "mcp-server"
      ]
    }
  }
}
```

## 10. Agent Setup Chooser

Command:

```powershell
npx -y memento-mori-jester@latest setup --agent codex
```

Typical output includes:

```text
Codex
Config target: Codex MCP config
Instruction target: AGENTS.md

MCP config:
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": ["-y", "memento-mori-jester@latest", "mcp-server"]
    }
  }
}
```

## 11. Guided First Run

Command:

```powershell
npx -y memento-mori-jester@latest start --preset web --agent codex --hook pre-commit
```

Typical output includes:

```text
Memento Mori Jester start

Mode: npx
Preset: web
Agent: codex
Hooks: pre-commit

Run these in order:

1. Check the package
   npx -y memento-mori-jester@latest doctor

4. Write starter files
   npx -y memento-mori-jester@latest bootstrap --preset web --hook pre-commit
```

## 12. Preset Example Packs

Command:

```powershell
npx -y memento-mori-jester@latest examples
```

Typical output includes:

```text
Preset packs:
  Next.js: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/nextjs
  Vite React: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/vite-react
  Express API: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/express-api
  FastAPI: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/fastapi
  Terraform Kubernetes: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/terraform-k8s
  AI MCP: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/ai-mcp
```

## 13. Review Fixtures

The fixture suite in `examples/fixtures/preset-review-cases.json` captures small real-usage examples with expected `pass`, `caution`, or `block` verdicts. It also includes matched-pass examples for low-severity rules, quiet-pass `absentRuleIds` examples that prove noisy rules stay silent for safe near-misses, stack-specific coverage for every built-in preset, quiet-pass boundaries across built-in, structural, custom, and preset/config-derived rules, second firing examples for preset blocked-command rules, second examples for AI/API, framework custom, built-in, and configured sensitive-domain rules, AI tool-dispatch examples with safe allowlist/schema boundaries, and real-world low-count preset examples across node, python, web, infra, AI, and security slices. Recent quiet-pass examples cover typechecks, prebuild scripts, mypy, dataclass parsing, CodeQL, Dependabot limits, form validation, accessibility copy, read-only Kubernetes inspection, Docker disk usage, Terraform linting, public-IP hardening changes, npm audit/outdated/ci, development-mode Node commands, package export maps, workspace test scripts, Bandit, pip-audit, coverage/pytest, Trivy filesystem scans, npm audit, TLS verification-enabled diffs, safe text rendering, allowlisted target paths, public analytics IDs, model-check commands, tool allowlist checks, public model-name config, API schema parsing, query-builder filters, enabled rate limiting, read-only Prisma migration diffs, signed-webhook docs, OpenAPI schema docs, Pydantic parsing, Pyright checks, SBOM generation, vulnerability-report docs, escaped React rendering, session-cookie docs, model regression checks, static action allowlists, FastAPI dependency injection, frozen `uv` syncs, docs-only Terraform and Helm guidance, redacted Gitleaks scans, and Next.js workspace linting. These examples are run by `npm test`, so preset tuning changes stay visible.

Maintainers can run `npm run fixtures:report` to see coverage by verdict, kind, preset, rule family, and preset slice. The report also includes a `Curation next` section that points at the next useful fixture batch, such as thin rules, feasible pass-case evidence, rule-family gaps, or lower-count presets. Use `npm run fixtures:report -- --markdown` for a paste-ready version of the same snapshot.

Maintainers can use `docs/MAINTAINER_TRIAGE.md` to turn useful false-positive reports into redacted fixture cases.

## 14. Framework Tuning Cookbook

For real repos with stack-shaped noisy rules, use [docs/FRAMEWORK_TUNING.md](FRAMEWORK_TUNING.md) and the checked cookbook in [examples/tuning](../examples/tuning).

The cookbook maps recipe IDs such as `next-vite-public-config`, `terraform-kubernetes-docs-only`, and `ai-mcp-tooling` to the exact `jester tune <rule-id> --json` commands and fixture IDs worth comparing first.

Maintainers can run:

```powershell
npm.cmd run framework:tuning:check
```

That validates [framework-tuning-cookbook.json](../examples/tuning/framework-tuning-cookbook.json) against this guide, the cookbook README, and `examples/fixtures/preset-review-cases.json`.

## 15. Framework CI Examples

The workflow examples in `examples/ci` show copy-paste GitHub Actions setups for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos. Each workflow uploads SARIF and writes the readable Jester job summary.
