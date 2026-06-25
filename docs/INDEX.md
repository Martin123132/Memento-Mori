# Documentation Index

This is the quick map for Memento Mori Jester docs and examples. Start with the smallest section that matches what you are trying to do, then follow the deeper links only when you need them.

## New Users

- [README](../README.md) - the shortest no-write path: `start`, `doctor`, `config recommend`, `setup --agent codex`, and `github-action --write`.
- [Getting Started](GETTING_STARTED.md) - a fuller first setup path with local-first safety notes.
- [Demo Transcript](DEMO.md) - the terminal-style walkthrough behind the README demo.
- [CLI Reference](CLI.md) - command details, including `doctor --json`, `summary`, `tune`, and `playground`.
- [Security Policy](../SECURITY.md) - where to report vulnerabilities, private code exposure, or credential-handling concerns.

## Agent Setup

- [Codex Setup](CODEX.md) - Codex-specific MCP setup.
- [Claude Code Setup](CLAUDE_CODE.md) - Claude Code-specific MCP setup.
- [Agent Setup](AGENTS.md) - shared agent instruction guidance.
- [MCP Tool Reference](MCP_TOOLS.md) - local MCP tools and expected client behavior.
- [Examples](../examples) - generated MCP snippets and copy-paste setup examples.

## Config, Presets, And Tuning

- [Preset Example Packs](../examples/presets) - Next.js, Vite React, Express API, FastAPI, Terraform/Kubernetes, and AI MCP examples.
- [Framework Tuning Guide](FRAMEWORK_TUNING.md) - stack-shaped false-positive guidance and `jester tune <rule-id>` examples.
- [Framework Tuning Cookbook](../examples/tuning) - checked `examples/tuning` recipes and `framework-tuning-cookbook.json`.
- [Review Fixtures](../examples/fixtures) - deterministic review cases.
- `npm run fixtures:check` - validates fixture IDs, metadata, unsafe-looking content, and explicit rule intent.
- `npm run fixtures:report` - reports fixture coverage by rule, family, preset, kind, verdict, quiet-pass boundaries, and feasible pass-case gaps.
- `npm run fixtures:report -- --markdown` - produces a paste-ready fixture coverage snapshot.

## CI And Adoption

- [GitHub Actions Guide](GITHUB_ACTIONS.md) - code-scanning and summary output setup.
- [Adoption Smoke CI](../examples/ci/adoption-smoke.yml) - read-only CI smoke for `doctor`, `summary`, and packaged framework tuning checks.
- [Consumer Quickstart Smoke](../examples/consumer-quickstart) - clean consumer-project smoke for installed usage.
- [Real-World Report Gallery](../examples/reports) - checked `doctor`, `summary`, and blocked-command output examples.
- [Report Gallery Feedback Template](../examples/reports/feedback-template.md) - public-safe report gallery feedback with redacted details.

## Maintainers And Support

- [Maintainer Triage](MAINTAINER_TRIAGE.md) - how to turn false-positive and report gallery feedback into evidence before changing behavior.
- [Support Examples README](../examples/support) - entry point for checked support artifacts.
- [Support Examples Quickstart](../examples/support/support-examples-quickstart.md) - 60-second maintainer handoff.
- [Support Examples Index](../examples/support/support-examples-index.md) - which support artifact to use when.
- [Installed Package Support Examples](../examples/support/installed-package-support.md) - verify support examples from an installed npm package.
- [Release Support Provenance Gate](../examples/support/release-support-provenance.md) - post-publish installed-package support verification.
- [Post-Release Evidence Ledger](../examples/support/post-release-evidence-ledger.md) - release closeout evidence shape.
- [Support Lifecycle Map](../examples/support/support-lifecycle-map.md) - compact report-to-backlog-review map.
- [Support Lifecycle Worksheet](../examples/support/support-lifecycle-worksheet.md) - active review checklist.
- [Filled Support Lifecycle Worksheet Example](../examples/support/support-lifecycle-filled-example.md) - synthetic public-safe example.
- [Support Lifecycle Overview](../examples/support/support-lifecycle.md) - full report, triage, response, closeout, prioritization, backlog record, and backlog review chain.
- [Support Outcome Prioritization](../examples/support/outcome-prioritization.md) - when to choose docs clarification, fixture backlog, or rule-review candidate.
- [Support Backlog Records](../examples/support/backlog-records.md) - public-safe backlog record examples.
- [Support Backlog Review](../examples/support/backlog-review.md) - aging and keep-or-close checklist.
- [Maintainer Response Snippets](../examples/support/response-snippets.md) - public-safe replies for common outcomes.
- [Support Closeout Checklist](../examples/support/closeout-checklist.md) - how to record the outcome after maintainer response.
- `npm run support:check` - verifies support templates and support examples stay public-safe.
- `npm run pack:contents:check` - verifies package contents include support examples while excluding repo-only promo, site, private, cache, and credential-shaped files.

## Release, Package, And Trust

- [Release Guide](RELEASE.md) - tag-driven release flow and post-publish smoke checks.
- [Trusted Publishing](TRUSTED_PUBLISHING.md) - npm trusted publishing setup and fallback.
- [Production Readiness](PRODUCTION_READINESS.md) - current production bar and static guard contract.
- [Changelog](../CHANGELOG.md) - release history.
- [Roadmap](../ROADMAP.md) - current priorities and shipped work.
- [Package Licence](../LICENSE), [Commercial Licence](../COMMERCIAL-LICENSE.md), and [Notice](../NOTICE.md) - personal/non-commercial terms and commercial licence direction.

## Public-Safety Reminder

Keep support, fixture, report-gallery feedback, and release evidence public-safe. Do not paste private repo code, secrets, customer data, private URLs, internal business details, credentials, or raw unredacted command output into public issues, docs, examples, screenshots, releases, or package artifacts.
