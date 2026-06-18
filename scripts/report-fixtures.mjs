#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixturePath = "examples/fixtures/preset-review-cases.json";
const allowedPresets = ["default", "node", "python", "web", "api", "infra", "ai", "security"];
const allowedKinds = ["plan", "command", "diff", "final"];
const allowedVerdicts = ["pass", "caution", "block"];
const sampleLimit = 3;
const structuralRuleIds = new Set([
  "large-removal",
  "missing-verification-step",
  "wildcard-file-operation"
]);
const passEligibleRuleIds = new Set([
  "confidence-theater",
  "console-log",
  "handwave-final",
  "large-removal",
  "missing-verification-step",
  "temporary-marker",
  "vibes-based-plan",
  "wildcard-file-operation"
]);
const ruleFamilyOrder = [
  "built-in",
  "structural",
  "custom",
  "configured-sensitive-domain",
  "blocked-command"
];

const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const markdown = args.has("--markdown");

if (json && markdown) {
  process.stderr.write("Use only one output format: --json or --markdown.\n");
  process.exit(1);
}

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
} else if (markdown) {
  process.stdout.write(renderFixtureReportMarkdown(report));
} else {
  process.stdout.write(renderFixtureReport(report));
}

function buildFixtureReport(rawFixtures) {
  const byPreset = zeroCounts(allowedPresets);
  const byKind = zeroCounts(allowedKinds);
  const byVerdict = zeroCounts(allowedVerdicts);
  const rules = new Map();
  const quietPassRules = new Map();
  const presetSlices = new Map(allowedPresets.map((preset) => [preset, createPresetSlice(preset)]));
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

    const presetSlice = presetSlices.get(preset) ?? createPresetSlice(preset);
    presetSlice.total += 1;
    presetSlice.weight += weight;
    presetSlice.byKind[kind] = (presetSlice.byKind[kind] ?? 0) + 1;
    presetSlice.byVerdict[verdict] = (presetSlice.byVerdict[verdict] ?? 0) + 1;
    presetSlice.expectedRuleReferences += expectedRuleIds.length;
    if (verdict === "pass") {
      presetSlice.quietPassRuleReferences += absentRuleIds.length;
    }
    if (edgeCase) {
      presetSlice.edgeCases += 1;
    }

    if (verdict === "pass" && expectedRuleIds.length === 0) {
      quietPassFixtures.push(sample);
      presetSlice.quietPassFixtures += 1;
    }
    presetSlices.set(preset, presetSlice);

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
    passEligibleRulesWithoutPassCases: ruleSummaries
      .filter((entry) => passEligibleRuleIds.has(entry.ruleId) && entry.passCases === 0)
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
  const ruleFamilySlices = buildRuleFamilySlices(ruleSummaries, quietPassRuleSummaries);
  const presetSliceSummaries = buildPresetSlices(presetSlices);
  const curationNext = buildCurationNext(gaps, ruleFamilySlices, presetSliceSummaries);

  return {
    totalFixtures: rawFixtures.length,
    totalWeight,
    edgeCaseFixtures,
    byVerdict: orderedCounts(byVerdict, allowedVerdicts),
    byKind: orderedCounts(byKind, allowedKinds),
    byPreset: orderedCounts(byPreset, allowedPresets),
    ruleFamilySlices,
    presetSlices: presetSliceSummaries,
    curationNext,
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
    "By rule family:"
  ];

  lines.push(...formatRuleFamilySlices(report.ruleFamilySlices));
  lines.push("", "Preset slices:");
  lines.push(...formatPresetSlices(report.presetSlices));
  lines.push(
    "",
    "Rules without pass-case coverage:"
  );

  lines.push(...formatRuleGaps(report.gaps.rulesWithoutPassCases));
  lines.push("", "Pass-eligible rules without pass-case coverage:");
  lines.push(...formatRuleGaps(report.gaps.passEligibleRulesWithoutPassCases));
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
  lines.push("", "Curation next:");
  lines.push(...formatCurationNext(report.curationNext));
  lines.push(
    "",
    "Next:",
    "  npm run fixtures:check",
    "  npm run fixtures:report -- --json",
    "  node .\\dist\\cli.js tune coverage"
  );

  return `${lines.join("\n")}\n`;
}

