# Production Readiness

This checklist defines what "production grade" means for Memento Mori Jester right now. It is intentionally practical: the project is a local CLI, MCP server, GitHub Action, and hook helper, so production readiness means users can install it, understand it, wire it in, recover from failures, and verify releases without guesswork.

## Current Bar

- The npm package installs with `npx -y memento-mori-jester@latest` and exposes the CLI plus MCP server binaries.
- The default path is local and deterministic: reviews run on user-provided text, diffs, commands, plans, and final answers without sending project code to a hosted API.
- GitHub Releases and npm publishing are automated from annotated `v*` tags through GitHub Actions trusted publishing.
- CI runs tests and a package dry run on every push to `main` and pull request.
- The local playground, GitHub Action, MCP setup snippets, preset examples, fixtures, and release notes ship in the npm package.
- Package dry runs include a support examples manifest smoke so the installed-package support note, release support provenance gate, post-release evidence ledger, index, quickstart, lifecycle map, blank worksheet, and filled synthetic example keep shipping from the tarball.
- Repo-local promo assets stay outside the npm package, but `npm run promo:check` keeps the current demo video, stills, social card, docs, and fixture evidence numbers aligned.
- The repo-local landing page stays outside the npm package, but `npm run site:check` keeps its start command and public links aligned.

## npm Package

- `package.json` includes repository, homepage, bugs, binaries, exports, public package files, and public publish access.
- `package-lock.json` version matches `package.json`.
- `npm run pack:dry` confirms the package includes `dist`, `docs`, `examples`, `scripts`, `README.md`, `CHANGELOG.md`, `ROADMAP.md`, `LICENSE`, `COMMERCIAL-LICENSE.md`, and `NOTICE.md`, then runs `npm run pack:contents:check`.
- `npm run pack:contents:check` verifies the dry-run package includes the installed-package support note, release support provenance gate, post-release evidence ledger, support examples index, quickstart, lifecycle map, blank worksheet, and filled synthetic example, and excludes repo-local promo, site, private, cache, GitHub workflow, and credential-shaped files.
- `npm run audit:high` fails CI and publish attempts when npm reports high or critical dependency advisories.
- `SECURITY.md` ships with the package so vulnerability reporting guidance is visible from the repository and npm tarball.
- `prepublishOnly` runs the high-severity audit, tests, and a package dry run for local publish attempts.

## GitHub Action

- `action.yml` builds with Node 24 through `actions/setup-node@v6`.
- Action inputs cover `fail-on`, `subject`, `config`, `no-config`, `format`, `output-file`, and `summary`.
- SARIF output and GitHub step summaries remain separate so users can enable readable summaries without new GitHub write permissions.
- Example workflows in `examples/` and `examples/ci/` stay aligned with the action shape.
- `examples/ci/adoption-smoke.yml` gives new repos a read-only smoke workflow for `doctor`, `summary`, and packaged framework tuning checks before code scanning is enabled.
- `examples/consumer-quickstart` gives maintainers a minimal installed-project fixture for proving those same first commands from a clean consumer project.

## MCP And Agent Setup

- `jester setup`, `jester mcp-config`, and `jester bootstrap` provide copy-paste setup for Codex, Claude Code, and generic MCP clients.
- `memento-mori-jester-mcp` is published as a package binary.
- `jester doctor` verifies package version, Node, the MCP server file, review-engine behavior, config loading, hook status, and generated GitHub Action status.
- `jester doctor --json` exposes the same support diagnostics with stable structured keys for automation and bug reports.

## Git Hooks

- `jester bootstrap --hook pre-commit` and `--hook pre-push` install managed hooks only when requested.
- Hooks use the same deterministic local review engine as CLI and MCP calls.
- `jester hook-status` lets users inspect managed hook state.

## Documentation

- `README.md` leads with a no-write first run, project bootstrap, agent setup, and optional hooks/CI.
- `docs/INDEX.md` gives readers an audience-based map for onboarding, agent setup, tuning, CI, support, release, package, and licence references.
- `docs/GETTING_STARTED.md`, `docs/CLI.md`, `docs/RELEASE.md`, and `docs/TRUSTED_PUBLISHING.md` cover the core adoption and release paths.
- `examples/reports` provides checked, public-safe report examples for fresh install diagnostics, summary output, blocked command reviews, and report-gallery feedback.
- `examples/support` provides a checked support examples quickstart, support examples index, installed-package support note, release support provenance gate, post-release evidence ledger, compact support lifecycle map, active-review worksheet, synthetic filled worksheet example, and full support lifecycle overview covering report, triage, response, closeout, prioritization, backlog record, and backlog review, plus the supporting outcome prioritization guide, backlog records, backlog review checklist, maintainer triage playbook, response snippets, and closeout checklist.
- `site/index.html` gives maintainers a static one-page share surface that reuses the demo, social card, start command, and public links.
- Every public release has matching `CHANGELOG.md` notes and `docs/RELEASE_NOTES_vX.Y.Z.md`.

## Support And Recovery

