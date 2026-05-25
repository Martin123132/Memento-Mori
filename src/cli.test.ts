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
  assert.match(stdout, /playground/);
  assert.match(stdout, /examples\/codex/);
  assert.match(stdout, /github-action/);
  assert.match(stdout, /rules --kind command/);
  assert.match(stdout, /tune risky-domain/);
  assert.match(stdout, /summary/);
});

test("help includes the local playground command", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "--help"
  ]);

  assert.match(stdout, /jester start/);
  assert.match(stdout, /jester playground/);
  assert.match(stdout, /jester setup --agent codex/);
  assert.match(stdout, /jester tune risky-domain/);
  assert.match(stdout, /--port <number>/);
});

test("start prints the guided first-run checklist", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "start"
  ]);

  assert.match(stdout, /Memento Mori Jester start/);
  assert.match(stdout, /npx -y memento-mori-jester@latest doctor/);
  assert.match(stdout, /npx -y memento-mori-jester@latest playground/);
  assert.match(stdout, /npx -y memento-mori-jester@latest setup/);
  assert.match(stdout, /npx -y memento-mori-jester@latest bootstrap --preset node/);
  assert.match(stdout, /npx -y memento-mori-jester@latest config validate/);
  assert.match(stdout, /npx -y memento-mori-jester@latest command "git reset --hard"/);
});

test("start supports preset agent and hook options", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "start",
    "--preset",
    "web",
    "--agent",
    "codex",
    "--hook",
    "pre-commit"
  ]);

  assert.match(stdout, /Preset: web/);
  assert.match(stdout, /Agent: codex/);
  assert.match(stdout, /Hooks: pre-commit/);
  assert.match(stdout, /setup --agent codex/);
  assert.match(stdout, /bootstrap --preset web --hook pre-commit/);
});

test("start supports the ai preset", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "start",
    "--preset",
    "ai",
    "--agent",
    "codex"
  ]);

  assert.match(stdout, /Preset: ai/);
  assert.match(stdout, /setup --agent codex/);
  assert.match(stdout, /bootstrap --preset ai/);
});

test("start supports the api preset", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "start",
    "--preset",
    "api",
    "--agent",
    "codex"
  ]);

  assert.match(stdout, /Preset: api/);
  assert.match(stdout, /setup --agent codex/);
  assert.match(stdout, /bootstrap --preset api/);
});

test("start json returns stable steps", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "start",
    "--json"
  ]);
  const result = JSON.parse(stdout) as {
    mode: string;
    preset: string;
    agent: string | null;
    hooks: string[];
    steps: Array<{
      id: string;
      title: string;
      command: string;
      description: string;
    }>;
  };

  assert.equal(result.mode, "npx");
  assert.equal(result.preset, "node");
  assert.equal(result.agent, null);
  assert.deepEqual(result.hooks, []);
  assert.deepEqual(result.steps.map((step) => step.id), [
    "doctor",
    "playground",
    "agent-setup",
    "bootstrap",
    "validate",
    "sample-review"
  ]);
  assert.ok(result.steps.every((step) => step.title && step.command && step.description));
  assert.match(result.steps.find((step) => step.id === "agent-setup")?.command ?? "", /setup$/);
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
    rules: Array<{
      id: string;
      source: string;
      kinds: string[];
      enabled: boolean;
      guidance: {
        why: string;
        falsePositive: string;
        saferAlternative: string;
        tuning: string;
      };
    }>;
  };

  assert.match(result.configPath ?? "", /jester\.config\.json$/);
  assert.ok(result.rules.some((rule) => rule.id === "blocked-command-deploy-prod" && rule.source === "project-config" && /project config/i.test(rule.guidance.why)));
  assert.ok(result.rules.some((rule) => rule.id === "configured-sensitive-domain-billing" && rule.source === "project-config"));
  assert.ok(result.rules.some((rule) => rule.id === "custom-must-mention-rollback" && rule.kinds.includes("plan") && !rule.enabled && /custom rule/i.test(rule.guidance.why)));
});

