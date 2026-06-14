#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixturePath = "examples/fixtures/preset-review-cases.json";
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const allowedPresets = new Set(["default", "node", "python", "web", "api", "infra", "ai", "security"]);
const allowedKinds = new Set(["plan", "command", "diff", "final"]);
const allowedVerdicts = new Set(["pass", "caution", "block"]);
const unsafeContentPatterns = [
  { name: "private key block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "OpenAI-looking secret key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: "Anthropic-looking secret key", pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { name: "GitHub-looking token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: "AWS access key id", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Slack-looking token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "absolute Unix home path", pattern: /(?:^|[\s"'`])\/(?:Users|home)\/[A-Za-z0-9._-]+/ },
  { name: "absolute Windows user path", pattern: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\/ }
];

let fixtures;
try {
  fixtures = JSON.parse(read(fixturePath));
} catch (error) {
  console.error(`Could not parse ${fixturePath}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (!Array.isArray(fixtures)) {
  console.error(`${fixturePath} should contain a JSON array.`);
  process.exit(1);
}

const ids = new Set();
const contentKeys = new Map();

for (const [index, fixture] of fixtures.entries()) {
  const label = typeof fixture?.id === "string" && fixture.id.length > 0
    ? fixture.id
    : `fixture[${index}]`;

  if (!fixture || typeof fixture !== "object" || Array.isArray(fixture)) {
    failures.push(`${label} should be an object.`);
    continue;
  }

  checkString(fixture, "id", label);
  checkString(fixture, "description", label, { minLength: 20 });
  checkString(fixture, "content", label, { minLength: 3 });

  if (typeof fixture.id === "string") {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fixture.id)) {
      failures.push(`${label}.id should use stable kebab-case.`);
    }

    if (ids.has(fixture.id)) {
      failures.push(`${label}.id is duplicated.`);
    }
    ids.add(fixture.id);
  }

  if (!allowedPresets.has(fixture.preset)) {
    failures.push(`${label}.preset should be one of: ${[...allowedPresets].join(", ")}.`);
  }

  if (!allowedKinds.has(fixture.kind)) {
    failures.push(`${label}.kind should be one of: ${[...allowedKinds].join(", ")}.`);
  }

  if (!allowedVerdicts.has(fixture.expectedVerdict)) {
    failures.push(`${label}.expectedVerdict should be pass, caution, or block.`);
  }

  checkRuleIdArray(fixture, "expectedRuleIds", label, { required: true });
  checkRuleIdArray(fixture, "absentRuleIds", label, { required: false });

  const expectedRuleIds = Array.isArray(fixture.expectedRuleIds) ? fixture.expectedRuleIds : [];
  const absentRuleIds = Array.isArray(fixture.absentRuleIds) ? fixture.absentRuleIds : [];
  const expectedSet = new Set(expectedRuleIds);
  for (const ruleId of absentRuleIds) {
    if (expectedSet.has(ruleId)) {
      failures.push(`${label} lists ${ruleId} in both expectedRuleIds and absentRuleIds.`);
    }
  }

  if (fixture.expectedVerdict !== "pass" && expectedRuleIds.length === 0) {
    failures.push(`${label} should include at least one expectedRuleIds entry for ${fixture.expectedVerdict} verdicts.`);
  }

  if (expectedRuleIds.length === 0 && absentRuleIds.length === 0) {
    failures.push(`${label} should include expectedRuleIds or absentRuleIds so fixture intent is explicit.`);
  }

  if (fixture.weight !== undefined && (!Number.isInteger(fixture.weight) || fixture.weight < 1 || fixture.weight > 3)) {
    failures.push(`${label}.weight should be an integer from 1 to 3.`);
  }

  if (fixture.edgeCase !== undefined && typeof fixture.edgeCase !== "boolean") {
    failures.push(`${label}.edgeCase should be boolean when present.`);
  }

  if (typeof fixture.content === "string") {
    for (const unsafe of unsafeContentPatterns) {
      if (unsafe.pattern.test(fixture.content)) {
        failures.push(`${label}.content appears to contain ${unsafe.name}; fixtures should use redacted placeholders.`);
      }
    }

    const contentKey = `${fixture.preset}:${fixture.kind}:${fixture.content}`;
    const previous = contentKeys.get(contentKey);
    if (previous) {
      failures.push(`${label}.content duplicates ${previous} for the same preset and kind.`);
    } else {
      contentKeys.set(contentKey, label);
    }
  }
}

if (failures.length > 0) {
  console.error("Fixture authoring check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

process.stdout.write(`Fixture authoring check passed for ${fixtures.length} fixtures.\n`);

function checkString(fixture, field, label, options = {}) {
  const value = fixture[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${label}.${field} should be a non-empty string.`);
    return;
  }

  if (options.minLength && value.trim().length < options.minLength) {
    failures.push(`${label}.${field} should be at least ${options.minLength} characters.`);
  }
}

function checkRuleIdArray(fixture, field, label, options) {
  const value = fixture[field];

  if (value === undefined) {
    if (options.required) {
      failures.push(`${label}.${field} should be an array.`);
    }
    return;
  }

  if (!Array.isArray(value)) {
    failures.push(`${label}.${field} should be an array.`);
    return;
  }

  const seen = new Set();
  for (const ruleId of value) {
    if (typeof ruleId !== "string" || ruleId.length === 0) {
      failures.push(`${label}.${field} should only contain non-empty strings.`);
      continue;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ruleId)) {
      failures.push(`${label}.${field} contains ${ruleId}; rule ids should use kebab-case.`);
    }

    if (seen.has(ruleId)) {
      failures.push(`${label}.${field} repeats ${ruleId}.`);
    }
    seen.add(ruleId);
  }
}
