# Changelog

All notable changes to Memento Mori Jester are tracked here.

## Unreleased

## 0.1.81

- Added a lightweight repo-local landing page under `site/index.html` that reuses the social card, demo video, start command, and public project links.
- Added `npm run site:check` and wired it into `npm test` and production-readiness checks.
- Updated README, promo docs, release docs, roadmap, and release notes for the new share page.

## 0.1.80

- Added a deterministic `promo/share-kit/social-card.svg` for GitHub, X, and project-update link previews.
- Added `npm run promo:card` and `npm run promo:card:check` to regenerate or verify the social card.
- Extended promo freshness checks and docs so the social card stays part of the maintainer release flow.

## 0.1.79

- Added `npm run promo:check` to verify the current repo-local promo video, stills, docs, and fixture evidence numbers stay aligned.
- Wired promo freshness validation into `npm test` and the production-readiness guard.
- Updated release, readiness, roadmap, and promo docs with the new maintainer check.

## 0.1.78

- Added a refreshed HyperFrames X demo render under `promo/x-demo-v0.1.78` with current version and fixture-evidence numbers.
- Updated the promo share-kit stills from the fresh render so public images show `v0.1.78`, 216 fixtures, and 6 quiet-pass examples.
- Updated promo docs, demo transcript, roadmap, and release notes while keeping `promo/` outside the npm package.

## 0.1.77

- Added a repo-local promo/share kit with X post copy, a 30-second demo script, posting checklist, and asset guidance.
- Added four vertical still images extracted from the existing X demo video for single-post and thread use.
- Linked the promo kit from the README while keeping `promo/` outside the npm package.

## 0.1.76

- Added eight real-world quiet-pass fixtures across python, security, web, and AI preset slices, growing the corpus to 216 fixtures.
- Strengthened safe near-miss evidence for Pydantic parsing, Pyright checks, SBOM generation, vulnerability-report docs, escaped React rendering, session-cookie docs, model regression checks, and static action allowlists.
- Refreshed demo, roadmap, fixture docs, and release notes for the expanded preset curation batch.

## 0.1.75

- Added `npm run fixtures:report -- --markdown` for paste-ready fixture coverage snapshots.
- Added Markdown tables for totals, counts, rule-family slices, preset slices, gaps, quiet-pass coverage, curation-next guidance, and next commands.
- Updated maintainer docs, release docs, and production-readiness checks for the Markdown fixture report export.

## 0.1.74

- Added six API quiet-pass fixtures, growing the corpus to 208 fixtures.
- Strengthened safe near-miss evidence for schema parsing, query-builder filters, enabled rate limiting, read-only Prisma migration diffs, signed-webhook docs, and OpenAPI schema docs.
- Refreshed demo, roadmap, fixture docs, and release notes for the API curation batch.

## 0.1.73

- Added six web and AI quiet-pass fixtures, growing the corpus to 202 fixtures.
- Strengthened safe near-miss evidence for safe text rendering, allowlisted target paths, public analytics IDs, model-check commands, tool allowlist checks, and public model-name config.
- Refreshed demo, roadmap, fixture docs, and release notes for the web/AI curation batch.

## 0.1.72

- Added six Python and security quiet-pass fixtures, growing the corpus to 196 fixtures.
- Strengthened safe near-miss evidence for Python security scans, dependency audits, coverage runs, Trivy scans, npm audit checks, and explicitly enabled TLS verification.
- Refreshed demo, roadmap, fixture docs, and release notes for the Python/security curation batch.

## 0.1.71

- Added six Node quiet-pass fixtures, growing the corpus to 190 fixtures.
- Strengthened safe near-miss evidence for npm audit/outdated/ci, development-mode Node commands, package export maps, and workspace test scripts.
- Added a repo-local X demo video asset under `promo/x-demo-v0.1.70` while keeping it outside the npm package.
- Refreshed demo, roadmap, fixture docs, and release notes for the Node-focused curation batch.

## 0.1.70

- Added six infra quiet-pass fixtures, growing the corpus to 184 fixtures.
- Strengthened safe near-miss evidence for read-only Kubernetes inspection, Docker disk usage, Terraform linting, and disabling public IP assignment.
- Refreshed demo, roadmap, fixture docs, and release notes for the infra-focused curation batch.

## 0.1.69

- Added eight real-world quiet-pass fixtures across node, python, security, and web preset slices, growing the corpus to 178 fixtures.
- Strengthened safe near-miss evidence for typecheck/prebuild scripts, mypy/dataclass parsing, CodeQL/Dependabot checks, form validation, and image alt text.
- Refreshed demo, roadmap, fixture docs, and release notes for the expanded preset curation batch.