function renderFixtureReportMarkdown(report) {
  const lines = [
    "# Fixture Coverage Report",
    "",
    "Generated from `examples/fixtures/preset-review-cases.json`.",
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "| --- | ---: |",
    `| Fixtures | ${report.totalFixtures} |`,
    `| Weighted fixtures | ${report.totalWeight} |`,
    `| Edge-case fixtures | ${report.edgeCaseFixtures} |`,
    `| Rules covered by expectedRuleIds | ${report.rules.length} |`,
    "",
    "## Counts",
    "",
    "### By Verdict",
    "",
    ...formatMarkdownCountTable("Verdict", report.byVerdict),
    "",
    "### By Kind",
    "",
    ...formatMarkdownCountTable("Kind", report.byKind),
    "",
    "### By Preset",
    "",
    ...formatMarkdownCountTable("Preset", report.byPreset),
    "",
    "## Rule Family Slices",
    "",
    ...formatMarkdownRuleFamilyTable(report.ruleFamilySlices),
    "",
    "## Preset Slices",
    "",
    ...formatMarkdownPresetTable(report.presetSlices),
    "",
    "## Gaps",
    "",
    "### Rules Without Pass-Case Coverage",
    "",
    ...formatMarkdownRuleGapList(report.gaps.rulesWithoutPassCases),
    "",
    "### Pass-Eligible Rules Without Pass-Case Coverage",
    "",
    ...formatMarkdownRuleGapList(report.gaps.passEligibleRulesWithoutPassCases),
    "",
    "### Rules Without Quiet-Pass Coverage",
    "",
    ...formatMarkdownRuleGapList(report.gaps.rulesWithoutQuietPassCoverage),
    "",
    "### Thin Rule Coverage",
    "",
    ...formatMarkdownRuleGapList(report.gaps.thinRuleCoverage),
    "",
    "### Preset/Kind Gaps",
    "",
    ...formatMarkdownPresetKindGaps(report.gaps.presetKindGaps),
    "",
    "## Quiet-Pass Rule Coverage",
    "",
    ...formatMarkdownQuietPassTable(report.gaps.quietPassRuleCoverage),
    "",
    "## Quiet-Pass Fixture Samples",
    "",
    ...formatMarkdownFixtureSamples(report.gaps.quietPassFixtures),
    "",
    "## Curation Next",
    "",
    ...formatMarkdownCurationNext(report.curationNext),
    "",
    "## Next Commands",
    "",
    "```powershell",
    "npm run fixtures:check",
    "npm run fixtures:report",
    "npm run fixtures:report -- --json",
    "npm run fixtures:report -- --markdown",
    "node .\\dist\\cli.js tune coverage",
    "```"
  ];

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

function createPresetSlice(preset) {
  return {
    preset,
    total: 0,
    weight: 0,
    edgeCases: 0,
    quietPassFixtures: 0,
    expectedRuleReferences: 0,
    quietPassRuleReferences: 0,
    byKind: zeroCounts(allowedKinds),
    byVerdict: zeroCounts(allowedVerdicts)
  };
}

function createRuleFamilySlice(family) {
  return {
    family,
    ruleCount: 0,
    ruleIds: [],
    fixtureReferences: 0,
    weight: 0,
    passCases: 0,
    cautionCases: 0,
    blockCases: 0,
    quietPassCases: 0,
    quietPassWeight: 0,
    rulesWithoutPassCases: [],
    rulesWithoutQuietPassCoverage: [],
    thinRules: [],
    sampleRules: []
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

function ruleFamily(ruleId) {
  if (ruleId.startsWith("blocked-command-")) {
    return "blocked-command";
  }

  if (ruleId.startsWith("configured-sensitive-domain-")) {
    return "configured-sensitive-domain";
  }

  if (ruleId.startsWith("custom-")) {
    return "custom";
  }

  if (structuralRuleIds.has(ruleId)) {
    return "structural";
  }

  return "built-in";
}

function buildRuleFamilySlices(ruleSummaries, quietPassRuleSummaries) {
  const slices = new Map(ruleFamilyOrder.map((family) => [family, createRuleFamilySlice(family)]));

  for (const entry of ruleSummaries) {
    const family = ruleFamily(entry.ruleId);
    const slice = slices.get(family) ?? createRuleFamilySlice(family);

    slice.ruleCount += 1;
    slice.ruleIds.push(entry.ruleId);
    slice.fixtureReferences += entry.total;
    slice.weight += entry.weight;
    slice.passCases += entry.passCases;
    slice.cautionCases += entry.cautionCases;
    slice.blockCases += entry.blockCases;
    if (entry.passCases === 0) {
      slice.rulesWithoutPassCases.push(ruleGapSummary(entry));
    }
    if (entry.quietPassCases === 0) {
      slice.rulesWithoutQuietPassCoverage.push(ruleGapSummary(entry));
    }
    if (entry.total < 2) {
      slice.thinRules.push(ruleGapSummary(entry));
    }
    if (slice.sampleRules.length < sampleLimit) {
      slice.sampleRules.push({
        ruleId: entry.ruleId,
        total: entry.total,
        quietPassCases: entry.quietPassCases
      });
    }

    slices.set(family, slice);
  }

  for (const entry of quietPassRuleSummaries) {
    const family = ruleFamily(entry.ruleId);
    const slice = slices.get(family) ?? createRuleFamilySlice(family);

    slice.quietPassCases += entry.total;
    slice.quietPassWeight += entry.weight;
    slices.set(family, slice);
  }

  return sortRuleFamilies([...slices.values()])
    .filter((entry) => entry.ruleCount > 0 || entry.quietPassCases > 0)
    .map((entry) => ({
      ...entry,
      ruleIds: entry.ruleIds.slice().sort((a, b) => a.localeCompare(b)),
      rulesWithoutPassCases: entry.rulesWithoutPassCases
        .slice()
        .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId)),
      rulesWithoutQuietPassCoverage: entry.rulesWithoutQuietPassCoverage
        .slice()
        .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId)),
      thinRules: entry.thinRules
        .slice()
        .sort((a, b) => a.total - b.total || a.ruleId.localeCompare(b.ruleId)),
      sampleRules: entry.sampleRules
        .slice()
        .sort((a, b) => b.total - a.total || a.ruleId.localeCompare(b.ruleId))
    }));
}

