#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import {
  configPresetNames,
  defaultUserConfig,
  findConfigPath,
  loadConfig,
  policyLevelNames,
  recommendConfigPreset,
  userConfigForPolicy,
  validateConfig,
  writeDefaultConfig,
  writePolicyConfig,
  type ConfigPreset,
  type PresetRecommendation,
  type PolicyLevel
} from "./config.js";
import { listRules, review, reviewCommand, type RuleCatalogEntry } from "./core.js";
import { formatReview } from "./format.js";
import {
  hookNames,
  hookStatus,
  installHook,
  isHookName,
  shellCommandPrefixForLocalCli,
  shellQuote,
  uninstallHook,
  type HookName
} from "./hooks.js";
import { playgroundHost, playgroundPortDefault, startPlaygroundServer } from "./playground.js";
import { formatSarif } from "./sarif.js";
import { type HookFailOn, type ReviewInput, type ReviewKind, type ReviewResult, reviewKinds, type RiskTolerance, type Tone, tones } from "./types.js";

const packageSpecDefault = "memento-mori-jester@latest";

type CliOptions = {
  kind?: ReviewKind;
  tone?: Tone;
  intensity?: number;
  riskTolerance?: RiskTolerance;
  json: boolean;
  failOn?: "caution" | "block";
  subject?: string;
  context?: string;
  file?: string;
  configPath?: string;
  noConfig: boolean;
  sarif: boolean;
};

type SetupMode = "npx" | "global" | "local";
type AgentTarget = "generic" | "claude" | "codex";

type SetupOptions = {
  mode: SetupMode;
  agent: AgentTarget;
  packageSpec: string;
  tone: Tone;
  intensity: number;
  riskTolerance: RiskTolerance;
  json: boolean;
};

type AgentSetupOptions = SetupOptions & {
  all: boolean;
};

type AgentSetupProfile = {
  agent: AgentTarget;
  label: string;
  instructionFile: string;
  configTarget: string;
  docsPath: string;
};

type ConfigCommandOptions = {
  json: boolean;
  force: boolean;
  path?: string;
  configPath?: string;
  noConfig: boolean;
  preset: ConfigPreset;
  ruleId?: string;
};

type PolicyCommandOptions = {
  json: boolean;
  force: boolean;
  path?: string;
  level: PolicyLevel;
};

type RulesCommandOptions = {
  json: boolean;
  kind?: ReviewKind;
  id?: string;
  configPath?: string;
  noConfig: boolean;
};

type TuneCommandOptions = {
  json: boolean;
  id?: string;
  configPath?: string;
  noConfig: boolean;
};

type SummaryRuleHit = {
  ruleId: string;
  count: number;
  severity: ReviewResult["issues"][number]["severity"];
  title: string;
  suggestedCheck: string;
};

type ReviewSummary = {
  kind: ReviewKind;
  subject: string;
  verdict: ReviewResult["verdict"];
  riskScore: number;
  issueCount: number;
  ruleHits: SummaryRuleHit[];
  highestSeverity: SummaryRuleHit | null;
  suggestedNext: string[];
  configPath: string | null;
};

type HookCommandOptions = {
  hook: HookName;
  setup: SetupOptions;
  failOn?: HookFailOn;
  force: boolean;
  configPath?: string;
  noConfig: boolean;
};

type BootstrapOptions = SetupOptions & {
  preset: ConfigPreset;
  force: boolean;
  hooks: HookName[];
};

type StartOptions = {
  mode: SetupMode;
  packageSpec: string;
  preset: ConfigPreset;
  agent?: AgentTarget;
  hooks: HookName[];
  json: boolean;
};

type StartStep = {
  id: "doctor" | "playground" | "agent-setup" | "bootstrap" | "validate" | "sample-review";
  title: string;
  command: string;
  description: string;
};

type BootstrapFileResult = {
  path: string;
  changed: boolean;
  message: string;
};

type GithubActionOptions = {
  json: boolean;
  write: boolean;
  force: boolean;
  path: string;
  failOn: HookFailOn;
  subject: string;
  actionRef: string;
};

type PlaygroundCommandOptions = {
  json: boolean;
  port: number;
  configPath?: string;
  noConfig: boolean;
};

const agentSetupProfiles: Record<AgentTarget, AgentSetupProfile> = {
  codex: {
    agent: "codex",
    label: "Codex",
    instructionFile: "AGENTS.md",
    configTarget: "Codex MCP config",
    docsPath: "docs/CODEX.md"
  },
  claude: {
    agent: "claude",
    label: "Claude Code",
    instructionFile: "CLAUDE.md",
    configTarget: "Claude Code MCP config",
    docsPath: "docs/CLAUDE_CODE.md"
  },
  generic: {
    agent: "generic",
    label: "Generic MCP client",
    instructionFile: "agent instructions",
    configTarget: "standard mcpServers config",
    docsPath: "docs/AGENTS.md"
  }
};

const agentInstruction = "Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.";

const githubActionWorkflowPathDefault = ".github/workflows/memento-mori.yml";

const args = process.argv.slice(2);

main(args).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main(argv: string[]): Promise<void> {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    output.write(helpText());
    return;
  }

  if (argv[0] === "mcp-server") {
    await import("./server.js");
    return;
  }

  if (argv[0] === "mcp-config") {
    const setupOptions = parseSetupOptions(argv.slice(1));
    output.write(`${JSON.stringify(mcpConfigSnippet(setupOptions), null, 2)}\n`);
    return;
  }

  if (argv[0] === "start") {
    const startOptions = parseStartOptions(argv.slice(1));
    output.write(renderStart(startOptions));
    return;
  }

  if (argv[0] === "setup") {
    const setupOptions = parseAgentSetupOptions(argv.slice(1));
    output.write(renderAgentSetup(setupOptions));
    return;
  }

  if (argv[0] === "init") {
    const setupOptions = parseSetupOptions(argv.slice(1));
    output.write(renderInit(setupOptions));
    return;
  }

  if (argv[0] === "bootstrap") {
    output.write(await handleBootstrap(argv.slice(1)));
    return;
  }

  if (argv[0] === "examples") {
    const setupOptions = parseSetupOptions(argv.slice(1));
    output.write(renderExamples(setupOptions));
    return;
  }

  if (argv[0] === "rules" || argv[0] === "rule") {
    output.write(await handleRulesCommand(argv[0], argv.slice(1)));
    return;
  }

  if (argv[0] === "tune") {
    output.write(await handleTuneCommand(argv.slice(1)));
    return;
  }

  if (argv[0] === "summary") {
    output.write(await handleSummaryCommand(argv.slice(1)));
    return;
  }

  if (argv[0] === "github-action") {
    output.write(await handleGithubAction(argv.slice(1)));
    return;
  }

  if (argv[0] === "explain") {
    output.write(await handleExplain(argv.slice(1)));
    return;
  }

  if (argv[0] === "config") {
    output.write(await handleConfigCommand(argv.slice(1)));
    return;
  }

  if (argv[0] === "policy") {
    output.write(await handlePolicyCommand(argv.slice(1)));
    return;
  }

  if (argv[0] === "doctor") {
    const doctorOptions = parseConfigCommandOptions(argv.slice(1));
    const result = await renderDoctor(doctorOptions);
    output.write(result.text);
    if (!result.ok) {
      process.exitCode = 1;
    }
    return;
  }

  if (argv[0] === "playground") {
    await handlePlayground(argv.slice(1));
    return;
  }

  if (argv[0] === "install-hook") {
    const result = await handleInstallHook(argv.slice(1));
    output.write(`${result.message}\n`);
    return;
  }

  if (argv[0] === "uninstall-hook") {
    const result = await handleUninstallHook(argv.slice(1));
    output.write(`${result.message}\n`);
    return;
  }

  if (argv[0] === "hook-status") {
    output.write(await renderHookStatus());
    return;
  }

  const { command, rest } = splitCommand(argv);
  const options = parseOptions(rest);
  const kind = resolveKind(command, options.kind);
  const content = await resolveContent(options, rest);

  if (!content.trim()) {
    throw new Error("Nothing to review. Pass text, use --file, or pipe content on stdin.");
  }

  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });

  const inputForReview: ReviewInput = {
    kind,
    content,
    subject: options.subject,
    context: options.context,
    tone: options.tone,
    intensity: options.intensity,
    riskTolerance: options.riskTolerance,
    config: loadedConfig.config
  };
  const result = review(inputForReview);

  if (options.sarif) {
    output.write(formatSarif(result, { content }));
  } else {
    output.write(options.json ? `${JSON.stringify(result, null, 2)}\n` : `${formatReview(result)}\n`);
  }

  if (options.failOn === "block" && result.verdict === "block") {
    process.exitCode = 2;
  } else if (options.failOn === "caution" && result.verdict !== "pass") {
    process.exitCode = result.verdict === "block" ? 2 : 1;
  }
}

