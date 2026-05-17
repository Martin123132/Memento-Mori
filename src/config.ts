import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import { reviewKinds, tones, type UserJesterConfig } from "./types.js";

export const configFileNames = ["jester.config.json", ".jester.json"] as const;

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
} = {}): Promise<string> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = resolve(cwd, options.path ?? "jester.config.json");
  const flag = options.force ? "w" : "wx";

  await writeFile(configPath, `${JSON.stringify(defaultUserConfig(), null, 2)}\n`, { encoding: "utf8", flag });
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

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