function buildPresetSlices(presetSlices) {
  return [...presetSlices.values()]
    .map((entry) => ({
      preset: entry.preset,
      total: entry.total,
      weight: entry.weight,
      edgeCases: entry.edgeCases,
      quietPassFixtures: entry.quietPassFixtures,
      expectedRuleReferences: entry.expectedRuleReferences,
      quietPassRuleReferences: entry.quietPassRuleReferences,
      byKind: orderedCounts(entry.byKind, allowedKinds),
      byVerdict: orderedCounts(entry.byVerdict, allowedVerdicts)
    }))
    .sort((a, b) => presetOrder(a.preset) - presetOrder(b.preset) || a.preset.localeCompare(b.preset));
}

function buildCurationNext(gaps, ruleFamilySlices, presetSlices) {
  const items = [];

  if (gaps.presetKindGaps.length > 0) {
    items.push({
      priority: "high",
      area: "preset-kind-gaps",
      title: "Fill missing preset/review-kind combinations",
      count: gaps.presetKindGaps.length,
      details: gaps.presetKindGaps
        .slice(0, 6)
        .map((entry) => `${entry.preset}: ${entry.missingKinds.join(", ")}`)
    });
  }

  if (gaps.rulesWithoutQuietPassCoverage.length > 0) {
    items.push({
      priority: "high",
      area: "quiet-pass-gaps",
      title: "Add safe near-miss fixtures for rules without quiet-pass coverage",
      count: gaps.rulesWithoutQuietPassCoverage.length,
      ruleIds: gaps.rulesWithoutQuietPassCoverage.slice(0, 8).map((entry) => entry.ruleId)
    });
  }

  if (gaps.thinRuleCoverage.length > 0) {
    items.push({
      priority: "medium",
      area: "thin-rule-coverage",
      title: "Add a second example for rules with only one firing fixture",
      count: gaps.thinRuleCoverage.length,
      ruleIds: gaps.thinRuleCoverage.slice(0, 8).map((entry) => entry.ruleId)
    });
  }

  if (gaps.passEligibleRulesWithoutPassCases.length > 0) {
    items.push({
      priority: "medium",
      area: "pass-case-coverage",
      title: "Add benign matched examples for low-severity rules with no pass-case evidence",
      count: gaps.passEligibleRulesWithoutPassCases.length,
      ruleIds: gaps.passEligibleRulesWithoutPassCases.slice(0, 8).map((entry) => entry.ruleId)
    });
  }

  const thinFamilies = ruleFamilySlices
    .filter((entry) => entry.thinRules.length > 0)
    .map((entry) => ({
      family: entry.family,
      thinRules: entry.thinRules.length,
      ruleIds: entry.thinRules.slice(0, 4).map((rule) => rule.ruleId)
    }));

  if (thinFamilies.length > 0) {
    items.push({
      priority: "low",
      area: "rule-family-curation",
      title: "Use rule-family slices to batch similar thin rules",
      count: thinFamilies.reduce((total, entry) => total + entry.thinRules, 0),
      families: thinFamilies
    });
  }

  const lowerPresetSlices = presetSlices
    .filter((entry) => entry.total > 0)
    .slice()
    .sort((a, b) => a.total - b.total || presetOrder(a.preset) - presetOrder(b.preset) || a.preset.localeCompare(b.preset))
    .slice(0, 4)
    .map((entry) => ({
      preset: entry.preset,
      total: entry.total,
      quietPassFixtures: entry.quietPassFixtures
    }));

  items.push({
    priority: "low",
    area: "preset-real-world-curation",
    title: "Collect real-world reports for the lowest-count preset slices",
    count: lowerPresetSlices.length,
    presets: lowerPresetSlices
  });

  return items;
}

