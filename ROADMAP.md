# Roadmap

Memento Mori Jester is usable today as a CLI, MCP server, GitHub Action, and git-hook helper. The next work is about making it easier to adopt and harder to misuse.

## Near Term

## Recently Shipped

- Checked maintainer response snippets in v0.1.91, adding public-safe reply templates for docs examples, fixture backlog items, and rule-review candidates.
- Checked maintainer triage playbook in v0.1.90, showing how sanitized reports become docs examples, fixture backlog items, or rule-review candidates.
- Checked adopter feedback path in v0.1.89, adding a report-gallery issue template, package-shipped feedback template, and support triage guard.
- Checked report gallery in v0.1.88, proving fresh `doctor`, destructive-command `summary`, and blocked-command reports from an installed consumer project.
- Consumer quickstart registry-mode fix in v0.1.87, proving the same smoke against `memento-mori-jester@latest` after publish.
- Consumer quickstart smoke in v0.1.86, proving the first installed-project commands from a minimal repo before release.
- Adoption smoke CI example in v0.1.85, giving real repos a read-only workflow for `doctor`, `summary`, and packaged framework tuning checks.
- Framework tuning doctor in v0.1.84, proving cookbook recipes execute through the built CLI with generated preset configs before release.
- Framework tuning cookbook in v0.1.83, adding checked copy-paste recipes and a machine-readable JSON map for stack-shaped noisy-rule reports.
- Framework tuning examples and quiet-pass fixture curation in v0.1.82, adding six safe real-world examples plus a guide for framework-shaped noisy-rule reports.
- Repo-local landing page in v0.1.81, adding a static one-page share surface plus deterministic link checks.
- Social preview card in v0.1.80, adding a deterministic 1200x630 promo card plus generation and freshness checks.
- Promo freshness check in v0.1.79, verifying the current demo video, share-kit stills, docs, and fixture evidence numbers before public posting.
- Fresh demo render in v0.1.78, updating the repo-local X video and share-kit stills to current version and fixture totals.
- Promo/share kit in v0.1.77, adding X post copy, a short demo script, a posting checklist, and still images from the existing demo video.
- Real-world preset quiet-pass curation in v0.1.76, adding eight safe examples across python, security, web, and AI workflows while keeping fixture coverage gaps clean.
- Markdown fixture report export in v0.1.75 for paste-ready coverage snapshots in release notes, GitHub issues, and maintainer updates.
- API fixture curation in v0.1.74, adding six quiet-pass examples for schema parsing, query-builder filters, enabled rate limiting, read-only Prisma migration diffs, signed-webhook docs, and OpenAPI schema docs.
- Web/AI fixture curation in v0.1.73, adding six quiet-pass examples for safe text rendering, allowlisted target paths, public analytics IDs, model-check commands, tool allowlist checks, and public model-name config.
- Python/security fixture curation in v0.1.72, adding six quiet-pass examples for Bandit, pip-audit, coverage/pytest, Trivy, npm audit, and TLS verification-enabled diffs.
- Node preset fixture curation in v0.1.71, adding six quiet-pass examples for npm audit/outdated/ci, development-mode Node commands, package export maps, and workspace test scripts, plus a repo-local X demo video asset.
- Infra preset fixture curation in v0.1.70, adding six quiet-pass operational examples for read-only Kubernetes, Docker, Terraform linting, and public-IP hardening changes.
- Node/python/security/web preset fixture curation in v0.1.69, adding eight quiet-pass real-world examples while keeping all fixture coverage gates clean.
- AI tool-dispatch fixture curation in v0.1.68, adding request-body and URL-parameter caution examples plus allowlist/schema quiet-pass boundaries.
- Security/web/node/python preset fixture curation in v0.1.67, adding real-world quiet-pass examples while keeping thin, quiet-pass, feasible pass-case, and preset-kind gaps at zero.
- Real-world low-count preset fixture batch in v0.1.66, adding node, python, infra, and AI examples while keeping thin, quiet-pass, and feasible pass-case gaps at zero.
- Feasible pass-case fixture curation in v0.1.65, adding matched-pass examples for low-severity tone/planning rules and stopping curation from asking for impossible pass cases on hard rules.
- Final thin-rule fixture precision pass in v0.1.64, clearing all remaining thin coverage gaps across built-in, structural, custom, configured sensitive-domain, and blocked-command rule families.
- Framework custom-rule fixture precision pass in v0.1.63, clearing custom-rule thin coverage and reducing total thin fixture coverage from 16 rules to 7.
- AI/API custom-rule fixture precision pass in v0.1.62, reducing total thin fixture coverage from 21 rules to 16 while keeping review behavior unchanged.
- Curation-next fixture batch in v0.1.61 that removed blocked-command thin coverage, strengthened stack-specific sensitive-domain examples, and reduced total thin fixture coverage from 37 rules to 21.
- Fixture report rule-family slices, preset slices, and curation-next guidance in v0.1.60 so maintainers can see which fixture areas need real-world examples next.
- Quiet-pass boundaries for remaining sparse built-in and structural rules in v0.1.59 so the fixture report now has no rules without quiet-pass coverage.
- Quiet-pass boundaries for thin custom/preset rules in v0.1.58 so preset blocked commands, sensitive-domain checks, and custom stack rules now have safe near-miss examples.
- Completed preset-kind fixture coverage in v0.1.57 so `default`, `node`, `python`, `web`, `api`, `infra`, `ai`, and `security` now all have plan, command, diff, and final examples.
- Node, python, and security preset-kind fixture coverage in v0.1.56 so those preset slices now have plan, command, diff, and final examples.
- Targeted quiet-pass fixture batch in v0.1.55 for noisy high-signal rules, plus quiet-pass evidence in `jester tune` and `npm run fixtures:report`.
- Fixture coverage report generator in v0.1.54 for rule, preset, review-kind, verdict, and pass-case gaps.
- Published-package fixture validator fix in v0.1.53 so `npm run fixtures:check` works outside a source checkout.
- Fixture authoring validator in v0.1.52 for duplicate IDs, missing expected/absent rule intent, weak metadata, unsafe-looking content, and duplicate content.
- Maintainer triage guide in v0.1.51 for turning useful false-positive reports into redacted fixture coverage.
- Security policy and GitHub issue templates in v0.1.50 for bug reports, false positives, feature requests, and vulnerability intake.
- Support-focused `doctor --json` diagnostics in v0.1.49 for package, config, hook, MCP, and GitHub Action state.
- Production readiness checklist and static guard in v0.1.48 for package, workflow, docs, release, and support drift.
- README onboarding polish in v0.1.47 around the shortest path from `npx` to playground, agent setup, hooks, and CI.
- Playground sample buttons in v0.1.46 for trying command, plan, diff, and final-answer reviews from the first screen.
- Fixture curation pass in v0.1.45 that moved all built-in and structural rule evidence to medium-or-better confidence.
- Additional precision pass for fixture-driven tuning signals (scoped to high-signal rule families first).
- Fixture-informed `jester tune` evidence from preset review cases, including matched fixture IDs and verdict buckets.
- Framework-specific GitHub Actions examples for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos.
- Real-usage review fixture suite for preset pass, caution, and block expectations.
- Framework-specific preset example packs for Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP repos.
- Node 24 GitHub Actions cleanup for CI, generated workflows, and the composite action.
- GitHub Action job summaries for readable PR/code-scanning run output.
- Rule-hit summaries for seeing which checks fired before tuning a noisy rule.
- False-positive tuning helper for deciding when and how to mute noisy rules.
- Framework-specific recommendation details for stacks such as Next.js, Vite, Express, Prisma, FastAPI, Terraform, Kubernetes, MCP, OpenAI, and Anthropic.
- Preset recommendation for choosing a starter profile from local repo files.
- Backend API preset for auth bypasses, CORS, rate limits, unsigned webhooks, raw SQL, and destructive migrations.
- AI app preset for LLM apps, MCP servers, agent tools, prompt-injection checks, eval coverage, and model-output execution risks.
- Docs-only diff noise tuning for harmless auth, security, and production wording in documentation changes.
- Guided first-run flow combining preset selection, agent setup, playground smoke checks, and optional git hooks.
- Agent setup chooser for Codex, Claude Code, and generic MCP clients.
- Local paste-in playground for commands, plans, diffs, and final answers.
- README demo snapshot generated as a small deterministic SVG.
- Kind-aware fixture coverage and confidence-triage surface for `jester tune` outputs.
- Deterministic tune fixture support signal (`none` / `thin` / `limited` / `strong`) for sparse/noisy families.
- Precision-pass fixture expansion in v0.1.41 to strengthen repeat signal coverage for plan/command/diff families.
- Tune fixture evidence determinism in v0.1.42 so project-config rules no longer borrow generic preset fixture coverage.
- Rule-specific tune support/confidence scoring in v0.1.43 so sparse clean evidence is no longer punished by total fixture corpus growth.
- Tune coverage report in v0.1.44 for seeing every rule's fixture support, confidence, surprise weight, and next maintenance action.

## Product Ideas

- Collect real-world reports and fold the strongest redacted cases into more framework tuning cookbook recipes.
- Use repeated playbook outcomes and response snippets to prioritize the next redacted fixture or report-gallery update.
- Add a hosted-page option or GitHub Pages instructions once the static page has settled.

## Quality And Safety

- Keep all checks local and deterministic unless the user explicitly asks for hosted services.
- Keep destructive commands blocked by default.
- Keep project-specific config transparent in `jester.config.json`.
- Avoid long-lived npm tokens by using trusted publishing.

## Not Planned Right Now

- Sending project code to a hosted API.
- Replacing human review.
- Auto-running commands that were only meant to be reviewed.
