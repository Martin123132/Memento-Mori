import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const cliPath = join(dirname(fileURLToPath(import.meta.url)), "cli.js");

test("bootstrap writes starter files", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-bootstrap-"));
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "bootstrap",
    "--mode",
    "local",
    "--preset",
    "node",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    ok: boolean;
    files: Array<{ path: string; changed: boolean }>;
  };

  assert.equal(result.ok, true);
  assert.equal(result.files.length, 3);
  assert.ok(result.files.every((file) => file.changed));

  const config = await readFile(join(cwd, "jester.config.json"), "utf8");
  const mcp = await readFile(join(cwd, "memento-mori.mcp.json"), "utf8");
  const instructions = await readFile(join(cwd, "MEMENTO_MORI.md"), "utf8");

  assert.match(config, /node-install-script-change/);
  assert.match(mcp, /memento-mori-jester/);
  assert.match(instructions, /Agent Instruction/);
});

test("bootstrap keeps existing files unless forced", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-bootstrap-"));
  await writeFile(join(cwd, "MEMENTO_MORI.md"), "keep me\n", "utf8");

  await execFileAsync(process.execPath, [cliPath, "bootstrap", "--mode", "local"], { cwd });
  const instructions = await readFile(join(cwd, "MEMENTO_MORI.md"), "utf8");

  assert.equal(instructions, "keep me\n");
});

test("bootstrap can install a git hook", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-bootstrap-"));
  await execFileAsync("git", ["init"], { cwd });

  await execFileAsync(process.execPath, [
    cliPath,
    "bootstrap",
    "--mode",
    "local",
    "--hook",
    "pre-commit"
  ], { cwd });

  const hook = await readFile(join(cwd, ".git", "hooks", "pre-commit"), "utf8");

  assert.match(hook, /memento-mori-jester managed hook/);
});

test("examples prints copy-paste onboarding commands", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "examples",
    "--mode",
    "local",
    "--agent",
    "codex"
  ]);

  assert.match(stdout, /Memento Mori Jester examples/);
  assert.match(stdout, /command "git reset --hard"/);
  assert.match(stdout, /bootstrap --preset node/);
  assert.match(stdout, /examples\/codex/);
});

test("explain turns a verdict into a teaching note", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "explain",
    "command",
    "git reset --hard"
  ]);

  assert.match(stdout, /Jester explanation: BLOCK/);
  assert.match(stdout, /What this means:/);
  assert.match(stdout, /Destructive git operation/);
  assert.match(stdout, /Do next:/);
});

test("explain supports json output", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "explain",
    "final",
    "--json",
    "Implemented the fix, but tests not run."
  ]);
  const result = JSON.parse(stdout) as {
    review: { verdict: string };
    explanation: string;
  };

  assert.equal(result.review.verdict, "caution");
  assert.match(result.explanation, /Jester explanation: CAUTION/);
});

test("mcp-config can render Claude Code shape", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "mcp-config",
    "--agent",
    "claude",
    "--mode",
    "npx"
  ]);
  const config = JSON.parse(stdout) as {
    "memento-mori-jester": { command: string; args: string[] };
    mcpServers?: unknown;
  };

  assert.equal(config["memento-mori-jester"].command, "npx");
  assert.ok(config["memento-mori-jester"].args.includes("memento-mori-jester@latest"));
  assert.equal(config.mcpServers, undefined);
});

test("policy init writes stricter project config", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-policy-"));
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "policy",
    "init",
    "--level",
    "strict",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    ok: boolean;
    level: string;
    path: string;
  };
  const config = await readFile(join(cwd, "jester.config.json"), "utf8");

  assert.equal(result.ok, true);
  assert.equal(result.level, "strict");
  assert.match(result.path, /jester\.config\.json$/);
  assert.match(config, /policy-secret-added/);
  assert.match(config, /docker system prune -a/);
});

test("policy commands list and show levels", async () => {
  const levels = await execFileAsync(process.execPath, [cliPath, "policy", "levels"]);
  const shown = await execFileAsync(process.execPath, [cliPath, "policy", "show", "team"]);

  assert.match(levels.stdout, /team/);
  assert.match(levels.stdout, /strict/);
  assert.match(shown.stdout, /policy-production-deploy/);
});
