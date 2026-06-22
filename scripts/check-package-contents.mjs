#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmExecPath = process.env.npm_execpath;
const failures = [];
const packageJson = readJson("package.json");

const requiredPackageFiles = [
  "dist/cli.js",
  "dist/core.js",
  "docs/RELEASE.md",
  `docs/RELEASE_NOTES_v${packageJson.version}.md`,
  "examples/support/installed-package-support.md",
  "examples/support/installed-package-support.json",
  "examples/support/post-release-evidence-ledger.md",
  "examples/support/post-release-evidence-ledger.json",
  "examples/support/release-support-provenance.md",
  "examples/support/release-support-provenance.json",
  "examples/support/support-examples-index.md",
  "examples/support/support-examples-index.json",
  "examples/support/support-examples-quickstart.md",
  "examples/support/support-examples-quickstart.json",
  "examples/support/support-lifecycle-map.md",
  "examples/support/support-lifecycle-map.json",
  "examples/support/support-lifecycle-worksheet.md",
  "examples/support/support-lifecycle-worksheet.json",
  "examples/support/support-lifecycle-filled-example.md",
  "examples/support/support-lifecycle-filled-example.json",
  "README.md",
  "CHANGELOG.md",
  "ROADMAP.md",
  "SECURITY.md",
  "LICENSE"
];

const requiredSupportFiles = [
  "examples/support/installed-package-support.md",
  "examples/support/installed-package-support.json",
  "examples/support/post-release-evidence-ledger.md",
  "examples/support/post-release-evidence-ledger.json",
  "examples/support/release-support-provenance.md",
  "examples/support/release-support-provenance.json",
  "examples/support/support-examples-index.md",
  "examples/support/support-examples-index.json",
  "examples/support/support-examples-quickstart.md",
  "examples/support/support-examples-quickstart.json",
  "examples/support/support-lifecycle-map.md",
  "examples/support/support-lifecycle-map.json",
  "examples/support/support-lifecycle-worksheet.md",
  "examples/support/support-lifecycle-worksheet.json",
  "examples/support/support-lifecycle-filled-example.md",
  "examples/support/support-lifecycle-filled-example.json"
];

