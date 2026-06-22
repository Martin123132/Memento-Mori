# Memento Mori Jester v0.1.89

## Summary

This release adds a checked adopter feedback path for real-world report-gallery results. The goal is to make support reports easier to act on without asking users to paste secrets, private code, customer data, full CI logs, or private paths.

## What Changed

- Added `.github/ISSUE_TEMPLATE/report_gallery_feedback.yml`.
- Strengthened `.github/ISSUE_TEMPLATE/false_positive.yml` with package version and optional redacted `doctor --json` fields.
- Added `examples/reports/feedback-template.md`.
- Added `scripts/check-support-triage.mjs`.
- Added `npm run support:check` and wired it into `npm test`.
- Updated README, report gallery docs, maintainer triage docs, release docs, production-readiness docs, roadmap, and changelog.

## Public Interface

- No CLI command changes.
- No MCP tool changes.
- No config schema changes.
- No review rule, scoring, matching, or verdict behavior changes.
- No GitHub Action input changes.
- New maintainer/package script: `npm run support:check`.
- New public support path: report-gallery feedback template and issue form.

## Release Validation

```powershell
npm.cmd test
npm.cmd run support:check
npm.cmd run reports:check
npm.cmd run demo:svg:check
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run pack:dry
git diff --check
node .\dist\cli.js doctor
node .\dist\cli.js summary --kind command "git reset --hard"
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.89 checked support triage"
```

Expected:

- `support:check` verifies report-gallery feedback docs, issue templates, and privacy prompts.
- `reports:check` still verifies the installed-package report gallery.
- fixture report still shows `Fixtures: 222`.
- GitHub Release and npm Publish complete from the `v0.1.89` tag.

After publish:

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm.cmd run support:check
npm.cmd run reports:check -- --package memento-mori-jester@latest
```
