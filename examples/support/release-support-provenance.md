# Release Support Provenance Gate

Use this public-safe gate after `npm Publish` succeeds. It makes the installed-package support verification part of the release closeout instead of an optional local habit.

The checked source is [release-support-provenance.json](release-support-provenance.json). Pair it with [post-release-evidence-ledger.md](post-release-evidence-ledger.md), [installed-package-support.md](installed-package-support.md), [support-examples-index.md](support-examples-index.md), [support-examples-quickstart.md](support-examples-quickstart.md), [support-lifecycle-map.md](support-lifecycle-map.md), [support-lifecycle-worksheet.md](support-lifecycle-worksheet.md), and [support-lifecycle-filled-example.md](support-lifecycle-filled-example.md).

## Post-Publish Gate

After the registry reports the new version, verify the installed package from a throwaway project:

```powershell
npm view memento-mori-jester version --silent
npm install --save-dev memento-mori-jester@latest --ignore-scripts --no-audit --no-fund
npm explore memento-mori-jester -- npm run pack:contents:check
```

## Record These Package-Relative Artifacts

Record these paths in the release closeout or maintainer update:

- `examples/support/installed-package-support.md`
- `examples/support/support-examples-index.md`
- `examples/support/support-examples-quickstart.md`
- `examples/support/support-lifecycle-map.md`
- `examples/support/support-lifecycle-worksheet.md`
- `examples/support/support-lifecycle-filled-example.md`

The release closeout should also record that no repo-only `promo/`, `site/`, `.github/`, private, secret, internal, cache, or credential-shaped paths were required for support-example verification.

## Public-Safe Record Fields

Keep the release record boring and safe:

- package version,
- GitHub Release URL,
- npm version returned by the registry,
- installed-package verification command,
- package-relative support artifacts checked,
- repo-only paths confirmed absent or not required,
- privacy scan result.

After those checks pass, copy the final evidence into [post-release-evidence-ledger.md](post-release-evidence-ledger.md) so later maintainers can review the GitHub Release URL, workflow statuses, public `npx` smokes, tarball file count, and private-ish path exclusion summary without reopening logs.

Do not paste secrets, private code, private paths, customer data, full logs, unredacted SARIF, package publishing credentials, MCP data exposure, command execution risk details, or exploitable security details. Route those through `SECURITY.md`.

## Checks

```powershell
npm run support:check
npm run pack:contents:check
npm run production:check
```
