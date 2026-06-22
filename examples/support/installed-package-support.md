# Installed Package Support Examples

This public-safe note shows maintainers how to use the checked support examples from an installed npm package instead of a repository checkout.

The checked source is [installed-package-support.json](installed-package-support.json). Use it with the [support examples index](support-examples-index.md), [support examples quickstart](support-examples-quickstart.md), [support lifecycle map](support-lifecycle-map.md), [support lifecycle worksheet](support-lifecycle-worksheet.md), and [filled synthetic example](support-lifecycle-filled-example.md).

## Verify From npm

```powershell
npm install --save-dev memento-mori-jester
npm explore memento-mori-jester -- npm run pack:contents:check
```

## Open The Package-Relative Artifacts

The support examples are package-relative paths under `examples/support/`:

- `examples/support/support-examples-index.md`
- `examples/support/support-examples-quickstart.md`
- `examples/support/support-lifecycle-map.md`
- `examples/support/support-lifecycle-worksheet.md`
- `examples/support/support-lifecycle-filled-example.md`

When using an installed package, stay inside the package directory through `npm explore memento-mori-jester -- <command>` or your editor's package viewer. The support examples do not require repo-only `promo/`, `site/`, `.github/`, private, secret, internal, cache, or credential-shaped paths.

## Maintainer Path

1. Run the package contents check from the installed package.
2. Open the support examples index to choose the right artifact.
3. Use the quickstart for a 60-second route from incoming report to map, worksheet, filled synthetic example, backlog record, and backlog review.
4. Keep report details redacted and route secrets, private code, private paths, customer data, package publishing compromise, MCP exposure, command execution risk, or exploitable security details through `SECURITY.md`.

## Checks

```powershell
npm run support:check
npm run pack:contents:check
npm run production:check
```