function sortRuleFamilies(entries) {
  return entries.sort((a, b) => ruleFamilyIndex(a.family) - ruleFamilyIndex(b.family) || a.family.localeCompare(b.family));
}

function ruleFamilyIndex(family) {
  const index = ruleFamilyOrder.indexOf(family);
  return index === -1 ? ruleFamilyOrder.length : index;
}

function presetOrder(preset) {
  const index = allowedPresets.indexOf(preset);
  return index === -1 ? allowedPresets.length : index;
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

function formatMarkdownCountTable(label, counts) {
  return [
    `| ${label} | Count |`,
    "| --- | ---: |",
    ...Object.entries(counts).map(([key, value]) => `| ${markdownCell(key)} | ${value} |`)
  ];
}

function formatMarkdownRuleFamilyTable(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return [
    "| Family | Rules | Fixture Refs | Pass | Caution | Block | Quiet Pass | Thin |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...entries.map((entry) =>
      [
        markdownCell(entry.family),
        entry.ruleCount,
        entry.fixtureReferences,
        entry.passCases,
        entry.cautionCases,
        entry.blockCases,
        entry.quietPassCases,
        entry.thinRules.length
      ].join(" | ")
    ).map((row) => `| ${row} |`)
  ];
}

function formatMarkdownPresetTable(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return [
    "| Preset | Fixtures | Weight | Pass | Caution | Block | Quiet Pass | Rule Refs | Absent Refs |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...entries.map((entry) =>
      [
        markdownCell(entry.preset),
        entry.total,
        entry.weight,
        entry.byVerdict.pass ?? 0,
        entry.byVerdict.caution ?? 0,
        entry.byVerdict.block ?? 0,
        entry.quietPassFixtures,
        entry.expectedRuleReferences,
        entry.quietPassRuleReferences
      ].join(" | ")
    ).map((row) => `| ${row} |`)
  ];
}

function formatMarkdownRuleGapList(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return entries
    .slice(0, 12)
    .map((entry) => `- \`${entry.ruleId}\`: ${entry.total} fixture(s), pass ${entry.passCases}, caution ${entry.cautionCases}, block ${entry.blockCases}, quiet-pass ${entry.quietPassCases}`);
}