- Package metadata points bug reports at the GitHub issues page.
- `jester doctor --json`, `jester config validate`, and `jester rules` are the first troubleshooting commands.
- `jester tune`, `jester tune coverage`, and the fixture suite give maintainers a way to inspect noisy rules before changing defaults.
- [FRAMEWORK_TUNING.md](FRAMEWORK_TUNING.md) maps common stack-specific false-positive reports to the relevant `jester tune <rule-id>` evidence and fixture IDs, while [examples/tuning](../examples/tuning) provides checked copy-paste recipes.
- GitHub issue templates collect bug reports, false-positive reports, report-gallery feedback, and feature requests with the diagnostic context maintainers need.
- `SECURITY.md` routes vulnerability reports away from public issues and asks for redacted diagnostics.
- `docs/MAINTAINER_TRIAGE.md` explains how to turn useful false-positive reports into fixture coverage before changing rule logic.
- `examples/support` shows maintainers how to use the quickstart for a live 60-second handoff, choose the right support artifact from the examples index, verify the same package-relative support artifacts from an installed npm package, record release support provenance after npm publish, capture the post-release evidence ledger for later review, scan the support lifecycle map, use the support lifecycle worksheet during active review, compare against a synthetic filled worksheet example, audit the full lifecycle overview, classify sanitized reports as a docs example, fixture backlog item, or rule-review candidate before changing behavior, then reply with public-safe response snippets, record the closeout, prioritize follow-up work, create a public-safe backlog record, and review aging records for keep-or-close decisions.
- `npm run fixtures:check` validates fixture IDs, metadata, unsafe-looking content, duplicate content, and explicit expected/absent rule intent.
- `npm run fixtures:report` shows fixture coverage by rule, rule family, preset slice, kind, verdict, quiet-pass rule boundaries, and feasible pass-case gaps so maintainers can pick the next fixture target; `npm run fixtures:report -- --markdown` produces a paste-ready maintainer snapshot.
- `npm run framework:tuning:check` keeps the framework tuning guide, cookbook JSON, cookbook README, and fixture IDs aligned.
- `npm run framework:tuning:doctor` runs the cookbook tune commands through the built CLI with temporary preset configs, so package consumers do not inherit stale recipes.
- `npm run consumer:quickstart:check` installs the package into a temporary minimal project and runs `doctor`, `summary`, and packaged framework tuning checks from that consumer side.
- `npm run reports:check` installs the package into a temporary minimal project and runs the report gallery's `doctor`, `summary`, and blocked-command examples through that consumer side.
- `npm run support:check` verifies issue templates, support docs, the report gallery feedback template, support examples quickstart, support examples index, installed-package support note, release support provenance gate, post-release evidence ledger, support lifecycle map, support lifecycle worksheet, filled worksheet example, support lifecycle overview, outcome prioritization guide, backlog records, backlog review checklist, maintainer triage playbook, response snippets, and closeout checklist stay public-safe and ask for useful redacted context.
- `npm run promo:card` regenerates the deterministic social preview card, and `npm run promo:check` verifies current repo-local promo assets against the current fixture evidence before maintainers post or refresh the demo.
- `npm run site:check` verifies the static landing page before maintainers post or host it.
- `npm run pack:contents:check` verifies the npm package surface keeps the support examples manifest files, installed-package provenance note, release support provenance gate, and post-release evidence ledger available while excluding repo-only or private-ish paths.
- `npm run audit:high` keeps the checked dependency tree clear of high and critical npm advisories before maintainers publish.
- npm publish has a manual workflow fallback, but the normal release path is tag-driven trusted publishing.

## Static Guard

`npm run production:check` validates the production-readiness contract:

- current version release notes and changelog section exist,
- package metadata and public package files are present,
- CI, release, publish, and composite action workflows use the expected runtime and steps,
- high-severity npm audit checks are wired into CI, publish, and local prepublish attempts,
- onboarding docs mention the important adoption paths,
- the docs index keeps onboarding, tuning, CI, support, release, package, and licence references discoverable outside the first README screen.
- production readiness documentation covers package, GitHub Action, MCP, git hooks, docs, and support,
- `SECURITY.md` and GitHub issue templates exist and ask for the right diagnostics.
- maintainer triage docs exist and link noisy-rule reports back to fixture coverage.
- fixture authoring checks are wired into `npm test`.
- fixture coverage reports are wired into `npm test`.
- framework tuning cookbook checks are wired into `npm test`.
- framework tuning cookbook doctor checks are wired into `npm test`.
- CI adoption example checks are wired into `npm test`.
- consumer quickstart smoke checks are wired into `npm test`.
- report gallery checks are wired into `npm test`.
- support triage checks are wired into `npm test`.
- promo freshness checks are wired into `npm test`.
- site checks are wired into `npm test`.
- package contents checks are wired into `npm test` and `npm run pack:dry`.

`npm test` runs this check after the TypeScript build and unit tests.

## Known Next Gaps

- Continue expanding real-world preset fixtures and false-positive examples so tuning remains evidence-based.
- Fold the strongest redacted support reports into fixture, playbook, or report-gallery updates.
