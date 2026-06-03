import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { userConfigForPreset, type ConfigPreset } from "./config.js";
import { review } from "./core.js";
import type { ReviewKind, UserJesterConfig, Verdict } from "./types.js";

type FixtureWeight = 1 | 2 | 3;
type FixtureMatchWeight = FixtureWeight | number;

export type PresetReviewFixture = {
  id: string;
  preset: ConfigPreset;
  kind: ReviewKind;
  description: string;
  content: string;
  expectedVerdict: Verdict;
  expectedRuleIds: string[];
  absentRuleIds?: string[];
  edgeCase?: boolean;
  weight?: FixtureMatchWeight;
};

export type RuleFixtureMatch = {
  id: string;
  description: string;
  preset: ConfigPreset;
  kind: ReviewKind;
  verdict: Verdict;
  expectedMatch: boolean;
  unexpectedMatch: boolean;
  weight: FixtureWeight;
  edgeCase: boolean;
};

export type FixtureEvidenceConfidence = "none" | "low" | "medium" | "high";

type RuleFixtureCoverage = {
  total: number;
  matched: number;
  weightedTotal: number;
  weightedMatched: number;
};

export type RuleFixtureEvidence = {
  ruleId: string;
  matchCount: number;
  support: FixtureEvidenceSupport;
  totalFixtures: number;
  totalWeightedFixtures: number;
  matchWeight: number;
  expectedWeight: number;
  unexpectedWeight: number;
  edgeCaseMatches: number;
  confidence: FixtureEvidenceConfidence;
  coverage: RuleFixtureCoverage;
  byKind: Record<ReviewKind, number>;
  byVerdict: {
    pass: number;
    caution: number;
    block: number;
  };
  matchedFixtures: RuleFixtureMatch[];
  samples: string[];
};

export type FixtureEvidenceSupport = "none" | "thin" | "limited" | "strong";

const fixtureFilePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../examples/fixtures/preset-review-cases.json"
);
const fixtureEvidenceLimit = 5;

let fixturesPromise: Promise<PresetReviewFixture[]> | null = null;
const fixtureEvidenceCache = new Map<string, RuleFixtureEvidence>();

export async function loadPresetFixtures(): Promise<PresetReviewFixture[]> {
  if (!fixturesPromise) {
    fixturesPromise = readFile(fixtureFilePath, "utf8")
      .then((raw) => {
        const parsed = JSON.parse(raw) as PresetReviewFixture[];

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed;
      });
  }

  return fixturesPromise;
}

function fixtureWeight(rawWeight: FixtureMatchWeight | undefined): FixtureWeight {
  if (typeof rawWeight === "number" && rawWeight > 0 && Number.isFinite(rawWeight)) {
    return Math.max(1, Math.min(3, Math.round(rawWeight))) as FixtureWeight;
  }

  return 1;
}

function edgeCasePenalty(isEdgeCase: boolean): number {
  return isEdgeCase ? 0.65 : 1;
}

function fixtureEvidenceConfidence(
  matchWeight: number,
  expectedWeight: number,
  unexpectedWeight: number,
  coverage: RuleFixtureCoverage
): FixtureEvidenceConfidence {
  if (matchWeight === 0) {
    return "none";
  }

  const coverageRatio = coverage.weightedMatched / Math.max(1, coverage.weightedTotal);
  const unexpectedRatio = unexpectedWeight / Math.max(0.5, matchWeight);

  if (coverageRatio < 0.05) {
    return "low";
  }

  if (unexpectedRatio >= 0.5 || expectedWeight < 1.2) {
    return "low";
  }

  if (unexpectedWeight === 0 && expectedWeight >= 4 && coverageRatio >= 0.15) {
    return "high";
  }

  return "medium";
}

