# Post-Release Evidence Ledger

Use this public-safe ledger after a release is live. It turns the release closeout evidence into a compact record maintainers can review later without reopening Actions logs, npm output, or local terminal scrollback.

The checked source is [post-release-evidence-ledger.json](post-release-evidence-ledger.json). Pair it with [release-support-provenance.md](release-support-provenance.md) when recording installed-package support verification after npm publish.

## Record These Results

Capture the release evidence as links, statuses, counts, and short command outcomes:

- GitHub Release URL.
- npm registry version from `npm view memento-mori-jester version --silent`.
- CI workflow status.
- GitHub Release workflow status.
- npm Publish workflow status.
- Public `npx -y memento-mori-jester@latest doctor` result.
- Public `npx -y memento-mori-jester@latest summary --kind command "git reset --hard"` result.
- Installed-package provenance command result: `npm explore memento-mori-jester -- npm run pack:contents:check`.
- Registry tarball file count.
- Private-ish path exclusion summary.

## Private-Ish Path Exclusion Summary

Record the private-ish path exclusion summary by confirming the package audit found no repo-only or private-ish package paths:

- `promo/`
- `site/`
- `.github/`
- `private/`
- `secrets/`
- `internal/`
- `node_modules/`
- `coverage/`
- `tmp/`
- `temp/`
- `.env`
- `.npmrc`

## Public-Safe Notes

Keep the ledger boring: URLs, workflow names, statuses, package version, file count, and short pass/fail summaries are enough. Do not paste secrets, private code, private paths, customer data, full CI logs, unredacted SARIF, package publishing credentials, MCP data exposure, command execution risk details, or exploitable security details. Route those through `SECURITY.md`.

## Checks

```powershell
npm run support:check
npm run pack:contents:check
npm run production:check
```