## 0.1.68

- Added AI preset fixtures for user-controlled tool dispatch from request body and URL search parameter inputs.
- Added quiet-pass AI near-misses for explicit tool allowlists and schema-validated model data, growing the corpus to 170 fixtures.
- Refreshed demo, roadmap, fixture docs, and release notes for the AI tool-dispatch coverage pass.

## 0.1.67

- Added six real-world quiet-pass fixtures for security, web, node, and python preset slices, growing the corpus to 166 fixtures.
- Strengthened safe near-miss evidence for static analysis commands, checksum commands, accessible frontend markup, static internal links, Node linting, and Python linting.
- Refreshed demo, roadmap, fixture docs, and release notes for the expanded preset curation batch.

## 0.1.66

- Added real-world preset fixtures for node, python, infra, and AI slices, growing the corpus to 160 fixtures.
- Added Kubernetes delete coverage for the infra preset, including a second firing and a read-only near-miss so thin and quiet-pass coverage stay clean.
- Refreshed demo, roadmap, fixture docs, and release notes for the expanded low-count preset coverage.

## 0.1.65

- Added matched-pass fixtures for low-severity `vibes-based-plan` and `handwave-final` rule boundaries.
- Added `passEligibleRulesWithoutPassCases` to `npm run fixtures:report -- --json` so curation only asks for pass-case coverage where a matched rule can genuinely remain a pass.
- Updated fixture report curation to move on from impossible hard-rule pass cases to real-world preset collection, with docs refreshed for the 154-fixture corpus.

## 0.1.64

- Added second firing fixtures for the remaining built-in destructive-command, final-answer, and configured billing-domain thin examples.
- Cleared all remaining thin rule coverage in `npm run fixtures:report` across built-in, structural, custom, configured sensitive-domain, and blocked-command rule families.
- Refreshed demo, roadmap, fixture docs, and release notes for the 152-fixture corpus.

## 0.1.63

- Added second firing fixtures for the remaining framework custom-rule thin examples across security, infra, node, python, and web presets.
- Cleared custom-rule thin coverage in `npm run fixtures:report`, reducing total thin fixture coverage from 16 rules to 7.
- Refreshed demo, roadmap, fixture docs, and release notes for the 145-fixture corpus.

## 0.1.62

- Added second firing fixtures for the remaining AI/API custom-rule thin examples: model-output execution, public AI provider keys, raw SQL from request input, and disabled webhook signature checks.
- Reduced total thin fixture coverage from 21 rules to 16 while keeping review behavior unchanged.
- Refreshed demo, roadmap, fixture docs, and release notes for the 138-fixture corpus.

## 0.1.61

- Added a focused fixture curation batch based on `fixtures:report` curation-next guidance.
- Added second firing examples for preset blocked-command rules covering npm publish, pip break-system installs, Prisma resets, Terraform destroy, and recursive chmod.
- Added second examples for stack-specific CORS, unsafe HTML, IAM, npm publish, and postinstall sensitive-domain coverage, reducing thin fixture coverage from 37 rules to 21.

## 0.1.60

- Added rule-family slices to `npm run fixtures:report` so maintainers can compare built-in, structural, custom, configured sensitive-domain, and blocked-command coverage.
- Added preset slices and curation-next guidance to fixture report text and `--json` output.
- Updated fixture-report tests and docs so the coverage dashboard stays useful as the fixture suite grows.

## 0.1.59

- Added quiet-pass fixtures for remaining sparse built-in and structural rules including missing verification, confidence theater, TypeScript suppressions, large removals, wildcard file operations, destructive commands, and untested finals.
- Updated fixture-report regression coverage so every rule family now has quiet-pass coverage.
- Refreshed demo and fixture docs with the expanded 125-fixture corpus.

## 0.1.58

- Added quiet-pass fixtures for thin custom, configured sensitive-domain, and preset blocked-command rules.
- Updated fixture-report regression coverage so thin preset/config-derived rules cannot silently lose quiet-pass coverage.
- Refreshed demo and fixture docs with the expanded 112-fixture corpus.

## 0.1.57

- Added web, API, infra, and AI preset fixture coverage across the remaining plan, command, and final review-kind gaps.
- Updated fixture-report regression coverage so every preset now has plan, command, diff, and final examples.
- Refreshed fixture and demo docs with the expanded 90-fixture corpus.

## 0.1.56

- Added node, python, and security preset fixture coverage across plan, command, diff, and final review kinds.
- Updated fixture-report regression coverage so those three presets cannot silently fall back to empty preset/kind coverage.
- Refreshed demo and fixture docs with the expanded 80-fixture corpus.

