# Changelog

All notable changes to Memento Mori Jester are tracked here.

## Unreleased

## 0.1.43

- Improved `jester tune` fixture support/confidence scoring so it rewards rule-specific expected fixture coverage instead of penalizing every rule against the full fixture corpus size.
- Clean sparse rule families can now surface as `limited` / `medium`, while well-covered low-surprise families can surface as `strong` / `high`.
- Added regression coverage for the updated scoring on `console-log`, `risky-domain`, and `package-install-script`.

## 0.1.42

- Tightened `jester tune` fixture evidence so built-in and structural rules always evaluate the fixture suite with each fixture's intended preset config.
- Project-config rules now deliberately report no generic fixture coverage instead of accidentally matching preset fixtures through local `blockedCommands`, `sensitiveDomains`, or custom rules.
- Added regression coverage for project-config tuning evidence when a local blocked command overlaps existing fixtures.

## 0.1.41

- Added a focused precision-fixture pass for `jester tune` evidence so more sparse rule families now have at least two matching examples.
- Added new `preset-review-cases.json` fixtures for:
  - `universal-privileged-command-plan`
  - `plan-skip-tests-2`
  - `plan-vibes-based-plan-2`
  - `diff-test-removal-caution-2`
  - `diff-ts-ignore-pass-3`
  - `diff-temporary-marker-pass-3`
  - `diff-console-debug-pass`
  - `diff-package-install-script-pass-3`
  - `command-chmod-777-pass`
  - `diff-large-removal-pass-2`
- Updated demo fixture counters in `docs/DEMO.md` to the expanded corpus.

## 0.1.40

- Added more deterministic fixture examples for `jester tune` so sparse signals get stronger, more stable evidence:
  - additional `ts-ignore` case
  - additional `temporary-marker` case
  - additional `package-install-script` case
  - additional `wildcard-file-operation` case
- Updated demo fixture statistics in `docs/DEMO.md` to reflect the current fixture corpus.

## 0.1.39

- Added deterministic fixture support guidance to `jester tune` so each rule now gets a `support` signal:
  - `none` when no fixture references exist
  - `thin` for sparse/mixed fixture matches
  - `limited` for moderate, aligned evidence
  - `strong` for strong fixture support
- `ruleFixtureEvidence` now optionally evaluates fixtures with project config (including project-config/custom rules) while still evaluating disabled rules with their rule shape intact, then surfaces support as a stable read-only field.
- `jester tune` now prints `Support:` in the fixture section and includes it in `--json` output, while leaving existing key names and behavior stable.

## 0.1.38

- `jester tune` now reports fixture evidence by review kind (command/plan/diff/final) so users can quickly see how broad the fixture signal is.
- Added deterministic kind-bucket diagnostics to fixture evidence output (text + JSON), while preserving existing tune keys and command behavior.
- Updated precision-pass docs to reflect kind-sliced fixture tuning evidence and the current roadmap status.

## 0.1.37

- Release maintenance patch for post-release stabilization.
- Updated fixture review expectations to match current rule behavior and deterministic tuning evidence semantics.
- Hardened `tune` fixture output tests to avoid brittle exact-text assumptions while keeping tune command behavior unchanged.

## 0.1.36

- Added fixture evidence weighting and edge-case signals so `jester tune` can rank fixture support by stability (1–3 weights plus edge-case penalties).
- Extended `ruleFixtureEvidence` to include weighted coverage totals, weighted match counts, expected-match / unexpected-match weights, edge-case match counts, and deterministic sample ordering.
- Expanded `jester tune` text output and JSON `fixtureEvidence` with weighted diagnostics and coverage details while keeping existing keys and command behavior stable.
- Added more precision fixture cases for secrets and sensitive env changes and documented the fixture-driven tuning improvements in CLI and demo docs.
- Updated `ROADMAP.md` with the next precision-pass idea and added release notes for `v0.1.36`.

## 0.1.35

- Extended fixture-backed `jester tune` evidence with a precision confidence signal (`none`, `low`, `medium`, `high`) and explicit fixture match expectation metadata.
- Preserved stable tune output while including `expectedMatch`/`unexpectedMatch` fields for matched fixtures in text and JSON guidance.
- Updated demo and CLI docs to reflect the new precision-tuning signal.

## 0.1.34

- Added fixture-backed evidence to `jester tune` output, including total fixture coverage, verdict breakdown, and deterministic fixture samples.
- Preserved CLI output and JSON shapes while adding `fixtureEvidence` for tune guidance.
- Documented fixture-aware tuning in CLI and demo docs.

## 0.1.33

- Added framework-specific GitHub Actions examples for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos.
- Updated `jester examples` and docs to link the new CI examples.

## 0.1.32

- Added a real-usage review fixture suite with preset-specific pass, caution, and block examples.
- Added tests that run the fixtures through the actual review engine to keep preset tuning expectations stable.

## 0.1.31

- Added framework-specific preset example packs for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos.
- Updated `jester examples` and docs to point users at stack-focused example configs.

## 0.1.30

