# v0.1.18 Release Notes

This release makes the project easier to understand at a glance by adding a lightweight terminal-style README demo.

## Added

- `docs/demo-terminal.svg`, a deterministic terminal snapshot for the README.
- `scripts/render-demo-svg.mjs`, which regenerates the SVG from hardcoded demo lines.
- `npm run demo:svg` to regenerate the image.
- `npm run demo:svg:check` to fail when the checked-in SVG is stale.

## Changed

- README now embeds the terminal demo and links to the full transcript.
- `docs/DEMO.md` now reflects current presets, including `web` and `infra`.
- Roadmap marks the README demo snapshot as shipped and points the next product idea toward a local paste-in playground.

## Unchanged

- No CLI, MCP, config schema, rule, or workflow behavior changed.

## Useful Commands

```powershell
npm.cmd run demo:svg
npm.cmd run demo:svg:check
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest config presets
```
