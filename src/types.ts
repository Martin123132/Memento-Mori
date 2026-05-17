export const tones = [
  "gentle_stoic",
  "court_jester",
  "absolute_menace",
  "professional"
] as const;

export type Tone = (typeof tones)[number];

export const reviewKinds = ["plan", "command", "diff", "final"] as const;

export type ReviewKind = (typeof reviewKinds)[number];

export type Verdict = "pass" | "caution" | "block";

export type RiskTolerance = "low" | "medium" | "high";

export interface JesterConfig {
  tone: Tone;
  intensity: number;
  riskTolerance: RiskTolerance;
}

export interface ReviewInput {
  kind: ReviewKind;
  content: string;
  subject?: string;
  context?: string;
  tone?: Tone;
  intensity?: number;
  riskTolerance?: RiskTolerance;
}

export interface Issue {
  id: string;
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  detail: string;
  suggestedCheck: string;
  evidence?: string;
}

export interface ReviewResult {
  kind: ReviewKind;
  subject: string;
  verdict: Verdict;
  riskScore: number;
  tone: Tone;
  intensity: number;
  jab: string;
  memento: string;
  issues: Issue[];
  suggestedChecks: string[];
}
