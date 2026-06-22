#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const failures = [];

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

const supportFiles = [
  ".github/ISSUE_TEMPLATE/report_gallery_feedback.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/false_positive.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  "examples/reports/feedback-template.md",
  "examples/reports/README.md",
  "examples/support/README.md",
  "examples/support/triage-playbook.json",
  "docs/MAINTAINER_TRIAGE.md",
  "docs/PRODUCTION_READINESS.md",
  "README.md",
  "SECURITY.md"
];

for (const path of supportFiles) {
  requireFile(path);
}

for (const path of supportFiles.filter((path) => existsSync(join(root, path)))) {
  const content = read(path);
  for (const unsafe of unsafeContentPatterns) {
    if (unsafe.pattern.test(content)) {
      failures.push(`${path} appears to contain ${unsafe.name}; support examples must stay public-safe and redacted.`);
    }
  }
}

requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /Report gallery feedback/, "a report gallery feedback template name");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /fresh-install-doctor/, "the fresh install report option");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /destructive-command-summary/, "the destructive summary report option");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /blocked-command-review/, "the blocked command report option");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /doctor --json/, "doctor JSON diagnostics");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /summary --kind command "git reset --hard"/, "the report-gallery summary smoke");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /Sanitized command summary/, "sanitized command prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /Sanitized output summary/, "sanitized output prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /SECURITY\.md/, "security redirect");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /removed secrets, tokens, private code, private paths, customer data, and full CI logs/, "privacy checkbox");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /Jester version/, "false-positive version prompt");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /doctor --json/, "false-positive doctor diagnostics");

requireText("examples/reports/feedback-template.md", /Report Gallery Feedback Template/, "feedback template heading");
requireText("examples/reports/feedback-template.md", /fresh-install-doctor/, "fresh install report id");
requireText("examples/reports/feedback-template.md", /destructive-command-summary/, "destructive summary report id");
requireText("examples/reports/feedback-template.md", /blocked-command-review/, "blocked command report id");
requireText("examples/reports/feedback-template.md", /doctor --json/, "doctor JSON command");
requireText("examples/reports/feedback-template.md", /summary --kind command "git reset --hard"/, "summary command");
requireText("examples/reports/feedback-template.md", /tune <rule-id> --json/, "tune JSON command");
requireText("examples/reports/feedback-template.md", /Privacy Checklist/, "privacy checklist");
requireText("examples/reports/feedback-template.md", /SECURITY\.md/, "security redirect");
requireText("examples/reports/feedback-template.md", /npm run support:check/, "support checker command");

requireText("examples/reports/README.md", /feedback-template\.md/, "feedback template link");
requireText("examples/reports/README.md", /report_gallery_feedback\.yml/, "GitHub issue template link");
requireText("examples/reports/README.md", /npm run support:check/, "support checker command");
requireText("examples/reports/README.md", /examples\/support|Maintainer Triage Playbook/i, "maintainer triage playbook link");

requireText("examples/support/README.md", /Maintainer Triage Playbook/, "maintainer playbook heading");
requireText("examples/support/README.md", /triage-playbook\.json/, "maintainer playbook JSON link");
requireText("examples/support/README.md", /gallery-expected-block-docs/, "docs example playbook case");
requireText("examples/support/README.md", /false-positive-fixture-backlog/, "fixture backlog playbook case");
requireText("examples/support/README.md", /repeated-risky-domain-rule-review/, "rule review playbook case");
requireText("examples/support/README.md", /doctor --json/, "doctor JSON playbook prompt");
requireText("examples/support/README.md", /tune <rule-id> --json/, "tune JSON playbook prompt");
requireText("examples/support/README.md", /docs-example/, "docs outcome");
requireText("examples/support/README.md", /fixture-backlog/, "fixture backlog outcome");
requireText("examples/support/README.md", /rule-review-candidate/, "rule review outcome");
requireText("examples/support/README.md", /SECURITY\.md/, "security redirect");
requireText("examples/support/README.md", /npm run support:check/, "support checker command");

requireText("docs/MAINTAINER_TRIAGE.md", /feedback-template\.md/, "feedback template triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /report_gallery_feedback\.yml/, "report gallery issue template triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /examples\/support/, "maintainer playbook triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /docs-example/, "docs example triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /fixture-backlog/, "fixture backlog triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /rule-review-candidate/, "rule review triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /npm(?:\.cmd)? run support:check/, "support checker triage command");
requireText("docs/PRODUCTION_READINESS.md", /support:check/, "support checker readiness");
requireText("README.md", /feedback-template\.md/, "feedback template README link");
requireText("README.md", /examples\/support/, "maintainer triage playbook README link");
requireText("README.md", /report gallery feedback/i, "report gallery feedback guidance");

