# Report Gallery Feedback Template

Use this template when a report-gallery example is confusing, stale, or missing context. Keep reports public-safe and minimal so maintainers can turn useful feedback into docs, fixtures, or a narrow code change.

The checked examples are:

- `fresh-install-doctor`
- `destructive-command-summary`
- `blocked-command-review`

## Commands To Run

```powershell
npx -y memento-mori-jester@latest doctor --json
npx -y memento-mori-jester@latest summary --kind command "git reset --hard"
```

For false-positive or noisy-rule reports, also run:

```powershell
npx -y memento-mori-jester@latest tune <rule-id> --json
```

## Public Issue Draft

```text
Jester version:
Install method: npx / global / local checkout / GitHub Action / git hook
Nearest report-gallery example: fresh-install-doctor / destructive-command-summary / blocked-command-review / none

Sanitized command or workflow step:

Sanitized output summary:

Expected behavior or clearer wording:

Relevant redacted doctor --json fields:

Relevant redacted tune output, if this is a noisy rule:

```

## Privacy Checklist

- Do not include secrets, tokens, private keys, customer data, or private repository code.
- Do not include full CI logs, unredacted SARIF, live credentials, or exploitable security details.
- Replace private paths and names with placeholders such as `<repo>`, `<path>`, `<service>`, or `<redacted>`.
- If the report involves credential exposure, command execution risk, package publishing, MCP data exposure, or private code disclosure, use [SECURITY.md](../../SECURITY.md) instead of a public issue.

Maintainers can validate this support path with:

```powershell
npm run support:check
```
