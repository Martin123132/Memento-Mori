# Trusted npm Publishing

Trusted publishing lets GitHub Actions publish this package to npm without a long-lived npm token.

## One-Time npm Setup

Open the package settings on npm:

```text
https://www.npmjs.com/package/memento-mori-jester/access
```

Find the trusted publishing settings and add:

- Provider: `GitHub Actions`
- Organization or user: `Martin123132`
- Repository: `Memento-Mori`
- Workflow filename: `npm-publish.yml`

The workflow file must exist in `.github/workflows/`, which this repo now has.

## Manual Publish From GitHub

After the npm trusted publisher is configured:

1. Open the GitHub repo.
2. Go to `Actions`.
3. Open `npm Publish`.
4. Click `Run workflow`.

The workflow installs dependencies, runs tests, and publishes the current package version to npm.

## Why It Exists

Manual `npm publish` works, but npm asks for browser authentication. Trusted publishing moves that trust to the GitHub workflow and avoids storing a reusable npm token.

## Important

Only run the workflow after `package.json` has a version that npm does not already have. npm will reject publishing the same version twice.
