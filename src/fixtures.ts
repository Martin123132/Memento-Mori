import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { userConfigForPreset, type ConfigPreset } from "./config.js";
import { review } from "./core.js";
import type { ReviewKind, Verdict } from "./types.js";

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
  totalFixtures: number;
  totalWeightedFixtures: number;
  matchWeight: number;
  expectedWeight: number;
  unexpectedWeight: number;
  edgeCaseMatches: number;
  confidence: FixtureEvidenceConfidence;
  coverage: RuleFixtureCoverage;
  byVerdict: {
    pass: number;
    caution: number;
    block: number;
  };
  matchedFixtures: RuleFixtureMatch[];
  samples: string[];
};

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

export async function ruleFixtureEvidence(ruleId: string): Promise<RuleFixtureEvidence> {
  const cached = fixtureEvidenceCache.get(ruleId);
  if (cached) {
    return cached;
  }

  const fixtures = await loadPresetFixtures();
  const matchedFixtures: RuleFixtureMatch[] = [];
  const byVerdict = { pass: 0, caution: 0, block: 0 };
  const coverageTotals = fixtureCoverageTotals(fixtures);

  for (const fixture of fixtures) {
    const expectedRuleIds = new Set(fixture.expectedRuleIds);
    const absentRuleIds = new Set(fixture.absentRuleIds ?? []);
    const expectedMatch = expectedRuleIds.has(ruleId);

    const result = review({
      kind: fixture.kind,
      content: fixture.content,
      subject: fixture.id,
      config: userConfigForPreset(fixture.preset)
    });

    if (!result.issues.some((issue) => issue.id === ruleId)) {
      continue;
    }

    byVerdict[result.verdict] += 1;

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
    matchedFixtures,
    samples: orderedSamples
      .map((entry) => `${entry.id}: ${entry.description}`)
  };

  fixtureEvidenceCache.set(ruleId, evidence);
  return evidence;
}