## 0.1.55

- Added the first targeted quiet-pass fixture batch for noisy high-signal rules including `risky-domain`, `done-without-evidence`, `package-install-script`, `secret-material`, `sensitive-env-change`, `test-removal`, `skip-tests`, `vibes-based-plan`, `chmod-777`, and `privileged-command`.
- Extended `jester tune` fixture evidence with quiet-pass counts, weights, fixtures, and samples so maintainers can see safe near-misses alongside matched rule hits.
- Expanded `npm run fixtures:report` with quiet-pass rule coverage and rules-without-quiet-pass gaps.

## 0.1.54

- Added `npm run fixtures:report`, a local fixture coverage report for rule, preset, review-kind, and verdict coverage.
- The report highlights rules without pass-case coverage, thin rule coverage, preset/kind gaps, and quiet pass fixtures, with text and `--json` output.
- Wired fixture coverage reporting into `npm test` and production-readiness checks so coverage gaps stay visible during maintenance.

## 0.1.53

- Made `npm run fixtures:check` self-contained so it works from the published npm package, where `src/` files are intentionally not shipped.
- Added a production-readiness guard to prevent the fixture validator from depending on source-only files.

## 0.1.52

- Added `npm run fixtures:check`, a local fixture authoring validator for duplicate IDs, weak metadata, unsafe-looking content, duplicate content, and explicit expected/absent rule intent.
- Wired fixture authoring validation into `npm test` so fixture quality is checked alongside the review-engine expectations.
- Updated maintainer, fixture, release, and production-readiness docs to make fixture validation part of the support-to-coverage workflow.

## 0.1.51

- Added `docs/MAINTAINER_TRIAGE.md` with a repeatable flow for triaging bugs, false positives, security-sensitive reports, and fixture candidates.
- Updated fixture docs so useful noisy-rule reports can become small redacted fixture cases instead of one-off anecdotes.
- Expanded the production readiness guard so maintainer triage and fixture-conversion guidance stay present in future releases.

## 0.1.50

- Added `SECURITY.md` with vulnerability reporting guidance, supported-version expectations, scope, and redacted diagnostic guidance.
- Added GitHub issue templates for bug reports, false-positive/noisy-rule reports, and feature requests.
- Expanded the production readiness guard so `SECURITY.md`, issue templates, and support-intake docs stay present in future releases.

## 0.1.49

- Expanded `jester doctor` into a support-focused diagnostic report covering package version, Node, MCP server file, review engine, config loading, git hook status, and generated GitHub Action status.
- Added `jester doctor --json` with stable structured diagnostics for automation and bug reports.
- Added regression tests for doctor text output, JSON output, config discovery, hook status, and generated GitHub Action checks.

## 0.1.48

- Added `docs/PRODUCTION_READINESS.md` to define the current production-grade bar across npm packaging, GitHub Action usage, MCP setup, git hooks, docs, release automation, and support.
- Added `npm run production:check`, a static readiness guard for version/release-note coverage, package metadata, public package files, workflow runtime expectations, and onboarding docs.
- Wired the production readiness check into `npm test` so CI catches readiness drift alongside the existing build, unit tests, and package dry run.

## 0.1.47

- Reworked the README Start Here section into a clearer four-step path: try without writing files, add a recommended preset, connect an agent, then add hooks or CI.
- Updated Getting Started to mirror the same onboarding order and mention playground sample buttons.
- Kept this as a docs-only onboarding release; no CLI, MCP, config, review, playground runtime, or release workflow behavior changed.

## 0.1.46

- Added one-click sample buttons to the local playground for command, plan, diff, and final-answer reviews.
- The sample buttons populate both subject and content, switch the active review kind, and preserve the existing local-only review API.
- Added playground tests for deterministic sample rendering and review-kind coverage.

## 0.1.45

- Added eight focused preset review fixtures for `risky-domain`, `missing-verification-step`, `confidence-theater`, and `done-without-evidence`.
- Curated intentional overlap expectations for existing fixtures so `jester tune coverage` no longer treats auth, security-group, eval, skip-tests, and migration intersections as surprise matches.
- Improved the fixture coverage baseline from low/thin families to medium-or-better support across the built-in and structural rule set.

## 0.1.44

- Added `jester tune coverage` and `jester tune coverage --json` as read-only maintenance reports for fixture support across every rule.
- The coverage report includes support, confidence, expected/unexpected fixture weight, sample counts, suggested actions, and next `jester tune <rule>` commands.
- Project-config rules are included when config is loaded, while still reporting no generic fixture coverage by design.

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
