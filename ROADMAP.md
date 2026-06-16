# Roadmap

Memento Mori Jester is usable today as a CLI, MCP server, GitHub Action, and git-hook helper. The next work is about making it easier to adopt and harder to misuse.

## Near Term

## Recently Shipped

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

- Collect real-world reports for the next lowest-count preset slices: security, node, python, and web.
- Add more framework-specific false-positive examples from real reports so tuning guidance keeps getting sharper.
- Add a Markdown export for fixture reports so maintainers can paste coverage snapshots into issues or release notes.

## Quality And Safety

- Keep all checks local and deterministic unless the user explicitly asks for hosted services.
- Keep destructive commands blocked by default.
- Keep project-specific config transparent in `jester.config.json`.
- Avoid long-lived npm tokens by using trusted publishing.

## Not Planned Right Now

- Sending project code to a hosted API.
- Replacing human review.
- Auto-running commands that were only meant to be reviewed.
