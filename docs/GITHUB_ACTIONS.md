# GitHub Actions

Use Memento Mori Jester in CI to review diffs before they merge.

## Generate A Workflow

Print a ready-to-copy workflow with SARIF upload:

```powershell
npx -y memento-mori-jester@latest github-action
```

Or write it directly into a repo:

```powershell
npx -y memento-mori-jester@latest github-action --write
```

The generated workflow reviews pull request diffs, writes `jester.sarif`, uploads it with `github/codeql-action/upload-sarif@v3`, and appends a readable Jester summary to the GitHub Actions run.

This repository dogfoods that generated workflow in [.github/workflows/memento-mori.yml](../.github/workflows/memento-mori.yml).

## Adoption Smoke Workflow

Use [examples/ci/adoption-smoke.yml](../examples/ci/adoption-smoke.yml) when you want a first read-only CI check before enabling SARIF/code scanning.

It runs:

```powershell
npx -y memento-mori-jester@latest doctor
npx -y memento-mori-jester@latest summary --kind command "git reset --hard"
npm run framework:tuning:check
npm run framework:tuning:doctor
```

The workflow downloads the published npm tarball into a temporary directory before running the framework tuning checks, so it verifies package contents rather than relying on this repository checkout.

## Composite Action

This repo can be used directly as a GitHub Action:

```yaml
name: Jester Review

on:
  pull_request:
    branches: [main]

jobs:
  jester:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Review diff
        uses: Martin123132/Memento-Mori@main
        with:
          fail-on: block
          subject: pull request diff
          summary: true
```

For pinned releases, replace `@main` with a tag such as `@v0.1.0`.

Set `summary: false` if you only want the raw action output or SARIF file.

## Pull Request Diff Review

Create `.github/workflows/jester.yml`:

```yaml
name: Jester Review

on:
  pull_request:
    branches: [main]

jobs:
  jester:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Review pull request diff
        run: |
          git fetch origin "${{ github.base_ref }}" --depth=1
          git diff --binary --no-ext-diff "origin/${{ github.base_ref }}...HEAD" \
            | npx -y memento-mori-jester@latest diff --fail-on block --subject "pull request diff"
```

## Push Diff Review

```yaml
name: Jester Push Review

on:
  push:
    branches: [main]

jobs:
  jester:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 2

      - name: Review pushed diff
        run: |
          git diff --binary --no-ext-diff HEAD~1..HEAD \
            | npx -y memento-mori-jester@latest diff --fail-on block --subject "pushed diff"
```

## With Project Config

Commit `jester.config.json` at the repo root. The CLI discovers it automatically:

```yaml
- run: |
    git diff --binary --no-ext-diff "origin/${{ github.base_ref }}...HEAD" \
      | npx -y memento-mori-jester@latest diff --fail-on block
```

To use a non-root config:

```yaml
- run: |
    git diff --binary --no-ext-diff "origin/${{ github.base_ref }}...HEAD" \
      | npx -y memento-mori-jester@latest diff --config .github/jester.config.json --fail-on block
```

## Softer Mode

Use `--fail-on caution` if you want warnings to fail CI too:

```yaml
- run: |
    git diff --binary --no-ext-diff "origin/${{ github.base_ref }}...HEAD" \
      | npx -y memento-mori-jester@latest diff --fail-on caution
```

Use `--json` if another CI step will parse the result.

## SARIF Output

Available in `v0.1.10` and later, the CLI can write SARIF 2.1.0:

```yaml
- run: |
    git diff --binary --no-ext-diff "origin/${{ github.base_ref }}...HEAD" \
      | npx -y memento-mori-jester@latest diff --sarif > jester.sarif
```

The composite action can also write SARIF to a file:

```yaml
- name: Review diff as SARIF
  uses: Martin123132/Memento-Mori@main
  with:
    format: sarif
    output-file: jester.sarif
    summary: true
    fail-on: block
```

Upload that file with GitHub's code scanning upload action if the repository has code scanning enabled. See [examples/github-code-scanning.yml](../examples/github-code-scanning.yml) for the complete workflow.
