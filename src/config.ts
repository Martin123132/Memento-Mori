import { type Dirent } from "node:fs";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { z } from "zod";
import { reviewKinds, tones, type UserJesterConfig } from "./types.js";

export const configFileNames = ["jester.config.json", ".jester.json"] as const;
export const configPresetNames = ["default", "node", "python", "web", "api", "infra", "ai", "security"] as const;
export const policyLevelNames = ["team", "strict"] as const;

export type ConfigPreset = (typeof configPresetNames)[number];
export type PolicyLevel = (typeof policyLevelNames)[number];

export interface LoadedConfig {
  path?: string;
  config: UserJesterConfig;
}

export interface ConfigValidationResult {
  ok: boolean;
  path?: string;
  config?: UserJesterConfig;
  issues: string[];
}

export type RecommendationConfidence = "low" | "medium" | "high";

export interface PresetRecommendationCandidate {
  preset: ConfigPreset;
  score: number;
  reasons: string[];
}

export interface PresetRecommendation {
  recommendedPreset: ConfigPreset;
  confidence: RecommendationConfidence;
  reasons: string[];
  candidates: PresetRecommendationCandidate[];
  configPath: string | null;
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
  disabledRules: z.array(z.string().min(1)).optional(),
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
  const result = parseConfig(raw);

  if (!result.ok || !result.config) {
    throw new Error(`Invalid jester config at ${configPath}: ${result.issues.join("; ")}`);
  }

  return {
    path: configPath,
    config: result.config
  };
}

export async function validateConfig(options: {
  cwd?: string;
  configPath?: string;
  search?: boolean;
} = {}): Promise<ConfigValidationResult> {
  const cwd = options.cwd ?? process.cwd();
  const search = options.search ?? true;
  const configPath = options.configPath ? resolve(cwd, options.configPath) : search ? await findConfigPath(cwd) : undefined;

  if (!configPath) {
    return {
      ok: false,
      issues: ["No config file found. Expected jester.config.json or .jester.json."]
    };
  }

  try {
    const raw = await readFile(configPath, "utf8");
    return {
      path: configPath,
      ...parseConfig(raw)
    };
  } catch (error) {
    return {
      ok: false,
      path: configPath,
      issues: [error instanceof Error ? error.message : String(error)]
    };
  }
}