function splitCommand(argv: string[]): { command: string; rest: string[] } {
  const [first, ...rest] = argv;
  if (reviewKinds.includes(first as ReviewKind) || first === "review") {
    return { command: first, rest };
  }

  return { command: "review", rest: argv };
}

function resolveKind(command: string, optionKind?: ReviewKind): ReviewKind {
  if (command !== "review" && reviewKinds.includes(command as ReviewKind)) {
    return command as ReviewKind;
  }

  return optionKind ?? "plan";
}

function parseOptions(argv: string[]): CliOptions {
  const options: CliOptions = { json: false, noConfig: false, sarif: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--sarif") {
      options.sarif = true;
    } else if (arg === "--kind") {
      options.kind = parseKind(requireValue(arg, next));
      index += 1;
    } else if (arg === "--tone") {
      options.tone = parseTone(requireValue(arg, next));
      index += 1;
    } else if (arg === "--intensity") {
      options.intensity = Number.parseInt(requireValue(arg, next), 10);
      index += 1;
    } else if (arg === "--risk") {
      options.riskTolerance = parseRisk(requireValue(arg, next));
      index += 1;
    } else if (arg === "--fail-on") {
      options.failOn = parseFailOn(requireValue(arg, next));
      index += 1;
    } else if (arg === "--subject") {
      options.subject = requireValue(arg, next);
      index += 1;
    } else if (arg === "--context") {
      options.context = requireValue(arg, next);
      index += 1;
    } else if (arg === "--file") {
      options.file = requireValue(arg, next);
      index += 1;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      options.noConfig = true;
    }
  }

  return options;
}

function parseConfigCommandOptions(argv: string[]): ConfigCommandOptions {
  const options: ConfigCommandOptions = {
    json: false,
    force: false,
    noConfig: false,
    preset: "default"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--path") {
      options.path = requireValue(arg, next);
      index += 1;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      options.noConfig = true;
    } else if (arg === "--preset") {
      options.preset = parseConfigPreset(requireValue(arg, next));
      index += 1;
    } else if (!arg.startsWith("--") && !options.ruleId) {
      options.ruleId = arg;
    }
  }

  return options;
}

function parsePolicyCommandOptions(argv: string[]): PolicyCommandOptions {
  const options: PolicyCommandOptions = {
    json: false,
    force: false,
    level: "team"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--path") {
      options.path = requireValue(arg, next);
      index += 1;
    } else if (arg === "--level") {
      options.level = parsePolicyLevel(requireValue(arg, next));
      index += 1;
    } else if (!arg.startsWith("--") && isPolicyLevel(arg)) {
      options.level = arg;
    }
  }

  return options;
}

function parseRulesCommandOptions(command: "rules" | "rule", argv: string[]): RulesCommandOptions {
  const options: RulesCommandOptions = {
    json: false,
    noConfig: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--kind") {
      options.kind = parseKind(requireValue(arg, next));
      index += 1;
    } else if (arg === "--id") {
      options.id = requireValue(arg, next);
      index += 1;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      options.noConfig = true;
    } else if (!arg.startsWith("--") && !options.id) {
      options.id = arg;
    }
  }

  if (command === "rule" && !options.id) {
    throw new Error('Missing rule id. Use "jester rule <id>" or "jester rules --id <id>".');
  }

  return options;
}

function parseTuneCommandOptions(argv: string[]): TuneCommandOptions {
  const options: TuneCommandOptions = {
    json: false,
    noConfig: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--id") {
      options.id = requireValue(arg, next);
      index += 1;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      options.noConfig = true;
    } else if (!arg.startsWith("--") && !options.id) {
      options.id = arg;
    }
  }

  if (!options.id) {
    throw new Error('Missing rule id. Use "jester tune <rule-id>".');
  }

  return options;
}

function parseGithubActionOptions(argv: string[]): GithubActionOptions {
  const options: GithubActionOptions = {
    json: false,
    write: false,
    force: false,
    path: githubActionWorkflowPathDefault,
    failOn: "block",
    subject: "pull request diff",
    actionRef: "main"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--write") {
      options.write = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--path") {
      options.path = requireValue(arg, next);
      index += 1;
    } else if (arg === "--fail-on") {
      options.failOn = parseFailOn(requireValue(arg, next));
      index += 1;
    } else if (arg === "--subject") {
      options.subject = requireValue(arg, next);
      index += 1;
    } else if (arg === "--ref" || arg === "--action-ref") {
      options.actionRef = requireValue(arg, next);
      index += 1;
    }
  }

  return options;
}

function parsePlaygroundOptions(argv: string[]): PlaygroundCommandOptions {
  const options: PlaygroundCommandOptions = {
    json: false,
    port: playgroundPortDefault,
    noConfig: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--port") {
      options.port = parsePort(requireValue(arg, next));
      index += 1;
    } else if (arg === "--config") {
      options.configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      options.noConfig = true;
    }
  }

  return options;
}

function parseStartOptions(argv: string[]): StartOptions {
  let mode: SetupMode = "npx";
  let packageSpec = packageSpecDefault;
  let preset: ConfigPreset = "node";
  let agent: AgentTarget | undefined;
  const hooks: HookName[] = [];
  let json = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      json = true;
    } else if (arg === "--mode") {
      mode = parseSetupMode(requireValue(arg, next));
      index += 1;
    } else if (arg === "--package") {
      packageSpec = requireValue(arg, next);
      index += 1;
    } else if (arg === "--preset") {
      preset = parseConfigPreset(requireValue(arg, next));
      index += 1;
    } else if (arg === "--agent") {
      agent = parseAgent(requireValue(arg, next));
      index += 1;
    } else if (arg === "--hook") {
      const hook = requireValue(arg, next);
      if (!isHookName(hook)) {
        throw new Error(`Unknown hook "${hook}". Use one of: ${hookNames.join(", ")}`);
      }
      hooks.push(hook);
      index += 1;
    } else if (!arg.startsWith("--")) {
      if (isSetupMode(arg)) {
        mode = arg;
      } else if (isAgent(arg)) {
        agent = arg;
      } else if (configPresetNames.includes(arg as ConfigPreset)) {
        preset = arg as ConfigPreset;
      }
    }
  }

  return {
    mode,
    packageSpec,
    preset,
    agent,
    hooks: [...new Set(hooks)],
    json
  };
}

