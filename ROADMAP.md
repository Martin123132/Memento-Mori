# Roadmap

Memento Mori Jester is usable today as a CLI, MCP server, GitHub Action, and git-hook helper. The next work is about making it easier to adopt and harder to misuse.

## Near Term

- Real-usage false-positive fixture suite for preset tuning.

## Recently Shipped

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

## Product Ideas

- Framework-specific CI examples and richer false-positive tuning reports.

## Quality And Safety

- Keep all checks local and deterministic unless the user explicitly asks for hosted services.
- Keep destructive commands blocked by default.
- Keep project-specific config transparent in `jester.config.json`.
- Avoid long-lived npm tokens by using trusted publishing.

## Not Planned Right Now

- Sending project code to a hosted API.
- Replacing human review.
- Auto-running commands that were only meant to be reviewed.