export async function recommendConfigPreset(options: {
  cwd?: string;
  configPath?: string;
  search?: boolean;
} = {}): Promise<PresetRecommendation> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const search = options.search ?? true;
  const explicitConfigPath = options.configPath ? resolve(cwd, options.configPath) : undefined;
  const configPath = explicitConfigPath
    ? await fileExists(explicitConfigPath) ? explicitConfigPath : undefined
    : search ? await findConfigPath(cwd) : undefined;
  const paths = await collectRepoPaths(cwd);
  const packageDependencies = await readPackageDependencyNames(cwd);
  const rankedCandidates = rankRecommendationCandidates(scorePresetCandidates(paths, packageDependencies));
  const meaningfulCandidates = rankedCandidates.filter((candidate) => candidate.score > 0);
  const candidates = meaningfulCandidates.length > 0
    ? meaningfulCandidates
    : [{
        preset: "default" as const,
        score: 0,
        reasons: ["No strong stack markers found."]
      }];
  const winner = candidates[0];

  return {
    recommendedPreset: winner.preset,
    confidence: recommendationConfidence(winner.preset, winner.score),
    reasons: winner.reasons,
    candidates,
    configPath: configPath ?? null
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

export async function writePolicyConfig(options: {
  cwd?: string;
  path?: string;
  force?: boolean;
  level?: PolicyLevel;
} = {}): Promise<string> {
  const cwd = options.cwd ?? process.cwd();
  const configPath = resolve(cwd, options.path ?? "jester.config.json");
  const flag = options.force ? "w" : "wx";

  await writeFile(configPath, `${JSON.stringify(userConfigForPolicy(options.level ?? "team"), null, 2)}\n`, { encoding: "utf8", flag });
  return configPath;
}

export function defaultUserConfig(): UserJesterConfig {
  return {
    tone: "court_jester",
    intensity: 3,
    riskTolerance: "medium",
    hookFailOn: "block",
    disabledRules: [],
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

export function userConfigForPolicy(level: PolicyLevel): UserJesterConfig {
  const teamPolicy = mergeConfigs(userConfigForPreset("security"), {
    riskTolerance: "low",
    hookFailOn: "caution",
    sensitiveDomains: [
      "release",
      "deploy",
      "infrastructure",
      "permissions",
      "secrets",
      "customer data",
      "migration"
    ],
    blockedCommands: [
      "git push --force origin main",
      "git push --force origin master",
      "npm unpublish",
      "npm publish --force",
      "terraform destroy"
    ],
    customRules: [
      {
        id: "policy-main-force-push",
        pattern: "git\\s+push\\s+--force(?:-with-lease)?\\s+(origin\\s+)?(main|master)",
        severity: 5,
        title: "Force-push to the main branch",
        detail: "Team policy treats force-pushing the default branch as a stop-and-escalate action.",
        suggestedCheck: "Use a branch or get explicit maintainer approval before rewriting shared history.",
        kinds: ["command", "plan"]
      },
      {
        id: "policy-production-deploy",
        pattern: "\\b(deploy-prod|production\\s+deploy|kubectl\\s+apply|terraform\\s+apply)\\b",
        severity: 4,
        title: "Production or infrastructure deploy",
        detail: "Production and infrastructure changes need evidence, rollback thinking, and the right target.",
        suggestedCheck: "Confirm environment, validation command, and rollback path before proceeding.",
        kinds: ["command", "plan", "final"]
      }
    ]
  });

  if (level === "team") {
    return teamPolicy;
  }

  return mergeConfigs(teamPolicy, {
    intensity: 4,
    blockedCommands: [
      "git reset --hard",
      "git clean -fdx",
      "docker system prune -a",
      "kubectl delete",
      "terraform destroy"
    ],
    customRules: [
      {
        id: "policy-secret-added",
        pattern: "^\\+.*\\b(SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY)\\b",
        flags: "im",
        severity: 5,
        title: "Secret-like value added",
        detail: "Strict policy blocks added secret-looking material in diffs.",
        suggestedCheck: "Remove the secret, rotate it if exposed, and use a secret store or environment variable.",
        kinds: ["diff"]
      },
      {
        id: "policy-release-without-rollback",
        pattern: "\\b(release|publish|deploy)\\b",
        severity: 3,
        title: "Release/deploy needs rollback evidence",
        detail: "Strict policy expects release and deploy work to name verification and rollback steps.",
        suggestedCheck: "Include the exact smoke test, target environment, and rollback plan.",
        kinds: ["plan", "final"]
      }
    ]
  });
}

function parseConfig(raw: string): Omit<ConfigValidationResult, "path"> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      issues: [error instanceof Error ? error.message : String(error)]
    };
  }

  const result = configSchema.safeParse(parsed);

  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map((issue) => `${issue.path.join(".") || "config"}: ${issue.message}`)
    };
  }

  return {
    ok: true,
    config: result.data,
    issues: []
  };
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

  if (preset === "web") {
    return {
      sensitiveDomains: [
        "browser storage",
        "client secret",
        "redirect",
        "returnUrl",
        "dangerouslySetInnerHTML",
        "innerHTML",
        "cookies",
        "session"
      ],
      customRules: [
        {
          id: "web-public-secret-name",
          pattern: "\\b(?:NEXT_PUBLIC|VITE|PUBLIC)_[A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*\\b",
          severity: 5,
          title: "Client-exposed secret-like variable",
          detail: "Public frontend environment variables are bundled for the browser, so secret-like names need a second look.",
          suggestedCheck: "Keep secrets server-side and expose only non-sensitive public config to the browser.",
          kinds: ["diff", "plan", "command"]
        },
        {
          id: "web-unsafe-html-injection",
          pattern: "\\bdangerouslySetInnerHTML\\b|\\binnerHTML\\s*=",
          severity: 4,
          title: "Unsafe HTML injection surface",
          detail: "Direct HTML injection can turn untrusted content into script execution.",
          suggestedCheck: "Use safe rendering, sanitize trusted HTML at the boundary, and add an XSS-focused test.",
          kinds: ["diff", "plan"]
        },
        {
          id: "web-storage-sensitive-value",
          pattern: "\\b(localStorage|sessionStorage)\\s*\\.\\s*setItem\\s*\\([^\\n]*(token|password|secret|api[_-]?key)",
          flags: "i",
          severity: 4,
          title: "Sensitive value stored in browser storage",
          detail: "Tokens and passwords in localStorage or sessionStorage are exposed to any injected script.",
          suggestedCheck: "Prefer httpOnly cookies or a short-lived server-backed session, and document the threat tradeoff.",
          kinds: ["diff", "plan"]
        },
        {
          id: "web-open-redirect-shape",
          pattern: "\\b(redirect|returnUrl|next|location\\.href)\\b[^\\n]*(req\\.query|searchParams|URLSearchParams|window\\.location)",
          severity: 3,
          title: "Open redirect-shaped change",
          detail: "Redirects built from request or URL parameters can send users to attacker-controlled destinations.",
          suggestedCheck: "Allowlist internal paths or trusted origins before redirecting.",
          kinds: ["diff", "plan"]
        }
      ]
    };
  }

  if (preset === "api") {
    return {
      sensitiveDomains: [
        "auth middleware",
        "authorization",
        "session",
        "cors",
        "csrf",
        "rate limit",
        "webhook",
        "database write",
        "migration",
        "admin route",
        "tenant",
        "request validation",
        "openapi"
      ],
      blockedCommands: [
        "prisma migrate reset --force",
        "rails db:drop",
        "sequelize db:drop",
        "dotnet ef database drop"
      ],
      customRules: [
        {
          id: "api-broad-cors",
          pattern: "(Access-Control-Allow-Origin[^\\n]{0,40}[\"']?\\*|cors\\s*\\([^\\n]*(origin\\s*:\\s*[\"']?\\*|credentials\\s*:\\s*true[\\s\\S]{0,80}origin\\s*:\\s*[\"']?\\*))",
          severity: 4,
          title: "Broad API CORS policy",
          detail: "Wildcard or credentialed broad CORS can expose API responses to unintended browser origins.",
          suggestedCheck: "Restrict origins to known clients and add an API CORS regression check.",
          kinds: ["diff", "plan"]
        },
        {
          id: "api-auth-bypass",
          pattern: "\\b(skipAuth|disableAuth|bypassAuth|publicRoute\\s*:\\s*true|auth\\s*:\\s*false|requireAuth\\s*:\\s*false)\\b",
          severity: 4,
          title: "API auth bypass-shaped change",
          detail: "Auth bypass flags can make protected API routes public by accident.",
          suggestedCheck: "Confirm the route is intentionally public and add an authorization test.",
          kinds: ["diff", "plan"]
        },
        {
          id: "api-rate-limit-disabled",
          pattern: "\\b(rateLimit|rateLimiter|throttle)\\b[^\\n]{0,80}\\b(disable|disabled|false|skip|off)\\b|\\b(skip|disable|disabled|off)\\b[^\\n]{0,80}\\b(rateLimit|rateLimiter|throttle)\\b",
          severity: 3,
          title: "API rate limiting disabled",
          detail: "Removing or disabling throttles can turn normal endpoints into abuse or cost-amplification paths.",
          suggestedCheck: "Keep a bounded limit, scope the exception, or add an abuse-focused smoke check.",
          kinds: ["diff", "plan"]
        },
        {
          id: "api-raw-sql-user-input",
          pattern: "\\b(query|execute|raw|unsafe)\\s*\\([\\s\\S]{0,160}\\b(req\\.(?:body|query|params)|searchParams|URLSearchParams|userInput)\\b|\\b(req\\.(?:body|query|params)|searchParams|URLSearchParams|userInput)\\b[\\s\\S]{0,160}\\b(query|execute|raw|unsafe)\\s*\\(",
          severity: 5,
          title: "Raw SQL from request input",
          detail: "Request-controlled values flowing into raw query execution can become SQL injection.",
          suggestedCheck: "Use parameterized queries or a query builder, then add an injection-focused test.",
          kinds: ["diff", "plan"]
        },
        {
          id: "api-webhook-signature-disabled",
          pattern: "\\bwebhook\\b[^\\n]{0,120}\\b(skip|disable|disabled|without|no)\\b[^\\n]{0,80}\\b(signature|signing|verify|verification)\\b|\\b(skip|disable|disabled|without|no)\\b[^\\n]{0,80}\\bwebhook\\b[^\\n]{0,120}\\b(signature|signing|verify|verification)\\b|\\b(signature|signing|verify|verification)\\b[^\\n]{0,80}\\b(skip|disable|disabled|without|no)\\b[^\\n]{0,120}\\bwebhook\\b",
          severity: 4,
          title: "Webhook signature verification disabled",
          detail: "Unsigned webhooks let attackers forge events that look like trusted provider callbacks.",
          suggestedCheck: "Verify provider signatures before parsing or acting on the webhook payload.",
          kinds: ["diff", "plan"]
        },
        {
          id: "api-destructive-migration",
          pattern: "\\b(drop\\s+(column|table|database)|truncate\\s+table|delete\\s+from\\s+[a-z0-9_\"]+\\s*;)\\b",
          severity: 5,
          title: "Destructive API data migration",
          detail: "Backend migrations that drop or broadly delete data need backups and rollback thinking.",
          suggestedCheck: "Confirm the environment, backup, migration plan, and rollback path before applying it.",
          kinds: ["diff", "plan"]
        }
      ]
    };
  }

  if (preset === "infra") {
    return {
      riskTolerance: "low",
      hookFailOn: "caution",
      sensitiveDomains: [
        "terraform",
        "pulumi",
        "kubernetes",
        "helm",
        "iam",
        "security group",
        "public bucket",
        "production",
        "infrastructure"
      ],
      blockedCommands: [
        "terraform destroy",
        "kubectl delete",
        "helm uninstall",
        "docker system prune -a"
      ],
      customRules: [
        {
          id: "infra-production-change",
          pattern: "\\b(terraform|pulumi|kubectl|helm)\\b[^\\n]*(apply|destroy|delete|replace|up|uninstall|upgrade)",
          severity: 5,
          title: "Production-impacting infra command",
          detail: "Infrastructure commands can change live systems, delete resources, or alter deployment state.",
          suggestedCheck: "Confirm the target environment, review the plan/diff, and name the rollback path.",
          kinds: ["command", "plan"]
        },
        {
          id: "infra-iam-wildcard-permission",
          pattern: "\\b(iam|policy|permission|role)\\b[\\s\\S]{0,160}(\"Action\"\\s*:\\s*\"\\*\"|\"Resource\"\\s*:\\s*\"\\*\"|\\*)",
          severity: 4,
          title: "IAM permission widening",
          detail: "Wildcard IAM actions or resources can grant more access than intended.",
          suggestedCheck: "Narrow actions and resources, then get a security review for broad permissions.",
          kinds: ["diff", "plan"]
        },
        {
          id: "infra-public-exposure",
          pattern: "\\b(0\\.0\\.0\\.0/0|public-read|public_access_block\\s*=\\s*false|block_public_acls\\s*=\\s*false|allow\\s+all)\\b",
          severity: 4,
          title: "Public cloud exposure",
          detail: "Public networking or storage settings can expose infrastructure or data.",
          suggestedCheck: "Restrict the source, bucket, or network rule and document the intended exposure.",
          kinds: ["diff", "plan"]
        },
        {
          id: "infra-state-or-secret-change",
          pattern: "\\b(tfstate|kubeconfig|\\.pem|private[_-]?key|client[_-]?secret|AWS[_-]?SECRET[_-]?ACCESS[_-]?KEY)\\b",
          severity: 5,
          title: "Infrastructure state or secret material touched",
          detail: "State files, kubeconfigs, private keys, and cloud secrets should not drift into source or logs.",
          suggestedCheck: "Remove secret/state material, rotate exposed credentials, and use the team's secret store.",
          kinds: ["diff", "plan", "command"]
        }
      ]
    };
  }

  if (preset === "ai") {
    return {
      sensitiveDomains: [
        "system prompt",
        "developer message",
        "tool call",
        "function call",
        "mcp",
        "agent",
        "eval",
        "retrieval",
        "vector store",
        "user prompt",
        "transcript"
      ],
      customRules: [
        {
          id: "ai-public-provider-key",
          pattern: "\\b(?:NEXT_PUBLIC|VITE|PUBLIC)_[A-Z0-9_]*(?:OPENAI|ANTHROPIC|GEMINI|GOOGLE|MISTRAL|COHERE|TOGETHER|PERPLEXITY)[A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET)[A-Z0-9_]*\\b|\\b(?:NEXT_PUBLIC|VITE|PUBLIC)_[A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET)[A-Z0-9_]*\\b",
          severity: 5,
          title: "Client-exposed AI provider key",
          detail: "Public frontend variables are bundled for the browser, so AI provider keys or tokens must not use public prefixes.",
          suggestedCheck: "Keep provider credentials server-side and expose only non-sensitive model or feature config to the client.",
          kinds: ["diff", "plan", "command"]
        },
        {
          id: "ai-prompt-injection-shape",
          pattern: "\\b(ignore\\s+(?:all\\s+)?(?:previous|prior|above)\\s+instructions|jailbreak|prompt\\s+injection|system\\s+prompt|developer\\s+message)\\b",
          severity: 4,
          title: "Prompt-injection shaped change",
          detail: "System/developer prompts and jailbreak-like instructions can alter model behavior in surprising ways.",
          suggestedCheck: "Add prompt-injection tests or eval cases, and keep untrusted user content outside privileged instructions.",
          kinds: ["diff", "plan"]
        },
        {
          id: "ai-user-controlled-tool-dispatch",
          pattern: "\\b(callTool|tool_choice|function_call|tools?\\s*\\[|agent\\s+tool|mcp\\s+tool)\\b[\\s\\S]{0,160}\\b(req\\.(?:body|query)|searchParams|URLSearchParams|userPrompt|user\\s+input|message\\.content|input\\.text)\\b|\\b(req\\.(?:body|query)|searchParams|URLSearchParams|userPrompt|user\\s+input|message\\.content|input\\.text)\\b[\\s\\S]{0,160}\\b(callTool|tool_choice|function_call|tools?\\s*\\[|agent\\s+tool|mcp\\s+tool)\\b",
          severity: 4,
          title: "User-controlled tool dispatch",
          detail: "Tool or function dispatch influenced directly by user-controlled text can turn prompts into actions.",
          suggestedCheck: "Use an explicit allowlist, validate tool names and arguments, and test denied tool calls.",
          kinds: ["diff", "plan"]
        },
        {
          id: "ai-evals-skipped",
          pattern: "\\b(skip|disable|remove|delete|without)\\b[^\\n]{0,80}\\b(evals?|evaluations?|model\\s+checks?|safety\\s+checks?|red[- ]?team)\\b|\\b(evals?|evaluations?|model\\s+checks?|safety\\s+checks?|red[- ]?team)\\b[^\\n]{0,80}\\b(skip|disabled?|removed?|deleted?|without)\\b",
          severity: 3,
          title: "AI eval or safety check skipped",
          detail: "Model behavior changes need regression checks because small prompt or tool changes can alter many outputs.",
          suggestedCheck: "Run or update representative evals, or document the replacement manual review.",
          kinds: ["diff", "plan", "final"]
        },
        {
          id: "ai-model-output-execution",
          pattern: "\\b(eval|exec|spawn|execFile|child_process|shell)\\b[\\s\\S]{0,160}\\b(modelOutput|llmOutput|completion|assistantMessage|message\\.content|response\\.output_text|generatedText)\\b|\\b(modelOutput|llmOutput|completion|assistantMessage|message\\.content|response\\.output_text|generatedText)\\b[\\s\\S]{0,160}\\b(eval|exec|spawn|execFile|child_process|shell)\\b",
          severity: 5,
          title: "Model output execution",
          detail: "Executing model-generated text as code or shell input can turn prompt injection into code execution.",
          suggestedCheck: "Treat model output as data, parse it into a constrained schema, and require explicit allowlisted actions.",
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
    disabledRules: mergeStringArrays(base.disabledRules, extra.disabledRules),
    customRules: [
      ...(base.customRules ?? []),
      ...(extra.customRules ?? [])
    ]
  };
}

function mergeStringArrays(left: string[] | undefined, right: string[] | undefined): string[] | undefined {
  const merged = [...new Set([...(left ?? []), ...(right ?? [])])];
  return merged.length > 0 ? merged : left || right ? [] : undefined;
}

const skippedRecommendationDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".venv",
  "venv",
  "vendor"
]);