function formatMarkdownPresetKindGaps(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return entries.map((entry) => `- \`${entry.preset}\`: ${entry.missingKinds.map((kind) => `\`${kind}\``).join(", ")}`);
}

function formatMarkdownQuietPassTable(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return [
    "| Rule | Quiet-Pass Fixtures | Weight |",
    "| --- | ---: | ---: |",
    ...entries
      .slice(0, 12)
      .map((entry) => `| \`${markdownCell(entry.ruleId)}\` | ${entry.total} | ${entry.weight} |`)
  ];
}

function formatMarkdownFixtureSamples(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return entries
    .slice(0, 8)
    .map((entry) => `- \`${entry.id}\`: ${markdownCell(entry.description)}`);
}

function formatMarkdownCurationNext(entries) {
  if (entries.length === 0) {
    return ["None."];
  }

  return [
    "| Priority | Area | Count | Details |",
    "| --- | --- | ---: | --- |",
    ...entries.map((entry) =>
      `| ${markdownCell(entry.priority)} | ${markdownCell(entry.area)} | ${entry.count} | ${markdownCell(markdownCurationDetails(entry))} |`
    )
  ];
}

function markdownCurationDetails(entry) {
  if (Array.isArray(entry.ruleIds) && entry.ruleIds.length > 0) {
    return entry.ruleIds.join(", ");
  }

  if (Array.isArray(entry.details) && entry.details.length > 0) {
    return entry.details.join("; ");
  }

  if (Array.isArray(entry.families) && entry.families.length > 0) {
    return entry.families.map((family) => `${family.family} ${family.thinRules}`).join(", ");
  }

  if (Array.isArray(entry.presets) && entry.presets.length > 0) {
    return entry.presets.map((preset) => `${preset.preset} ${preset.total}`).join(", ");
  }

  return "";
}

function markdownCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatRuleGaps(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries
    .slice(0, 12)
    .map((entry) => `- ${entry.ruleId}: ${entry.total} fixture(s), pass ${entry.passCases}, caution ${entry.cautionCases}, block ${entry.blockCases}, quiet-pass ${entry.quietPassCases}`);
}

function formatRuleFamilySlices(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries.map((entry) =>
    [
      `- ${entry.family}: ${entry.ruleCount} rule(s)`,
      `${entry.fixtureReferences} fixture ref(s)`,
      `pass ${entry.passCases}`,
      `caution ${entry.cautionCases}`,
      `block ${entry.blockCases}`,
      `quiet-pass ${entry.quietPassCases}`,
      `thin ${entry.thinRules.length}`
    ].join(", ")
  );
}

function formatPresetSlices(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries.map((entry) =>
    [
      `- ${entry.preset}: ${entry.total} fixture(s)`,
      `weight ${entry.weight}`,
      `pass ${entry.byVerdict.pass ?? 0}`,
      `caution ${entry.byVerdict.caution ?? 0}`,
      `block ${entry.byVerdict.block ?? 0}`,
      `quiet-pass ${entry.quietPassFixtures}`,
      `rule refs ${entry.expectedRuleReferences}`,
      `absent refs ${entry.quietPassRuleReferences}`
    ].join(", ")
  );
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

function formatCurationNext(entries) {
  if (entries.length === 0) {
    return ["- none"];
  }

  return entries.map((entry) => {
    const details = formatCurationDetails(entry);
    return `- ${entry.priority} ${entry.area}: ${entry.title} (${entry.count})${details}`;
  });
}

function formatCurationDetails(entry) {
  if (Array.isArray(entry.ruleIds) && entry.ruleIds.length > 0) {
    return `: ${entry.ruleIds.join(", ")}`;
  }

  if (Array.isArray(entry.details) && entry.details.length > 0) {
    return `: ${entry.details.join("; ")}`;
  }

  if (Array.isArray(entry.families) && entry.families.length > 0) {
    return `: ${entry.families.map((family) => `${family.family} ${family.thinRules}`).join(", ")}`;
  }

  if (Array.isArray(entry.presets) && entry.presets.length > 0) {
    return `: ${entry.presets.map((preset) => `${preset.preset} ${preset.total}`).join(", ")}`;
  }

  return "";
}
