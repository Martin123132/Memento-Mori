#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixturePath = "examples/fixtures/preset-review-cases.json";
const allowedPresets = ["default", "node", "python", "web", "api", "infra", "ai", "security"];
const allowedKinds = ["plan", "command", "diff", "final"];
const allowedVerdicts = ["pass", "caution", "block"];
const sampleLimit = 3;

const args = new Set(process.argv.slice(2));
const json = args.has("--json");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

let fixtures;
try {
  fixtures = JSON.parse(read(fixturePath));
} catch (error) {
  process.stderr.write(`Could not parse ${fixturePath}: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}

if (!Array.isArray(fixtures)) {
  process.stderr.write(`${fixturePath} should contain a JSON array.\n`);
  process.exit(1);
}

const report = buildFixtureReport(fixtures);

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(renderFixtureReport(report));
}

function buildFixtureReport(rawFixtures) {
  const byPreset = zeroCounts(allowedPresets);
  const byKind = zeroCounts(allowedKinds);
  const byVerdict = zeroCounts(allowedVerdicts);
  const rules = new Map();
  const quietPassRules = new Map();
  const quietPassFixtures = [];

  let totalWeight = 0;
  let edgeCaseFixtures = 0;

  for (const fixture of rawFixtures) {
    const preset = typeof fixture.preset === "string" ? fixture.preset : "unknown";
    const kind = typeof fixture.kind === "string" ? fixture.kind : "unknown";
    const verdict = typeof fixture.expectedVerdict === "string" ? fixture.expectedVerdict : "unknown";
    const expectedRuleIds = Array.isArray(fixture.expectedRuleIds) ? fixture.expectedRuleIds : [];
    const absentRuleIds = Array.isArray(fixture.absentRuleIds) ? fixture.absentRuleIds : [];
    const weight = fixtureWeight(fixture.weight);
    const edgeCase = fixture.edgeCase === true;
    const sample = {
      id: String(fixture.id ?? "unknown"),
      description: String(fixture.description ?? ""),
      preset,
      kind,
      verdict
    };

    byPreset[preset] = (byPreset[preset] ?? 0) + 1;
    byKind[kind] = (byKind[kind] ?? 0) + 1;
    byVerdict[verdict] = (byVerdict[verdict] ?? 0) + 1;
    totalWeight += weight;
    if (edgeCase) {
      edgeCaseFixtures += 1;
    }

    if (verdict === "pass" && expectedRuleIds.length === 0) {
      quietPassFixtures.push(sample);
    }

    if (verdict === "pass") {
      for (const ruleId of absentRuleIds) {
        const entry = quietPassRules.get(ruleId) ?? createQuietPassEntry(ruleId);
        entry.total += 1;
        entry.weight += weight;
        entry.kinds[kind] = (entry.kinds[kind] ?? 0) + 1;
        entry.presets[preset] = (entry.presets[preset] ?? 0) + 1;
        if (edgeCase) {
          entry.edgeCases += 1;
        }
        entry.samples.push(sample);
        quietPassRules.set(ruleId, entry);
      }
    }

    for (const ruleId of expectedRuleIds) {
      const entry = rules.get(ruleId) ?? createRuleEntry(ruleId);
      entry.total += 1;
      entry.weight += weight;
      entry.verdicts[verdict] = (entry.verdicts[verdict] ?? 0) + 1;
      entry.kinds[kind] = (entry.kinds[kind] ?? 0) + 1;
      entry.presets[preset] = (entry.presets[preset] ?? 0) + 1;
      if (edgeCase) {
        entry.edgeCases += 1;
      }
      entry.samples.push(sample);
      rules.set(ruleId, entry);
    }
  }

  const ruleSummaries = [...rules.values()]
    .map((entry) => ({
      ruleId: entry.ruleId,
      total: entry.total,
      weight: entry.weight,
      passCases: entry.verdicts.pass ?? 0,
      cautionCases: entry.verdicts.caution ?? 0,
      blockCases: entry.verdicts.block ?? 0,
      edgeCases: entry.edgeCases,
      verdicts: orderedCounts(entry.verdicts, allowedVerdicts),
      kinds: orderedCounts(entry.kinds, allowedKinds),
      presets: orderedCounts(entry.presets, allowedPresets),
      quietPassCases: quietPassRules.get(entry.ruleId)?.total ?? 0,
      samples: entry.samples
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, sampleLimit)
    }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  const quietPassRuleSummaries = [...quietPassRules.values()]
    .map((entry) => ({
      ruleId: entry.ruleId,
      total: entry.total,
      weight: entry.weight,
      edgeCases: entry.edgeCases,
      kinds: orderedCounts(entry.kinds, allowedKinds),
      presets: orderedCounts(entry.presets, allowedPresets),
      samples: entry.samples
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, sampleLimit)
    }))
    .sort((a, b) => b.total - a.total || b.weight - a.weight || a.ruleId.localeCompare(b.ruleId));

  const gaps = {
    rulesWithoutPassCases: ruleSummaries
      .filter((entry) => entry.passCases === 0)
      .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId))
      .map(ruleGapSummary),
    rulesWithoutQuietPassCoverage: ruleSummaries
      .filter((entry) => entry.quietPassCases === 0)
      .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId))
      .map(ruleGapSummary),
    thinRuleCoverage: ruleSummaries
      .filter((entry) => entry.total < 2)
      .sort((a, b) => a.total - b.total || a.ruleId.localeCompare(b.ruleId))
      .map(ruleGapSummary),
    presetKindGaps: presetKindGaps(rawFixtures),
    quietPassRuleCoverage: quietPassRuleSummaries,
    quietPassFixtures: quietPassFixtures
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
  };

  return {
    totalFixtures: rawFixtures.length,
    totalWeight,
    edgeCaseFixtures,
    byVerdict: orderedCounts(byVerdict, allowedVerdicts),
    byKind: orderedCounts(byKind, allowedKinds),
    byPreset: orderedCounts(byPreset, allowedPresets),
    quietPassRules: quietPassRuleSummaries,
    rules: ruleSummaries,
    gaps
  };
}

function renderFixtureReport(report) {
  const lines = [
    "Fixture coverage report",
    "",
    `Fixtures: ${report.totalFixtures}`,
    `Weighted fixtures: ${report.totalWeight}`,
    `Edge-case fixtures: ${report.edgeCaseFixtures}`,
    `Rules covered by expectedRuleIds: ${report.rules.length}`,
    "",
    `By verdict: ${formatCounts(report.byVerdict)}`,
    `By kind: ${formatCounts(report.byKind)}`,
    `By preset: ${formatCounts(report.byPreset)}`,
    "",
    "Rules without pass-case coverage:"
  ];

  lines.push(...formatRuleGaps(report.gaps.rulesWithoutPassCases));
  lines.push("", "Rules without quiet-pass coverage:");
  lines.push(...formatRuleGaps(report.gaps.rulesWithoutQuietPassCoverage));
  lines.push("", "Quiet-pass rule coverage:");
  lines.push(...formatQuietPassRuleCoverage(report.gaps.quietPassRuleCoverage));
  lines.push("", "Thin rule coverage:");
  lines.push(...formatRuleGaps(report.gaps.thinRuleCoverage));
  lines.push("", "Preset/kind gaps:");
  lines.push(...formatPresetKindGaps(report.gaps.presetKindGaps));
  lines.push("", "Quiet pass fixtures:");
  lines.push(...formatFixtureSamples(report.gaps.quietPassFixtures));
  lines.push(
    "",
    "Next:",
    "  npm run fixtures:check",
    "  npm run fixtures:report -- --json",
    "  node .\\dist\\cli.js tune coverage"
  );

  return `${lines.join("\n")}\n`;
}

function createRuleEntry(ruleId) {
  return {
    ruleId,
    total: 0,
    weight: 0,
    edgeCases: 0,
    verdicts: zeroCounts(allowedVerdicts),
    kinds: zeroCounts(allowedKinds),
    presets: zeroCounts(allowedPresets),
    samples: []
  };
}

function createQuietPassEntry(ruleId) {
  return {
    ruleId,
    total: 0,
    weight: 0,
    edgeCases: 0,
    kinds: zeroCounts(allowedKinds),
    presets: zeroCounts(allowedPresets),
    samples: []
  };
}

function fixtureWeight(rawWeight) {
  if (typeof rawWeight === "number" && rawWeight > 0 && Number.isFinite(rawWeight)) {
    return Math.max(1, Math.min(3, Math.round(rawWeight)));
  }

  return 1;
}

function zeroCounts(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function orderedCounts(counts, keys) {
  const ordered = zeroCounts(keys);
  for (const [key, value] of Object.entries(counts)) {
    ordered[key] = value;
  }
  return ordered;
}

function presetKindGaps(fixtures) {
  const seen = new Set(fixtures.map((fixture) => `${fixture.preset}:${fixture.kind}`));
  return allowedPresets
    .map((preset) => ({
      preset,
      missingKinds: allowedKinds.filter((kind) => !seen.has(`${preset}:${kind}`))
    }))
    .filter((entry) => entry.missingKinds.length > 0);
}

function ruleGapSummary(entry) {
  return {
    ruleId: entry.ruleId,
    total: entry.total,
    passCases: entry.passCases,
    cautionCases: entry.cautionCases,
    blockCases: entry.blockCases,
    quietPassCases: entry.quietPassCases ?? 0,
    samples: entry.samples
  };
}

function formatCounts(counts) {
  return Object.entries(counts)
    .map(([key, value]) => `${key} ${value}`)
    .join(", ");
}

function formatRuleGaps(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries
    .slice(0, 12)
    .map((entry) => `- ${entry.ruleId}: ${entry.total} fixture(s), pass ${entry.passCases}, caution ${entry.cautionCases}, block ${entry.blockCases}, quiet-pass ${entry.quietPassCases}`);
}

function formatQuietPassRuleCoverage(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries
    .slice(0, 12)
    .map((entry) => `- ${entry.ruleId}: ${entry.total} quiet-pass fixture(s), weight ${entry.weight}`);
}

function formatPresetKindGaps(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries.map((entry) => `- ${entry.preset}: ${entry.missingKinds.join(", ")}`);
}

function formatFixtureSamples(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries
    .slice(0, 8)
    .map((entry) => `- ${entry.id}: ${entry.description}`);
}
