# Security Policy

Memento Mori Jester is a local CLI, MCP server, GitHub Action, and git-hook helper. It is designed to review text you provide locally; it should not send project code to a hosted service.

## Supported Versions

Security fixes target the latest npm release and the `main` branch.

If you are using an older version, first confirm the issue still appears on the latest package:

```powershell
npx -y memento-mori-jester@latest doctor
```

## Reporting A Vulnerability

Please do not put secrets, exploit details, private repository content, or live credentials in a public issue.

Use GitHub's private vulnerability report flow when available:

<https://github.com/Martin123132/Memento-Mori/security/advisories/new>

If that flow is unavailable, open a minimal public issue asking for a private security contact, but do not include sensitive details.

Helpful report details:

- affected package version and install method,
- operating system and Node version,
- the command, GitHub Action, MCP setup, hook, or installer path involved,
- the expected behavior and the observed behavior,
- whether credentials, private code, generated SARIF, or CI logs are involved,
- redacted `jester doctor --json` output.

## Scope

Useful security reports include:

- command execution or shell-injection risks in CLI, hooks, installers, or GitHub Action paths,
- unexpected network access or code disclosure,
- unsafe handling of config, SARIF, fixture, or diagnostic output,
- supply-chain or package-publishing concerns,
- MCP server behavior that could expose more data than the caller provided.

Reports about noisy rules or false positives are welcome too, but use the false-positive issue template unless there is a concrete vulnerability.

## Handling Notes

This is a small project, so response times are best effort. Security reports get priority over normal bugs, and fixes should preserve the project's local-first, deterministic behavior wherever possible.
