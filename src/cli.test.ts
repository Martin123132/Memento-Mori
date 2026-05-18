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
  assert.match(stdout, /github-action/);
  assert.match(stdout, /rules --kind command/);
});

test("rules lists built-in and structural checks", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "rules",
    "--kind",
    "plan",
    "--no-config"
  ]);

  assert.match(stdout, /Memento Mori Jester rules/);
  assert.match(stdout, /Built-in checks/);
  assert.match(stdout, /destructive-git-history/);
  assert.match(stdout, /Structural checks/);
  assert.match(stdout, /missing-verification-step/);
});

test("rules supports json output and project config rules", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-rules-"));
  await writeFile(join(cwd, "jester.config.json"), `${JSON.stringify({
    blockedCommands: ["deploy-prod"],
    sensitiveDomains: ["billing"],
    disabledRules: ["custom-must-mention-rollback"],
    customRules: [
      {
        id: "must-mention-rollback",
        pattern: "rollback",
        severity: 3,
        title: "Rollback mentioned",
        kinds: ["plan"]
      }
    ]
  }, null, 2)}\n`, "utf8");

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "rules",
    "--kind",
    "plan",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    configPath?: string;
    rules: Array<{ id: string; source: string; kinds: string[]; enabled: boolean }>;
  };

  assert.match(result.configPath ?? "", /jester\.config\.json$/);
  assert.ok(result.rules.some((rule) => rule.id === "blocked-command-deploy-prod" && rule.source === "project-config"));
  assert.ok(result.rules.some((rule) => rule.id === "configured-sensitive-domain-billing" && rule.source === "project-config"));
  assert.ok(result.rules.some((rule) => rule.id === "custom-must-mention-rollback" && rule.kinds.includes("plan") && !rule.enabled));
});

test("rule shows one rule with matcher detail", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-rule-"));
  await writeFile(join(cwd, "jester.config.json"), `${JSON.stringify({
    disabledRules: ["destructive-git-history"]
  }, null, 2)}\n`, "utf8");
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "rule",
    "destructive-git-history"
  ], { cwd });

  assert.match(stdout, /Memento Mori Jester rule: destructive-git-history/);
  assert.match(stdout, /\[disabled\]/);
  assert.match(stdout, /Pattern:/);
  assert.doesNotMatch(stdout, /pipe-to-shell/);
});

test("github-action prints a SARIF code scanning workflow", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "github-action",
    "--fail-on",
    "caution",
    "--subject",
    "AI agent diff",
    "--ref",
    "v0.1.10"
  ]);

  assert.match(stdout, /name: Memento Mori Jester/);
  assert.match(stdout, /format: sarif/);
  assert.match(stdout, /output-file: jester\.sarif/);
  assert.match(stdout, /fail-on: caution/);
  assert.match(stdout, /subject: 'AI agent diff'/);
  assert.match(stdout, /Martin123132\/Memento-Mori@v0\.1\.10/);
  assert.match(stdout, /github\/codeql-action\/upload-sarif@v3/);
});

test("github-action can write a workflow file", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-github-action-"));
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "github-action",
    "--write",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    ok: boolean;
    changed: boolean;
    path: string;
  };
  const workflow = await readFile(join(cwd, ".github", "workflows", "memento-mori.yml"), "utf8");

  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.match(result.path, /memento-mori\.yml$/);
  assert.match(workflow, /Jester SARIF review/);
  assert.match(workflow, /security-events: write/);
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

test("sarif output renders review issues", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "command",
    "git reset --hard",
    "--sarif"
  ]);
  const sarif = JSON.parse(stdout) as {
    version: string;
    runs: Array<{
      tool: { driver: { rules: Array<{ id: string }> } };
      results: Array<{ ruleId: string; level: string }>;
    }>;
  };

  assert.equal(sarif.version, "2.1.0");
  assert.equal(sarif.runs[0]?.results[0]?.ruleId, "destructive-git-history");
  assert.equal(sarif.runs[0]?.results[0]?.level, "error");
  assert.ok(sarif.runs[0]?.tool.driver.rules.some((rule) => rule.id === "destructive-git-history"));
});

test("sarif output still honors fail-on exit codes", async () => {
  await assert.rejects(
    () => execFileAsync(process.execPath, [
      cliPath,
      "command",
      "git reset --hard",
      "--sarif",
      "--fail-on",
      "block"
    ]),
    (error: unknown) => {
      const failed = error as { code?: number; stdout?: string };
      assert.equal(failed.code, 2);
      assert.match(failed.stdout ?? "", /destructive-git-history/);
      return true;
    }
  );
});
