import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import { reviewKinds, tones, type UserJesterConfig } from "./types.js";

export const configFileNames = ["jester.config.json", ".jester.json"] as const;
export const configPresetNames = ["default", "node", "python", "security"] as const;

export type ConfigPreset = (typeof configPresetNames)[number];

export interface LoadedConfig {
  path?: string;
  config: UserJesterConfig;
}

const severitySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
]);

const customRuleSchema = z.object({
  id: z.string().min(1),
  pattern: z.string().min(1),
  severity: severitySchema.optional(),
  title: z.string().min(1).optional(),
  detail: z.string().min(1).optional(),
  suggestedCheck: z.string().min(1).optional(),
  kinds: z.array(z.enum(reviewKinds)).optional(),
  flags: z.string().optional()
});

const configSchema = z.object({
  tone: z.enum(tones).optional(),
  intensity: z.number().int().min(1).max(5).optional(),
  riskTolerance: z.enum(["low", "medium", "high"]).optional(),
  blockedCommands: z.array(z.string().min(1)).optional(),
  sensitiveDomains: z.array(z.string().min(1)).optional(),
  customRules: z.array(customRuleSchema).optional(),
  hookFailOn: z.enum(["caution", "block"]).optional()
}).passthrough();

export async function loadConfig(options: {
  cwd?: string;
  configPath?: string;
  search?: boolean;
} = {}): Promise<LoadedConfig> {
  const cwd = options.cwd ?? process.cwd();
  const search = options.search ?? true;
  const configPath = options.configPath ? resolve(cwd, options.configPath) : search ? await findConfigPath(cwd) : undefined;

  if (!configPath) {
    return { config: {} };
  }

  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const result = configSchema.safeParse(parsed);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid jester config at ${configPath}: ${details}`);
  }

  return {
    path: configPath,
    config: result.data
  };
}

export async function findConfigPath(cwd: string = process.cwd()): Promise<string | undefined> {
  let current = resolve(cwd);

  while (true) {
    for (const fileName of configFileNames) {
      const candidate = resolve(current, fileName);
      if (await fileExists(candidate)) {
        return candidate;
      }
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}

export async function writeDefaultConfig(options: {
  cwd?: string;
  path?: string;
  force?: boolean;
  preset?: ConfigPreset;
} = {}): Promise<string> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = resolve(cwd, options.path ?? "jester.config.json");
  const flag = options.force ? "w" : "wx";

  await writeFile(configPath, `${JSON.stringify(userConfigForPreset(options.preset ?? "default"), null, 2)}\n`, { encoding: "utf8", flag });
  return configPath;
}

export function defaultUserConfig(): UserJesterConfig {
  return {
    tone: "court_jester",
    intensity: 3,
    riskTolerance: "medium",
    hookFailOn: "block",
    blockedCommands: [
      "git reset --hard",
      "git clean -fd"
    ],
    sensitiveDomains: [
      "auth",
      "billing",
      "payments",
      "production",
      "customer data"
    ],
    customRules: [
      {
        id: "no-force-push-main",
        pattern: "git\\s+push\\s+--force(?:-with-lease)?\\s+origin\\s+main",
        severity: 5,
        title: "Force-push to main",
        detail: "This project treats force-pushing main as a stop-and-think event.",
        suggestedCheck: "Create a branch or use --force-with-lease only after confirming the protected branch policy.",
        kinds: ["command", "plan"]
      }
    ]
  };
}

export function userConfigForPreset(preset: ConfigPreset): UserJesterConfig {
  if (preset === "default") {
    return defaultUserConfig();
  }

  return mergeConfigs(defaultUserConfig(), presetConfig(preset));
}

function presetConfig(preset: Exclude<ConfigPreset, "default">): UserJesterConfig {
  if (preset === "node") {
    return {
      sensitiveDomains: [
        "package-lock.json",
        "npm publish",
        "postinstall",
        "preinstall",
        "node_modules"
      ],
      blockedCommands: [
        "npm publish --force",
        "npm unpublish"
      ],
      customRules: [
        {
          id: "node-install-script-change",
          pattern: "\"(?:preinstall|install|postinstall)\"\\s*:",
          severity: 4,
          title: "Package install script touched",
          detail: "Install scripts run on user machines and deserve extra scrutiny.",
          suggestedCheck: "Verify the script is necessary, safe, and covered by release notes.",
          kinds: ["diff", "plan"]
        },
        {
          id: "node-env-production-change",
          pattern: "NODE_ENV\\s*=\\s*production",
          severity: 3,
          title: "Node production mode touched",
          detail: "Production-mode changes can alter build or runtime behavior.",
          suggestedCheck: "Run the production build or a representative smoke test.",
          kinds: ["command", "plan", "diff"]
        }
      ]
    };
  }

  if (preset === "python") {
    return {
      sensitiveDomains: [
        "requirements.txt",
        "pyproject.toml",
        "setup.py",
        "migrations",
        "venv"
      ],
      blockedCommands: [
        "pip install --break-system-packages",
        "python setup.py upload"
      ],
      customRules: [
        {
          id: "python-pickle-load",
          pattern: "\\bpickle\\.loads?\\b",
          severity: 4,
          title: "Pickle deserialization touched",
          detail: "Pickle deserialization can execute code when fed untrusted data.",
          suggestedCheck: "Confirm the input is trusted or use a safer serialization format.",
          kinds: ["diff", "plan"]
        },
        {
          id: "python-eval-exec",
          pattern: "\\b(eval|exec)\\s*\\(",
          severity: 4,
          title: "Dynamic Python execution",
          detail: "eval/exec changes deserve strong justification and tests.",
          suggestedCheck: "Replace with structured parsing or constrain the input surface.",
          kinds: ["diff", "plan"]
        }
      ]
    };
  }

  return {
    riskTolerance: "low",
    hookFailOn: "caution",
    sensitiveDomains: [
      "secrets",
      "token",
      "private key",
      "permissions",
      "crypto",
      "cors",
      "csrf",
      "xss",
      "sql injection"
    ],
    blockedCommands: [
      "chmod -R 777",
      "curl | sh",
      "wget | sh"
    ],
    customRules: [
      {
        id: "insecure-tls-disabled",
        pattern: "(rejectUnauthorized\\s*:\\s*false|NODE_TLS_REJECT_UNAUTHORIZED\\s*=\\s*0|verify\\s*=\\s*False)",
        severity: 5,
        title: "TLS verification disabled",
        detail: "Disabling TLS verification can expose users or infrastructure to interception.",
        suggestedCheck: "Use a trusted certificate path or environment-specific test fixture instead.",
        kinds: ["command", "plan", "diff"]
      },
      {
        id: "broad-cors",
        pattern: "(Access-Control-Allow-Origin\\s*[:=]\\s*[\"']?\\*|origin\\s*:\\s*[\"']?\\*)",
        severity: 4,
        title: "Broad CORS policy",
        detail: "Wildcard origins can widen the attack surface.",
        suggestedCheck: "Restrict origins to the expected domains and add a security note.",
        kinds: ["diff", "plan"]
      }
    ]
  };
}

function mergeConfigs(base: UserJesterConfig, extra: UserJesterConfig): UserJesterConfig {
  return {
    ...base,
    ...extra,
    blockedCommands: mergeStringArrays(base.blockedCommands, extra.blockedCommands),
    sensitiveDomains: mergeStringArrays(base.sensitiveDomains, extra.sensitiveDomains),
    customRules: [
      ...(base.customRules ?? []),
      ...(extra.customRules ?? [])
    ]
  };
}

function mergeStringArrays(left: string[] | undefined, right: string[] | undefined): string[] | undefined {
  const merged = [...new Set([...(left ?? []), ...(right ?? [])])];
  return merged.length > 0 ? merged : undefined;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