function parseSetupOptions(argv: string[]): SetupOptions {
  const options: SetupOptions = {
    mode: "npx",
    agent: "generic",
    packageSpec: packageSpecDefault,
    tone: "court_jester",
    intensity: 3,
    riskTolerance: "medium",
    json: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
    } else if (arg === "--mode") {
      options.mode = parseSetupMode(requireValue(arg, next));
      index += 1;
    } else if (arg === "--agent") {
      options.agent = parseAgent(requireValue(arg, next));
      index += 1;
    } else if (arg === "--package") {
      options.packageSpec = requireValue(arg, next);
      index += 1;
    } else if (arg === "--tone") {
      options.tone = parseTone(requireValue(arg, next));
      index += 1;
    } else if (arg === "--intensity") {
      options.intensity = Number.parseInt(requireValue(arg, next), 10);
      index += 1;
    } else if (arg === "--risk") {
      options.riskTolerance = parseRisk(requireValue(arg, next));
      index += 1;
    } else if (!arg.startsWith("--")) {
      if (isSetupMode(arg)) {
        options.mode = arg;
      } else if (isAgent(arg)) {
        options.agent = arg;
      }
    }
  }

  return options;
}

function parseAgentSetupOptions(argv: string[]): AgentSetupOptions {
  const setup = parseSetupOptions(argv);
  const requestedAgent = argv.some((arg, index) => arg === "--agent" || (index > 0 && argv[index - 1] === "--agent") || isAgent(arg));
  const all = argv.includes("--all") || !requestedAgent;

  return {
    ...setup,
    all
  };
}

async function resolveContent(options: CliOptions, argv: string[]): Promise<string> {
  if (options.file) {
    return readFile(options.file, "utf8");
  }

  const positional = collectPositional(argv);
  if (positional.length > 0) {
    return positional.join(" ");
  }

  if (!input.isTTY) {
    return readStdin();
  }

  return "";
}

function collectPositional(argv: string[]): string[] {
  const positional: string[] = [];
  let afterSeparator = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      afterSeparator = true;
      continue;
    }

    if (!afterSeparator && isKnownOption(arg)) {
      index += optionHasValue(arg) ? 1 : 0;
      continue;
    }

    positional.push(arg);
  }

  return positional;
}

function optionHasValue(arg: string): boolean {
  return ["--kind", "--tone", "--intensity", "--risk", "--fail-on", "--subject", "--context", "--file", "--config", "--path", "--preset", "--level", "--port"].includes(arg);
}

function isKnownOption(arg: string): boolean {
  return optionHasValue(arg) || ["--json", "--sarif", "--no-config", "--force"].includes(arg);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    input.setEncoding("utf8");
    input.on("data", (chunk: string) => {
      data += chunk;
    });
    input.on("end", () => resolve(data));
    input.on("error", reject);
  });
}

function parseKind(value: string): ReviewKind {
  if (reviewKinds.includes(value as ReviewKind)) {
    return value as ReviewKind;
  }

  throw new Error(`Unknown review kind "${value}". Use one of: ${reviewKinds.join(", ")}`);
}

function parseTone(value: string): Tone {
  if (tones.includes(value as Tone)) {
    return value as Tone;
  }

  throw new Error(`Unknown tone "${value}". Use one of: ${tones.join(", ")}`);
}

function parseRisk(value: string): RiskTolerance {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  throw new Error('Unknown risk tolerance. Use "low", "medium", or "high".');
}

function parseFailOn(value: string): HookFailOn {
  if (value === "caution" || value === "block") {
    return value;
  }

  throw new Error('Unknown fail threshold. Use "caution" or "block".');
}

function parsePort(value: string): number {
  const port = Number.parseInt(value, 10);

  if (Number.isInteger(port) && port >= 0 && port <= 65535) {
    return port;
  }

  throw new Error("Unknown playground port. Use a number from 0 to 65535.");
}

function parseConfigPreset(value: string): ConfigPreset {
  if (configPresetNames.includes(value as ConfigPreset)) {
    return value as ConfigPreset;
  }

  throw new Error(`Unknown config preset "${value}". Use one of: ${configPresetNames.join(", ")}`);
}

function parsePolicyLevel(value: string): PolicyLevel {
  if (isPolicyLevel(value)) {
    return value;
  }

  throw new Error(`Unknown policy level "${value}". Use one of: ${policyLevelNames.join(", ")}`);
}

function isPolicyLevel(value: string): value is PolicyLevel {
  return policyLevelNames.includes(value as PolicyLevel);
}

function parseSetupMode(value: string): SetupMode {
  if (isSetupMode(value)) {
    return value;
  }

  throw new Error('Unknown setup mode. Use "npx", "global", or "local".');
}

function isSetupMode(value: string): value is SetupMode {
  return value === "npx" || value === "global" || value === "local";
}

function parseAgent(value: string): AgentTarget {
  if (isAgent(value)) {
    return value;
  }

  throw new Error('Unknown agent target. Use "generic", "claude", or "codex".');
}

function isAgent(value: string): value is AgentTarget {
  return value === "generic" || value === "claude" || value === "codex";
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function mcpConfigSnippet(options: SetupOptions): Record<string, unknown> {
  const spec = mcpCommandSpec(options);

  if (options.agent === "claude") {
    return {
      "memento-mori-jester": spec
    };
  }

  return {
    mcpServers: {
      "memento-mori-jester": spec
    }
  };
}

function mcpCommandSpec(options: SetupOptions): { command: string; args: string[] } {
  if (options.mode === "local") {
    return {
      command: "node",
      args: [serverPath()]
    };
  }

  if (options.mode === "global") {
    return {
      command: "memento-mori-jester-mcp",
      args: []
    };
  }

  return {
    command: "npx",
    args: ["-y", options.packageSpec, "mcp-server"]
  };
}

function serverPath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "server.js");
}

function cliPath(): string {
  return fileURLToPath(import.meta.url);
}

function renderStart(options: StartOptions): string {
  const steps = startSteps(options);
  const result = {
    mode: options.mode,
    preset: options.preset,
    agent: options.agent ?? null,
    hooks: options.hooks,
    steps
  };

  if (options.json) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  const lines = [
    "Memento Mori Jester start",
    "",
    `Mode: ${options.mode}`,
    `Preset: ${options.preset}`,
    `Agent: ${options.agent ?? "choose later"}`,
    `Hooks: ${options.hooks.length > 0 ? options.hooks.join(", ") : "none"}`,
    "",
    "Run these in order:"
  ];

  steps.forEach((step, index) => {
    lines.push(
      "",
      `${index + 1}. ${step.title}`,
      `   ${step.description}`,
      `   ${step.command}`
    );
  });

  lines.push("");
  return `${lines.join("\n")}\n`;
}

function startSteps(options: StartOptions): StartStep[] {
  const cliCommand = renderCliCommand(startSetupOptions(options.agent ?? "generic", options));
  const modeFlag = options.mode === "npx" ? "" : ` --mode ${options.mode}`;
  const agentSetupCommand = options.agent
    ? `${cliCommand} setup --agent ${options.agent}${modeFlag}`
    : `${cliCommand} setup${modeFlag}`;
  const hookFlags = options.hooks.map((hook) => ` --hook ${hook}`).join("");

  return [
    {
      id: "doctor",
      title: "Check the package",
      command: `${cliCommand} doctor`,
      description: "Confirm Node, the MCP server file, the review engine, and config loading are healthy."
    },
    {
      id: "playground",
      title: "Try the local playground",
      command: `${cliCommand} playground`,
      description: "Open a local paste-in UI for commands, plans, diffs, and final answers."
    },
    {
      id: "agent-setup",
      title: "Print agent setup",
      command: agentSetupCommand,
      description: options.agent
        ? `Print exact MCP config and instruction text for ${agentSetupProfiles[options.agent].label}.`
        : "Choose Codex, Claude Code, or generic MCP setup snippets."
    },
    {
      id: "bootstrap",
      title: "Write starter files",
      command: `${cliCommand} bootstrap${modeFlag} --preset ${options.preset}${hookFlags}`,
      description: "Create project config, MCP starter config, agent instruction notes, and any requested git hooks."
    },
    {
      id: "validate",
      title: "Validate config",
      command: `${cliCommand} config validate`,
      description: "Check the written project config before asking agents or hooks to rely on it."
    },
    {
      id: "sample-review",
      title: "Run a sample block",
      command: `${cliCommand} command "git reset --hard"`,
      description: "Confirm destructive git commands are reviewed as text and blocked."
    }
  ];
}

