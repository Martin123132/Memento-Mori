#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import { defaultUserConfig, loadConfig, writeDefaultConfig } from "./config.js";
import { review, reviewCommand } from "./core.js";
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
import { type HookFailOn, type ReviewInput, type ReviewKind, reviewKinds, type RiskTolerance, type Tone, tones } from "./types.js";

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

type ConfigCommandOptions = {
  json: boolean;
  force: boolean;
  path?: string;
  configPath?: string;
  noConfig: boolean;
};

type HookCommandOptions = {
  hook: HookName;
  setup: SetupOptions;
  failOn?: HookFailOn;
  force: boolean;
  configPath?: string;
  noConfig: boolean;
};

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

  if (argv[0] === "init") {
    const setupOptions = parseSetupOptions(argv.slice(1));
    output.write(renderInit(setupOptions));
    return;
  }

  if (argv[0] === "config") {
    output.write(await handleConfigCommand(argv.slice(1)));
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

  output.write(options.json ? `${JSON.stringify(result, null, 2)}\n` : `${formatReview(result)}\n`);

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
  const options: CliOptions = { json: false, noConfig: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--json") {
      options.json = true;
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
    noConfig: false
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
    }
  }

  return options;
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
  return ["--kind", "--tone", "--intensity", "--risk", "--fail-on", "--subject", "--context", "--file", "--config", "--path"].includes(arg);
}

function isKnownOption(arg: string): boolean {
  return optionHasValue(arg) || ["--json", "--no-config", "--force"].includes(arg);
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
  return {
    mcpServers: {
      "memento-mori-jester": {
        ...mcpCommandSpec(options)
      }
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
  Before risky commands, final answers, commits, or large edits, call the Memento Mori Jester. Treat BLOCK as requiring a changed plan, and CAUTION as requiring at least one concrete verification step.

Useful next checks:
  ${cliCommand} doctor
  ${cliCommand} config init
  ${cliCommand} install-hook pre-commit
  ${cliCommand} plan "I will just refactor auth and ship it"
`;
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
      force: options.force
    });
    return `Wrote ${path}\n`;
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

  throw new Error('Unknown config command. Use "jester config init" or "jester config show".');
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

async function renderHookStatus(): Promise<string> {
  const statuses = await hookStatus();
  return `${statuses.map((status) => `${status.hook}: ${status.message} (${status.path})`).join("\n")}\n`;
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
  jester init
  jester doctor
  jester config init
  jester config show
  jester install-hook pre-commit
  jester install-hook pre-push --fail-on caution
  jester hook-status
  jester mcp-config --mode npx
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
  --json

Setup options:
  --mode <npx|global|local>            MCP command style; default is npx
  --agent <generic|claude|codex>       Label the generated setup guidance
  --package <npm-or-git-spec>          Package spec used by npx mode

Hook options:
  --fail-on <caution|block>            Hook failure threshold; defaults to config hookFailOn or block
  --force                              Replace an existing hook
`;
}
