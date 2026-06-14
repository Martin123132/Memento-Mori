# Production Readiness

This checklist defines what "production grade" means for Memento Mori Jester right now. It is intentionally practical: the project is a local CLI, MCP server, GitHub Action, and hook helper, so production readiness means users can install it, understand it, wire it in, recover from failures, and verify releases without guesswork.

## Current Bar

- The npm package installs with `npx -y memento-mori-jester@latest` and exposes the CLI plus MCP server binaries.
- The default path is local and deterministic: reviews run on user-provided text, diffs, commands, plans, and final answers without sending project code to a hosted API.
- GitHub Releases and npm publishing are automated from annotated `v*` tags through GitHub Actions trusted publishing.
- CI runs tests and a package dry run on every push to `main` and pull request.
- The local playground, GitHub Action, MCP setup snippets, preset examples, fixtures, and release notes ship in the npm package.

## npm Package

- `package.json` includes repository, homepage, bugs, binaries, exports, public package files, and public publish access.
- `package-lock.json` version matches `package.json`.
- `npm run pack:dry` confirms the package includes `dist`, `docs`, `examples`, `scripts`, `README.md`, `CHANGELOG.md`, `ROADMAP.md`, and `LICENSE`.
- `SECURITY.md` ships with the package so vulnerability reporting guidance is visible from the repository and npm tarball.
- `prepublishOnly` runs tests and a package dry run for local publish attempts.

## GitHub Action

- `action.yml` builds with Node 24 through `actions/setup-node@v6`.
- Action inputs cover `fail-on`, `subject`, `config`, `no-config`, `format`, `output-file`, and `summary`.
- SARIF output and GitHub step summaries remain separate so users can enable readable summaries without new GitHub write permissions.
- Example workflows in `examples/` and `examples/ci/` stay aligned with the action shape.

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
- `docs/GETTING_STARTED.md`, `docs/CLI.md`, `docs/RELEASE.md`, and `docs/TRUSTED_PUBLISHING.md` cover the core adoption and release paths.
- Every public release has matching `CHANGELOG.md` notes and `docs/RELEASE_NOTES_vX.Y.Z.md`.

## Support And Recovery

- Package metadata points bug reports at the GitHub issues page.
- `jester doctor --json`, `jester config validate`, and `jester rules` are the first troubleshooting commands.
- `jester tune`, `jester tune coverage`, and the fixture suite give maintainers a way to inspect noisy rules before changing defaults.
- GitHub issue templates collect bug reports, false-positive reports, and feature requests with the diagnostic context maintainers need.
- `SECURITY.md` routes vulnerability reports away from public issues and asks for redacted diagnostics.
- `docs/MAINTAINER_TRIAGE.md` explains how to turn useful false-positive reports into fixture coverage before changing rule logic.
- `npm run fixtures:check` validates fixture IDs, metadata, unsafe-looking content, duplicate content, and explicit expected/absent rule intent.
- `npm run fixtures:report` shows fixture coverage by rule, preset, kind, and verdict so maintainers can pick the next pass-case target.
- npm publish has a manual workflow fallback, but the normal release path is tag-driven trusted publishing.

## Static Guard

`npm run production:check` validates the production-readiness contract:

- current version release notes and changelog section exist,
- package metadata and public package files are present,
- CI, release, publish, and composite action workflows use the expected runtime and steps,
- onboarding docs mention the important adoption paths,
- production readiness documentation covers package, GitHub Action, MCP, git hooks, docs, and support,
- `SECURITY.md` and GitHub issue templates exist and ask for the right diagnostics.
- maintainer triage docs exist and link noisy-rule reports back to fixture coverage.
- fixture authoring checks are wired into `npm test`.
- fixture coverage reports are wired into `npm test`.

`npm test` runs this check after the TypeScript build and unit tests.

## Known Next Gaps

- Continue expanding pass-case fixtures from real-world usage so false-positive tuning remains evidence-based.
- Add more framework-specific false-positive examples as people report real noisy cases.
