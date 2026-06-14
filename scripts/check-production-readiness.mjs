#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function requireFile(path) {
  if (!existsSync(join(root, path))) {
    failures.push(`${path} is missing.`);
  }
}

function requireText(path, pattern, description) {
  const content = read(path);
  if (!pattern.test(content)) {
    failures.push(`${path} should include ${description}.`);
  }
}

function requirePackageFile(packageJson, value) {
  if (!Array.isArray(packageJson.files) || !packageJson.files.includes(value)) {
    failures.push(`package.json files should include ${value}.`);
  }
}

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const version = packageJson.version;
const tag = `v${version}`;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  failures.push(`package.json version should be plain semver. Saw ${version}.`);
}

if (packageLock.version !== version || packageLock.packages?.[""]?.version !== version) {
  failures.push("package-lock.json version should match package.json.");
}

for (const path of [
  "README.md",
  "CHANGELOG.md",
  "ROADMAP.md",
  "LICENSE",
  "SECURITY.md",
  "docs/RELEASE.md",
  "docs/TRUSTED_PUBLISHING.md",
  "docs/PRODUCTION_READINESS.md",
  "docs/MAINTAINER_TRIAGE.md",
  `docs/RELEASE_NOTES_${tag}.md`,
  "action.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/false_positive.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/npm-publish.yml",
  ".github/workflows/release.yml",
  "examples/github-action.yml",
  "examples/github-code-scanning.yml",
  "examples/ci/README.md",
  "examples/presets/README.md",
  "examples/fixtures/preset-review-cases.json"
]) {
  requireFile(path);
}

requireText("CHANGELOG.md", new RegExp(`## ${version.replaceAll(".", "\\.")}`), `a ${version} section`);
requireText(`docs/RELEASE_NOTES_${tag}.md`, /## Release Validation/, "release validation commands");
requireText("README.md", /## Start Here/, "Start Here onboarding");
requireText("README.md", /doctor --json/, "doctor JSON support guidance");
requireText("README.md", /config recommend/, "preset recommendation onboarding");
requireText("README.md", /setup --agent codex/, "Codex setup onboarding");
requireText("README.md", /github-action --write/, "GitHub Action onboarding");
requireText("README.md", /SECURITY\.md/, "security policy link");
requireText("README.md", /false-positive/i, "false-positive support guidance");
requireText("README.md", /MAINTAINER_TRIAGE\.md/, "maintainer triage guide link");
requireText("README.md", /License: PolyForm Noncommercial/, "the noncommercial license badge");
requireText("docs/PRODUCTION_READINESS.md", /npm package/i, "npm package readiness");
requireText("docs/PRODUCTION_READINESS.md", /GitHub Action/i, "GitHub Action readiness");
requireText("docs/PRODUCTION_READINESS.md", /MCP/i, "MCP readiness");
requireText("docs/PRODUCTION_READINESS.md", /git hooks/i, "git hook readiness");
requireText("docs/PRODUCTION_READINESS.md", /support/i, "support readiness");
requireText("docs/PRODUCTION_READINESS.md", /doctor --json/, "doctor JSON support diagnostics");
requireText("docs/PRODUCTION_READINESS.md", /SECURITY\.md/, "security policy readiness");
requireText("docs/PRODUCTION_READINESS.md", /issue templates/i, "issue template readiness");
requireText("docs/PRODUCTION_READINESS.md", /MAINTAINER_TRIAGE\.md/, "maintainer triage readiness");
requireText("docs/CLI.md", /jester doctor --json/, "doctor JSON CLI docs");
requireText("docs/MAINTAINER_TRIAGE.md", /doctor --json/, "doctor JSON triage prompt");
requireText("docs/MAINTAINER_TRIAGE.md", /tune <rule-id> --json/, "tune JSON triage prompt");
requireText("docs/MAINTAINER_TRIAGE.md", /preset-review-cases\.json/, "fixture suite link");
requireText("docs/MAINTAINER_TRIAGE.md", /expectedMatches/, "fixture overlap guidance");
requireText("examples/fixtures/README.md", /MAINTAINER_TRIAGE\.md/, "maintainer triage link");
requireText("examples/fixtures/README.md", /Adding A Fixture From A Report/, "fixture report conversion guidance");
requireText("SECURITY.md", /doctor --json/, "doctor JSON redaction guidance");
requireText("SECURITY.md", /security\/advisories\/new/, "private vulnerability report link");
requireText(".github/ISSUE_TEMPLATE/bug_report.yml", /doctor --json/, "doctor JSON support prompt");
requireText(".github/ISSUE_TEMPLATE/bug_report.yml", /SECURITY\.md|security policy/i, "security redirect");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /jester tune <rule-id> --json/, "tune JSON prompt");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /false-positive|noisy rule/i, "false-positive scope");
requireText(".github/ISSUE_TEMPLATE/feature_request.yml", /local-first and deterministic/, "project constraint prompt");
requireText(".github/ISSUE_TEMPLATE/config.yml", /security\/advisories\/new/, "security contact link");

for (const publicFile of ["dist", "docs", "examples", "scripts", "CHANGELOG.md", "LICENSE", "SECURITY.md", "README.md", "ROADMAP.md"]) {
  requirePackageFile(packageJson, publicFile);
}

for (const binName of ["jester", "memento-mori-jester", "memento-mori-jester-mcp"]) {
  if (!packageJson.bin?.[binName]) {
    failures.push(`package.json bin should include ${binName}.`);
  }
}

if (packageJson.license !== "SEE LICENSE IN LICENSE") {
  failures.push("package.json license should point to LICENSE.");
}

if (packageJson.publishConfig?.access !== "public") {
  failures.push("package.json publishConfig.access should be public.");
}

requireText(".github/workflows/ci.yml", /actions\/checkout@v6/, "checkout@v6");
requireText(".github/workflows/ci.yml", /actions\/setup-node@v6/, "setup-node@v6");
requireText(".github/workflows/ci.yml", /node-version:\s*24/, "Node 24");
requireText(".github/workflows/ci.yml", /npm test/, "npm test");
requireText(".github/workflows/ci.yml", /npm run pack:dry/, "package dry run");

requireText(".github/workflows/npm-publish.yml", /tags:\s*\n\s*-\s*"v\*"/, "tag-triggered publishing");
requireText(".github/workflows/npm-publish.yml", /workflow_dispatch/, "manual publish fallback");
requireText(".github/workflows/npm-publish.yml", /id-token:\s*write/, "trusted publishing id-token permission");
requireText(".github/workflows/npm-publish.yml", /Verify tag matches package version/, "tag/package version guard");
requireText(".github/workflows/npm-publish.yml", /npm run pack:dry/, "package dry run before publish");
requireText(".github/workflows/npm-publish.yml", /npm publish/, "npm publish step");

requireText(".github/workflows/release.yml", /tags:\s*\n\s*-\s*"v\*"/, "tag-triggered GitHub Releases");
requireText(".github/workflows/release.yml", /docs\/RELEASE_NOTES_\$\{TAG\}\.md/, "release notes lookup");
requireText(".github/workflows/release.yml", /gh release create/, "GitHub Release creation");

requireText("action.yml", /summary:/, "summary input");
requireText("action.yml", /GITHUB_STEP_SUMMARY/, "GitHub step summary output");
requireText("action.yml", /actions\/setup-node@v6/, "setup-node@v6");
requireText("action.yml", /node-version:\s*24/, "Node 24");

if (failures.length > 0) {
  console.error("Production readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Production readiness check passed for ${tag}.`);
