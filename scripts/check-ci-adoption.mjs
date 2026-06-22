#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const workflowPath = "examples/ci/adoption-smoke.yml";
const workflow = read(workflowPath);
const examplesReadme = read("examples/ci/README.md");
const githubActionsDocs = read("docs/GITHUB_ACTIONS.md");
const readme = read("README.md");

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

function requireText(path, content, pattern, description) {
  if (!pattern.test(content)) {
    failures.push(`${path} should include ${description}.`);
  }
}

function forbidText(path, content, pattern, description) {
  if (pattern.test(content)) {
    failures.push(`${path} should not include ${description}.`);
  }
}

for (const [path, content] of [
  [workflowPath, workflow],
  ["examples/ci/README.md", examplesReadme],
  ["docs/GITHUB_ACTIONS.md", githubActionsDocs],
  ["README.md", readme]
]) {
  for (const unsafe of unsafeContentPatterns) {
    if (unsafe.pattern.test(content)) {
      failures.push(`${path} appears to contain ${unsafe.name}; adoption examples should stay public and redacted.`);
    }
  }
}

requireText(workflowPath, workflow, /^name: Memento Mori Jester Adoption Smoke/m, "the adoption smoke workflow name");
requireText(workflowPath, workflow, /^\s*pull_request:/m, "a pull_request trigger");
requireText(workflowPath, workflow, /^\s*workflow_dispatch:/m, "a manual trigger");
requireText(workflowPath, workflow, /^permissions:\s*\n\s*contents: read/m, "read-only contents permission");
requireText(workflowPath, workflow, /actions\/checkout@v6/, "checkout@v6");
requireText(workflowPath, workflow, /actions\/setup-node@v6/, "setup-node@v6");
requireText(workflowPath, workflow, /node-version:\s*24/, "Node 24");
requireText(workflowPath, workflow, /npx -y memento-mori-jester@latest doctor/, "the doctor command");
requireText(workflowPath, workflow, /npx -y memento-mori-jester@latest summary --kind command "git reset --hard"/, "the command summary smoke");
requireText(workflowPath, workflow, /npm pack memento-mori-jester@latest --pack-destination "\$workdir" --silent/, "the registry package smoke");
requireText(workflowPath, workflow, /npm run framework:tuning:check --prefix "\$workdir\/package"/, "the framework tuning check command");
requireText(workflowPath, workflow, /npm run framework:tuning:doctor --prefix "\$workdir\/package"/, "the framework tuning doctor command");
requireText(workflowPath, workflow, /trap 'rm -rf "\$workdir"' EXIT/, "temporary package cleanup");
forbidText(workflowPath, workflow, /pull_request_target/, "pull_request_target");
forbidText(workflowPath, workflow, /security-events:\s*write|contents:\s*write|pull-requests:\s*write|id-token:\s*write/, "write permissions");
forbidText(workflowPath, workflow, /npm publish|gh release|git push/, "release or publish commands");

for (const [path, content] of [
  ["examples/ci/README.md", examplesReadme],
  ["docs/GITHUB_ACTIONS.md", githubActionsDocs],
  ["README.md", readme]
]) {
  requireText(path, content, /adoption-smoke\.yml/, "the adoption smoke workflow link");
  requireText(path, content, /doctor/, "doctor adoption guidance");
  requireText(path, content, /summary --kind command "git reset --hard"/, "summary smoke guidance");
  requireText(path, content, /framework:tuning:doctor/, "framework tuning doctor guidance");
}

if (failures.length > 0) {
  console.error("CI adoption example check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("CI adoption example check passed for examples/ci/adoption-smoke.yml.");
