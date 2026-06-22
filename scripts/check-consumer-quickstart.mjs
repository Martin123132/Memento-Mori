#!/usr/bin/env node
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmExecPath = process.env.npm_execpath;
const fixtureDir = join(root, "examples", "consumer-quickstart");
const fixturePackagePath = join(fixtureDir, "package.json");
const fixtureReadmePath = join(fixtureDir, "README.md");
const args = process.argv.slice(2);

process.on("uncaughtException", (error) => {
  console.error("Consumer quickstart check failed:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

let requestedPackageSpec = null;
let keepTemp = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--package" || arg === "--package-spec") {
    requestedPackageSpec = args[index + 1];
    index += 1;
  } else if (arg === "--registry-latest") {
    requestedPackageSpec = "memento-mori-jester@latest";
  } else if (arg === "--keep-temp") {
    keepTemp = true;
  } else {
    fail(`Unknown option: ${arg}`);
  }
}

if (requestedPackageSpec === "") {
  fail("--package requires a non-empty npm package spec.");
}

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

checkFixtureFiles();

const tempRoot = mkdtempSync(join(tmpdir(), "jester-consumer-quickstart-"));
let packageSpec = requestedPackageSpec;
let packageLabel = requestedPackageSpec ?? "local packed package";

try {
  if (!packageSpec) {
    packageSpec = packLocalPackage(tempRoot);
  }

  const consumerDir = join(tempRoot, "consumer-project");
  cpSync(fixtureDir, consumerDir, { recursive: true });
  installPackageSpec(consumerDir, packageSpec);

  const doctor = runNpm(["run", "jester:doctor"], { cwd: consumerDir });
  requireOutput(doctor, /PASS package-version/, "doctor package-version pass");
  requireOutput(doctor, /The fool is fit for court\./, "doctor success footer");

  const summary = runNpm(["run", "jester:summary"], { cwd: consumerDir });
  requireOutput(summary, /Verdict: BLOCK/, "summary block verdict");
  requireOutput(summary, /destructive-git-history/, "destructive git rule hit");

  const tuningCheck = runNpm(["run", "jester:framework-tuning:check"], { cwd: consumerDir });
  requireOutput(tuningCheck, /Framework tuning check passed for 5 recipes\./, "framework tuning cookbook check success");

  const tuningDoctor = runNpm(["run", "jester:framework-tuning:doctor"], { cwd: consumerDir });
  requireOutput(tuningDoctor, /Framework tuning doctor/, "framework tuning doctor heading");
  requireOutput(tuningDoctor, /Checked 5 recipe\(s\), 10 executable tune command\(s\), and 34 fixture rule reference\(s\)\./, "framework tuning doctor totals");

  console.log("Consumer quickstart check");
  console.log(`PASS installed ${packageLabel}`);
  console.log("PASS npm run jester:doctor");
  console.log("PASS npm run jester:summary");
  console.log("PASS npm run jester:framework-tuning:check");
  console.log("PASS npm run jester:framework-tuning:doctor");
} finally {
  if (keepTemp) {
    console.log(`Kept temp project at ${tempRoot}`);
  } else {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function checkFixtureFiles() {
  if (!existsSync(fixturePackagePath)) {
    fail("examples/consumer-quickstart/package.json is missing.");
  }

  if (!existsSync(fixtureReadmePath)) {
    fail("examples/consumer-quickstart/README.md is missing.");
  }

  const fixturePackageRaw = readFileSync(fixturePackagePath, "utf8");
  const fixtureReadme = readFileSync(fixtureReadmePath, "utf8");
  const fixturePackage = JSON.parse(fixturePackageRaw);

  for (const [path, content] of [
    ["examples/consumer-quickstart/package.json", fixturePackageRaw],
    ["examples/consumer-quickstart/README.md", fixtureReadme]
  ]) {
    for (const unsafe of unsafeContentPatterns) {
      if (unsafe.pattern.test(content)) {
        fail(`${path} appears to contain ${unsafe.name}; consumer examples should stay public and redacted.`);
      }
    }
  }

  const expectedScripts = {
    "jester:doctor": "jester doctor",
    "jester:summary": "jester summary --kind command \"git reset --hard\"",
    "jester:framework-tuning:check": "npm run framework:tuning:check --prefix node_modules/memento-mori-jester",
    "jester:framework-tuning:doctor": "npm run framework:tuning:doctor --prefix node_modules/memento-mori-jester"
  };

  if (fixturePackage.private !== true) {
    fail("examples/consumer-quickstart/package.json should stay private.");
  }

  for (const [scriptName, scriptCommand] of Object.entries(expectedScripts)) {
    if (fixturePackage.scripts?.[scriptName] !== scriptCommand) {
      fail(`examples/consumer-quickstart/package.json script ${scriptName} should be "${scriptCommand}".`);
    }
  }

  for (const expected of [
    "npm install --save-dev memento-mori-jester",
    "npm run jester:doctor",
    "npm run jester:summary",
    "npm run jester:framework-tuning:check",
    "npm run jester:framework-tuning:doctor",
    "examples/ci/adoption-smoke.yml",
    "npm run consumer:quickstart:check"
  ]) {
    if (!fixtureReadme.includes(expected)) {
      fail(`examples/consumer-quickstart/README.md should include ${expected}.`);
    }
  }
}

function packLocalPackage(destination) {
  const cliPath = join(root, "dist", "cli.js");
  if (!existsSync(cliPath)) {
    fail(`${cliPath} is missing. Run npm run build before npm run consumer:quickstart:check.`);
  }

  const output = runNpm(["pack", "--ignore-scripts", "--pack-destination", destination, "--silent"], { cwd: root });
  const filename = output.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!filename) {
    fail("npm pack did not return a tarball filename.");
  }

  return isAbsolute(filename) ? filename : resolve(destination, filename);
}

function installPackageSpec(consumerDir, spec) {
  const packagePath = join(consumerDir, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  delete packageJson.devDependencies;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  runNpm(["install", "--save-dev", spec, "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: consumerDir });
}

function runNpm(commandArgs, options = {}) {
  if (npmExecPath) {
    return run(process.execPath, [npmExecPath, ...commandArgs], options);
  }

  return run(npmCommand, commandArgs, options);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
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

function requireOutput(output, pattern, description) {
  if (!pattern.test(output)) {
    fail(`Expected ${description}. Output was:\n${output}`);
  }
}

function fail(message) {
  throw new Error(message);
}