const recommendationTieBreak: ConfigPreset[] = [
  "ai",
  "infra",
  "api",
  "web",
  "node",
  "python",
  "security",
  "default"
];

async function collectRepoPaths(root: string, current: string = root): Promise<string[]> {
  let entries: Dirent[];

  try {
    entries = await readdir(current, { withFileTypes: true });
  } catch {
    return [];
  }

  const paths: string[] = [];
  const sortedEntries = entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of sortedEntries) {
    const fullPath = join(current, entry.name);

    if (entry.isDirectory()) {
      if (!skippedRecommendationDirectories.has(entry.name.toLocaleLowerCase())) {
        paths.push(...await collectRepoPaths(root, fullPath));
      }
      continue;
    }

    if (entry.isFile()) {
      paths.push(relative(root, fullPath).replace(/\\/g, "/"));
    }
  }

  return paths;
}

async function readPackageDependencyNames(cwd: string): Promise<Set<string>> {
  try {
    const raw = await readFile(join(cwd, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as {
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
      peerDependencies?: Record<string, unknown>;
      optionalDependencies?: Record<string, unknown>;
    };

    return new Set([
      ...Object.keys(parsed.dependencies ?? {}),
      ...Object.keys(parsed.devDependencies ?? {}),
      ...Object.keys(parsed.peerDependencies ?? {}),
      ...Object.keys(parsed.optionalDependencies ?? {})
    ].map((dependency) => dependency.toLocaleLowerCase()));
  } catch {
    return new Set();
  }
}

function scorePresetCandidates(paths: string[], packageDependencies: Set<string>): PresetRecommendationCandidate[] {
  const candidates = new Map<ConfigPreset, PresetRecommendationCandidate>(
    configPresetNames.map((preset) => [preset, { preset, score: 0, reasons: [] }])
  );
  const lowerPaths = paths.map((path) => path.toLocaleLowerCase());

  const add = (preset: ConfigPreset, score: number, reason: string) => {
    const candidate = candidates.get(preset);
    if (!candidate) {
      return;
    }

    candidate.score += score;
    if (!candidate.reasons.includes(reason)) {
      candidate.reasons.push(reason);
    }
  };

  if (hasExactPath(lowerPaths, "package.json")) {
    add("node", 5, "Found package.json");
  }
  if (hasFileName(lowerPaths, ["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb"])) {
    add("node", 2, "Found JavaScript package lockfile");
  }
  if (hasFileName(lowerPaths, ["tsconfig.json", "jsconfig.json"])) {
    add("node", 2, "Found TypeScript or JavaScript project config");
  }
  if (lowerPaths.some((path) => /\.(?:mjs|cjs|js|jsx|mts|cts|ts|tsx)$/.test(path) && !path.endsWith(".d.ts"))) {
    add("node", 1, "Found JavaScript or TypeScript source files");
  }

  if (hasFileName(lowerPaths, ["pyproject.toml"])) {
    add("python", 5, "Found pyproject.toml");
  }
  if (hasFileName(lowerPaths, ["requirements.txt", "setup.py", "poetry.lock", "uv.lock"])) {
    add("python", 3, "Found Python dependency or package file");
  }
  if (lowerPaths.some((path) => path.endsWith(".py"))) {
    add("python", 1, "Found Python source files");
  }

  if (lowerPaths.some((path) => /(?:^|\/)(?:next|vite|astro|remix)\.config\.(?:js|mjs|cjs|ts|mts|cts)$/.test(path))) {
    add("web", 5, "Found frontend framework config");
  }
  if (hasFileName(lowerPaths, ["index.html"])) {
    add("web", 3, "Found browser entry HTML");
  }
  if (hasAnyDependency(packageDependencies, ["@remix-run/node", "@sveltejs/kit", "astro", "next", "react", "svelte", "vite", "vue"])) {
    add("web", 3, "Found frontend framework dependency");
  }
  if (lowerPaths.some((path) => /(?:^|\/)(?:app|pages|src\/routes)\//.test(path) && /\.(?:jsx|tsx|vue|svelte)$/.test(path))) {
    add("web", 2, "Found frontend route or app files");
  }
  if (lowerPaths.some((path) => /\.(?:jsx|tsx|vue|svelte)$/.test(path))) {
    add("web", 2, "Found component source files");
  }

  if (lowerPaths.some((path) => /(?:^|\/)(?:openapi|swagger)\.(?:ya?ml|json)$/.test(path))) {
    add("api", 5, "Found OpenAPI or Swagger spec");
  }
  if (lowerPaths.some((path) => path === "prisma/schema.prisma" || path.includes("/prisma/schema.prisma") || /(?:^|\/)migrations\//.test(path))) {
    add("api", 4, "Found ORM schema or database migrations");
  }
  if (lowerPaths.some((path) => /(?:^|\/)(?:api|routes|server|controllers|middleware)\//.test(path))) {
    add("api", 3, "Found server or API route folders");
  }
  if (hasAnyDependency(packageDependencies, ["@fastify/cors", "@nestjs/core", "@prisma/client", "express", "fastify", "hapi", "koa", "nestjs", "prisma"])) {
    add("api", 3, "Found API server or ORM dependency");
  }

  if (lowerPaths.some((path) => path.endsWith(".tf") || path.endsWith(".tfvars") || path.endsWith(".tf.json"))) {
    add("infra", 5, "Found Terraform files");
  }
  if (hasFileName(lowerPaths, ["pulumi.yaml", "pulumi.yml", "pulumi.json"])) {
    add("infra", 5, "Found Pulumi project file");
  }
  if (hasFileName(lowerPaths, ["dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"])) {
    add("infra", 3, "Found Docker config");
  }
  if (hasFileName(lowerPaths, ["chart.yaml", "values.yaml"]) || lowerPaths.some((path) => /(?:^|\/)(?:k8s|kubernetes|helm)\//.test(path))) {
    add("infra", 3, "Found Kubernetes or Helm files");
  }
  if (lowerPaths.some((path) => path.startsWith(".github/workflows/") && /\b(?:deploy|release|publish|terraform|kubectl)\b/.test(path))) {
    add("infra", 2, "Found deployment workflow");
  }

  if (lowerPaths.some((path) => /(?:^|\/|\.)(?:mcp)(?:\/|\.|-|_|$)/.test(path))) {
    add("ai", 4, "Found MCP-related files");
  }
  if (hasFileName(lowerPaths, ["agents.md", "claude.md", "memento_mori.md", "memento-mori.md"])) {
    add("ai", 3, "Found agent instruction files");
  }
  if (lowerPaths.some((path) => /(?:^|\/)(?:prompts?|evals?|evaluations?|vector-store|retrieval)\//.test(path))) {
    add("ai", 4, "Found prompt, eval, retrieval, or vector-store folders");
  }
  if (hasAnyDependency(packageDependencies, ["@anthropic-ai/sdk", "@modelcontextprotocol/sdk", "ai", "langchain", "openai"])) {
    add("ai", 4, "Found AI or MCP dependency");
  }
  if (lowerPaths.some((path) => /(?:^|\/|[-_.])(?:agent|llm|prompt|eval)(?:\/|[-_.]|$)/.test(path))) {
    add("ai", 2, "Found AI-oriented file naming");
  }

  if (hasFileName(lowerPaths, ["security.md"])) {
    add("security", 2, "Found security policy documentation");
  }
  if (lowerPaths.some((path) => /(?:^|\/)(?:\.semgrep|semgrep|snyk|trivy|codeql|dependabot)(?:\/|\.|$)/.test(path) || path.includes("/codeql-"))) {
    add("security", 3, "Found security scanning config");
  }
  if (lowerPaths.some((path) => path.startsWith(".github/workflows/") && /\b(?:security|codeql|snyk|trivy|semgrep)\b/.test(path))) {
    add("security", 3, "Found security workflow");
  }

  return [...candidates.values()];
}

function rankRecommendationCandidates(candidates: PresetRecommendationCandidate[]): PresetRecommendationCandidate[] {
  return [...candidates].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return recommendationTieBreak.indexOf(left.preset) - recommendationTieBreak.indexOf(right.preset);
  });
}

function recommendationConfidence(preset: ConfigPreset, score: number): RecommendationConfidence {
  if (preset === "default") {
    return "low";
  }
  if (score >= 5) {
    return "high";
  }
  if (score >= 3) {
    return "medium";
  }
  return "low";
}

function hasExactPath(paths: string[], expectedPath: string): boolean {
  return paths.includes(expectedPath) || paths.some((path) => path.endsWith(`/${expectedPath}`));
}

function hasFileName(paths: string[], fileNames: string[]): boolean {
  const fileNameSet = new Set(fileNames);
  return paths.some((path) => fileNameSet.has(path.split("/").pop() ?? ""));
}

function hasAnyDependency(packageDependencies: Set<string>, dependencyNames: string[]): boolean {
  return dependencyNames.some((dependency) => packageDependencies.has(dependency.toLocaleLowerCase()));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