test("rules json includes guidance for built-in rules", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "rules",
    "--kind",
    "command",
    "--json",
    "--no-config"
  ]);
  const result = JSON.parse(stdout) as {
    rules: Array<{
      id: string;
      guidance: {
        why: string;
        falsePositive: string;
        saferAlternative: string;
        tuning: string;
      };
    }>;
  };
  const destructiveGitRule = result.rules.find((rule) => rule.id === "destructive-git-history");

  assert.ok(destructiveGitRule);
  assert.match(destructiveGitRule.guidance.why, /discard work/);
  assert.match(destructiveGitRule.guidance.falsePositive, /throwaway checkout/);
  assert.match(destructiveGitRule.guidance.saferAlternative, /git status/);
  assert.match(destructiveGitRule.guidance.tuning, /disable-rule destructive-git-history/);
});

test("tune explains safe muting for a noisy built-in rule", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "tune",
    "risky-domain",
    "--no-config"
  ]);

  assert.match(stdout, /Memento Mori Jester tuning advice/);
  assert.match(stdout, /Rule: risky-domain \[enabled\]/);
  assert.match(stdout, /When it may be noisy/);
  assert.match(stdout, /docs, release notes, or rule text/);
  assert.match(stdout, /Before muting/);
  assert.match(stdout, /jester config disable-rule risky-domain/);
  assert.match(stdout, /jester config enable-rule risky-domain/);
});

test("tune supports json output with stable commands", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "tune",
    "console-log",
    "--json",
    "--no-config"
  ]);
  const result = JSON.parse(stdout) as {
    ruleId: string;
    title: string;
    enabled: boolean;
    severity: number;
    source: string;
    kinds: string[];
    matcher: string;
    configPath: string | null;
    guidance: {
      why: string;
      falsePositive: string;
      saferAlternative: string;
      tuning: string;
    };
    recommendation: string;
    checksBeforeMuting: string[];
    commands: {
      inspect: string;
      disable: string;
      enable: string;
      validate: string;
      list: string;
    };
  };

  assert.deepEqual(Object.keys(result), [
    "ruleId",
    "title",
    "enabled",
    "severity",
    "source",
    "kinds",
    "matcher",
    "configPath",
    "guidance",
    "recommendation",
    "checksBeforeMuting",
    "commands"
  ]);
  assert.equal(result.ruleId, "console-log");
  assert.equal(result.enabled, true);
  assert.equal(result.commands.disable, "jester config disable-rule console-log");
  assert.equal(result.commands.enable, "jester config enable-rule console-log");
  assert.match(result.guidance.falsePositive, /scripts, CLIs, examples/);
});