- Updated GitHub workflows, generated workflow examples, and the composite action to Node 24-era Actions versions.
- Removed Node 20 GitHub Actions deprecation warnings without changing CLI, review, SARIF, or summary behavior.

## 0.1.29

- Added GitHub Action job summaries with verdict, issue counts, rule hits, highest-severity issue, and next tuning commands.
- Added a `summary` composite action input while preserving SARIF output and existing `fail-on` behavior.

## 0.1.28

- Added `jester summary` for grouped rule-hit summaries across reviewed plans, commands, diffs, and final answers.
- Added summary JSON output and next-step tuning commands for the noisiest rule hit.

## 0.1.27

- Added `jester tune <rule-id>` for read-only false-positive and safe-muting advice.
- Added JSON output for tuning advice and documented the new rule tuning flow.

## 0.1.26

- Added framework and stack detection details to `jester config recommend` text and JSON output.
- Improved preset scoring evidence for Next.js, Vite, React, FastAPI, Express, Prisma, Terraform, Kubernetes, MCP, OpenAI, Anthropic, and related tooling.

## 0.1.25

- Added `jester config recommend` for local, read-only preset recommendations with text and JSON output.
- Documented the advisory recommendation flow in README, getting-started, CLI, demo, and release guidance.

## 0.1.24

- Added the `api` config preset for backend auth, CORS, rate limiting, webhooks, raw SQL, and destructive migration risks.
- Documented `api` anywhere preset choices are listed.

## 0.1.23

- Added the `ai` config preset for LLM apps, MCP servers, agent tools, prompt injection, evals, and model-output execution risks.
- Documented `ai` anywhere preset choices are listed.

## 0.1.22

- Suppressed broad `risky-domain` and project sensitive-domain noise for docs-only diffs.
- Kept concrete risky patterns active in docs, including secrets, blocked commands, install scripts, and custom rules.

## 0.1.21

- Added `jester start`, a read-only first-run checklist for health checks, playground, agent setup, bootstrap, config validation, and sample review.
- Added JSON output for guided onboarding steps.

## 0.1.20

- Added `jester setup`, an agent setup chooser for Codex, Claude Code, and generic MCP clients.
- Added setup JSON output, smoke-check commands, and docs pointers for each supported agent.

## 0.1.19

- Added `jester playground`, a local-only browser playground for command, plan, diff, and final-answer reviews.
- Added playground API coverage and documentation for the local paste-in workflow.

## 0.1.18

- Added a generated README terminal demo snapshot and regeneration/check scripts.
- Refreshed the demo transcript around current presets and MCP setup.

## 0.1.17

- Added `web` and `infra` config presets for frontend/browser and deployment/infrastructure repos.
- Documented the new presets in CLI, agent, getting-started, and README guidance.

## 0.1.16

- Automated trusted npm publishing on `v*` tag pushes while keeping manual workflow dispatch as a fallback.
- Updated release documentation now that trusted publishing is proven.

## 0.1.15

- Added practical rule guidance to `jester rule <id>` and `jester rules --json`.

## 0.1.14

- Added `jester config disable-rule <id>` and `jester config enable-rule <id>` for rule tuning without manual JSON edits.

## 0.1.13

- Added `disabledRules` config support for disabling noisy checks by rule id.

## 0.1.12

- Added `jester rules` and `jester rule <id>` for inspecting active built-in, structural, and project-config checks.
- Added the generated SARIF workflow to this repo for dogfooding.

## 0.1.11

- Added `jester github-action` for generating a ready-to-copy SARIF code-scanning workflow.

## 0.1.10

- Added SARIF output for CLI reviews and GitHub Action runs.

## 0.1.9

- Added `jester policy init` for stricter team and strict project policies.

## 0.1.8

- Added `jester explain` for short teaching notes based on review verdicts.
- Added agent-specific `mcp-config --agent claude` output for Claude Code config shape.

## 0.1.7

- Added `jester examples` for copy-paste onboarding commands and example links.
- Polished the README homepage around the shortest npm path.
- Added MCP tool input/output reference docs.
- Added a fuller demo transcript.

## 0.1.6

- Added copy-paste examples for Codex, Claude Code, generic MCP clients, and git-hook-only use.
- Added default checks for final answers that admit tests were not run.
- Added default diff checks for npm install lifecycle scripts.
- Added default diff checks for sensitive environment/config changes.

## 0.1.5

- Added GitHub Release automation for `v*` tags.
- Added npm trusted-publishing workflow and setup guide.
- Added roadmap and release notes.

## 0.1.4

- Cleaned docs now that the npm package is live.
- Added getting started, CLI, Codex, Claude Code, and demo docs.

## 0.1.3

- Added `jester bootstrap`.
- Added starter file generation for project config, MCP JSON, and agent instructions.
- Added optional hook install during bootstrap.

## 0.1.2

- Added `jester config validate`.
- Added JSON config validation output.

## 0.1.1

- Prepared the package metadata for npm publishing.

## 0.1.0

- Added CLI, MCP server, config presets, hooks, and GitHub Action support.