const forbiddenPackagePathRules = [
  { name: "repo-local promo assets", pattern: /^promo\// },
  { name: "repo-local site assets", pattern: /^site\// },
  { name: "GitHub workflow or issue-template files", pattern: /^\.github\// },
  { name: "git metadata", pattern: /^\.git(?:\/|$)/ },
  { name: "dependency or generated caches", pattern: /(^|\/)(?:node_modules|coverage|tmp|temp|\.next|dist-debug)(?:\/|$)/ },
  { name: "private or secret-named directories", pattern: /(^|\/)(?:private|secrets?|internal)(?:\/|$)/i },
  { name: "environment or credential files", pattern: /(^|\/)(?:\.env(?:\..*)?|\.npmrc|npm-debug\.log|yarn-error\.log|pnpm-debug\.log|.*\.(?:pem|p12|key))$/i }
];

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

const pack = dryRunPack();
const files = new Set(pack.files.map((file) => normalizePath(file.path)));

if (pack.name !== packageJson.name) {
  failures.push(`Dry-run package name should be ${packageJson.name}. Saw ${pack.name}.`);
}

if (pack.version !== packageJson.version) {
  failures.push(`Dry-run package version should be ${packageJson.version}. Saw ${pack.version}.`);
}

for (const file of requiredPackageFiles) {
  if (!files.has(file)) {
    failures.push(`Package dry run should include ${file}.`);
  }
}

for (const file of pack.files) {
  const path = normalizePath(file.path);
  for (const rule of forbiddenPackagePathRules) {
    if (rule.pattern.test(path)) {
      failures.push(`Package dry run should exclude ${rule.name}: ${path}.`);
    }
  }
}

for (const path of requiredSupportFiles) {
  requireFile(path);
  if (!existsSync(join(root, path))) {
    continue;
  }

  const content = read(path);
  for (const unsafe of unsafeContentPatterns) {
    if (unsafe.pattern.test(content)) {
      failures.push(`${path} appears to contain ${unsafe.name}; package support examples must stay public-safe.`);
    }
  }
}

checkInstalledPackageSupport();
checkPostReleaseEvidenceLedger();
checkReleaseSupportProvenance();

if (failures.length > 0) {
  console.error("Package contents check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

function checkPostReleaseEvidenceLedger() {
  const path = "examples/support/post-release-evidence-ledger.json";
  if (!existsSync(join(root, path))) {
    return;
  }

  const ledger = readJson(path);
  const expectedRecordFields = [
    "GitHub Release URL",
    "npm registry version",
    "CI workflow status",
    "GitHub Release workflow status",
    "npm Publish workflow status",
    "public npx doctor result",
    "public npx summary result",
    "installed-package provenance command result",
    "tarball file count",
    "private-ish path exclusion summary"
  ];
  const expectedPrivateIshPaths = ["promo/", "site/", ".github/", "private/", "secrets/", "internal/"];

  if (ledger.packageName !== packageJson.name) {
    failures.push(`${path}.packageName should be ${packageJson.name}.`);
  }

  if (ledger.releaseCloseoutRequired !== true) {
    failures.push(`${path}.releaseCloseoutRequired should be true.`);
  }

  if (ledger.sourceGate !== "examples/support/release-support-provenance.json") {
    failures.push(`${path}.sourceGate should point at examples/support/release-support-provenance.json.`);
  }

  if (!Array.isArray(ledger.recordFields) || ledger.recordFields.join("|") !== expectedRecordFields.join("|")) {
    failures.push(`${path}.recordFields should list post-release evidence fields in order.`);
  }

  if (!Array.isArray(ledger.evidenceCommands) || !ledger.evidenceCommands.some((command) => command?.command === "npm explore memento-mori-jester -- npm run pack:contents:check")) {
    failures.push(`${path}.evidenceCommands should include the installed-package provenance command.`);
  }

  if (!Array.isArray(ledger.privateIshPathExclusions)) {
    failures.push(`${path}.privateIshPathExclusions should be an array.`);
  } else {
    for (const privateIshPath of expectedPrivateIshPaths) {
      if (!ledger.privateIshPathExclusions.includes(privateIshPath)) {
        failures.push(`${path}.privateIshPathExclusions should include ${privateIshPath}.`);
      }

      for (const file of files) {
        if (file.startsWith(privateIshPath)) {
          failures.push(`${path}.privateIshPathExclusions lists ${privateIshPath}, but ${file} is present in the package dry run.`);
        }
      }
    }
  }
}

function checkReleaseSupportProvenance() {
  const path = "examples/support/release-support-provenance.json";
  if (!existsSync(join(root, path))) {
    return;
  }

  const gate = readJson(path);
  const expectedArtifacts = [
    "examples/support/installed-package-support.md",
    "examples/support/support-examples-index.md",
    "examples/support/support-examples-quickstart.md",
    "examples/support/support-lifecycle-map.md",
    "examples/support/support-lifecycle-worksheet.md",
    "examples/support/support-lifecycle-filled-example.md"
  ];
  const expectedRepoOnlyPaths = ["promo/", "site/", ".github/", "private/", "secrets/", "internal/"];

  if (gate.packageName !== packageJson.name) {
    failures.push(`${path}.packageName should be ${packageJson.name}.`);
  }

  if (gate.postPublishRequired !== true) {
    failures.push(`${path}.postPublishRequired should be true.`);
  }

  if (gate.registryVersionCommand !== "npm view memento-mori-jester version --silent") {
    failures.push(`${path}.registryVersionCommand should check the npm registry version.`);
  }

  if (gate.verifyCommand !== "npm explore memento-mori-jester -- npm run pack:contents:check") {
    failures.push(`${path}.verifyCommand should run the package contents check through npm explore.`);
  }

  if (!Array.isArray(gate.packageRelativeArtifacts) || gate.packageRelativeArtifacts.join("|") !== expectedArtifacts.join("|")) {
    failures.push(`${path}.packageRelativeArtifacts should list the release support package artifacts in order.`);
  } else {
    for (const artifact of gate.packageRelativeArtifacts) {
      if (!files.has(artifact)) {
        failures.push(`${path}.packageRelativeArtifacts references ${artifact}, but it is not in the package dry run.`);
      }
    }
  }

  if (!Array.isArray(gate.repoOnlyPathsNotRequired)) {
    failures.push(`${path}.repoOnlyPathsNotRequired should be an array.`);
  } else {
    for (const repoOnlyPath of expectedRepoOnlyPaths) {
      if (!gate.repoOnlyPathsNotRequired.includes(repoOnlyPath)) {
        failures.push(`${path}.repoOnlyPathsNotRequired should include ${repoOnlyPath}.`);
      }

      for (const file of files) {
        if (file.startsWith(repoOnlyPath)) {
          failures.push(`${path}.repoOnlyPathsNotRequired lists ${repoOnlyPath}, but ${file} is present in the package dry run.`);
        }
      }
    }
  }
}

console.log("Package contents check passed.");
console.log(`PASS package ${pack.name}@${pack.version}`);
console.log(`PASS support examples included: ${requiredSupportFiles.length} files`);
console.log("PASS promo, site, GitHub workflow, cache, private, and credential-shaped files excluded");

function checkInstalledPackageSupport() {
  const path = "examples/support/installed-package-support.json";
  if (!existsSync(join(root, path))) {
    return;
  }

  const note = readJson(path);
  const expectedArtifacts = [
    "examples/support/support-examples-index.md",
    "examples/support/support-examples-quickstart.md",
    "examples/support/support-lifecycle-map.md",
    "examples/support/support-lifecycle-worksheet.md",
    "examples/support/support-lifecycle-filled-example.md"
  ];
  const expectedRepoOnlyPaths = ["promo/", "site/", ".github/", "private/", "secrets/", "internal/"];

  if (note.packageName !== packageJson.name) {
    failures.push(`${path}.packageName should be ${packageJson.name}.`);
  }

  if (note.verifyCommand !== "npm explore memento-mori-jester -- npm run pack:contents:check") {
    failures.push(`${path}.verifyCommand should run the package contents check through npm explore.`);
  }

  if (!Array.isArray(note.packageRelativeArtifacts) || note.packageRelativeArtifacts.join("|") !== expectedArtifacts.join("|")) {
    failures.push(`${path}.packageRelativeArtifacts should list the checked package support artifacts in order.`);
  } else {
    for (const artifact of note.packageRelativeArtifacts) {
      if (!files.has(artifact)) {
        failures.push(`${path}.packageRelativeArtifacts references ${artifact}, but it is not in the package dry run.`);
      }
    }
  }

  if (!Array.isArray(note.repoOnlyPathsNotRequired)) {
    failures.push(`${path}.repoOnlyPathsNotRequired should be an array.`);
  } else {
    for (const repoOnlyPath of expectedRepoOnlyPaths) {
      if (!note.repoOnlyPathsNotRequired.includes(repoOnlyPath)) {
        failures.push(`${path}.repoOnlyPathsNotRequired should include ${repoOnlyPath}.`);
      }

      for (const file of files) {
        if (file.startsWith(repoOnlyPath)) {
          failures.push(`${path}.repoOnlyPathsNotRequired lists ${repoOnlyPath}, but ${file} is present in the package dry run.`);
        }
      }
    }
  }
}

function dryRunPack() {
  const output = runNpm(["pack", "--dry-run", "--json", "--ignore-scripts"]);
  const parsed = parsePackJson(output);
  if (!Array.isArray(parsed) || parsed.length !== 1 || typeof parsed[0] !== "object") {
    fail("npm pack --dry-run --json should return one package entry.");
  }

  const [pack] = parsed;
  if (!Array.isArray(pack.files)) {
    fail("npm pack --dry-run --json output should include a files array.");
  }

  return pack;
}

function parsePackJson(output) {
  const trimmed = output.trim();
  if (!trimmed) {
    fail("npm pack --dry-run --json returned no output.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("[");
    const end = trimmed.lastIndexOf("]");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    fail(`Could not parse npm pack JSON output:\n${trimmed}`);
  }
}

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

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function runNpm(commandArgs) {
  if (npmExecPath) {
    return run(process.execPath, [npmExecPath, ...commandArgs]);
  }

  return run(npmCommand, commandArgs);
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    env: {
      ...process.env,
      npm_config_audit: "false",
      npm_config_fund: "false"
    }
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(`${command} ${commandArgs.join(" ")} failed${detail ? `:\n${detail}` : "."}`);
  }

  return result.stdout;
}

function fail(message) {
  throw new Error(message);
}