function startSetupOptions(agent: AgentTarget, options: StartOptions): SetupOptions {
  return {
    mode: options.mode,
    agent,
    packageSpec: options.packageSpec,
    tone: "court_jester",
    intensity: 3,
    riskTolerance: "medium",
    json: false
  };
}

function renderAgentSetup(options: AgentSetupOptions): string {
  const agents: AgentTarget[] = options.all ? ["codex", "claude", "generic"] : [options.agent];
  const setups = agents.map((agent) => agentSetupDetails({ ...options, agent }));

  if (options.json) {
    return `${JSON.stringify({
      mode: options.mode,
      packageSpec: options.packageSpec,
      agents: setups
    }, null, 2)}\n`;
  }

  const header = [
    "Memento Mori Jester agent setup",
    "",
    options.all
      ? "Choose the section for your agent, then paste the matching config and instruction."
      : `Use this for ${setups[0]?.label}.`,
    ""
  ];
  const chooser = options.all
    ? [
        "Chooser:",
        `  ${renderCliCommand(options)} setup --agent codex --mode ${options.mode}`,
        `  ${renderCliCommand(options)} setup --agent claude --mode ${options.mode}`,
        `  ${renderCliCommand(options)} setup --agent generic --mode ${options.mode}`,
        ""
      ]
    : [];

  return [
    ...header,
    ...chooser,
    ...setups.flatMap((setup) => renderAgentSetupSection(setup))
  ].join("\n");
}

function agentSetupDetails(options: SetupOptions): {
  agent: AgentTarget;
  label: string;
  mode: SetupMode;
  configTarget: string;
  instructionFile: string;
  instruction: string;
  mcpConfig: Record<string, unknown>;
  commands: string[];
  docsPath: string;
} {
  const profile = agentSetupProfiles[options.agent];
  const cliCommand = renderCliCommand(options);

  return {
    agent: profile.agent,
    label: profile.label,
    mode: options.mode,
    configTarget: profile.configTarget,
    instructionFile: profile.instructionFile,
    instruction: agentInstruction,
    mcpConfig: mcpConfigSnippet(options),
    commands: [
      `${cliCommand} doctor`,
      `${cliCommand} playground`,
      `${cliCommand} command "git reset --hard"`,
      `${cliCommand} bootstrap --preset node`
    ],
    docsPath: profile.docsPath
  };
}

function renderAgentSetupSection(setup: ReturnType<typeof agentSetupDetails>): string[] {
  return [
    `${setup.label}`,
    `Config target: ${setup.configTarget}`,
    `Instruction target: ${setup.instructionFile}`,
    "",
    "MCP config:",
    JSON.stringify(setup.mcpConfig, null, 2),
    "",
    "Instruction:",
    setup.instruction,
    "",
    "Smoke checks:",
    ...setup.commands.map((command) => `  ${command}`),
    "",
    `Docs: ${setup.docsPath}`,
    ""
  ];
}

function renderInit(options: SetupOptions): string {
  const cliCommand = renderCliCommand(options);
  const config = JSON.stringify(mcpConfigSnippet(options), null, 2);
  const agentLine = options.agent === "generic"
    ? "Paste this into any MCP client that accepts the standard mcpServers JSON shape."
    : `Use this for ${options.agent}; if its config format differs, keep the command and args values.`;

  return `Memento Mori Jester setup

Try it now:
  ${cliCommand} command "git reset --hard"

MCP config (${options.mode} mode):
${config}

${agentLine}

Suggested agent instruction:
  ${agentInstruction}

Useful next checks:
  ${cliCommand} doctor
  ${cliCommand} playground
  ${cliCommand} config init
  ${cliCommand} install-hook pre-commit
  ${cliCommand} plan "I will just refactor auth and ship it"
`;
}

function renderExamples(options: SetupOptions): string {
  const cliCommand = renderCliCommand(options);
  const examples = {
    quickChecks: [
      `${cliCommand} doctor`,
      `${cliCommand} command "git reset --hard"`,
      `${cliCommand} plan "I will just refactor auth and ship it"`,
      `git diff | ${cliCommand} diff --fail-on block`,
      `git diff | ${cliCommand} summary`,
      `${cliCommand} final "Implemented the fix, but tests not run."`,
      `${cliCommand} explain command "git reset --hard"`,
      `${cliCommand} playground`,
      `${cliCommand} rules --kind command`,
      `${cliCommand} tune risky-domain`,
      `${cliCommand} github-action`
    ],
    setup: [
      `${cliCommand} setup`,
      `${cliCommand} setup --agent ${options.agent} --mode ${options.mode}`,
      `${cliCommand} init --agent ${options.agent} --mode ${options.mode}`,
      `${cliCommand} mcp-config --agent ${options.agent} --mode ${options.mode}`,
      `${cliCommand} bootstrap --preset node`,
      `${cliCommand} bootstrap --preset node --hook pre-commit`,
      `${cliCommand} github-action --write`
    ],
    docs: [
      "https://github.com/Martin123132/Memento-Mori/blob/main/docs/GETTING_STARTED.md",
      "https://github.com/Martin123132/Memento-Mori/blob/main/docs/CLI.md",
      "https://github.com/Martin123132/Memento-Mori/blob/main/docs/MCP_TOOLS.md",
      "https://github.com/Martin123132/Memento-Mori/tree/main/examples"
    ],
    presetPacks: [
      "Next.js: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/nextjs",
      "Vite React: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/vite-react",
      "Express API: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/express-api",
      "FastAPI: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/fastapi",
      "Terraform Kubernetes: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/terraform-k8s",
      "AI MCP: https://github.com/Martin123132/Memento-Mori/tree/main/examples/presets/ai-mcp"
    ]
  };

  if (options.json) {
    return `${JSON.stringify({ mode: options.mode, agent: options.agent, examples }, null, 2)}\n`;
  }

  return `Memento Mori Jester examples

Quick checks:
${examples.quickChecks.map((command) => `  ${command}`).join("\n")}

Setup:
${examples.setup.map((command) => `  ${command}`).join("\n")}

Example files:
  Codex: https://github.com/Martin123132/Memento-Mori/tree/main/examples/codex
  Claude Code: https://github.com/Martin123132/Memento-Mori/tree/main/examples/claude-code
  Generic MCP: https://github.com/Martin123132/Memento-Mori/tree/main/examples/generic-mcp
  Git hooks only: https://github.com/Martin123132/Memento-Mori/tree/main/examples/git-hooks-only
  GitHub code scanning: https://github.com/Martin123132/Memento-Mori/blob/main/examples/github-code-scanning.yml
  Review fixtures: https://github.com/Martin123132/Memento-Mori/tree/main/examples/fixtures

Preset packs:
${examples.presetPacks.map((pack) => `  ${pack}`).join("\n")}

Docs:
${examples.docs.map((doc) => `  ${doc}`).join("\n")}
`;
}

