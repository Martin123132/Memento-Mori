# Memento Mori Jester v0.1.107

## Summary

This release makes the project easier to trust at first glance. It adds a high-severity npm audit gate to CI and publish checks, then clarifies the product/package/repo names so new readers can tell normal local checks apart from release and publish steps.

## Changes

- Added `npm run audit:high` for high and critical npm advisory checks.
- Wired the audit gate into CI, the npm publish workflow, and `prepublishOnly`.
- Extended production-readiness checks so the audit gate remains part of the release contract.
- Added first-reader naming notes to README and Getting Started:
  - `Memento Mori Jester` is the product name.
  - `memento-mori-jester` is the npm package and long binary.
  - `jester` is the short CLI command.
  - `Memento-Mori` is the GitHub repository slug.
  - MCP is the local tool protocol used by Codex, Claude Code, and other clients.
- Clarified that `start`, `doctor`, `config recommend`, `summary`, `tune`, `playground`, and `npm run audit:high` do not publish packages or create releases.
- Included `COMMERCIAL-LICENSE.md` and `NOTICE.md` in the npm package file list and package contents checks so the company non-commercial licence context ships with the tarball.

## Public Interface Changes

- No CLI, MCP, config schema, rule, scoring, or runtime behavior changes.
- No licence changes. The package continues to use the repository `LICENSE` file and the existing source-available/noncommercial terms, with `COMMERCIAL-LICENSE.md` and `NOTICE.md` now explicitly shipped in the npm package.
- GitHub CI and publish workflows now fail earlier on high or critical npm advisories.
- README and Getting Started include clearer product/package/repo naming guidance.

## Release Validation

```powershell
npm.cmd run audit:high
npm.cmd test
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.107 naming and audit gate polish"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest start
npm.cmd explore memento-mori-jester -- npm run audit:high
```
