# Release Guide

This project publishes GitHub Releases and npm packages from `v*` tags.

## 1. Prepare The Version

```powershell
npm.cmd version 0.1.x --no-git-tag-version
npm.cmd test
npm.cmd run production:check
npm.cmd run fixtures:check
npm.cmd run fixtures:report
npm.cmd run fixtures:report -- --json
npm.cmd run fixtures:report -- --markdown
npm.cmd run promo:card:check
npm.cmd run promo:check
npm.cmd run pack:dry
git diff --check
```

Move the current changelog bullets into a matching version section and add `docs/RELEASE_NOTES_v0.1.x.md` before committing. Keep `docs/PRODUCTION_READINESS.md` and `npm run production:check` aligned when package, workflow, docs, or support expectations change.

## 2. Tag And Push

```powershell
git add package.json package-lock.json CHANGELOG.md docs/RELEASE_NOTES_v0.1.x.md docs/PRODUCTION_READINESS.md docs/MAINTAINER_TRIAGE.md SECURITY.md .github/ISSUE_TEMPLATE
git commit -m "Release v0.1.x"
git tag -a v0.1.x -m "Memento Mori Jester v0.1.x"
git push origin main
git push origin v0.1.x
```

Pushing the tag starts both release workflows:

- `GitHub Release` creates the release from `docs/RELEASE_NOTES_<tag>.md` when present.
- `npm Publish` checks the tag matches `package.json`, runs tests, runs a dry pack, and publishes to npm through trusted publishing.

The manual `npm Publish` workflow remains available in GitHub Actions as a fallback retry path.

## 3. Smoke Test Published Package

```powershell
npm.cmd view memento-mori-jester version --silent
npx.cmd -y memento-mori-jester@latest doctor
npx.cmd -y memento-mori-jester@latest doctor --json
npx.cmd -y memento-mori-jester@latest examples
npx.cmd -y memento-mori-jester@latest rules --kind command
npx.cmd -y memento-mori-jester@latest rule destructive-git-history
npx.cmd -y memento-mori-jester@latest rules --json
npx.cmd -y memento-mori-jester@latest github-action
npx.cmd -y memento-mori-jester@latest explain command "git reset --hard"
npx.cmd -y memento-mori-jester@latest command "git reset --hard"
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard"
npx.cmd -y memento-mori-jester@latest summary --kind command "git reset --hard" --json
npx.cmd -y memento-mori-jester@latest command "git reset --hard" --sarif
npx.cmd -y memento-mori-jester@latest start
npx.cmd -y memento-mori-jester@latest start --preset web --agent codex --hook pre-commit
npx.cmd -y memento-mori-jester@latest init
npx.cmd -y memento-mori-jester@latest setup
npx.cmd -y memento-mori-jester@latest setup --agent claude --json
npx.cmd -y memento-mori-jester@latest mcp-config --agent claude --mode npx
npx.cmd -y memento-mori-jester@latest policy levels
npx.cmd -y memento-mori-jester@latest policy show --level strict
npx.cmd -y memento-mori-jester@latest bootstrap --preset node
npx.cmd -y memento-mori-jester@latest config recommend
npx.cmd -y memento-mori-jester@latest config recommend --json
npx.cmd -y memento-mori-jester@latest tune risky-domain
npx.cmd -y memento-mori-jester@latest tune risky-domain --json
npx.cmd -y memento-mori-jester@latest config init
npx.cmd -y memento-mori-jester@latest config disable-rule console-log --json
npx.cmd -y memento-mori-jester@latest config enable-rule console-log --json
npx.cmd -y memento-mori-jester@latest config init --preset web --path jester-web.config.json
npx.cmd -y memento-mori-jester@latest config validate --config jester-web.config.json
npx.cmd -y memento-mori-jester@latest config init --preset api --path jester-api.config.json
npx.cmd -y memento-mori-jester@latest config validate --config jester-api.config.json
npx.cmd -y memento-mori-jester@latest config init --preset infra --path jester-infra.config.json
npx.cmd -y memento-mori-jester@latest config validate --config jester-infra.config.json
npx.cmd -y memento-mori-jester@latest config init --preset ai --path jester-ai.config.json
npx.cmd -y memento-mori-jester@latest config validate --config jester-ai.config.json
npx.cmd -y memento-mori-jester@latest config init --preset security --path jester-security.config.json
npx.cmd -y memento-mori-jester@latest config validate --config jester-security.config.json
```

## 4. MCP Copy-Paste

The lowest-friction config uses `npx`:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "npx",
      "args": [
        "-y",
        "memento-mori-jester@latest",
        "mcp-server"
      ]
    }
  }
}
```

For users who install globally:

```json
{
  "mcpServers": {
    "memento-mori-jester": {
      "command": "memento-mori-jester-mcp",
      "args": []
    }
  }
}
```

## 5. Repository Metadata

The package is configured for:

```text
https://github.com/Martin123132/Memento-Mori
```

If the repo moves, update `repository`, `homepage`, and `bugs` in `package.json`, plus the raw installer URLs in `README.md`.

## 6. Post-Release Workflow Check

In a throwaway git repo:

```powershell
npx.cmd -y memento-mori-jester@latest config init
npx.cmd -y memento-mori-jester@latest install-hook pre-commit
npx.cmd -y memento-mori-jester@latest hook-status
```

Then stage a risky diff and confirm the hook blocks or cautions according to `hookFailOn`.
