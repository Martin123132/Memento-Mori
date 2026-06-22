# Real-World Report Gallery

These small examples show the first reports people tend to trust when trying Memento Mori Jester in a fresh project. They are public, synthetic, and intentionally boring: no private code, no tokens, no customer data, and no full CI logs.

The machine-readable source is [report-gallery.json](report-gallery.json). It is checked by `npm run reports:check`, which installs Memento Mori Jester into a temporary consumer project and runs each command through that installed package.

| ID | Report | Command | What It Proves |
| --- | --- | --- | --- |
| `fresh-install-doctor` | Fresh install health check | `jester doctor` | The package, runtime, MCP file, review engine, config, hook, and workflow diagnostics are visible. |
| `destructive-command-summary` | Readable summary for a destructive command | `jester summary --kind command "git reset --hard"` | A compact report shows the block verdict, rule hit, and next tuning commands. |
| `blocked-command-review` | Full blocked command review | `jester command "git reset --hard"` | The full command review blocks the risky operation and explains the safer check. |

Run the checker from the repo root:

```powershell
npm run reports:check
```

After publishing, verify the same gallery against the public package:

```powershell
npm run reports:check -- --package memento-mori-jester@latest
```

When turning a real issue into a gallery entry, keep the example minimal and redacted. If the report needs private context, route it through [SECURITY.md](../../SECURITY.md) or keep it out of the public repo.
