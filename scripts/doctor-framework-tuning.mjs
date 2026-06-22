#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const cliPath = join(root, "dist", "cli.js");
const cookbookPath = join(root, "examples", "tuning", "framework-tuning-cookbook.json");
const fixturesPath = join(root, "examples", "fixtures", "preset-review-cases.json");
const failures = [];
const commandPattern = /^jester tune ([a-z0-9]+(?:-[a-z0-9]+)*) --json$/;
const presets = ["node", "python", "web", "api", "infra", "ai", "security"];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`jester ${args.join(" ")} failed${detail ? `:\n${detail}` : "."}`);
  }

  if (!options.json) {
    return result.stdout;
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`jester ${args.join(" ")} did not return JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (!existsSync(cliPath)) {
  console.error("Framework tuning doctor failed:");
  console.error(`- ${cliPath} is missing. Run npm run build first, or run this from an installed package.`);
  process.exit(1);
}

let cookbook;
let fixtures;
try {
  cookbook = readJson(cookbookPath);
  fixtures = readJson(fixturesPath);
} catch (error) {
  console.error(`Could not parse framework tuning doctor inputs: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (!Array.isArray(cookbook)) {
  console.error(`Framework tuning doctor failed: ${cookbookPath} should contain a JSON array.`);
  process.exit(1);
}

if (!Array.isArray(fixtures)) {
  console.error(`Framework tuning doctor failed: ${fixturesPath} should contain a JSON array.`);
  process.exit(1);
}

const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
const tmpRoot = mkdtempSync(join(tmpdir(), "jester-framework-tuning-"));
const configByPreset = new Map();

try {
  for (const preset of presets) {
    const configPath = join(tmpRoot, `${preset}.config.json`);
    runCli(["config", "init", "--preset", preset, "--path", configPath, "--force"]);
    runCli(["config", "validate", "--config", configPath]);
    configByPreset.set(preset, configPath);
  }

  const noConfigCatalog = readRuleCatalog(["rules", "--json", "--no-config"]);
  const presetCatalogs = new Map();
  for (const [preset, configPath] of configByPreset.entries()) {
    presetCatalogs.set(preset, readRuleCatalog(["rules", "--json", "--config", configPath]));
  }

  const recipeSummaries = [];
  let commandCount = 0;
  let fixtureReferenceCount = 0;

  for (const recipe of cookbook) {
    const label = typeof recipe?.id === "string" ? recipe.id : "unknown-recipe";
    const commands = Array.isArray(recipe?.commands) ? recipe.commands : [];
    const fixtureIds = Array.isArray(recipe?.fixtures) ? recipe.fixtures : [];
    const recipeRuleIds = [];

    for (const command of commands) {
      const match = typeof command === "string" ? command.match(commandPattern) : null;
      if (!match) {
        failures.push(`${label} command should match "jester tune <rule-id> --json". Saw ${String(command)}.`);
        continue;
      }

      recipeRuleIds.push(match[1]);
    }

    for (const fixtureId of fixtureIds) {
      const fixture = fixtureById.get(fixtureId);
      if (!fixture) {
        failures.push(`${label} references missing fixture ${fixtureId}.`);
        continue;
      }

      const refs = new Set([
        ...(Array.isArray(fixture.expectedRuleIds) ? fixture.expectedRuleIds : []),
        ...(Array.isArray(fixture.absentRuleIds) ? fixture.absentRuleIds : [])
      ]);
      fixtureReferenceCount += refs.size;
    }

    for (const ruleId of recipeRuleIds) {
      const relatedFixtures = fixtureIds.filter((fixtureId) => {
        const fixture = fixtureById.get(fixtureId);
        const refs = new Set([
          ...(Array.isArray(fixture?.expectedRuleIds) ? fixture.expectedRuleIds : []),
          ...(Array.isArray(fixture?.absentRuleIds) ? fixture.absentRuleIds : [])
        ]);
        return refs.has(ruleId);
      });

      if (relatedFixtures.length === 0) {
        failures.push(`${label} command for ${ruleId} should have at least one referenced fixture in expectedRuleIds or absentRuleIds.`);
      }

      const runContext = chooseRunContext(ruleId, recipe.preset, noConfigCatalog, presetCatalogs, configByPreset);
      if (!runContext) {
        failures.push(`${label} command for ${ruleId} did not resolve in built-in rules or generated preset configs.`);
        continue;
      }

      const args = ["tune", ruleId, "--json"];
      if (runContext.configPath) {
        args.push("--config", runContext.configPath);
      } else {
        args.push("--no-config");
      }

      let advice;
      try {
        advice = runCli(args, { json: true });
      } catch (error) {
        failures.push(`${label} command for ${ruleId} failed: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }

      commandCount += 1;
      validateTuneAdvice(label, ruleId, runContext.name, advice);
    }

    recipeSummaries.push({
      id: label,
      commandCount: recipeRuleIds.length,
      fixtureCount: fixtureIds.length
    });
  }

  if (failures.length > 0) {
    console.error("Framework tuning doctor failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Framework tuning doctor");
  console.log("");
  for (const recipe of recipeSummaries) {
    console.log(`PASS ${recipe.id}: ${recipe.commandCount} tune command(s), ${recipe.fixtureCount} fixture reference(s)`);
  }
  console.log("");
  console.log(`Checked ${recipeSummaries.length} recipe(s), ${commandCount} executable tune command(s), and ${fixtureReferenceCount} fixture rule reference(s).`);
  console.log("Generated temporary preset configs and removed them after validation.");
} finally {
  rmSync(tmpRoot, { recursive: true, force: true });
}

function readRuleCatalog(args) {
  const output = runCli(args, { json: true });
  if (!Array.isArray(output.rules)) {
    throw new Error(`jester ${args.join(" ")} did not return a rules array.`);
  }
  return new Set(output.rules.map((rule) => rule.id).filter((id) => typeof id === "string"));
}

function chooseRunContext(ruleId, preferredPreset, noConfigCatalog, presetCatalogs, configByPreset) {
  if (typeof preferredPreset === "string" && presetCatalogs.get(preferredPreset)?.has(ruleId)) {
    return {
      name: preferredPreset,
      configPath: configByPreset.get(preferredPreset)
    };
  }

  for (const [preset, catalog] of presetCatalogs.entries()) {
    if (catalog.has(ruleId)) {
      return {
        name: preset,
        configPath: configByPreset.get(preset)
      };
    }
  }

  if (noConfigCatalog.has(ruleId)) {
    return {
      name: "built-in",
      configPath: null
    };
  }

  return null;
}

function validateTuneAdvice(recipeId, ruleId, contextName, advice) {
  if (advice?.ruleId !== ruleId) {
    failures.push(`${recipeId} expected tune JSON ruleId ${ruleId}; saw ${String(advice?.ruleId)}.`);
  }

  if (typeof advice?.title !== "string" || advice.title.length === 0) {
    failures.push(`${recipeId} tune ${ruleId} should include a title.`);
  }

  if (!Number.isInteger(advice?.severity)) {
    failures.push(`${recipeId} tune ${ruleId} should include numeric severity.`);
  }

  if (!Array.isArray(advice?.kinds) || advice.kinds.length === 0) {
    failures.push(`${recipeId} tune ${ruleId} should include review kinds.`);
  }

  if (typeof advice?.recommendation !== "string" || advice.recommendation.length === 0) {
    failures.push(`${recipeId} tune ${ruleId} should include a recommendation.`);
  }

  if (!Array.isArray(advice?.checksBeforeMuting) || advice.checksBeforeMuting.length === 0) {
    failures.push(`${recipeId} tune ${ruleId} should include checksBeforeMuting.`);
  }

  if (advice?.fixtureEvidence?.ruleId !== ruleId) {
    failures.push(`${recipeId} tune ${ruleId} should include fixtureEvidence for the same rule.`);
  }

  if (!advice?.commands?.inspect || !advice?.commands?.validate || !advice?.commands?.list) {
    failures.push(`${recipeId} tune ${ruleId} should include inspect, validate, and list commands.`);
  }

  if (contextName !== "built-in" && advice?.configPath === null) {
    failures.push(`${recipeId} tune ${ruleId} should report a generated config path when using the ${contextName} preset.`);
  }
}
