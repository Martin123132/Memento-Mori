# Roadmap

Memento Mori Jester is usable today as a CLI, MCP server, GitHub Action, and git-hook helper. The next work is about making it easier to adopt and harder to misuse.

## Near Term

- More config presets for common stacks and risk profiles.
- A short demo recording or GIF for the README.
- Better rule explanations and fewer false-positive cautions as real usage accumulates.

## Product Ideas

- A small web/demo page that lets people paste a command or diff and see the verdict.

## Quality And Safety

- Keep all checks local and deterministic unless the user explicitly asks for hosted services.
- Keep destructive commands blocked by default.
- Keep project-specific config transparent in `jester.config.json`.
- Avoid long-lived npm tokens by using trusted publishing.

## Not Planned Right Now

- Sending project code to a hosted API.
- Replacing human review.
- Auto-running commands that were only meant to be reviewed.
