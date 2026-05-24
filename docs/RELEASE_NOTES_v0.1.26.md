# v0.1.26 Release Notes

This release makes `jester config recommend` more specific by showing the stack evidence behind a preset recommendation.

## Added

- `Detected stack` in text output.
- `detectedStacks` in JSON output for the winning recommendation and each candidate.
- More specific framework and tooling signals for Next.js, Vite, React, Vue, Svelte, Astro, Remix, Express, Fastify, NestJS, Prisma, FastAPI, Django, Flask, SQLAlchemy, Terraform, Pulumi, Docker, Kubernetes, Helm, MCP, OpenAI, Anthropic, LangChain, and common security tooling.

## Unchanged

- No config schema changed.
- No review verdict behavior changed.
- No MCP tools, playground behavior, or release automation changed.
- `jester config recommend` remains read-only, local, deterministic, and network-free.

## Useful Commands

```powershell
npm.cmd test
npm.cmd run demo:svg:check
npm.cmd run pack:dry
node .\dist\cli.js config recommend
node .\dist\cli.js config recommend --json
git diff | node .\dist\cli.js diff --fail-on block --subject "v0.1.26 stack-aware preset recommendation"
```