function fixtureEvidenceSupport(
  matchCount: number,
  matchWeight: number,
  expectedWeight: number,
  unexpectedWeight: number,
  coverage: RuleFixtureCoverage
): FixtureEvidenceSupport {
  if (matchWeight === 0) {
    return "none";
  }

  if (coverage.weightedTotal === 0) {
    return "thin";
  }

  const weightedCoverage = matchWeight / coverage.weightedTotal;
  const expectedRatio = matchWeight > 0 ? expectedWeight / Math.max(0.5, matchWeight) : 0;
  const unexpectedRatio = unexpectedWeight / Math.max(0.5, matchWeight);

  if (matchCount >= 4 && weightedCoverage >= 0.18 && unexpectedRatio <= 0.2 && expectedRatio >= 0.85) {
    return "strong";
  }

  if (matchCount >= 2 && weightedCoverage >= 0.08 && unexpectedRatio <= 0.4 && expectedRatio >= 0.7) {
    return "limited";
  }

  return "thin";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${
    keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")
  }}`;
}

function normalizeFixtureConfig(config: UserJesterConfig | undefined): UserJesterConfig | undefined {
  if (!config) {
    return undefined;
  }

  const normalized: UserJesterConfig = {
    ...config,
    disabledRules: []
  };

  return normalized;
}

function fixtureCoverageTotals(fixtures: PresetReviewFixture[]): { total: number; weightedTotal: number } {
  let total = 0;
  let weightedTotal = 0;

  for (const fixture of fixtures) {
    total += 1;
    weightedTotal += fixtureWeight(fixture.weight) * edgeCasePenalty(fixture.edgeCase ?? false);
  }

  return {
    total,
    weightedTotal: Number(weightedTotal.toFixed(3))
  };
}

export async function ruleFixtureEvidence(
  ruleId: string,
  options: {
    config?: UserJesterConfig;
  } = {}
): Promise<RuleFixtureEvidence> {
  const normalizedConfig = normalizeFixtureConfig(options.config);
  const cacheKey = `${ruleId}:${stableStringify(normalizedConfig ?? null)}`;
  const cached = fixtureEvidenceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const fixtures = await loadPresetFixtures();
  const matchedFixtures: RuleFixtureMatch[] = [];
  const byVerdict = { pass: 0, caution: 0, block: 0 };
  const byKind = {
    command: 0,
    plan: 0,
    diff: 0,
    final: 0
  };
  const coverageTotals = fixtureCoverageTotals(fixtures);

  for (const fixture of fixtures) {
    const expectedRuleIds = new Set(fixture.expectedRuleIds);
    const absentRuleIds = new Set(fixture.absentRuleIds ?? []);
    const expectedMatch = expectedRuleIds.has(ruleId);

    const configForFixture = normalizedConfig ? { ...normalizedConfig } : userConfigForPreset(fixture.preset);
    const result = review({
      kind: fixture.kind,
      content: fixture.content,
      subject: fixture.id,
      config: configForFixture
    });

    if (!result.issues.some((issue) => issue.id === ruleId)) {
      continue;
    }

    byVerdict[result.verdict] += 1;
    byKind[fixture.kind] += 1;

    const edgeCase = fixture.edgeCase ?? false;
    const weight = fixtureWeight(fixture.weight);
    const unexpectedMatch = !expectedMatch && !absentRuleIds.has(ruleId);
    matchedFixtures.push({
      id: fixture.id,
      description: fixture.description,
      preset: fixture.preset,
      kind: fixture.kind,
      verdict: result.verdict,
      expectedMatch,
      unexpectedMatch,
      weight,
      edgeCase
    });
  }

  const matchCount = matchedFixtures.length;
  const expectedWeight = matchedFixtures
    .filter((entry) => entry.expectedMatch)
    .reduce((acc, match) => acc + match.weight * edgeCasePenalty(match.edgeCase), 0);
  const unexpectedWeight = matchedFixtures
    .filter((entry) => entry.unexpectedMatch)
    .reduce((acc, match) => acc + match.weight * edgeCasePenalty(match.edgeCase), 0);

  const edgeCaseMatches = matchedFixtures.filter((entry) => entry.edgeCase).length;
  const matchWeight = matchedFixtures
    .reduce((acc, entry) => acc + entry.weight * edgeCasePenalty(entry.edgeCase), 0);

  const orderedSamples = matchedFixtures.length > 0
    ? matchedFixtures
      .slice()
      .sort((a, b) => Number(b.expectedMatch) - Number(a.expectedMatch) || b.weight - a.weight || a.id.localeCompare(b.id))
      .slice(0, fixtureEvidenceLimit)
    : [];

  const evidence: RuleFixtureEvidence = {
    ruleId,
    matchCount,
    support: fixtureEvidenceSupport(
      matchCount,
      Number(matchWeight.toFixed(3)),
      Number(expectedWeight.toFixed(3)),
      Number(unexpectedWeight.toFixed(3)),
      {
        total: coverageTotals.total,
        matched: matchCount,
        weightedTotal: coverageTotals.weightedTotal,
        weightedMatched: Number(matchWeight.toFixed(3))
      }
    ),
    totalFixtures: coverageTotals.total,
    totalWeightedFixtures: coverageTotals.weightedTotal,
    matchWeight: Number(matchWeight.toFixed(3)),
    expectedWeight: Number(expectedWeight.toFixed(3)),
    unexpectedWeight: Number(unexpectedWeight.toFixed(3)),
    edgeCaseMatches,
    confidence: fixtureEvidenceConfidence(matchWeight, expectedWeight, unexpectedWeight, {
      total: coverageTotals.total,
      matched: matchCount,
      weightedTotal: coverageTotals.weightedTotal,
      weightedMatched: Number(matchWeight.toFixed(3))
    }),
    coverage: {
      total: coverageTotals.total,
      matched: matchCount,
      weightedTotal: coverageTotals.weightedTotal,
      weightedMatched: Number(matchWeight.toFixed(3))
    },
    byVerdict,
    byKind,
    matchedFixtures,
    samples: orderedSamples
      .map((entry) => `${entry.id}: ${entry.description}`)
  };

  fixtureEvidenceCache.set(cacheKey, evidence);
  return evidence;
}
