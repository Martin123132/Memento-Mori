import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { userConfigForPreset, type ConfigPreset } from "./config.js";
import { review } from "./core.js";
import type { ReviewKind, Verdict } from "./types.js";

export type PresetReviewFixture = {
  id: string;
  preset: ConfigPreset;
  kind: ReviewKind;
  description: string;
  content: string;
  expectedVerdict: Verdict;
  expectedRuleIds: string[];
  absentRuleIds?: string[];
};

export type RuleFixtureMatch = {
  id: string;
  description: string;
  preset: ConfigPreset;
  kind: ReviewKind;
  verdict: Verdict;
  expectedMatch: boolean;
  unexpectedMatch: boolean;
};

export type FixtureEvidenceConfidence = "none" | "low" | "medium" | "high";

export type RuleFixtureEvidence = {
  ruleId: string;
  matchCount: number;
  totalFixtures: number;
  confidence: FixtureEvidenceConfidence;
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

function fixtureEvidenceConfidence(matchCount: number, expectedMatches: number, unexpectedMatches: number): FixtureEvidenceConfidence {
  if (matchCount === 0) {
    return "none";
  }
  if (unexpectedMatches > 0 || (expectedMatches === 0 && matchCount > 1)) {
    return "low";
  }
  if (expectedMatches >= 2 && unexpectedMatches === 0) {
    return "high";
  }
  return "medium";
}

export async function ruleFixtureEvidence(ruleId: string): Promise<RuleFixtureEvidence> {
  const cached = fixtureEvidenceCache.get(ruleId);
  if (cached) {
    return cached;
  }

  const fixtures = await loadPresetFixtures();
  const matchedFixtures: RuleFixtureMatch[] = [];
  const byVerdict = { pass: 0, caution: 0, block: 0 };

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

    const unexpectedMatch = !expectedMatch && !absentRuleIds.has(ruleId);
    matchedFixtures.push({
      id: fixture.id,
      description: fixture.description,
      preset: fixture.preset,
      kind: fixture.kind,
      verdict: result.verdict,
      expectedMatch,
      unexpectedMatch
    });
  }

  const matchCount = matchedFixtures.length;
  const expectedMatches = matchedFixtures.filter((entry) => entry.expectedMatch).length;
  const unexpectedMatches = matchedFixtures.filter((entry) => entry.unexpectedMatch).length;

  const orderedSamples = matchedFixtures.length > 0
    ? matchedFixtures
      .slice()
      .sort((a, b) => Number(b.expectedMatch) - Number(a.expectedMatch) || a.id.localeCompare(b.id))
      .slice(0, fixtureEvidenceLimit)
    : [];

  const evidence: RuleFixtureEvidence = {
    ruleId,
    matchCount,
    totalFixtures: fixtures.length,
    confidence: fixtureEvidenceConfidence(matchCount, expectedMatches, unexpectedMatches),
    byVerdict,
    matchedFixtures,
    samples: orderedSamples
      .map((entry) => `${entry.id}: ${entry.description}`)
  };

  fixtureEvidenceCache.set(ruleId, evidence);
  return evidence;
}