async function handleRulesCommand(command: "rules" | "rule", argv: string[]): Promise<string> {
  const options = parseRulesCommandOptions(command, argv);
  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const rules = listRules({
    kind: options.kind,
    config: loadedConfig.config
  });
  const matchedRules = options.id ? rules.filter((rule) => rule.id === options.id) : rules;

  if (options.id && matchedRules.length === 0) {
    throw new Error(`No rule found for "${options.id}". Run "jester rules" to list rule ids.`);
  }

  const result = {
    configPath: loadedConfig.path,
    kind: options.kind,
    id: options.id,
    count: matchedRules.length,
    rules: matchedRules
  };

  if (options.json) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  return renderRules(result);
}

function renderRules(result: {
  configPath?: string;
  kind?: ReviewKind;
  id?: string;
  count: number;
  rules: RuleCatalogEntry[];
}): string {
  const lines = [
    result.id ? `Memento Mori Jester rule: ${result.id}` : "Memento Mori Jester rules",
    "",
    result.configPath ? `Project config: ${result.configPath}` : "Project config: none loaded",
    `Kind: ${result.kind ?? "all"}`,
    `Rules: ${result.count}`,
    `Enabled: ${result.rules.filter((rule) => rule.enabled).length}`,
    ""
  ];

  if (result.rules.length === 0) {
    lines.push("No rules matched.", "");
    return lines.join("\n");
  }

  const groups: Array<{ source: RuleCatalogEntry["source"]; label: string }> = [
    { source: "built-in", label: "Built-in checks" },
    { source: "structural", label: "Structural checks" },
    { source: "project-config", label: "Project config checks" }
  ];
  const showMatcher = Boolean(result.id);

  for (const group of groups) {
    const rules = result.rules.filter((rule) => rule.source === group.source);
    if (rules.length === 0) {
      continue;
    }

    lines.push(group.label);
    for (const rule of rules) {
      lines.push(
        `- ${rule.id} [S${rule.severity}] ${rule.kinds.join(", ")}${rule.enabled ? "" : " [disabled]"}`,
        `  ${rule.title}`,
        `  ${rule.detail}`,
        `  Check: ${rule.suggestedCheck}`
      );

      if (showMatcher) {
        if (rule.pattern) {
          lines.push(`  Pattern: /${rule.pattern}/${rule.flags ?? ""}`);
        } else if (rule.value) {
          lines.push(`  Value: ${rule.value}`);
        } else {
          lines.push(`  Matcher: ${rule.matcher}`);
        }

        lines.push(
          `  Why: ${rule.guidance.why}`,
          `  False positives: ${rule.guidance.falsePositive}`,
          `  Safer move: ${rule.guidance.saferAlternative}`,
          `  Tune: ${rule.guidance.tuning}`
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function handleTuneCommand(argv: string[]): Promise<string> {
  const options = parseTuneCommandOptions(argv);
  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const rules = listRules({
    config: loadedConfig.config
  });
  const rule = rules.find((entry) => entry.id === options.id);

  if (!rule) {
    throw new Error(`No rule found for "${options.id}". Run "jester rules" to list rule ids.`);
  }

  const advice = tuneAdvice(rule, loadedConfig.path);

  if (options.json) {
    return `${JSON.stringify(advice, null, 2)}\n`;
  }

  return renderTuneAdvice(advice);
}

function tuneAdvice(rule: RuleCatalogEntry, configPath?: string) {
  const commands = {
    inspect: `jester rule ${rule.id}`,
    disable: `jester config disable-rule ${rule.id}`,
    validate: "jester config validate",
    enable: `jester config enable-rule ${rule.id}`,
    list: "jester rules"
  };
  const checksBeforeMuting = [
    "Confirm the latest hit is harmless, documentation-only, example-only, or already covered by another guard.",
    "Prefer fixing the risky change or adding verification when the rule found real risk.",
    rule.source === "project-config"
      ? "Prefer narrowing the local project config pattern or value before muting the whole rule id."
      : "Prefer muting only after repeated false positives in this repo."
  ];
  const recommendation = rule.enabled
    ? rule.severity >= 5
      ? "High severity: fix, narrow, or document the guard before disabling this rule."
      : rule.source === "project-config"
        ? "Project-config rule: narrow jester.config.json first; disable only if the local rule is intentionally too broad."
        : "If repeated hits are harmless for this repo, disable the rule and validate the config."
    : "This rule is already disabled; re-enable it when the noisy work is done or if the risk becomes relevant again.";

  return {
    ruleId: rule.id,
    title: rule.title,
    enabled: rule.enabled,
    severity: rule.severity,
    source: rule.source,
    kinds: rule.kinds,
    matcher: rule.matcher,
    configPath: configPath ?? null,
    guidance: rule.guidance,
    recommendation,
    checksBeforeMuting,
    commands
  };
}

function renderTuneAdvice(advice: ReturnType<typeof tuneAdvice>): string {
  const enabledLabel = advice.enabled ? "enabled" : "disabled";

  return `Memento Mori Jester tuning advice

Rule: ${advice.ruleId} [${enabledLabel}]
Title: ${advice.title}
Severity: S${advice.severity}
Source: ${advice.source}
Kinds: ${advice.kinds.join(", ")}
Project config: ${advice.configPath ?? "none loaded"}

Why it exists:
${advice.guidance.why}

When it may be noisy:
${advice.guidance.falsePositive}

Safer move:
${advice.guidance.saferAlternative}

Recommendation:
${advice.recommendation}

Before muting:
${advice.checksBeforeMuting.map((check) => `- ${check}`).join("\n")}

Commands:
  ${advice.commands.inspect}
  ${advice.commands.disable}
  ${advice.commands.validate}
  ${advice.commands.enable}
`;
}

async function handleSummaryCommand(argv: string[]): Promise<string> {
  const options = parseOptions(argv);
  const kind = options.kind ?? "diff";
  const content = await resolveContent(options, argv);

  if (!content.trim()) {
    throw new Error("Nothing to summarize. Pass text, use --file, or pipe content on stdin.");
  }

  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const result = review({
    kind,
    content,
    subject: options.subject,
    context: options.context,
    tone: options.tone,
    intensity: options.intensity,
    riskTolerance: options.riskTolerance,
    config: loadedConfig.config
  });
  const summary = summarizeReview(result, loadedConfig.path);

  if (options.failOn === "block" && result.verdict === "block") {
    process.exitCode = 2;
  } else if (options.failOn === "caution" && result.verdict !== "pass") {
    process.exitCode = result.verdict === "block" ? 2 : 1;
  }

  return options.json ? `${JSON.stringify(summary, null, 2)}\n` : renderSummary(summary);
}

function summarizeReview(result: ReviewResult, configPath?: string): ReviewSummary {
  const hits = new Map<string, SummaryRuleHit>();

  for (const issue of result.issues) {
    const existing = hits.get(issue.id);
    if (existing) {
      existing.count += 1;
      if (issue.severity > existing.severity) {
        existing.severity = issue.severity;
        existing.title = issue.title;
        existing.suggestedCheck = issue.suggestedCheck;
      }
    } else {
      hits.set(issue.id, {
        ruleId: issue.id,
        count: 1,
        severity: issue.severity,
        title: issue.title,
        suggestedCheck: issue.suggestedCheck
      });
    }
  }

  const ruleHits = [...hits.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    if (right.severity !== left.severity) {
      return right.severity - left.severity;
    }
    return left.ruleId.localeCompare(right.ruleId);
  });
  const highestSeverity = [...ruleHits].sort((left, right) => {
    if (right.severity !== left.severity) {
      return right.severity - left.severity;
    }
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return left.ruleId.localeCompare(right.ruleId);
  })[0] ?? null;
  const topRule = ruleHits[0] ?? highestSeverity;

  return {
    kind: result.kind,
    subject: result.subject,
    verdict: result.verdict,
    riskScore: result.riskScore,
    issueCount: result.issues.length,
    ruleHits,
    highestSeverity,
    suggestedNext: topRule
      ? [
          `jester tune ${topRule.ruleId}`,
          `jester rule ${topRule.ruleId}`
        ]
      : ["No rule tuning needed."],
    configPath: configPath ?? null
  };
}

function renderSummary(summary: ReviewSummary): string {
  const lines = [
    "Memento Mori Jester summary",
    "",
    `Verdict: ${summary.verdict.toUpperCase()} (${summary.riskScore}/100)`,
    `Kind: ${summary.kind}`,
    `Subject: ${summary.subject}`,
    `Issues: ${summary.issueCount}`,
    "",
    "Rules hit:"
  ];

  if (summary.ruleHits.length === 0) {
    lines.push("- none");
  } else {
    for (const hit of summary.ruleHits) {
      lines.push(`- ${hit.ruleId}: ${hit.count} ${hit.count === 1 ? "hit" : "hits"} [S${hit.severity}] ${hit.title}`);
    }
  }

  lines.push("", "Highest severity:");
  if (summary.highestSeverity) {
    const hit = summary.highestSeverity;
    lines.push(`- ${hit.ruleId} [S${hit.severity}] ${hit.title}`);
  } else {
    lines.push("- none");
  }

  lines.push(
    "",
    "Suggested next:",
    ...summary.suggestedNext.map((step) => `  ${step}`),
    ""
  );

  return lines.join("\n");
}

async function handleGithubAction(argv: string[]): Promise<string> {
  const options = parseGithubActionOptions(argv);
  const workflow = renderGithubActionWorkflow(options);

  if (!options.write) {
    if (options.json) {
      return `${JSON.stringify({ path: options.path, workflow }, null, 2)}\n`;
    }

    return workflow;
  }

  const path = resolve(process.cwd(), options.path);
  const exists = await fileExists(path);
  let changed = false;

  if (!exists || options.force) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, workflow, "utf8");
    changed = true;
  }

  const result = {
    ok: true,
    path,
    changed,
    message: changed
      ? `Wrote ${path}`
      : `Kept existing ${path}. Use --force to overwrite.`
  };

  if (options.json) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  return `${result.message}\n`;
}

function renderGithubActionWorkflow(options: GithubActionOptions): string {
  return `name: Memento Mori Jester

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: read
  security-events: write

jobs:
  jester:
    name: Jester SARIF review
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Review diff as SARIF
        uses: Martin123132/Memento-Mori@${options.actionRef}
        with:
          format: sarif
          output-file: jester.sarif
          summary: true
          fail-on: ${options.failOn}
          subject: ${yamlSingleQuote(options.subject)}

      - name: Upload Jester SARIF
        if: always() && hashFiles('jester.sarif') != ''
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: jester.sarif
`;
}

function yamlSingleQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function handleExplain(argv: string[]): Promise<string> {
  const { command, rest } = splitCommand(argv);
  const options = parseOptions(rest);
  const kind = resolveKind(command, options.kind);
  const content = await resolveContent(options, rest);

  if (!content.trim()) {
    throw new Error("Nothing to explain. Pass text, use --file, or pipe content on stdin.");
  }

  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const inputForReview: ReviewInput = {
    kind,
    content,
    subject: options.subject,
    context: options.context,
    tone: options.tone,
    intensity: options.intensity,
    riskTolerance: options.riskTolerance,
    config: loadedConfig.config
  };
  const result = review(inputForReview);
  const explanation = renderExplanation(result);

  if (options.sarif) {
    throw new Error('Use "--json" for structured explain output. "--sarif" is for plan, command, diff, and final reviews.');
  }

  if (options.json) {
    return `${JSON.stringify({ review: result, explanation }, null, 2)}\n`;
  }

  return `${explanation}\n`;
}

function renderExplanation(result: ReviewResult): string {
  const verdictLine: Record<ReviewResult["verdict"], string> = {
    pass: "No obvious concern was found. This is permission to proceed carefully, not proof that nothing can go wrong.",
    caution: "There is enough risk here to slow down and add evidence before proceeding.",
    block: "This should change before it is run, shipped, or claimed as done."
  };
  const lines = [
    `Jester explanation: ${result.verdict.toUpperCase()} (${result.riskScore}/100)`,
    "",
    `What this means: ${verdictLine[result.verdict]}`
  ];

  if (result.issues.length > 0) {
    lines.push(
      "",
      "Why:",
      ...result.issues.slice(0, 4).map((issue) => `- [S${issue.severity}] ${issue.title}: ${issue.detail}`)
    );
  } else {
    lines.push("", "Why:", "- No matching risky pattern or structural warning fired.");
  }

  const nextChecks = result.suggestedChecks.length > 0
    ? result.suggestedChecks
    : ["Run the smallest meaningful check for the work before calling it finished."];

  lines.push(
    "",
    "Do next:",
    ...nextChecks.slice(0, 4).map((check) => `- ${check}`),
    "",
    result.memento
  );

  return lines.join("\n");
}

function renderCliCommand(options: SetupOptions): string {
  if (options.mode === "global") {
    return "jester";
  }

  if (options.mode === "local") {
    return `node "${cliPath()}"`;
  }

  return `npx -y ${options.packageSpec}`;
}

async function handleConfigCommand(argv: string[]): Promise<string> {
  const [subcommand = "show"] = argv;
  const options = parseConfigCommandOptions(argv.slice(1));

  if (subcommand === "init") {
    const path = await writeDefaultConfig({
      path: options.path,
      force: options.force,
      preset: options.preset
    });
    return `Wrote ${path}\n`;
  }

  if (subcommand === "presets") {
    return `${configPresetNames.join("\n")}\n`;
  }

  if (subcommand === "recommend") {
    const recommendation = await recommendConfigPreset({
      configPath: options.configPath,
      search: !options.noConfig
    });

    return renderConfigRecommendation(recommendation, options.json);
  }

  if (subcommand === "disable-rule" || subcommand === "enable-rule") {
    return handleConfigRuleToggle(subcommand, options);
  }

  if (subcommand === "show") {
    const loaded = await loadConfig({
      configPath: options.configPath,
      search: !options.noConfig
    });

    if (options.json) {
      return `${JSON.stringify(loaded, null, 2)}\n`;
    }

    const label = loaded.path ? `Loaded ${loaded.path}` : "No config file found; using built-in defaults.";
    return `${label}\n${JSON.stringify({ ...defaultUserConfig(), ...loaded.config }, null, 2)}\n`;
  }

  if (subcommand === "validate") {
    const result = await validateConfig({
      configPath: options.configPath,
      search: !options.noConfig
    });

    if (options.json) {
      return `${JSON.stringify(result, null, 2)}\n`;
    }

    if (result.ok) {
      return `Config valid: ${result.path}\n`;
    }

    process.exitCode = 1;
    return `Config invalid${result.path ? `: ${result.path}` : ""}\n${result.issues.map((issue) => `- ${issue}`).join("\n")}\n`;
  }

  throw new Error('Unknown config command. Use "jester config init", "jester config show", "jester config validate", "jester config presets", "jester config recommend", "jester config disable-rule <id>", or "jester config enable-rule <id>".');
}

function renderConfigRecommendation(recommendation: PresetRecommendation, json: boolean): string {
  if (json) {
    return `${JSON.stringify(recommendation, null, 2)}\n`;
  }

  const preset = recommendation.recommendedPreset;
  const detectedStack = recommendation.detectedStacks.length > 0
    ? recommendation.detectedStacks.join(" + ")
    : "No specific framework markers";
  const reasons = recommendation.reasons.length > 0
    ? recommendation.reasons.map((reason) => `- ${reason}`).join("\n")
    : "- No strong stack markers found.";
  const candidates = recommendation.candidates
    .map((candidate) => {
      const stackSummary = candidate.detectedStacks.length > 0
        ? ` [${candidate.detectedStacks.join(" + ")}]`
        : "";
      const reasonSummary = candidate.reasons.length > 0 ? ` (${candidate.reasons.join("; ")})` : "";
      return `- ${candidate.preset}: ${candidate.score}${stackSummary}${reasonSummary}`;
    })
    .join("\n");
  const configLine = recommendation.configPath
    ? `Existing config: ${recommendation.configPath}\nNote: this recommendation is advisory; no files were changed.`
    : "Existing config: none\nNote: no files were changed.";

  return `Memento Mori Jester config recommendation

Recommended preset: ${preset}
Confidence: ${recommendation.confidence}
Detected stack: ${detectedStack}
${configLine}

Why:
${reasons}

Candidates:
${candidates}

Next:
  jester start --preset ${preset}
  jester config init --preset ${preset}
  jester bootstrap --preset ${preset}
`;
}

async function handleConfigRuleToggle(subcommand: "disable-rule" | "enable-rule", options: ConfigCommandOptions): Promise<string> {
  const ruleId = options.ruleId?.trim();
  if (!ruleId) {
    throw new Error(`Missing rule id. Use "jester config ${subcommand} <rule-id>".`);
  }

  const configPath = options.path ?? options.configPath ?? await findConfigPath() ?? "jester.config.json";
  const resolvedConfigPath = resolve(process.cwd(), configPath);
  const existing = await fileExists(resolvedConfigPath);
  const config = existing
    ? (await loadConfig({ configPath: resolvedConfigPath, search: false })).config
    : { disabledRules: [] };
  const disabledRules = config.disabledRules ?? [];
  const normalizedRuleId = ruleId.toLocaleLowerCase();
  const hasRule = disabledRules.some((id) => id.toLocaleLowerCase() === normalizedRuleId);
  let changed = false;

  if (subcommand === "disable-rule") {
    if (!hasRule) {
      config.disabledRules = [...disabledRules, ruleId];
      changed = true;
    } else {
      config.disabledRules = disabledRules;
    }
  } else {
    const nextDisabledRules = disabledRules.filter((id) => id.toLocaleLowerCase() !== normalizedRuleId);
    config.disabledRules = nextDisabledRules;
    changed = nextDisabledRules.length !== disabledRules.length;
  }

  if (!existing || changed) {
    await mkdir(dirname(resolvedConfigPath), { recursive: true });
    await writeFile(resolvedConfigPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }

  const action = subcommand === "disable-rule" ? "Disabled" : "Enabled";
  const already = subcommand === "disable-rule" ? "already disabled" : "not disabled";
  const result = {
    ok: true,
    action: subcommand,
    ruleId,
    path: resolvedConfigPath,
    changed: !existing || changed,
    disabledRules: config.disabledRules ?? [],
    nextSteps: [
      `jester rule ${ruleId}`,
      "jester config validate"
    ]
  };

  if (options.json) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  const message = result.changed
    ? `${action} ${ruleId} in ${resolvedConfigPath}`
    : `${ruleId} was ${already} in ${resolvedConfigPath}`;

  return `${message}\nNext:\n  ${result.nextSteps.join("\n  ")}\n`;
}

async function handlePolicyCommand(argv: string[]): Promise<string> {
  const [subcommand = "show"] = argv;
  const options = parsePolicyCommandOptions(argv.slice(1));

  if (subcommand === "init") {
    const path = await writePolicyConfig({
      path: options.path,
      force: options.force,
      level: options.level
    });
    const result = {
      ok: true,
      level: options.level,
      path,
      nextSteps: [
        "jester config validate",
        "jester hook-status",
        "jester install-hook pre-commit --fail-on caution"
      ]
    };

    if (options.json) {
      return `${JSON.stringify(result, null, 2)}\n`;
    }

    return `Wrote ${path} (${options.level} policy)\nNext:\n  ${result.nextSteps.join("\n  ")}\n`;
  }

  if (subcommand === "levels") {
    return `${policyLevelNames.join("\n")}\n`;
  }

  if (subcommand === "show") {
    return `${JSON.stringify(userConfigForPolicy(options.level), null, 2)}\n`;
  }

  throw new Error('Unknown policy command. Use "jester policy init", "jester policy show", or "jester policy levels".');
}

async function handleBootstrap(argv: string[]): Promise<string> {
  const options = parseBootstrapOptions(argv);
  const configFile = await ensureBootstrapConfig(options);
  const mcpFile = await writeStarterFile({
    relativePath: "memento-mori.mcp.json",
    content: `${JSON.stringify(mcpConfigSnippet(options), null, 2)}\n`,
    force: options.force
  });
  const instructionsFile = await writeStarterFile({
    relativePath: "MEMENTO_MORI.md",
    content: renderBootstrapInstructions(options),
    force: options.force
  });
  const loaded = await loadConfig({ configPath: configFile.path, search: false });
  const failOn = loaded.config.hookFailOn ?? "block";
  const hooks = [];

  for (const hook of options.hooks) {
    hooks.push(await installHook({
      hook,
      commandPrefix: hookCommandPrefix(options),
      failOn,
      force: options.force
    }));
  }

  const result = {
    ok: true,
    mode: options.mode,
    agent: options.agent,
    preset: options.preset,
    files: [configFile, mcpFile, instructionsFile],
    hooks,
    nextSteps: [
      `${renderCliCommand(options)} doctor`,
      `${renderCliCommand(options)} config validate`,
      "Add memento-mori.mcp.json to your MCP client, or copy the command and args from it."
    ]
  };

  if (options.json) {
    return `${JSON.stringify(result, null, 2)}\n`;
  }

  const lines = [
    "Memento Mori Jester bootstrap",
    "",
    "Files:",
    ...result.files.map((file) => `  ${file.changed ? "wrote" : "kept"} ${file.path}`),
    ""
  ];

  if (hooks.length > 0) {
    lines.push("Hooks:", ...hooks.map((hook) => `  ${hook.message}`), "");
  }

  lines.push(
    "Next:",
    ...result.nextSteps.map((step) => `  ${step}`),
    ""
  );

  return lines.join("\n");
}

async function handleInstallHook(argv: string[]) {
  const options = await parseHookCommandOptions(argv);
  const loaded = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const failOn = options.failOn ?? loaded.config.hookFailOn ?? "block";

  return installHook({
    hook: options.hook,
    commandPrefix: hookCommandPrefix(options.setup),
    failOn,
    force: options.force
  });
}

async function handleUninstallHook(argv: string[]) {
  const options = await parseHookCommandOptions(argv);
  return uninstallHook(options.hook, { force: options.force });
}

async function parseHookCommandOptions(argv: string[]): Promise<HookCommandOptions> {
  const setup = parseSetupOptions(argv);
  let hook: HookName | undefined;
  let failOn: HookFailOn | undefined;
  let force = false;
  let configPath: string | undefined;
  let noConfig = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (isHookName(arg)) {
      hook = arg;
    } else if (arg === "--fail-on") {
      failOn = parseFailOn(requireValue(arg, next));
      index += 1;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--config") {
      configPath = requireValue(arg, next);
      index += 1;
    } else if (arg === "--no-config") {
      noConfig = true;
    }
  }

  if (!hook) {
    throw new Error(`Missing hook name. Use one of: ${hookNames.join(", ")}`);
  }

  return {
    hook,
    setup,
    failOn,
    force,
    configPath,
    noConfig
  };
}

function parseBootstrapOptions(argv: string[]): BootstrapOptions {
  const setup = parseSetupOptions(argv);
  let preset: ConfigPreset = "default";
  let force = false;
  const hooks: HookName[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--preset") {
      preset = parseConfigPreset(requireValue(arg, next));
      index += 1;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--hook") {
      const hook = requireValue(arg, next);
      if (!isHookName(hook)) {
        throw new Error(`Unknown hook "${hook}". Use one of: ${hookNames.join(", ")}`);
      }
      hooks.push(hook);
      index += 1;
    }
  }

  return {
    ...setup,
    preset,
    force,
    hooks: [...new Set(hooks)]
  };
}

async function renderHookStatus(): Promise<string> {
  const statuses = await hookStatus();
  return `${statuses.map((status) => `${status.hook}: ${status.message} (${status.path})`).join("\n")}\n`;
}

async function handlePlayground(argv: string[]): Promise<void> {
  const options = parsePlaygroundOptions(argv);
  const loadedConfig = await loadConfig({
    configPath: options.configPath,
    search: !options.noConfig
  });
  const started = await startPlaygroundServer({
    port: options.port,
    config: loadedConfig.config
  });

  const details = {
    ok: true,
    url: started.url,
    host: playgroundHost,
    port: started.port,
    configPath: loadedConfig.path ?? null
  };

  if (options.json) {
    output.write(`${JSON.stringify(details, null, 2)}\n`);
  } else {
    output.write([
      "Memento Mori Jester playground",
      "",
      `Open ${started.url}`,
      loadedConfig.path ? `Config: ${loadedConfig.path}` : "Config: built-in defaults",
      "Press Ctrl+C to stop.",
      ""
    ].join("\n"));
  }

  await new Promise<void>((resolve) => {
    const shutdown = () => {
      started.server.close(() => resolve());
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

function hookCommandPrefix(options: SetupOptions): string {
  if (options.mode === "local") {
    return shellCommandPrefixForLocalCli(cliPath());
  }

  if (options.mode === "global") {
    return "jester";
  }

  return `npx -y ${shellQuote(options.packageSpec)}`;
}

async function renderDoctor(options: ConfigCommandOptions): Promise<{ ok: boolean; text: string }> {
  let configCheck: { name: string; ok: boolean; detail: string };

  try {
    const loaded = await loadConfig({
      configPath: options.configPath,
      search: !options.noConfig
    });
    configCheck = {
      name: "config",
      ok: true,
      detail: loaded.path ? `Loaded ${loaded.path}.` : "No config file found; using built-in defaults."
    };
  } catch (error) {
    configCheck = {
      name: "config",
      ok: false,
      detail: error instanceof Error ? error.message : String(error)
    };
  }

  const checks = [
    {
      name: "node-version",
      ok: nodeMajorVersion() >= 20,
      detail: `Node ${process.version}; required >=20.`
    },
    {
      name: "mcp-server-file",
      ok: await fileExists(serverPath()),
      detail: serverPath()
    },
    {
      name: "review-engine",
      ok: reviewCommand("git reset --hard").verdict === "block",
      detail: "Dangerous git command is blocked."
    },
    configCheck
  ];
  const ok = checks.every((check) => check.ok);

  if (options.json) {
    return {
      ok,
      text: `${JSON.stringify({ ok, checks }, null, 2)}\n`
    };
  }

  const lines = [
    "Memento Mori Jester doctor",
    "",
    ...checks.map((check) => `${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`),
    "",
    ok
      ? "The fool is fit for court."
      : "Something needs fixing before the fool can be trusted with sharp objects.",
    ""
  ];

  return { ok, text: lines.join("\n") };
}

async function ensureBootstrapConfig(options: BootstrapOptions): Promise<BootstrapFileResult> {
  const existing = await findConfigPath();

  if (existing && !options.force) {
    return {
      path: existing,
      changed: false,
      message: "Kept existing config file."
    };
  }

  const path = await writeDefaultConfig({ force: options.force, preset: options.preset });
  return {
    path,
    changed: true,
    message: "Wrote project config."
  };
}

async function writeStarterFile(options: {
  relativePath: string;
  content: string;
  force: boolean;
}): Promise<BootstrapFileResult> {
  const path = resolve(process.cwd(), options.relativePath);
  const exists = await fileExists(path);

  if (exists && !options.force) {
    return {
      path,
      changed: false,
      message: `Kept existing ${options.relativePath}.`
    };
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, options.content, "utf8");

  return {
    path,
    changed: true,
    message: `Wrote ${options.relativePath}.`
  };
}

function renderBootstrapInstructions(options: SetupOptions): string {
  const cliCommand = renderCliCommand(options);

  return `# Memento Mori Jester

## Agent Instruction

Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.

## MCP

Use \`memento-mori.mcp.json\` with an MCP client, or copy the command and args from it into the client's config.

## Local Checks

\`\`\`powershell
${cliCommand} doctor
${cliCommand} config validate
${cliCommand} command "git reset --hard"
git diff | ${cliCommand} diff --fail-on block
\`\`\`

## Git Hooks

\`\`\`powershell
${cliCommand} install-hook pre-commit
${cliCommand} install-hook pre-push --fail-on caution
\`\`\`
`;
}

function nodeMajorVersion(): number {
  return Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function helpText(): string {
  return `Memento Mori Jester

Usage:
  jester plan "I will just refactor auth and ship it"
  jester command "Remove-Item .\\\\dist -Recurse -Force"
  git diff | jester diff --fail-on block
  jester final --file final-answer.txt --tone professional
  jester explain command "git reset --hard"
  git diff | jester summary
  jester summary --kind command "git reset --hard"
  jester start
  jester init
  jester setup
  jester setup --agent codex
  jester setup --agent claude
  jester examples
  jester rules
  jester rules --kind diff
  jester rule destructive-git-history
  jester tune risky-domain
  jester github-action
  jester github-action --write
  jester bootstrap --preset node
  jester doctor
  jester playground
  jester config init
  jester config init --preset web
  jester config init --preset api
  jester config init --preset infra
  jester config init --preset ai
  jester config init --preset security
  jester config show
  jester config validate
  jester config presets
  jester config recommend
  jester config disable-rule console-log
  jester config enable-rule console-log
  jester policy init --level team
  jester policy init --level strict
  jester policy show --level strict
  jester policy levels
  jester install-hook pre-commit
  jester install-hook pre-push --fail-on caution
  jester hook-status
  jester mcp-config --agent codex --mode npx
  jester mcp-config --agent claude --mode npx
  jester mcp-server

Options:
  --kind <plan|command|diff|final>     Review kind when using "review"
  --tone <gentle_stoic|court_jester|absolute_menace|professional>
  --intensity <1-5>
  --risk <low|medium|high>
  --fail-on <caution|block>            Set a non-zero exit code at this verdict
  --subject <text>
  --context <text>
  --file <path>
  --config <path>                     Use a specific jester config file
  --no-config                         Ignore jester.config.json discovery
  --port <number>                     Playground port; default is 4818
  --preset <${configPresetNames.join("|")}>
  --level <team|strict>
  --sarif                             Output SARIF 2.1.0 for CI/code scanning
  --json

Rules options:
  --kind <plan|command|diff|final>     Filter visible rules by review kind
  --id <rule-id>                       Show a single rule

GitHub Action options:
  --write                             Write .github/workflows/memento-mori.yml
  --path <path>                       Workflow path when using --write
  --ref <git-ref>                     Action ref for Martin123132/Memento-Mori; default is main

Setup options:
  --mode <npx|global|local>            MCP command style; default is npx
  --agent <generic|claude|codex>       Label the generated setup guidance
  --all                                Show setup guidance for every supported agent
  --package <npm-or-git-spec>          Package spec used by npx mode
  --hook <pre-commit|pre-push>         Install a hook during bootstrap; repeatable

Hook options:
  --fail-on <caution|block>            Hook failure threshold; defaults to config hookFailOn or block
  --force                              Replace existing hooks or bootstrap files
`;
}
