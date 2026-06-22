#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmExecPath = process.env.npm_execpath;
const galleryPath = join(root, "examples", "reports", "report-gallery.json");
const readmePath = join(root, "examples", "reports", "README.md");
const args = process.argv.slice(2);

process.on("uncaughtException", (error) => {
  console.error("Report gallery check failed:");
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

const gallery = readGallery();
checkReadme(gallery);

const tempRoot = mkdtempSync(join(tmpdir(), "jester-report-gallery-"));
let packageSpec = requestedPackageSpec;
const packageLabel = requestedPackageSpec ?? "local packed package";

try {
  if (!packageSpec) {
    packageSpec = packLocalPackage(tempRoot);
  }
} catch (error) {
  rmSync(tempRoot, { recursive: true, force: true });
  throw error;
}

try {
  const consumerDir = join(tempRoot, "consumer-project");
  prepareConsumerProject(consumerDir, packageSpec);

  const results = [];
  for (const report of gallery) {
    const output = runNpm(["exec", "--", "jester", ...report.args], { cwd: consumerDir });
    for (const expected of report.expected.includes) {
      if (!output.includes(expected)) {
        fail(`${report.id} output should include ${expected}. Output was:\n${output}`);
      }
    }
    results.push(report.id);
  }

  console.log("Report gallery check");
  console.log(`PASS installed ${packageLabel}`);
  for (const id of results) {
    console.log(`PASS ${id}`);
  }
} finally {
  if (keepTemp) {
    console.log(`Kept temp project at ${tempRoot}`);
  } else {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function readGallery() {
  if (!existsSync(galleryPath)) {
    fail("examples/reports/report-gallery.json is missing.");
  }

  if (!existsSync(readmePath)) {
    fail("examples/reports/README.md is missing.");
  }

  const galleryRaw = readFileSync(galleryPath, "utf8");
  const readme = readFileSync(readmePath, "utf8");

  for (const [path, content] of [
    ["examples/reports/report-gallery.json", galleryRaw],
    ["examples/reports/README.md", readme]
  ]) {
    for (const unsafe of unsafeContentPatterns) {
      if (unsafe.pattern.test(content)) {
        fail(`${path} appears to contain ${unsafe.name}; report examples should stay public and redacted.`);
      }
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(galleryRaw);
  } catch (error) {
    fail(`examples/reports/report-gallery.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!Array.isArray(parsed) || parsed.length !== 3) {
    fail("examples/reports/report-gallery.json should contain exactly three report examples.");
  }

  const expectedIds = ["fresh-install-doctor", "destructive-command-summary", "blocked-command-review"];
  const seenIds = new Set();

  for (const [index, report] of parsed.entries()) {
    const expectedId = expectedIds[index];
    if (report?.id !== expectedId) {
      fail(`Report ${index + 1} should have id ${expectedId}.`);
    }

    if (seenIds.has(report.id)) {
      fail(`Duplicate report id: ${report.id}.`);
    }
    seenIds.add(report.id);

    for (const field of ["title", "scenario", "command"]) {
      if (typeof report[field] !== "string" || report[field].trim().length < 10) {
        fail(`${report.id}.${field} should be a useful string.`);
      }
    }

    if (!Array.isArray(report.args) || report.args.length === 0 || report.args.some((arg) => typeof arg !== "string")) {
      fail(`${report.id}.args should be a non-empty string array.`);
    }

    if (!Array.isArray(report.expected?.includes) || report.expected.includes.length < 3) {
      fail(`${report.id}.expected.includes should contain at least three stable output fragments.`);
    }
  }

  return parsed;
}

function checkReadme(gallery) {
  const readme = readFileSync(readmePath, "utf8");

  for (const report of gallery) {
    for (const expected of [report.id, report.command]) {
      if (!readme.includes(expected)) {
        fail(`examples/reports/README.md should include ${expected}.`);
      }
    }
  }

  for (const expected of [
    "npm run reports:check",
    "memento-mori-jester@latest",
    "SECURITY.md"
  ]) {
    if (!readme.includes(expected)) {
      fail(`examples/reports/README.md should include ${expected}.`);
    }
  }
}

function packLocalPackage(destination) {
  const cliPath = join(root, "dist", "cli.js");
  if (!existsSync(cliPath)) {
    fail(`${cliPath} is missing. Run npm run build before npm run reports:check.`);
  }

  const output = runNpm(["pack", "--ignore-scripts", "--pack-destination", destination, "--silent"], { cwd: root });
  const filename = output.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!filename) {
    fail("npm pack did not return a tarball filename.");
  }

  return isAbsolute(filename) ? filename : resolve(destination, filename);
}

function prepareConsumerProject(consumerDir, spec) {
  rmSync(consumerDir, { recursive: true, force: true });
  mkdirSync(consumerDir, { recursive: true });
  writeFileSync(
    join(consumerDir, "package.json"),
    `${JSON.stringify({ name: "jester-report-gallery-consumer", version: "0.0.0", private: true }, null, 2)}\n`
  );
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

function fail(message) {
  throw new Error(message);
}
