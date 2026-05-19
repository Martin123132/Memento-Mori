# Trusted npm Publishing

Trusted publishing lets GitHub Actions publish this package to npm without a long-lived npm token. It is configured and working for `memento-mori-jester`.

## npm Setup

The package trusted publisher should be configured on npm as:

- Provider: `GitHub Actions`
- Organization or user: `Martin123132`
- Repository: `Memento-Mori`
- Workflow filename: `npm-publish.yml`

If it ever needs to be checked, open:

```text
https://www.npmjs.com/package/memento-mori-jester/access
```

## Normal Publish Path

Publish by preparing a new package version, committing it, then pushing a matching `v*` tag:

```powershell
git tag -a v0.1.x -m "Memento Mori Jester v0.1.x"
git push origin main
git push origin v0.1.x
```

The `npm Publish` workflow runs automatically on the tag push. It verifies the tag matches `package.json`, installs dependencies, runs tests, runs a dry pack, and publishes to npm.

## Manual Fallback

The workflow can still be run manually from GitHub Actions if a publish needs to be retried from `main`.

Only use the manual fallback after `package.json` has a version that npm does not already have. npm rejects publishing the same version twice.

## Why It Exists

Manual `npm publish` works, but npm asks for browser authentication. Trusted publishing moves that trust to the GitHub workflow and avoids storing a reusable npm token.
