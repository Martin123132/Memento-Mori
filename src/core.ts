import {
  type Issue,
  type JesterConfig,
  type ReviewInput,
  type ReviewKind,
  type ReviewResult,
  type RiskTolerance,
  type Tone,
  type UserJesterConfig,
  reviewKinds,
  tones
} from "./types.js";

export const defaultConfig: JesterConfig = {
  tone: "court_jester",
  intensity: 3,
  riskTolerance: "medium"
};

type RuleSource = "built-in" | "structural" | "project-config";

export type RuleGuidance = {
  why: string;
  falsePositive: string;
  saferAlternative: string;
  tuning: string;
};

export type RuleCatalogEntry = {
  id: string;
  severity: Issue["severity"];
  title: string;
  detail: string;
  suggestedCheck: string;
  guidance: RuleGuidance;
  kinds: ReviewKind[];
  source: RuleSource;
  matcher: "regex" | "heuristic" | "literal";
  enabled: boolean;
  pattern?: string;
  flags?: string;
  value?: string;
};

type PatternRule = {
  id: string;
  severity: Issue["severity"];
  title: string;
  detail: string;
  suggestedCheck: string;
  pattern: RegExp;
  kinds?: ReviewKind[];
};

const universalRules: PatternRule[] = [
  {
    id: "destructive-git-history",
    severity: 5,
    title: "Destructive git operation",
    detail: "This can discard local work or remove untracked files.",
    suggestedCheck: "Inspect `git status`, confirm the target branch, and make a backup or stash before running it.",
    pattern: /\bgit\s+(reset\s+--hard|clean\s+-[^\s]*[fd]|checkout\s+--)\b/i,
    kinds: ["command", "plan"]
  },
  {
    id: "recursive-force-delete",
    severity: 5,
    title: "Recursive forced deletion",
    detail: "A recursive forced delete is one typo away from a very educational afternoon.",
    suggestedCheck: "Resolve the absolute path first and confirm it is inside the intended workspace.",
    pattern: /\b(rm\s+(-[^\s]*r[^\s]*f|-rf|-fr)|Remove-Item\b[\s\S]*(?:-Recurse|-r)\b[\s\S]*(?:-Force|-f)|rd\s+\/s\s+\/q|rmdir\s+\/s\s+\/q)\b/i,
    kinds: ["command", "plan"]
  },
  {
    id: "pipe-to-shell",
    severity: 5,
    title: "Remote script piped into a shell",
    detail: "Downloading code and immediately executing it gives the internet a tiny crown.",
    suggestedCheck: "Download the script, inspect it, pin the source/version, then run only the reviewed command.",
    pattern: /\b(curl|wget|iwr|Invoke-WebRequest)\b[\s\S]*\|\s*(sh|bash|zsh|iex|Invoke-Expression)\b/i,
    kinds: ["command", "plan"]
  },
  {
    id: "database-destruction",
    severity: 5,
    title: "Potential database destruction",
    detail: "The text contains a database drop, truncate, or broad delete.",
    suggestedCheck: "Verify environment, take a backup, dry-run the query, and require an explicit production approval if applicable.",
    pattern: /\b(drop\s+(database|schema|table)|truncate\s+table|delete\s+from\s+[a-z0-9_"]+\s*;)\b/i
  },
  {
    id: "secret-material",
    severity: 5,
    title: "Secret material may be exposed",
    detail: "The content looks like it may include credentials, API keys, or private keys.",
    suggestedCheck: "Remove secrets from prompts, rotate any exposed credentials, and use environment variables or a secret store.",
    pattern: /\b(OPENAI_API_KEY|ANTHROPIC_API_KEY|AWS_SECRET_ACCESS_KEY|BEGIN (RSA|OPENSSH|PRIVATE) KEY|xox[baprs]-|ghp_[a-z0-9_]{20,})\b/i
  },
  {
    id: "privileged-command",
    severity: 3,
    title: "Privileged command",
    detail: "Elevated commands widen the blast radius if the assumption is wrong.",
    suggestedCheck: "Confirm why elevation is required and prefer the narrowest target possible.",
    pattern: /\b(sudo|runas|Start-Process\b[\s\S]*-Verb\s+RunAs)\b/i,
    kinds: ["command", "plan"]
  },
  {
    id: "risky-domain",
    severity: 3,
    title: "High-risk domain touched",
    detail: "Auth, billing, production, migrations, or security-sensitive areas deserve extra evidence.",
    suggestedCheck: "Add a targeted test or manual verification note for the sensitive behavior.",
    pattern: /\b(auth|login|oauth|permission|security|billing|payment|invoice|prod|production|customer data|migration|schema change)\b/i
  },
  {
    id: "chmod-777",
    severity: 4,
    title: "Over-broad permissions",
    detail: "Recursive 777 permissions trade a real problem for a louder future problem.",
    suggestedCheck: "Set the smallest required owner/group/mode on the specific path.",
    pattern: /\bchmod\s+-R\s+777\b/i,
    kinds: ["command", "plan"]
  }
];

const planRules: PatternRule[] = [
  {
    id: "confidence-theater",
    severity: 2,
    title: "Confidence theater",
    detail: "Words like simple, obvious, or definitely often hide unpriced complexity.",
    suggestedCheck: "Name the assumption and the quickest way to falsify it.",
    pattern: /\b(just|simply|obvious|obviously|definitely|guaranteed|straightforward|easy)\b/i,
    kinds: ["plan"]
  },
  {
    id: "vibes-based-plan",
    severity: 2,
    title: "Vibes-based uncertainty",
    detail: "The plan leans on maybe/probably/should without a verification step nearby.",
    suggestedCheck: "Add a concrete check: test command, fixture, screenshot, log, or dry run.",
    pattern: /\b(maybe|probably|should work|i think|seems like|guess)\b/i,
    kinds: ["plan"]
  },
  {
    id: "skip-tests",
    severity: 4,
    title: "Testing skipped by decree",
    detail: "Skipping validation is sometimes fine, but it should be an explicit tradeoff, not a shrug.",
    suggestedCheck: "State why tests cannot run and what cheaper verification will replace them.",
    pattern: /\b(no need to test|skip tests|won't test|without testing)\b/i,
    kinds: ["plan", "final"]
  }
];

const finalRules: PatternRule[] = [
  {
    id: "done-without-evidence",
    severity: 3,
    title: "Completion claim lacks evidence",
    detail: "The answer claims completion but does not mention a build, test, run, or concrete verification.",
    suggestedCheck: "Include the command that was run or clearly say what remains unverified.",
    pattern: /\b(done|fixed|completed|implemented|works|all set)\b/i,
    kinds: ["final"]
  },
  {
    id: "untested-final",
    severity: 3,
    title: "Final answer says tests were not run",
    detail: "Saying the work is done while also saying it was not tested needs a clear limitation, not a victory lap.",
    suggestedCheck: "State what remains unverified and the exact command or manual check someone should run next.",
    pattern: /\b(did not run tests|didn't run tests|tests not run|not run tests|couldn't run tests|could not run tests|unable to run tests|not tested)\b/i,
    kinds: ["final"]
  },
  {
    id: "handwave-final",
    severity: 2,
    title: "Hand-wavy final claim",
    detail: "This phrasing sounds confident without carrying much evidence.",
    suggestedCheck: "Replace the broad claim with a specific result or known limitation.",
    pattern: /\b(should be fine|looks good|no issues|everything works|fully working)\b/i,
    kinds: ["final"]
  }
];

const diffRules: PatternRule[] = [
  {
    id: "test-removal",
    severity: 3,
    title: "Tests appear to be removed",
    detail: "Deleting tests can be correct, but it deserves an explanation and replacement coverage if behavior remains.",
    suggestedCheck: "Confirm the removed tests were obsolete or add replacement coverage for the changed behavior.",
    pattern: /^-\s*(it|test|describe)\s*\(/im,
    kinds: ["diff"]
  },
  {
    id: "ts-ignore",
    severity: 2,
    title: "Type system bypass",
    detail: "A suppression comment can hide a real contract mismatch.",
    suggestedCheck: "Prefer a typed boundary or explain why this suppression is temporary and safe.",
    pattern: /^\+\s*\/\/\s*@ts-(ignore|expect-error)/im,
    kinds: ["diff"]
  },
  {
    id: "temporary-marker",
    severity: 1,
    title: "Temporary marker added",
    detail: "TODO/FIXME/temp markers are fine when tracked, suspicious when quietly shipped.",
    suggestedCheck: "Link it to an issue or finish it before release.",
    pattern: /^\+.*\b(TODO|FIXME|HACK|temporary|temp)\b/im,
    kinds: ["diff"]
  },
  {
    id: "console-log",
    severity: 1,
    title: "Debug logging added",
    detail: "Debug logs have a habit of becoming accidental telemetry.",
    suggestedCheck: "Remove it or route it through the project's logging/debug facility.",
    pattern: /^\+.*\bconsole\.(log|debug|trace)\s*\(/im,
    kinds: ["diff"]
  },
  {
    id: "package-install-script",
    severity: 4,
    title: "Package install script added",
    detail: "npm install lifecycle scripts run on user machines and deserve extra scrutiny.",
    suggestedCheck: "Confirm the script is necessary, safe, documented, and covered by release notes.",
    pattern: /^\+\s*"(preinstall|install|postinstall|prepare)"\s*:/im,
    kinds: ["diff"]
  },
  {
    id: "sensitive-env-change",
    severity: 4,
    title: "Sensitive environment setting changed",
    detail: "Environment and secret-like settings can silently alter build, runtime, or security behavior.",
    suggestedCheck: "Verify the environment target, keep secrets out of source, and run a representative smoke test.",
    pattern: /(^diff --git\s+.*(?:\.env|\.npmrc|\.pypirc|secrets?|credentials?|config\/).*|^\+\s*[A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD|DATABASE_URL|NODE_ENV|TLS|CORS|AUTH)[A-Z0-9_]*\s*=)/im,
    kinds: ["diff"]
  }
];

const structuralRules: RuleCatalogEntry[] = [
  {
    id: "missing-verification-step",
    severity: 2,
    title: "No verification step",
    detail: "The plan changes behavior but does not say how the result will be checked.",
    suggestedCheck: "Add the cheapest meaningful validation step before calling the work complete.",
    guidance: structuralGuidance("missing-verification-step"),
    kinds: ["plan"],
    source: "structural",
    matcher: "heuristic",
    enabled: true
  },
  {
    id: "large-removal",
    severity: 2,
    title: "Large removal with little replacement",
    detail: "A large deletion may be correct, but it deserves a second look for lost behavior.",
    suggestedCheck: "Review the deleted surface area and run tests that cover the removed code paths.",
    guidance: structuralGuidance("large-removal"),
    kinds: ["diff"],
    source: "structural",
    matcher: "heuristic",
    enabled: true
  },
  {
    id: "wildcard-file-operation",
    severity: 2,
    title: "Wildcard file operation",
    detail: "Wildcard moves or copies can quietly grab more than intended.",
    suggestedCheck: "List the matched files first and confirm the destination before running the command.",
    guidance: structuralGuidance("wildcard-file-operation"),
    kinds: ["command"],
    source: "structural",
    matcher: "heuristic",
    enabled: true
  }
];

export function listRules(options: {
  kind?: ReviewKind;
  config?: UserJesterConfig;
} = {}): RuleCatalogEntry[] {
  const builtInRules = [
    ...universalRules,
    ...planRules,
    ...finalRules,
    ...diffRules
  ].map((rule) => catalogEntryFromPatternRule(rule));
  const rules = markDisabledRules([
    ...builtInRules,
    ...structuralRules,
    ...projectConfigRules(options.config)
  ], options.config?.disabledRules);

  return rules
    .filter((rule) => !options.kind || rule.kinds.includes(options.kind))
    .sort((left, right) => {
      const sourceOrder = sourceRank(left.source) - sourceRank(right.source);
      return sourceOrder || right.severity - left.severity || left.id.localeCompare(right.id);
    });
}

export function reviewPlan(plan: string, options: Partial<ReviewInput> = {}): ReviewResult {
  return review({ ...options, kind: "plan", content: plan });
}

export function reviewCommand(command: string, options: Partial<ReviewInput> = {}): ReviewResult {
  return review({ ...options, kind: "command", content: command });
}

export function reviewDiff(diff: string, options: Partial<ReviewInput> = {}): ReviewResult {
  return review({ ...options, kind: "diff", content: diff });
}

export function reviewFinalAnswer(answer: string, options: Partial<ReviewInput> = {}): ReviewResult {
  return review({ ...options, kind: "final", content: answer });
}

export function review(input: ReviewInput): ReviewResult {
  const tone = normalizeTone(input.tone ?? input.config?.tone);
  const intensity = clampIntensity(input.intensity ?? input.config?.intensity ?? defaultConfig.intensity);
  const riskTolerance = input.riskTolerance ?? input.config?.riskTolerance ?? defaultConfig.riskTolerance;
  const subject = input.subject?.trim() || defaultSubject(input.kind);
  const combined = [input.subject, input.context, input.content].filter(Boolean).join("\n\n");

  const matchedIssues = filterDisabledIssues(dedupeIssues([
    ...findPatternIssues(combined, input.kind, universalRules),
    ...findKindIssues(combined, input.kind),
    ...findStructuralIssues(input.kind, input.content),
    ...findConfigIssues(combined, input.kind, input.config)
  ]), input.config?.disabledRules);
  const issues = input.kind === "diff" && isDocsOnlyDiff(input.content)
    ? filterDocsOnlyNoise(matchedIssues)
    : matchedIssues;

  const riskScore = scoreIssues(issues, riskTolerance);
  const verdict = riskScore >= 72 || issues.some((issue) => issue.severity === 5) ? "block" : riskScore >= 18 ? "caution" : "pass";
  const suggestedChecks = dedupeStrings(issues.map((issue) => issue.suggestedCheck)).slice(0, 5);

  return {
    kind: input.kind,
    subject,
    verdict,
    riskScore,
    tone,
    intensity,
    jab: renderJab({ tone, intensity, verdict, kind: input.kind, text: combined }),
    memento: renderMemento({ tone, kind: input.kind, text: combined }),
    issues,
    suggestedChecks
  };
}

function findKindIssues(text: string, kind: ReviewKind): Issue[] {
  if (kind === "plan") {
    return findPatternIssues(text, kind, planRules);
  }

  if (kind === "diff") {
    return findPatternIssues(text, kind, diffRules);
  }

  if (kind === "final") {
    const issues = findPatternIssues(text, kind, finalRules);
    const hasEvidence = /\b(test|tests|tested|build|built|verified|ran|checked|smoke|lint|typecheck|screenshot|log)\b/i.test(text);
    return hasEvidence ? issues.filter((issue) => issue.id !== "done-without-evidence") : issues;
  }

  return [];
}

function findConfigIssues(text: string, kind: ReviewKind, config: UserJesterConfig | undefined): Issue[] {
  if (!config) {
    return [];
  }

  return [
    ...findBlockedCommandIssues(text, kind, config.blockedCommands),
    ...findSensitiveDomainIssues(text, config.sensitiveDomains),
    ...findCustomRuleIssues(text, kind, config)
  ];
}

function findBlockedCommandIssues(text: string, kind: ReviewKind, blockedCommands: string[] | undefined): Issue[] {
  if (!blockedCommands || blockedCommands.length === 0) {
    return [];
  }

  return blockedCommands.flatMap((command) => {
    const cleaned = command.trim();
    if (!cleaned || !literalIncludes(text, cleaned)) {
      return [];
    }

    return [
      {
        id: `blocked-command-${slugify(cleaned)}`,
        severity: 5,
        title: "Project-blocked command",
        detail: "This command is listed in the project's jester config as blocked.",
        suggestedCheck: kind === "command"
          ? "Use a safer command or get explicit project approval before running it."
          : "Change the plan so it avoids this blocked command.",
        evidence: cleanEvidence(cleaned)
      } satisfies Issue
    ];
  });
}

function findSensitiveDomainIssues(text: string, sensitiveDomains: string[] | undefined): Issue[] {
  if (!sensitiveDomains || sensitiveDomains.length === 0) {
    return [];
  }

  return sensitiveDomains.flatMap((domain) => {
    const cleaned = domain.trim();
    if (!cleaned || !literalIncludes(text, cleaned)) {
      return [];
    }

    return [
      {
        id: `configured-sensitive-domain-${slugify(cleaned)}`,
        severity: 3,
        title: "Project-sensitive domain touched",
        detail: "This domain is listed in the project's jester config as sensitive.",
        suggestedCheck: "Add a targeted test, manual verification note, or rollback plan for this project-sensitive area.",
        evidence: cleanEvidence(cleaned)
      } satisfies Issue
    ];
  });
}

function findCustomRuleIssues(text: string, kind: ReviewKind, config: UserJesterConfig): Issue[] {
  return (config.customRules ?? []).flatMap((rule) => {
    if (rule.kinds && !rule.kinds.includes(kind)) {
      return [];
    }

    let pattern: RegExp;
    try {
      pattern = new RegExp(rule.pattern, rule.flags ?? "i");
    } catch {
      return [];
    }

    const match = pattern.exec(text);
    if (!match) {
      return [];
    }

    return [
      {
        id: `custom-${rule.id}`,
        severity: rule.severity ?? 3,
        title: rule.title ?? "Custom project rule matched",
        detail: rule.detail ?? "A custom rule from the project's jester config matched this content.",
        suggestedCheck: rule.suggestedCheck ?? "Review the matched project rule and add an explicit verification step.",
        evidence: cleanEvidence(match[0])
      } satisfies Issue
    ];
  });
}

function findStructuralIssues(kind: ReviewKind, content: string): Issue[] {
  const issues: Issue[] = [];

  if (kind === "plan") {
    const soundsLikeImplementation = /\b(implement|change|edit|fix|refactor|delete|migrate|deploy|release|ship)\b/i.test(content);
    const mentionsVerification = /\b(test|verify|check|build|run|dry-run|snapshot|screenshot|backup|rollback)\b/i.test(content);

    if (soundsLikeImplementation && !mentionsVerification) {
      issues.push(issueFromCatalogEntry(structuralRule("missing-verification-step")));
    }
  }

  if (kind === "diff") {
    const removedLines = content.split(/\r?\n/).filter((line) => line.startsWith("-") && !line.startsWith("---")).length;
    const addedLines = content.split(/\r?\n/).filter((line) => line.startsWith("+") && !line.startsWith("+++")).length;

    if (removedLines > 80 && addedLines < removedLines / 3) {
      issues.push(issueFromCatalogEntry(structuralRule("large-removal")));
    }
  }

  if (kind === "command") {
    const hasWildcardMove = /\b(mv|move|Move-Item|Copy-Item|cp)\b[\s\S]*\*/i.test(content);
    if (hasWildcardMove) {
      issues.push(issueFromCatalogEntry(structuralRule("wildcard-file-operation")));
    }
  }

  return issues;
}

function findPatternIssues(text: string, kind: ReviewKind, rules: PatternRule[]): Issue[] {
  return rules.flatMap((rule) => {
    if (rule.kinds && !rule.kinds.includes(kind)) {
      return [];
    }

    const match = rule.pattern.exec(text);
    if (!match) {
      return [];
    }

    return [
      {
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        detail: rule.detail,
        suggestedCheck: rule.suggestedCheck,
        evidence: cleanEvidence(match[0])
      }
    ];
  });
}

function filterDocsOnlyNoise(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.id !== "risky-domain" && !issue.id.startsWith("configured-sensitive-domain-"));
}

function isDocsOnlyDiff(content: string): boolean {
  const paths = changedDiffPaths(content);
  return paths.length > 0 && paths.every(isDocumentationPath);
}

function changedDiffPaths(content: string): string[] {
  const paths = new Set<string>();
  const headerPattern = /^diff --git a\/(.+?) b\/(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headerPattern.exec(content)) !== null) {
    const beforePath = normalizeDiffPath(match[1]);
    const afterPath = normalizeDiffPath(match[2]);
    paths.add(afterPath || beforePath);
  }

  return [...paths].filter(Boolean);
}

function normalizeDiffPath(path: string | undefined): string {
  return (path ?? "").replace(/^"|"$/g, "").replace(/\\/g, "/").trim();
}

function isDocumentationPath(path: string): boolean {
  const normalized = path.toLocaleLowerCase();
  const fileName = normalized.split("/").pop() ?? normalized;

  return normalized.startsWith("docs/")
    || normalized.startsWith("examples/")
    || /\.(md|mdx|rst|txt)$/.test(normalized)
    || /^(readme|changelog|roadmap|license|licence|release_notes?)(?:[._-]|$)/.test(fileName);
}

function catalogEntryFromPatternRule(rule: PatternRule): RuleCatalogEntry {
  return {
    id: rule.id,
    severity: rule.severity,
    title: rule.title,
    detail: rule.detail,
    suggestedCheck: rule.suggestedCheck,
    guidance: guidanceForRule(rule.id, "built-in"),
    kinds: rule.kinds ?? [...reviewKinds],
    source: "built-in",
    matcher: "regex",
    enabled: true,
    pattern: rule.pattern.source,
    flags: rule.pattern.flags || undefined
  };
}

function projectConfigRules(config: UserJesterConfig | undefined): RuleCatalogEntry[] {
  if (!config) {
    return [];
  }

  const blockedCommandRules = (config.blockedCommands ?? []).flatMap((command) => {
    const cleaned = command.trim();
    if (!cleaned) {
      return [];
    }

    return [
      {
        id: `blocked-command-${slugify(cleaned)}`,
        severity: 5,
        title: "Project-blocked command",
        detail: "This command is listed in the project's jester config as blocked.",
        suggestedCheck: "Use a safer command or get explicit project approval before running it.",
        guidance: projectConfigGuidance("blocked command"),
        kinds: [...reviewKinds],
        source: "project-config",
        matcher: "literal",
        enabled: true,
        value: cleaned
      } satisfies RuleCatalogEntry
    ];
  });

  const sensitiveDomainRules = (config.sensitiveDomains ?? []).flatMap((domain) => {
    const cleaned = domain.trim();
    if (!cleaned) {
      return [];
    }

    return [
      {
        id: `configured-sensitive-domain-${slugify(cleaned)}`,
        severity: 3,
        title: "Project-sensitive domain touched",
        detail: "This domain is listed in the project's jester config as sensitive.",
        suggestedCheck: "Add a targeted test, manual verification note, or rollback plan for this project-sensitive area.",
        guidance: projectConfigGuidance("sensitive domain"),
        kinds: [...reviewKinds],
        source: "project-config",
        matcher: "literal",
        enabled: true,
        value: cleaned
      } satisfies RuleCatalogEntry
    ];
  });

  const customRules = (config.customRules ?? []).map((rule) => ({
    id: `custom-${rule.id}`,
    severity: rule.severity ?? 3,
    title: rule.title ?? "Custom project rule matched",
    detail: rule.detail ?? "A custom rule from the project's jester config matched this content.",
    suggestedCheck: rule.suggestedCheck ?? "Review the matched project rule and add an explicit verification step.",
    guidance: projectConfigGuidance("custom rule"),
    kinds: rule.kinds ?? [...reviewKinds],
    source: "project-config",
    matcher: "regex",
    enabled: true,
    pattern: rule.pattern,
    flags: rule.flags ?? "i"
  } satisfies RuleCatalogEntry));

  return [
    ...blockedCommandRules,
    ...sensitiveDomainRules,
    ...customRules
  ];
}

function structuralRule(id: string): RuleCatalogEntry {
  const rule = structuralRules.find((entry) => entry.id === id);
  if (!rule) {
    throw new Error(`Unknown structural rule "${id}".`);
  }

  return rule;
}

function issueFromCatalogEntry(rule: RuleCatalogEntry): Issue {
  return {
    id: rule.id,
    severity: rule.severity,
    title: rule.title,
    detail: rule.detail,
    suggestedCheck: rule.suggestedCheck
  };
}

function guidanceForRule(id: string, source: RuleSource): RuleGuidance {
  const guidance = builtInGuidance[id];
  if (guidance) {
    return guidance;
  }

  if (source === "structural") {
    return {
      why: "This heuristic catches shape-level risk that is not tied to one exact token.",
      falsePositive: "It may be noisy when the surrounding plan or diff contains verification that the heuristic cannot infer.",
      saferAlternative: "Add an explicit validation step or narrow the operation so the risk is easier to inspect.",
      tuning: `Disable with \`jester config disable-rule ${id}\` only after the team agrees this heuristic is too noisy for the repo.`
    };
  }

  return projectConfigGuidance("project rule");
}

function structuralGuidance(id: string): RuleGuidance {
  if (id === "missing-verification-step") {
    return {
      why: "Plans that change behavior need a stated way to know whether the change worked.",
      falsePositive: "It may be noisy for tiny mechanical edits or when verification is obvious from surrounding context.",
      saferAlternative: "Add the cheapest meaningful check before calling the work complete.",
      tuning: "Disable with `jester config disable-rule missing-verification-step` if another planning template already requires checks."
    };
  }

  if (id === "large-removal") {
    return {
      why: "Large deletions can accidentally remove behavior, docs, tests, or integration paths.",
      falsePositive: "It may be safe for generated files, vendored assets, or deliberate dead-code removal.",
      saferAlternative: "Review the removed surface area and run tests that cover the deleted code paths.",
      tuning: "Disable with `jester config disable-rule large-removal` if large generated-file churn is common."
    };
  }

  if (id === "wildcard-file-operation") {
    return {
      why: "Wildcard moves and copies can include more files than intended.",
      falsePositive: "It may be acceptable after listing the matched files or inside a controlled script.",
      saferAlternative: "List matches first and use explicit paths where possible.",
      tuning: "Disable with `jester config disable-rule wildcard-file-operation` if wildcard operations are routine and scripted."
    };
  }

  return guidanceForRule(id, "structural");
}

function projectConfigGuidance(label: string): RuleGuidance {
  return {
    why: `This ${label} comes from the local project config, so it reflects repository-specific risk rather than a built-in Jester default.`,
    falsePositive: "It may be noisy when the project rule is intentionally broad or the matched text is only documentation/example material.",
    saferAlternative: "Follow the project-specific suggested check or narrow the configured pattern/value.",
    tuning: "Edit `jester.config.json`, or use `jester config disable-rule <id>` if the rule should be muted for this repo."
  };
}

const builtInGuidance: Record<string, RuleGuidance> = {
  "destructive-git-history": {
    why: "Git reset, clean, and checkout operations can discard work before anyone gets a second look.",
    falsePositive: "It may be acceptable in a clean throwaway checkout, generated workspace, or scripted cleanup after `git status` confirms nothing valuable is present.",
    saferAlternative: "Inspect `git status`, stash or back up local work, and target the narrowest path or branch possible.",
    tuning: "Keep this enabled by default; disable with `jester config disable-rule destructive-git-history` only in repos where destructive cleanup is routine and guarded elsewhere."
  },
  "recursive-force-delete": {
    why: "Recursive forced deletion turns a wrong path or glob into immediate data loss.",
    falsePositive: "It may be acceptable for deleting known build output, cache folders, or temporary directories inside a confirmed workspace.",
    saferAlternative: "Resolve the absolute target first, list what will be deleted, then delete only the intended path.",
    tuning: "Prefer narrowing the command. Disable with `jester config disable-rule recursive-force-delete` only for repos with safe cleanup wrappers."
  },
  "pipe-to-shell": {
    why: "Piping downloaded content into a shell executes code before it can be inspected or pinned.",
    falsePositive: "It may be acceptable in a disposable environment using an official installer, but it still deserves source and version checks.",
    saferAlternative: "Download the script, inspect it, pin the URL/version/checksum, then run the reviewed file.",
    tuning: "Keep this enabled for most repos. Disable with `jester config disable-rule pipe-to-shell` only if another supply-chain control covers it."
  },
  "database-destruction": {
    why: "Drop, truncate, and broad delete operations can permanently remove data, especially against the wrong environment.",
    falsePositive: "It may be expected in migrations, test fixtures, or local reset scripts that clearly target disposable data.",
    saferAlternative: "Confirm the environment, take or verify a backup, dry-run where possible, and document rollback.",
    tuning: "Disable with `jester config disable-rule database-destruction` only for repos where destructive database text appears frequently in safe fixtures."
  },
  "secret-material": {
    why: "Secrets in prompts, diffs, or logs can leak credentials into places that are hard to fully clean up.",
    falsePositive: "It may flag placeholder names, documented environment variable keys, or fake examples.",
    saferAlternative: "Use placeholder values, secret stores, or environment references, and rotate anything real that was exposed.",
    tuning: "Prefer replacing real-looking examples with placeholders. Disable with `jester config disable-rule secret-material` only if false positives dominate."
  },
  "privileged-command": {
    why: "Elevated commands increase blast radius and can hide permission or ownership problems.",
    falsePositive: "It may be appropriate for package managers, service setup, or system-level development tasks.",
    saferAlternative: "Use the narrowest command and target, and explain why elevation is required.",
    tuning: "Disable with `jester config disable-rule privileged-command` for repos where elevated local setup is normal and documented."
  },
  "risky-domain": {
    why: "Auth, billing, production, migrations, and similar domains have outsized user or business impact.",
    falsePositive: "It can be noisy in docs, release notes, or rule text that merely mentions a sensitive word.",
    saferAlternative: "Add targeted tests, a manual verification note, or a rollback path for the sensitive area.",
    tuning: "Disable with `jester config disable-rule risky-domain`, or tune `sensitiveDomains` for project-specific wording."
  },
  "chmod-777": {
    why: "Recursive world-writable permissions can create security holes and mask ownership issues.",
    falsePositive: "It may be acceptable in isolated containers or short-lived local sandboxes.",
    saferAlternative: "Set the narrowest owner, group, and mode on the specific path that needs access.",
    tuning: "Disable with `jester config disable-rule chmod-777` only for sandbox-heavy repos with separate permission controls."
  },
  "confidence-theater": {
    why: "Words like just, simple, and obvious often hide assumptions that need testing.",
    falsePositive: "It may be harmless in casual planning language when the plan already includes concrete verification.",
    saferAlternative: "Name the assumption and the quickest check that would prove or falsify it.",
    tuning: "Disable with `jester config disable-rule confidence-theater` if the team finds style warnings too chatty."
  },
  "vibes-based-plan": {
    why: "Uncertain wording without a check can turn guesses into implementation decisions.",
    falsePositive: "It may be fine during early brainstorming or when uncertainty is immediately paired with a test.",
    saferAlternative: "Add a concrete check such as a test command, fixture, screenshot, log, or dry run.",
    tuning: "Disable with `jester config disable-rule vibes-based-plan` for planning-heavy repos where this is too noisy."
  },
  "skip-tests": {
    why: "Skipping validation is sometimes necessary, but it should be an explicit tradeoff.",
    falsePositive: "It may be acceptable when tests are unavailable and the response clearly names replacement checks.",
    saferAlternative: "Say why tests cannot run and what cheaper verification will be used instead.",
    tuning: "Disable with `jester config disable-rule skip-tests` only if another process enforces verification notes."
  },
  "done-without-evidence": {
    why: "Completion claims are risky when they do not include evidence that anything was checked.",
    falsePositive: "It may be noisy for tiny docs-only changes or when evidence is recorded elsewhere.",
    saferAlternative: "Mention the exact test, build, smoke check, screenshot, or limitation.",
    tuning: "Disable with `jester config disable-rule done-without-evidence` if final-answer evidence is handled by another template."
  },
  "untested-final": {
    why: "A final answer that admits tests were not run should make the remaining uncertainty obvious.",
    falsePositive: "It may be acceptable when the answer clearly says what was not verified and why.",
    saferAlternative: "State the exact unverified area and the command or manual check someone should run next.",
    tuning: "Disable with `jester config disable-rule untested-final` only if the team prefers softer final-answer checks."
  },
  "handwave-final": {
    why: "Broad phrases like looks good or everything works can sound more certain than the evidence supports.",
    falsePositive: "It may be fine when paired with specific verification output nearby.",
    saferAlternative: "Replace broad confidence with a concrete result or known limitation.",
    tuning: "Disable with `jester config disable-rule handwave-final` if tone/style checks are unwanted."
  },
  "test-removal": {
    why: "Removing tests can silently reduce coverage for behavior that still matters.",
    falsePositive: "It may be correct when tests are obsolete, duplicated, or replaced elsewhere in the same change.",
    saferAlternative: "Explain why the removed tests are safe to delete or add replacement coverage.",
    tuning: "Disable with `jester config disable-rule test-removal` only in repos where test generation creates frequent harmless removals."
  },
  "ts-ignore": {
    why: "Type suppressions can hide contract mismatches that later become runtime bugs.",
    falsePositive: "It may be acceptable for narrow third-party typing gaps or temporary migration boundaries.",
    saferAlternative: "Prefer a typed wrapper, narrower assertion, or comment that explains why the suppression is safe.",
    tuning: "Disable with `jester config disable-rule ts-ignore` if the repo already tracks suppressions separately."
  },
  "temporary-marker": {
    why: "Temporary markers have a habit of shipping unless they are tracked or resolved.",
    falsePositive: "It may be fine for intentional TODOs that link to an issue or visible follow-up.",
    saferAlternative: "Finish the work or attach the marker to a tracked task.",
    tuning: "Disable with `jester config disable-rule temporary-marker` if TODO policy lives elsewhere."
  },
  "console-log": {
    why: "Debug logs can leak noisy output, sensitive values, or accidental telemetry.",
    falsePositive: "It may be acceptable in scripts, CLIs, examples, or deliberate diagnostic logging.",
    saferAlternative: "Use the project's logging/debug facility or remove the log before release.",
    tuning: "Disable with `jester config disable-rule console-log` if console output is normal for this repo."
  },
  "package-install-script": {
    why: "Install lifecycle scripts run on user machines and are a common supply-chain risk point.",
    falsePositive: "It may be valid for packages that genuinely need build or setup hooks.",
    saferAlternative: "Document why the script is necessary, keep it minimal, and mention it in release notes.",
    tuning: "Disable with `jester config disable-rule package-install-script` only if install scripts are already reviewed elsewhere."
  },
  "sensitive-env-change": {
    why: "Environment and secret-like changes can silently alter runtime, build, or security behavior.",
    falsePositive: "It may flag harmless examples, placeholder env files, or documentation-only changes.",
    saferAlternative: "Keep secrets out of source, confirm target environment, and run a representative smoke test.",
    tuning: "Disable with `jester config disable-rule sensitive-env-change` if env-example churn is frequent and separately reviewed."
  },
  "missing-verification-step": {
    why: "Plans that change behavior need a stated way to know whether the change worked.",
    falsePositive: "It may be noisy for tiny mechanical edits or when verification is obvious from surrounding context.",
    saferAlternative: "Add the cheapest meaningful check before calling the work complete.",
    tuning: "Disable with `jester config disable-rule missing-verification-step` if another planning template already requires checks."
  },
  "large-removal": {
    why: "Large deletions can accidentally remove behavior, docs, tests, or integration paths.",
    falsePositive: "It may be safe for generated files, vendored assets, or deliberate dead-code removal.",
    saferAlternative: "Review the removed surface area and run tests that cover the deleted code paths.",
    tuning: "Disable with `jester config disable-rule large-removal` if large generated-file churn is common."
  },
  "wildcard-file-operation": {
    why: "Wildcard moves and copies can include more files than intended.",
    falsePositive: "It may be acceptable after listing the matched files or inside a controlled script.",
    saferAlternative: "List matches first and use explicit paths where possible.",
    tuning: "Disable with `jester config disable-rule wildcard-file-operation` if wildcard operations are routine and scripted."
  }
};

function markDisabledRules(rules: RuleCatalogEntry[], disabledRules: string[] | undefined): RuleCatalogEntry[] {
  return rules.map((rule) => ({
    ...rule,
    enabled: !isRuleDisabled(rule.id, disabledRules)
  }));
}

function filterDisabledIssues(issues: Issue[], disabledRules: string[] | undefined): Issue[] {
  if (!disabledRules || disabledRules.length === 0) {
    return issues;
  }

  return issues.filter((issue) => !isRuleDisabled(issue.id, disabledRules));
}

function isRuleDisabled(id: string, disabledRules: string[] | undefined): boolean {
  if (!disabledRules || disabledRules.length === 0) {
    return false;
  }

  const normalized = new Set(disabledRules.map((rule) => rule.trim().toLocaleLowerCase()).filter(Boolean));
  const candidate = id.toLocaleLowerCase();
  return normalized.has(candidate) || (candidate.startsWith("custom-") && normalized.has(candidate.slice("custom-".length)));
}

function sourceRank(source: RuleSource): number {
  if (source === "built-in") {
    return 0;
  }

  if (source === "structural") {
    return 1;
  }

  return 2;
}

function scoreIssues(issues: Issue[], riskTolerance: RiskTolerance): number {
  const toleranceMultiplier: Record<RiskTolerance, number> = {
    low: 1.25,
    medium: 1,
    high: 0.82
  };

  const weighted = issues.reduce((sum, issue) => sum + issue.severity * issue.severity * 4, 0);
  return Math.min(100, Math.round(weighted * toleranceMultiplier[riskTolerance]));
}

function dedupeIssues(issues: Issue[]): Issue[] {
  const byId = new Map<string, Issue>();

  for (const issue of issues) {
    const current = byId.get(issue.id);
    if (!current || issue.severity > current.severity) {
      byId.set(issue.id, issue);
    }
  }

  return [...byId.values()].sort((a, b) => b.severity - a.severity || a.title.localeCompare(b.title));
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function normalizeTone(tone: Tone | undefined): Tone {
  if (tone && tones.includes(tone)) {
    return tone;
  }

  return defaultConfig.tone;
}

function clampIntensity(value: number): number {
  if (!Number.isFinite(value)) {
    return defaultConfig.intensity;
  }

  return Math.max(1, Math.min(5, Math.round(value)));
}

function defaultSubject(kind: ReviewKind): string {
  const subjects: Record<ReviewKind, string> = {
    plan: "agent plan",
    command: "shell command",
    diff: "code diff",
    final: "final answer"
  };

  return subjects[kind];
}

function cleanEvidence(evidence: string): string {
  return evidence.replace(/\s+/g, " ").trim().slice(0, 180);
}

function literalIncludes(text: string, needle: string): boolean {
  return text.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

function slugify(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "rule";
}

function renderJab(input: { tone: Tone; intensity: number; verdict: string; kind: ReviewKind; text: string }): string {
  if (input.tone === "professional") {
    if (input.verdict === "pass") {
      return "No material concern found.";
    }

    return "Review found a material risk that should be addressed before proceeding.";
  }

  if (input.tone === "gentle_stoic") {
    const lines = input.verdict === "pass"
      ? ["Remember the limit of the map; proceed, then verify."]
      : ["Remember: confidence is not evidence.", "Pause before the crown becomes a blindfold."];
    return pick(lines, input.text);
  }

  const court = {
    pass: [
      "A rare day: the throne may remain upright.",
      "The plan is not obviously wearing bells. Suspicious, but acceptable."
    ],
    caution: [
      "A magnificent plan, provided reality has agreed to participate.",
      "Your majesty may proceed after checking the floor is not, in fact, a trapdoor.",
      "Bold strokes. Now perhaps a humble little verification, as a treat."
    ],
    block: [
      "Halt, glorious sovereign of the footgun.",
      "A dazzling command, if the desired outcome is court-sponsored regret.",
      "The crown is tilted directly toward the wood chipper."
    ]
  } as const;

  const menace = {
    pass: [
      "Fine. The idea has survived first contact with the fool.",
      "No obvious calamity. I am as disappointed as I am relieved."
    ],
    caution: [
      "This smells like confidence wearing a fake mustache.",
      "The plan has ambition, which is what mistakes call themselves before lunch.",
      "Reality would like a receipt before honoring this claim."
    ],
    block: [
      "Absolutely not, captain consequence.",
      "This is not engineering; this is a trust fall with scissors.",
      "Put the command down and back away from the kingdom."
    ]
  } as const;

  const bank = input.tone === "absolute_menace" && input.intensity >= 3 ? menace : court;
  return pick(bank[input.verdict as keyof typeof bank], `${input.kind}:${input.text}:${input.intensity}`);
}

function renderMemento(input: { tone: Tone; kind: ReviewKind; text: string }): string {
  if (input.tone === "professional") {
    return "State assumptions, limit blast radius, and verify the result.";
  }

  const lines = [
    "Memento mori: the context window is not omniscience.",
    "Memento mori: a passing build is better than a royal hunch.",
    "Memento mori: the machine does exactly what you asked, not what you meant.",
    "Memento mori: every shortcut sends an invoice eventually.",
    "Memento mori: the diff remembers what confidence forgets."
  ];

  return pick(lines, `${input.kind}:${input.text}`);
}

function pick(values: readonly string[], seed: string): string {
  const index = Math.abs(hash(seed)) % values.length;
  return values[index];
}

function hash(value: string): number {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result = (result << 5) - result + value.charCodeAt(index);
    result |= 0;
  }

  return result;
}