test("tune reports disabled and project-config rules", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-tune-config-"));
  await writeFile(join(cwd, "jester.config.json"), `${JSON.stringify({
    disabledRules: ["console-log"],
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
  const disabled = await execFileAsync(process.execPath, [
    cliPath,
    "tune",
    "console-log"
  ], { cwd });
  const custom = await execFileAsync(process.execPath, [
    cliPath,
    "tune",
    "custom-must-mention-rollback",
    "--json"
  ], { cwd });
  const customResult = JSON.parse(custom.stdout) as {
    source: string;
    configPath: string | null;
    recommendation: string;
  };

  assert.match(disabled.stdout, /Rule: console-log \[disabled\]/);
  assert.match(disabled.stdout, /already disabled/);
  assert.equal(customResult.source, "project-config");
  assert.match(customResult.configPath ?? "", /jester\.config\.json$/);
  assert.match(customResult.recommendation, /narrow jester\.config\.json/);
});

test("summary prints rule hit counts and next tuning commands", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "summary",
    "--kind",
    "command",
    "git reset --hard"
  ]);

  assert.match(stdout, /Memento Mori Jester summary/);
  assert.match(stdout, /Verdict: BLOCK/);
  assert.match(stdout, /Rules hit:/);
  assert.match(stdout, /destructive-git-history: 1 hit/);
  assert.match(stdout, /Highest severity:/);
  assert.match(stdout, /jester tune destructive-git-history/);
  assert.match(stdout, /jester rule destructive-git-history/);
});

test("summary supports json output with stable rule hits", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "summary",
    "--kind",
    "plan",
    "--json",
    "I will just refactor auth and ship it"
  ]);
  const result = JSON.parse(stdout) as {
    kind: string;
    subject: string;
    verdict: string;
    riskScore: number;
    issueCount: number;
    ruleHits: Array<{
      ruleId: string;
      count: number;
      severity: number;
      title: string;
      suggestedCheck: string;
    }>;
    highestSeverity: {
      ruleId: string;
      severity: number;
      title: string;
    } | null;
    suggestedNext: string[];
    configPath: string | null;
  };

  assert.deepEqual(Object.keys(result), [
    "kind",
    "subject",
    "verdict",
    "riskScore",
    "issueCount",
    "ruleHits",
    "highestSeverity",
    "suggestedNext",
    "configPath"
  ]);
  assert.equal(result.kind, "plan");
  assert.ok(result.issueCount > 0);
  assert.ok(result.ruleHits.some((hit) => hit.ruleId === "risky-domain" && hit.count >= 1));
  assert.ok(result.highestSeverity);
  assert.ok(result.suggestedNext.some((command) => command.startsWith("jester tune ")));
});

test("summary reports a quiet review without tuning commands", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "summary",
    "--kind",
    "final",
    "Updated README wording. Verified with npm test."
  ]);

  assert.match(stdout, /Verdict: PASS/);
  assert.match(stdout, /Issues: 0/);
  assert.match(stdout, /Rules hit:\n- none/);
  assert.match(stdout, /No rule tuning needed/);
});

test("config can disable and enable rules", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-rules-"));
  const disabled = await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "disable-rule",
    "destructive-git-history",
    "--json"
  ], { cwd });
  const disabledResult = JSON.parse(disabled.stdout) as {
    changed: boolean;
    disabledRules: string[];
  };

  assert.equal(disabledResult.changed, true);
  assert.deepEqual(disabledResult.disabledRules, ["destructive-git-history"]);

  await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "disable-rule",
    "destructive-git-history",
    "--json"
  ], { cwd });
  const configAfterSecondDisable = JSON.parse(await readFile(join(cwd, "jester.config.json"), "utf8")) as {
    disabledRules: string[];
  };

  assert.deepEqual(configAfterSecondDisable.disabledRules, ["destructive-git-history"]);

  const disabledReview = await execFileAsync(process.execPath, [
    cliPath,
    "command",
    "git reset --hard",
    "--json"
  ], { cwd });
  const disabledReviewResult = JSON.parse(disabledReview.stdout) as { verdict: string };

  assert.equal(disabledReviewResult.verdict, "pass");

  const enabled = await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "enable-rule",
    "destructive-git-history",
    "--json"
  ], { cwd });
  const enabledResult = JSON.parse(enabled.stdout) as {
    changed: boolean;
    disabledRules: string[];
  };

  assert.equal(enabledResult.changed, true);
  assert.deepEqual(enabledResult.disabledRules, []);

  const enabledReview = await execFileAsync(process.execPath, [
    cliPath,
    "command",
    "git reset --hard",
    "--json"
  ], { cwd });
  const enabledReviewResult = JSON.parse(enabledReview.stdout) as { verdict: string };

  assert.equal(enabledReviewResult.verdict, "block");
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
  assert.match(stdout, /Why: .*discard work/);
  assert.match(stdout, /False positives: .*throwaway checkout/);
  assert.match(stdout, /Safer move: .*git status/);
  assert.match(stdout, /Tune: .*disable-rule destructive-git-history/);
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

test("setup chooser lists supported agents", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "setup",
    "--mode",
    "npx"
  ]);

  assert.match(stdout, /Memento Mori Jester agent setup/);
  assert.match(stdout, /Codex/);
  assert.match(stdout, /Claude Code/);
  assert.match(stdout, /Generic MCP client/);
  assert.match(stdout, /AGENTS\.md/);
  assert.match(stdout, /CLAUDE\.md/);
  assert.match(stdout, /mcpServers/);
});

test("setup json can render exact Claude Code setup", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "setup",
    "--agent",
    "claude",
    "--mode",
    "npx",
    "--json"
  ]);
  const result = JSON.parse(stdout) as {
    agents: Array<{
      agent: string;
      instructionFile: string;
      mcpConfig: {
        "memento-mori-jester": { command: string; args: string[] };
        mcpServers?: unknown;
      };
      commands: string[];
    }>;
  };

  assert.equal(result.agents.length, 1);
  assert.equal(result.agents[0]?.agent, "claude");
  assert.equal(result.agents[0]?.instructionFile, "CLAUDE.md");
  assert.equal(result.agents[0]?.mcpConfig["memento-mori-jester"].command, "npx");
  assert.ok(result.agents[0]?.mcpConfig["memento-mori-jester"].args.includes("memento-mori-jester@latest"));
  assert.equal(result.agents[0]?.mcpConfig.mcpServers, undefined);
  assert.ok(result.agents[0]?.commands.some((command) => command.includes("playground")));
});

test("config presets includes web and infra", async () => {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, "config", "presets"]);

  assert.match(stdout, /^web$/m);
  assert.match(stdout, /^api$/m);
  assert.match(stdout, /^infra$/m);
  assert.match(stdout, /^ai$/m);
});

test("config init can write web and infra presets", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-preset-config-"));

  await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "init",
    "--preset",
    "api",
    "--path",
    "jester-api.config.json"
  ], { cwd });
  await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "init",
    "--preset",
    "web",
    "--path",
    "jester-web.config.json"
  ], { cwd });
  await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "init",
    "--preset",
    "infra",
    "--path",
    "jester-infra.config.json"
  ], { cwd });
  await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "init",
    "--preset",
    "ai",
    "--path",
    "jester-ai.config.json"
  ], { cwd });

  const web = await readFile(join(cwd, "jester-web.config.json"), "utf8");
  const api = await readFile(join(cwd, "jester-api.config.json"), "utf8");
  const infra = await readFile(join(cwd, "jester-infra.config.json"), "utf8");
  const ai = await readFile(join(cwd, "jester-ai.config.json"), "utf8");

  assert.match(web, /web-public-secret-name/);
  assert.match(api, /api-raw-sql-user-input/);
  assert.match(infra, /terraform destroy/);
  assert.match(ai, /ai-public-provider-key/);
});

test("config recommend prints preset reasons and next commands", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-cli-"));
  await writeFile(join(cwd, "package.json"), "{}\n", "utf8");
  await writeFile(join(cwd, "package-lock.json"), "{}\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "recommend"
  ], { cwd });

  assert.match(stdout, /Recommended preset: node/);
  assert.match(stdout, /Detected stack: Node\.js \+ npm/);
  assert.match(stdout, /Found package\.json/);
  assert.match(stdout, /jester start --preset node/);
  assert.match(stdout, /jester config init --preset node/);
  assert.match(stdout, /jester bootstrap --preset node/);
});

test("config recommend json returns stable keys and candidate scores", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-json-"));
  await writeFile(join(cwd, "openapi.yaml"), "openapi: 3.1.0\n", "utf8");
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "recommend",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    recommendedPreset: string;
    confidence: string;
    reasons: string[];
    detectedStacks: string[];
    candidates: Array<{ preset: string; score: number; reasons: string[]; detectedStacks: string[] }>;
    configPath: string | null;
  };

  assert.deepEqual(Object.keys(result), ["recommendedPreset", "confidence", "reasons", "detectedStacks", "candidates", "configPath"]);
  assert.equal(result.recommendedPreset, "api");
  assert.equal(result.confidence, "high");
  assert.ok(result.detectedStacks.includes("OpenAPI"));
  assert.equal(result.configPath, null);
  assert.ok(result.candidates.some((candidate) => candidate.preset === "api" && candidate.score >= 5 && candidate.detectedStacks.includes("OpenAPI")));
});

test("config recommend reports existing config path without changing recommendation", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-existing-"));
  await writeFile(join(cwd, "package.json"), "{}\n", "utf8");
  await writeFile(join(cwd, "jester.config.json"), JSON.stringify({ riskTolerance: "low" }), "utf8");

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "config",
    "recommend",
    "--json"
  ], { cwd });
  const result = JSON.parse(stdout) as {
    recommendedPreset: string;
    configPath: string | null;
  };

  assert.equal(result.recommendedPreset, "node");
  assert.match(result.configPath ?? "", /jester\.config\.json$/);
});

test("help and unknown config command mention recommend", async () => {
  const help = await execFileAsync(process.execPath, [cliPath, "--help"]);
  assert.match(help.stdout, /jester config recommend/);

  await assert.rejects(
    () => execFileAsync(process.execPath, [cliPath, "config", "nonsense"]),
    (error: unknown) => {
      const failure = error as { stderr?: string; message?: string };
      assert.match(`${failure.stderr ?? ""}${failure.message ?? ""}`, /jester config recommend/);
      return true;
    }
  );
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
