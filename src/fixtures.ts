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
};

export type RuleFixtureEvidence = {
  ruleId: string;
  matchCount: number;
  totalFixtures: number;
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

export async function ruleFixtureEvidence(ruleId: string): Promise<RuleFixtureEvidence> {
  const cached = fixtureEvidenceCache.get(ruleId);
  if (cached) {
    return cached;
  }

  const fixtures = await loadPresetFixtures();
  const matchedFixtures: RuleFixtureMatch[] = [];
  const byVerdict = { pass: 0, caution: 0, block: 0 };

  for (const fixture of fixtures) {
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
    matchedFixtures.push({
      id: fixture.id,
      description: fixture.description,
      preset: fixture.preset,
      kind: fixture.kind,
      verdict: result.verdict
    });
  }

  const evidence: RuleFixtureEvidence = {
    ruleId,
    matchCount: matchedFixtures.length,
    totalFixtures: fixtures.length,
    byVerdict,
    matchedFixtures,
    samples: matchedFixtures
      .slice(0, fixtureEvidenceLimit)
      .map((entry) => `${entry.id}: ${entry.description}`)
  };

  fixtureEvidenceCache.set(ruleId, evidence);
  return evidence;
}

