#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const args = new Set(process.argv.slice(2));
const requirePackageVersion = args.has("--require-package-version");

for (const arg of args) {
  if (arg !== "--require-package-version") {
    failures.push(`Unknown option: ${arg}`);
  }
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requireFile(path, description, minBytes = 1) {
  const fullPath = join(root, path);
  if (!existsSync(fullPath)) {
    failures.push(`${description} is missing: ${path}`);
    return;
  }
  const size = statSync(fullPath).size;
  if (size < minBytes) {
    failures.push(`${description} looks too small: ${path} (${size} bytes).`);
  }
}

function requireText(path, pattern, description) {
  const content = read(path);
  if (!pattern.test(content)) {
    failures.push(`${path} should include ${description}.`);
  }
}

function failJson(path, error) {
  failures.push(`${path} could not be parsed: ${error instanceof Error ? error.message : String(error)}.`);
}

function loadRiskyDomainEvidence() {
  const cliPath = join(root, "dist", "cli.js");
  if (!existsSync(cliPath)) {
    failures.push("dist/cli.js is missing; run `npm run build` before `npm run promo:check`.");
    return null;
  }

  const result = spawnSync(
    process.execPath,
    [cliPath, "tune", "risky-domain", "--json", "--no-config"],
    { cwd: root, encoding: "utf8" }
  );

  if (result.status !== 0) {
    failures.push(`Could not load risky-domain fixture evidence: ${result.stderr || result.stdout}`.trim());
    return null;
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return parsed.fixtureEvidence ?? null;
  } catch (error) {
    failures.push(`Could not parse risky-domain fixture evidence JSON: ${error instanceof Error ? error.message : String(error)}.`);
    return null;
  }
}

let packageJson;
try {
  packageJson = readJson("package.json");
} catch (error) {
  failJson("package.json", error);
  packageJson = {};
}

let fixtures;
try {
  fixtures = readJson("examples/fixtures/preset-review-cases.json");
} catch (error) {
  failJson("examples/fixtures/preset-review-cases.json", error);
  fixtures = [];
}

const promoReadmePath = "promo/README.md";
const promoReadme = read(promoReadmePath);
const currentVideo = promoReadme.match(/Final vertical demo video:\s*\[([^\]]+)\]\(([^)]+)\)/);

if (!currentVideo) {
  failures.push(`${promoReadmePath} should link the final vertical demo video.`);
}

const linkedLabel = currentVideo?.[1] ?? "";
const linkedTarget = currentVideo?.[2] ?? "";
if (linkedLabel && linkedTarget && linkedLabel !== linkedTarget) {
  failures.push(`${promoReadmePath} video link label and target should match.`);
}

const videoMatch = linkedTarget.match(/^x-demo-v(\d+\.\d+\.\d+)\/renders\/memento-mori-jester-x-demo-v\1\.mp4$/);
if (!videoMatch) {
  failures.push(`${promoReadmePath} video should point at x-demo-vX.Y.Z/renders/memento-mori-jester-x-demo-vX.Y.Z.mp4.`);
}

const promoVersion = videoMatch?.[1] ?? "unknown";
const demoId = `x-demo-v${promoVersion}`;
const demoDir = `promo/${demoId}`;
const demoVideoPath = linkedTarget ? `promo/${linkedTarget}` : "";
const fixtureTotal = Array.isArray(fixtures) ? fixtures.length : 0;
const riskyEvidence = loadRiskyDomainEvidence();

if (requirePackageVersion && packageJson.version !== promoVersion) {
  failures.push(`Current promo version v${promoVersion} should match package.json ${packageJson.version} when --require-package-version is used.`);
}

