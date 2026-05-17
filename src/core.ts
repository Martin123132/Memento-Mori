import {
  type Issue,
  type JesterConfig,
  type ReviewInput,
  type ReviewKind,
  type ReviewResult,
  type RiskTolerance,
  type Tone,
  tones
} from "./types.js";

export const defaultConfig: JesterConfig = {
  tone: "court_jester",
  intensity: 3,
  riskTolerance: "medium"
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
  }
];

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
  const tone = normalizeTone(input.tone);
  const intensity = clampIntensity(input.intensity ?? defaultConfig.intensity);
  const riskTolerance = input.riskTolerance ?? defaultConfig.riskTolerance;
  const subject = input.subject?.trim() || defaultSubject(input.kind);
  const combined = [input.subject, input.context, input.content].filter(Boolean).join("\n\n");

  const issues = dedupeIssues([
    ...findPatternIssues(combined, input.kind, universalRules),
    ...findKindIssues(combined, input.kind),
    ...findStructuralIssues(input.kind, input.content)
  ]);

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

function findStructuralIssues(kind: ReviewKind, content: string): Issue[] {
  const issues: Issue[] = [];

  if (kind === "plan") {
    const soundsLikeImplementation = /\b(implement|change|edit|fix|refactor|delete|migrate|deploy|release|ship)\b/i.test(content);
    const mentionsVerification = /\b(test|verify|check|build|run|dry-run|snapshot|screenshot|backup|rollback)\b/i.test(content);

    if (soundsLikeImplementation && !mentionsVerification) {
      issues.push({
        id: "missing-verification-step",
        severity: 2,
        title: "No verification step",
        detail: "The plan changes behavior but does not say how the result will be checked.",
        suggestedCheck: "Add the cheapest meaningful validation step before calling the work complete."
      });
    }
  }

  if (kind === "diff") {
    const removedLines = content.split(/\r?\n/).filter((line) => line.startsWith("-") && !line.startsWith("---")).length;
    const addedLines = content.split(/\r?\n/).filter((line) => line.startsWith("+") && !line.startsWith("+++")).length;

    if (removedLines > 80 && addedLines < removedLines / 3) {
      issues.push({
        id: "large-removal",
        severity: 2,
        title: "Large removal with little replacement",
        detail: "A large deletion may be correct, but it deserves a second look for lost behavior.",
        suggestedCheck: "Review the deleted surface area and run tests that cover the removed code paths."
      });
    }
  }

  if (kind === "command") {
    const hasWildcardMove = /\b(mv|move|Move-Item|Copy-Item|cp)\b[\s\S]*\*/i.test(content);
    if (hasWildcardMove) {
      issues.push({
        id: "wildcard-file-operation",
        severity: 2,
        title: "Wildcard file operation",
        detail: "Wildcard moves or copies can quietly grab more than intended.",
        suggestedCheck: "List the matched files first and confirm the destination before running the command."
      });
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
