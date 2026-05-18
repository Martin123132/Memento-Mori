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
