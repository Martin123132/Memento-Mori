# Changelog

All notable changes to Memento Mori Jester are tracked here.

## Unreleased

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