if (promoVersion !== "unknown") {
  requireFile(`${demoDir}/index.html`, "current promo demo HTML");
  requireFile(`${demoDir}/README.md`, "current promo demo README");
  requireFile(`${demoDir}/package.json`, "current promo demo package.json");
  requireFile(`${demoDir}/package-lock.json`, "current promo demo package-lock.json");
  requireFile(`${demoDir}/meta.json`, "current promo demo metadata");
  requireFile(demoVideoPath, "current promo demo video", 100_000);

  for (const still of ["01-opener.jpg", "02-command-block.jpg", "03-tuning-evidence.jpg", "04-try-it.jpg"]) {
    requireFile(`promo/share-kit/stills/${still}`, `share-kit still ${still}`, 50_000);
  }

  try {
    const demoPackage = readJson(`${demoDir}/package.json`);
    if (demoPackage.name !== demoId) {
      failures.push(`${demoDir}/package.json name should be ${demoId}.`);
    }
  } catch (error) {
    failJson(`${demoDir}/package.json`, error);
  }

  try {
    const demoLock = readJson(`${demoDir}/package-lock.json`);
    if (demoLock.name !== demoId || demoLock.packages?.[""]?.name !== demoId) {
      failures.push(`${demoDir}/package-lock.json root name should be ${demoId}.`);
    }
  } catch (error) {
    failJson(`${demoDir}/package-lock.json`, error);
  }

  try {
    const demoMeta = readJson(`${demoDir}/meta.json`);
    if (demoMeta.id !== demoId || demoMeta.name !== demoId) {
      failures.push(`${demoDir}/meta.json id and name should be ${demoId}.`);
    }
  } catch (error) {
    failJson(`${demoDir}/meta.json`, error);
  }

  const escapedVersion = escapeRegExp(promoVersion);
  requireText(`${demoDir}/README.md`, new RegExp(`# Memento Mori Jester X Demo v${escapedVersion}`), `demo title v${promoVersion}`);
  requireText(`${demoDir}/README.md`, new RegExp(`renders/memento-mori-jester-x-demo-v${escapedVersion}\\.mp4`), "current render path");
  requireText(`${demoDir}/index.html`, new RegExp(`<span>v${escapedVersion}</span>`), `visible version v${promoVersion}`);
  requireText(`${demoDir}/index.html`, new RegExp(`PASS package-version: ${escapedVersion}`), `doctor package version ${promoVersion}`);
  requireText(`${demoDir}/index.html`, new RegExp(`<strong>${fixtureTotal}</strong>\\s*<span>fixtures checked</span>`), `${fixtureTotal} fixture count`);
  requireText("promo/share-kit/README.md", new RegExp(escapeRegExp(`../${linkedTarget}`)), "current promo video path");

  if (riskyEvidence) {
    requireText(
      `${demoDir}/index.html`,
      new RegExp(`<strong>${riskyEvidence.matchCount}</strong>\\s*<span>risky-domain matches</span>`),
      `${riskyEvidence.matchCount} risky-domain match count`
    );
    requireText(
      `${demoDir}/index.html`,
      new RegExp(`<strong>${riskyEvidence.quietPassCount}</strong>\\s*<span>quiet-pass examples</span>`),
      `${riskyEvidence.quietPassCount} quiet-pass count`
    );
    requireText("docs/DEMO.md", new RegExp(`Total fixtures checked: ${riskyEvidence.totalFixtures}`), "current tune fixture total");
    requireText("docs/DEMO.md", new RegExp(`Matching fixtures: ${riskyEvidence.matchCount}`), "current tune match count");
    requireText("docs/DEMO.md", new RegExp(`Quiet-pass fixtures: ${riskyEvidence.quietPassCount}`), "current tune quiet-pass count");
  }
}

if (failures.length > 0) {
  process.stderr.write("Promo freshness check failed:\n");
  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(
  `Promo freshness check passed for ${demoId}: ${fixtureTotal} fixtures, ` +
    `${riskyEvidence?.matchCount ?? "unknown"} risky-domain matches, ` +
    `${riskyEvidence?.quietPassCount ?? "unknown"} quiet-pass examples.\n`
);