requireText("package.json", /"support:check": "node scripts\/check-support-triage\.mjs"/, "support checker script");
requireText("package.json", /npm run support:check/, "support checker in npm test");

checkTriagePlaybook();

if (failures.length > 0) {
  console.error("Support triage check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Support triage check passed.");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    failures.push(`${path} should be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function requireFile(path) {
  if (!existsSync(join(root, path))) {
    failures.push(`${path} is missing.`);
  }
}

function requireText(path, pattern, description) {
  if (!existsSync(join(root, path))) {
    failures.push(`${path} is missing; cannot check for ${description}.`);
    return;
  }

  const content = read(path);
  if (!pattern.test(content)) {
    failures.push(`${path} should include ${description}.`);
  }
}

function checkTriagePlaybook() {
  const path = "examples/support/triage-playbook.json";
  const playbook = readJson(path);
  if (!playbook) {
    return;
  }

  if (!Array.isArray(playbook) || playbook.length !== 3) {
    failures.push(`${path} should contain exactly three maintainer triage examples.`);
    return;
  }

  const expectedIds = [
    "gallery-expected-block-docs",
    "false-positive-fixture-backlog",
    "repeated-risky-domain-rule-review"
  ];
  const expectedOutcomes = ["docs-example", "fixture-backlog", "rule-review-candidate"];
  const expectedSources = ["report-gallery-feedback", "false-positive"];
  const seenIds = new Set();

  for (const [index, entry] of playbook.entries()) {
    const expectedId = expectedIds[index];
    if (entry?.id !== expectedId) {
      failures.push(`${path} entry ${index + 1} should have id ${expectedId}.`);
      continue;
    }

    if (seenIds.has(entry.id)) {
      failures.push(`${path} has duplicate id ${entry.id}.`);
    }
    seenIds.add(entry.id);

    if (!expectedSources.includes(entry.source)) {
      failures.push(`${entry.id}.source should be one of ${expectedSources.join(", ")}.`);
    }

    if (typeof entry.nearestReportExample !== "string" || entry.nearestReportExample.length < 4) {
      failures.push(`${entry.id}.nearestReportExample should be a useful string.`);
    }

    if (typeof entry.sanitizedReport?.version !== "string") {
      failures.push(`${entry.id}.sanitizedReport.version should be present.`);
    }

    if (!["command", "plan", "diff", "final"].includes(entry.sanitizedReport?.kind)) {
      failures.push(`${entry.id}.sanitizedReport.kind should be a review kind.`);
    }

    if (typeof entry.sanitizedReport?.command !== "string" || !entry.sanitizedReport.command.includes("jester")) {
      failures.push(`${entry.id}.sanitizedReport.command should include a jester command.`);
    }

    if (!Array.isArray(entry.sanitizedReport?.observed) || entry.sanitizedReport.observed.length < 2) {
      failures.push(`${entry.id}.sanitizedReport.observed should include stable output fragments.`);
    }

    if (typeof entry.sanitizedReport?.question !== "string" || entry.sanitizedReport.question.length < 20) {
      failures.push(`${entry.id}.sanitizedReport.question should explain the adopter surprise.`);
    }

    if (typeof entry.firstResponse !== "string" || !entry.firstResponse.includes("doctor --json")) {
      failures.push(`${entry.id}.firstResponse should ask for or mention redacted doctor --json diagnostics.`);
    }

    if (!Array.isArray(entry.classification?.labels) || entry.classification.labels.length === 0) {
      failures.push(`${entry.id}.classification.labels should be a non-empty array.`);
    }

    if (typeof entry.classification?.decision !== "string" || entry.classification.decision.length < 8) {
      failures.push(`${entry.id}.classification.decision should be present.`);
    }

    if (!Array.isArray(entry.maintainerChecks) || !entry.maintainerChecks.includes("npm run support:check")) {
      failures.push(`${entry.id}.maintainerChecks should include npm run support:check.`);
    }

    if (entry.followUpOutcome?.type !== expectedOutcomes[index]) {
      failures.push(`${entry.id}.followUpOutcome.type should be ${expectedOutcomes[index]}.`);
    }

    if (typeof entry.followUpOutcome?.action !== "string" || entry.followUpOutcome.action.length < 30) {
      failures.push(`${entry.id}.followUpOutcome.action should describe the maintainer action.`);
    }
  }
}
