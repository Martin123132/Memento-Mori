#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
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

requireFile("site/index.html");

const promoReadme = read("promo/README.md");
const currentVideo = promoReadme.match(/Final vertical demo video:\s*\[([^\]]+)\]\(([^)]+)\)/);
const videoPath = currentVideo?.[2] ?? "";

if (!videoPath) {
  failures.push("promo/README.md should expose the current final vertical demo video.");
}

requireText("site/index.html", /<h1 id="hero-title">Memento Mori Jester<\/h1>/, "the product name as the hero heading");
requireText("site/index.html", /npx -y memento-mori-jester@latest start/, "the current start command");
requireText("site/index.html", /\.\.\/promo\/share-kit\/social-card\.svg/, "the social preview card");
requireText("site/index.html", /\.\.\/docs\/DEMO\.md/, "the demo transcript link");
requireText("site/index.html", /https:\/\/github\.com\/Martin123132\/Memento-Mori/, "the GitHub repository link");
requireText("site/index.html", /https:\/\/github\.com\/Martin123132\/Memento-Mori\/releases\/latest/, "the latest release link");
requireText("site/index.html", /https:\/\/www\.npmjs\.com\/package\/memento-mori-jester/, "the npm package link");
requireText("site/index.html", /Codex, Claude Code, generic MCP clients, hooks, and CI/, "agent compatibility copy");

if (videoPath) {
  requireText("site/index.html", new RegExp(`\\.\\./promo/${videoPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), "the current promo video");
}

if (failures.length > 0) {
  process.stderr.write("Site check failed:\n");
  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write("Site check passed for site/index.html.\n");
