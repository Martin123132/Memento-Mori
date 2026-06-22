#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const cookbookPath = "examples/tuning/framework-tuning-cookbook.json";
const cookbookReadmePath = "examples/tuning/README.md";
const guidePath = "docs/FRAMEWORK_TUNING.md";
const fixturesPath = "examples/fixtures/preset-review-cases.json";
const failures = [];

const allowedPresets = new Set(["default", "node", "python", "web", "api", "infra", "ai", "security"]);
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

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function checkString(value, label, options = {}) {
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${label} should be a non-empty string.`);
    return;
  }

  if (options.kebab && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    failures.push(`${label} should use stable kebab-case.`);
  }

  if (options.minLength && value.trim().length < options.minLength) {
    failures.push(`${label} should be at least ${options.minLength} characters.`);
  }
}

function checkStringArray(value, label, options = {}) {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push(`${label} should be a non-empty array.`);
    return [];
  }

  const seen = new Set();
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || item.trim().length === 0) {
      failures.push(`${label}[${index}] should be a non-empty string.`);
      continue;
    }

    if (seen.has(item)) {
      failures.push(`${label} repeats ${item}.`);
    }
    seen.add(item);

    if (options.pattern && !options.pattern.test(item)) {
      failures.push(`${label}[${index}] should match ${options.description}. Saw ${item}.`);
    }
  }

  return value.filter((item) => typeof item === "string" && item.trim().length > 0);
}

function requireIncludes(content, file, value, description) {
  if (!content.includes(value)) {
    failures.push(`${file} should include ${description}: ${value}`);
  }
}

let cookbook;
let fixtures;
try {
  cookbook = readJson(cookbookPath);
  fixtures = readJson(fixturesPath);
} catch (error) {
  console.error(`Could not parse framework tuning inputs: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const cookbookRaw = read(cookbookPath);
const cookbookReadme = read(cookbookReadmePath);
const frameworkGuide = read(guidePath);

for (const [file, content] of [
  [cookbookPath, cookbookRaw],
  [cookbookReadmePath, cookbookReadme],
  [guidePath, frameworkGuide]
]) {
  for (const unsafe of unsafeContentPatterns) {
    if (unsafe.pattern.test(content)) {
      failures.push(`${file} appears to contain ${unsafe.name}; tuning examples should stay public and redacted.`);
    }
  }
}

if (!Array.isArray(cookbook)) {
  failures.push(`${cookbookPath} should contain a JSON array.`);
} else if (cookbook.length < 5) {
  failures.push(`${cookbookPath} should contain at least five framework recipes.`);
}

if (!Array.isArray(fixtures)) {
  failures.push(`${fixturesPath} should contain a JSON array.`);
  fixtures = [];
}

const fixtureIds = new Set();
const fixtureRuleIds = new Set();
for (const fixture of fixtures) {
  if (typeof fixture?.id === "string") {
    fixtureIds.add(fixture.id);
  }
  for (const field of ["expectedRuleIds", "absentRuleIds"]) {
    if (Array.isArray(fixture?.[field])) {
      for (const ruleId of fixture[field]) {
        if (typeof ruleId === "string") {
          fixtureRuleIds.add(ruleId);
        }
      }
    }
  }
}

requireIncludes(frameworkGuide, guidePath, "framework-tuning-cookbook.json", "the cookbook JSON link");
requireIncludes(frameworkGuide, guidePath, "examples/tuning", "the tuning examples link");
requireIncludes(cookbookReadme, cookbookReadmePath, "framework-tuning-cookbook.json", "the cookbook JSON link");
requireIncludes(cookbookReadme, cookbookReadmePath, "npm run framework:tuning:check", "the checker command");

const ids = new Set();
const commandPattern = /^jester tune ([a-z0-9]+(?:-[a-z0-9]+)*) --json$/;

for (const [index, recipe] of (Array.isArray(cookbook) ? cookbook : []).entries()) {
  const label = typeof recipe?.id === "string" ? recipe.id : `recipe[${index}]`;

  if (!recipe || typeof recipe !== "object" || Array.isArray(recipe)) {
    failures.push(`${label} should be an object.`);
    continue;
  }

  checkString(recipe.id, `${label}.id`, { kebab: true });
  checkString(recipe.stack, `${label}.stack`);
  checkString(recipe.preset, `${label}.preset`);
  checkString(recipe.when, `${label}.when`, { minLength: 40 });

  if (typeof recipe.id === "string") {
    if (ids.has(recipe.id)) {
      failures.push(`${label}.id is duplicated.`);
    }
    ids.add(recipe.id);
  }

  if (!allowedPresets.has(recipe.preset)) {
    failures.push(`${label}.preset should be one of: ${[...allowedPresets].join(", ")}.`);
  }

  const commands = checkStringArray(recipe.commands, `${label}.commands`, {
    pattern: commandPattern,
    description: "`jester tune <rule-id> --json`"
  });
  const fixturesForRecipe = checkStringArray(recipe.fixtures, `${label}.fixtures`, {
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    description: "a kebab-case fixture id"
  });
  checkStringArray(recipe.next, `${label}.next`);

  for (const command of commands) {
    const match = command.match(commandPattern);
    const ruleId = match?.[1];
    if (ruleId && !fixtureRuleIds.has(ruleId)) {
      failures.push(`${label}.commands references ${ruleId}, but no fixture currently names that rule in expectedRuleIds or absentRuleIds.`);
    }

    requireIncludes(frameworkGuide, guidePath, command, `${label} command`);
    requireIncludes(cookbookReadme, cookbookReadmePath, command, `${label} command`);
  }

  for (const fixtureId of fixturesForRecipe) {
    if (!fixtureIds.has(fixtureId)) {
      failures.push(`${label}.fixtures references missing fixture ${fixtureId}.`);
    }

    requireIncludes(frameworkGuide, guidePath, fixtureId, `${label} fixture id`);
    requireIncludes(cookbookReadme, cookbookReadmePath, fixtureId, `${label} fixture id`);
  }

  if (typeof recipe.id === "string") {
    requireIncludes(frameworkGuide, guidePath, recipe.id, `${label} recipe id`);
    requireIncludes(cookbookReadme, cookbookReadmePath, recipe.id, `${label} recipe id`);
  }

  if (typeof recipe.stack === "string") {
    requireIncludes(frameworkGuide, guidePath, recipe.stack, `${label} stack`);
    requireIncludes(cookbookReadme, cookbookReadmePath, recipe.stack, `${label} stack`);
  }
}

if (failures.length > 0) {
  console.error("Framework tuning check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Framework tuning check passed for ${Array.isArray(cookbook) ? cookbook.length : 0} recipes.`);
