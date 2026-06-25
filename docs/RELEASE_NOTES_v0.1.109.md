# Memento Mori Jester v0.1.109

## Summary

This release adds a checked documentation index and makes the README's first-run path calmer for new readers. It is documentation and guard polish only: no CLI, MCP, rule, scoring, config, workflow, licence, or runtime behavior changes.

## Changes

- Added `docs/INDEX.md` as an audience-based map for onboarding, agent setup, config, tuning, CI, support, release, package, and licence references.
- Shortened the README Start Here section so it leads with local no-write checks, project bootstrap, agent setup, hooks, CI, and a small set of next links.
- Linked the documentation index from Getting Started and production-readiness docs.
- Extended `npm run production:check` so the documentation index keeps support, fixture, report-gallery, package, and licence references discoverable.

## Public Interface Changes

- No new commands, flags, JSON fields, config fields, MCP tools, GitHub Action inputs, licence changes, or review behavior changes.
- New package file: `docs/INDEX.md`.

## Release Validation

```powershell
npm.cmd run audit:high
npm.cmd test
npm.cmd run production:check
npm.cmd run pack:dry
git diff --check
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.109 docs navigation polish"
```

## Post-Publish Smoke

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest start
npm.cmd pack memento-mori-jester@0.1.109 --json --ignore-scripts
```
