# GitHub Actions

Use Memento Mori Jester in CI to review diffs before they merge.

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
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Review diff
        uses: Martin123132/Memento-Mori@main
        with:
          fail-on: block
          subject: pull request diff
```

For pinned releases, replace `@main` with a tag such as `@v0.1.0`.

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
        uses: actions/checkout@v4
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
        uses: actions/checkout@v4
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
