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
  "examples/support/closeout-checklist.md",
  "examples/support/closeout-checklist.json",
  "examples/support/README.md",
  "examples/support/response-snippets.md",
  "examples/support/response-snippets.json",
  "examples/support/support-lifecycle.md",
  "examples/support/support-lifecycle.json",
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
requireText("examples/support/README.md", /support-lifecycle\.md/, "support lifecycle overview link");
requireText("examples/support/README.md", /closeout-checklist\.md/, "support closeout checklist link");
requireText("examples/support/README.md", /triage-playbook\.json/, "maintainer playbook JSON link");
requireText("examples/support/README.md", /response-snippets\.md/, "maintainer response snippets link");
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
requireText("examples/support/closeout-checklist.md", /Support Closeout Checklist/, "closeout checklist heading");
requireText("examples/support/closeout-checklist.md", /closeout-checklist\.json/, "closeout checklist JSON link");
requireText("examples/support/closeout-checklist.md", /docs-example/, "docs closeout outcome");
requireText("examples/support/closeout-checklist.md", /fixture-backlog/, "fixture closeout outcome");
requireText("examples/support/closeout-checklist.md", /rule-review-candidate/, "rule-review closeout outcome");
requireText("examples/support/closeout-checklist.md", /shipped-or-queued/, "docs closeout status");
requireText("examples/support/closeout-checklist.md", /backlog-created/, "fixture closeout status");
requireText("examples/support/closeout-checklist.md", /candidate-opened/, "rule-review closeout status");
requireText("examples/support/closeout-checklist.md", /npm run support:check/, "support checker closeout command");
requireText("examples/support/closeout-checklist.md", /SECURITY\.md/, "closeout security redirect");
requireText("examples/support/closeout-checklist.json", /docs-clarification-closeout/, "docs closeout record");
requireText("examples/support/closeout-checklist.json", /fixture-backlog-closeout/, "fixture closeout record");
requireText("examples/support/closeout-checklist.json", /rule-review-closeout/, "rule-review closeout record");
requireText("examples/support/support-lifecycle.md", /Support Lifecycle Overview/, "support lifecycle heading");
requireText("examples/support/support-lifecycle.md", /support-lifecycle\.json/, "support lifecycle JSON link");
requireText("examples/support/support-lifecycle.md", /report -> triage -> response -> closeout/, "support lifecycle flow");
requireText("examples/support/support-lifecycle.md", /report gallery feedback template/, "report feedback lifecycle link");
requireText("examples/support/support-lifecycle.md", /triage playbook/, "triage lifecycle link");
requireText("examples/support/support-lifecycle.md", /response snippets/, "response lifecycle link");
requireText("examples/support/support-lifecycle.md", /closeout checklist/, "closeout lifecycle link");
requireText("examples/support/support-lifecycle.md", /docs-example/, "docs lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /fixture-backlog/, "fixture lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /rule-review-candidate/, "rule-review lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /doctor --json/, "doctor JSON lifecycle prompt");
requireText("examples/support/support-lifecycle.md", /SECURITY\.md/, "lifecycle security redirect");
requireText("examples/support/support-lifecycle.json", /docs-example-response/, "docs lifecycle response");
requireText("examples/support/support-lifecycle.json", /fixture-backlog-response/, "fixture lifecycle response");
requireText("examples/support/support-lifecycle.json", /rule-review-candidate-response/, "rule-review lifecycle response");
requireText("examples/support/response-snippets.md", /Maintainer Response Snippets/, "response snippets heading");
requireText("examples/support/response-snippets.md", /response-snippets\.json/, "response snippets JSON link");
requireText("examples/support/response-snippets.md", /docs-example/, "docs response outcome");
requireText("examples/support/response-snippets.md", /fixture-backlog/, "fixture backlog response outcome");
requireText("examples/support/response-snippets.md", /rule-review-candidate/, "rule review response outcome");
requireText("examples/support/response-snippets.md", /jester doctor --json/, "doctor JSON response prompt");
requireText("examples/support/response-snippets.md", /jester tune <rule-id> --json/, "tune JSON response prompt");
requireText("examples/support/response-snippets.md", /npm run support:check/, "support checker response command");
requireText("examples/support/response-snippets.json", /docs-example-response/, "docs response snippet");
requireText("examples/support/response-snippets.json", /fixture-backlog-response/, "fixture response snippet");
requireText("examples/support/response-snippets.json", /rule-review-candidate-response/, "rule review response snippet");

requireText("docs/MAINTAINER_TRIAGE.md", /feedback-template\.md/, "feedback template triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /report_gallery_feedback\.yml/, "report gallery issue template triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /examples\/support/, "maintainer playbook triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle\.md/, "support lifecycle triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /closeout-checklist\.md/, "support closeout checklist triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /response-snippets\.md/, "maintainer response snippets triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /docs-example/, "docs example triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /fixture-backlog/, "fixture backlog triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /rule-review-candidate/, "rule review triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /npm(?:\.cmd)? run support:check/, "support checker triage command");
requireText("docs/PRODUCTION_READINESS.md", /support:check/, "support checker readiness");
requireText("README.md", /feedback-template\.md/, "feedback template README link");
requireText("README.md", /support-lifecycle\.md/, "support lifecycle README link");
requireText("README.md", /closeout-checklist\.md/, "support closeout checklist README link");
requireText("README.md", /examples\/support/, "maintainer triage playbook README link");
requireText("README.md", /response-snippets\.md/, "maintainer response snippets README link");
requireText("README.md", /report gallery feedback/i, "report gallery feedback guidance");

requireText("package.json", /"support:check": "node scripts\/check-support-triage\.mjs"/, "support checker script");
requireText("package.json", /npm run support:check/, "support checker in npm test");

checkTriagePlaybook();
checkResponseSnippets();
checkCloseoutChecklist();
checkSupportLifecycle();

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

function checkResponseSnippets() {
  const path = "examples/support/response-snippets.json";
  const snippets = readJson(path);
  if (!snippets) {
    return;
  }

  if (!Array.isArray(snippets) || snippets.length !== 3) {
    failures.push(`${path} should contain exactly three maintainer response snippets.`);
    return;
  }

  const expected = [
    { id: "docs-example-response", outcome: "docs-example", checks: ["npm run reports:check", "npm run support:check"] },
    { id: "fixture-backlog-response", outcome: "fixture-backlog", checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"] },
    { id: "rule-review-candidate-response", outcome: "rule-review-candidate", checks: ["npm run fixtures:report -- --markdown", "npm run support:check"] }
  ];
  const seenIds = new Set();

  for (const [index, snippet] of snippets.entries()) {
    const expectedSnippet = expected[index];
    if (snippet?.id !== expectedSnippet.id) {
      failures.push(`${path} entry ${index + 1} should have id ${expectedSnippet.id}.`);
      continue;
    }

    if (seenIds.has(snippet.id)) {
      failures.push(`${path} has duplicate id ${snippet.id}.`);
    }
    seenIds.add(snippet.id);

    if (snippet.outcome !== expectedSnippet.outcome) {
      failures.push(`${snippet.id}.outcome should be ${expectedSnippet.outcome}.`);
    }

    if (typeof snippet.title !== "string" || snippet.title.length < 10) {
      failures.push(`${snippet.id}.title should be a useful string.`);
    }

    if (typeof snippet.useWhen !== "string" || snippet.useWhen.length < 30) {
      failures.push(`${snippet.id}.useWhen should explain when to use the response.`);
    }

    if (!Array.isArray(snippet.labels) || snippet.labels.length === 0) {
      failures.push(`${snippet.id}.labels should be a non-empty array.`);
    }

    if (!Array.isArray(snippet.body) || snippet.body.length !== 3) {
      failures.push(`${snippet.id}.body should contain exactly three response paragraphs.`);
      continue;
    }

    const bodyText = snippet.body.join("\n");
    if (!bodyText.includes("doctor --json")) {
      failures.push(`${snippet.id}.body should ask for or mention redacted doctor --json diagnostics.`);
    }

    if (!/secret|private|redacted/i.test(bodyText)) {
      failures.push(`${snippet.id}.body should include privacy or redaction guidance.`);
    }

    if (!Array.isArray(snippet.requiredChecks)) {
      failures.push(`${snippet.id}.requiredChecks should be an array.`);
      continue;
    }

    for (const check of expectedSnippet.checks) {
      if (!snippet.requiredChecks.includes(check)) {
        failures.push(`${snippet.id}.requiredChecks should include ${check}.`);
      }
    }
  }
}

function checkCloseoutChecklist() {
  const path = "examples/support/closeout-checklist.json";
  const closeouts = readJson(path);
  if (!closeouts) {
    return;
  }

  if (!Array.isArray(closeouts) || closeouts.length !== 3) {
    failures.push(`${path} should contain exactly three support closeout records.`);
    return;
  }

  const expected = [
    {
      id: "docs-clarification-closeout",
      outcome: "docs-example",
      status: "shipped-or-queued",
      checks: ["npm run reports:check", "npm run support:check"]
    },
    {
      id: "fixture-backlog-closeout",
      outcome: "fixture-backlog",
      status: "backlog-created",
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"]
    },
    {
      id: "rule-review-closeout",
      outcome: "rule-review-candidate",
      status: "candidate-opened",
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"]
    }
  ];
  const seenIds = new Set();

  for (const [index, closeout] of closeouts.entries()) {
    const expectedCloseout = expected[index];
    if (closeout?.id !== expectedCloseout.id) {
      failures.push(`${path} entry ${index + 1} should have id ${expectedCloseout.id}.`);
      continue;
    }

    if (seenIds.has(closeout.id)) {
      failures.push(`${path} has duplicate id ${closeout.id}.`);
    }
    seenIds.add(closeout.id);

    if (closeout.outcome !== expectedCloseout.outcome) {
      failures.push(`${closeout.id}.outcome should be ${expectedCloseout.outcome}.`);
    }

    if (closeout.decisionRecord?.status !== expectedCloseout.status) {
      failures.push(`${closeout.id}.decisionRecord.status should be ${expectedCloseout.status}.`);
    }

    if (typeof closeout.decisionRecord?.publicSummary !== "string" || closeout.decisionRecord.publicSummary.length < 30) {
      failures.push(`${closeout.id}.decisionRecord.publicSummary should be a useful public summary.`);
    }

    if (typeof closeout.decisionRecord?.userReply !== "string" || closeout.decisionRecord.userReply.length < 30) {
      failures.push(`${closeout.id}.decisionRecord.userReply should be a useful closeout reply.`);
    }

    if (typeof closeout.decisionRecord?.followUpLinkPlaceholder !== "string" || !closeout.decisionRecord.followUpLinkPlaceholder.startsWith("<")) {
      failures.push(`${closeout.id}.decisionRecord.followUpLinkPlaceholder should be a placeholder.`);
    }

    if (typeof closeout.decisionRecord?.nextCommand !== "string" || closeout.decisionRecord.nextCommand.length < 8) {
      failures.push(`${closeout.id}.decisionRecord.nextCommand should include a next command.`);
    }

    if (!Array.isArray(closeout.requiredEvidence) || closeout.requiredEvidence.length < 3) {
      failures.push(`${closeout.id}.requiredEvidence should contain at least three evidence checks.`);
    } else {
      const evidenceText = closeout.requiredEvidence.join("\n");
      if (!/secret|private|redacted|public-safe/i.test(evidenceText)) {
        failures.push(`${closeout.id}.requiredEvidence should include privacy or redaction evidence.`);
      }
    }

    if (!Array.isArray(closeout.requiredChecks)) {
      failures.push(`${closeout.id}.requiredChecks should be an array.`);
      continue;
    }

    for (const check of expectedCloseout.checks) {
      if (!closeout.requiredChecks.includes(check)) {
        failures.push(`${closeout.id}.requiredChecks should include ${check}.`);
      }
    }
  }
}

function checkSupportLifecycle() {
  const path = "examples/support/support-lifecycle.json";
  const lifecycle = readJson(path);
  if (!lifecycle) {
    return;
  }

  if (!Array.isArray(lifecycle) || lifecycle.length !== 3) {
    failures.push(`${path} should contain exactly three support lifecycle outcomes.`);
    return;
  }

  const expected = [
    {
      outcome: "docs-example",
      stageReferences: ["report-gallery-feedback", "gallery-expected-block-docs", "docs-example-response", "docs-clarification-closeout"],
      checks: ["npm run reports:check", "npm run support:check"]
    },
    {
      outcome: "fixture-backlog",
      stageReferences: ["false-positive", "false-positive-fixture-backlog", "fixture-backlog-response", "fixture-backlog-closeout"],
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"]
    },
    {
      outcome: "rule-review-candidate",
      stageReferences: ["false-positive", "repeated-risky-domain-rule-review", "rule-review-candidate-response", "rule-review-closeout"],
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"]
    }
  ];
  const expectedStageIds = ["report", "triage", "response", "closeout"];
  const expectedArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json"
  ];
  const seenOutcomes = new Set();

  for (const [index, entry] of lifecycle.entries()) {
    const expectedEntry = expected[index];
    if (entry?.outcome !== expectedEntry.outcome) {
      failures.push(`${path} entry ${index + 1} should have outcome ${expectedEntry.outcome}.`);
      continue;
    }

    if (seenOutcomes.has(entry.outcome)) {
      failures.push(`${path} has duplicate outcome ${entry.outcome}.`);
    }
    seenOutcomes.add(entry.outcome);

    if (typeof entry.title !== "string" || entry.title.length < 20) {
      failures.push(`${entry.outcome}.title should explain the lifecycle outcome.`);
    }

    if (!Array.isArray(entry.stages) || entry.stages.length !== 4) {
      failures.push(`${entry.outcome}.stages should contain report, triage, response, and closeout.`);
      continue;
    }

    for (const [stageIndex, stage] of entry.stages.entries()) {
      if (stage?.id !== expectedStageIds[stageIndex]) {
        failures.push(`${entry.outcome}.stages[${stageIndex}].id should be ${expectedStageIds[stageIndex]}.`);
      }

      if (stage?.artifact !== expectedArtifacts[stageIndex]) {
        failures.push(`${entry.outcome}.stages[${stageIndex}].artifact should be ${expectedArtifacts[stageIndex]}.`);
      }

      if (stage?.reference !== expectedEntry.stageReferences[stageIndex]) {
        failures.push(`${entry.outcome}.stages[${stageIndex}].reference should be ${expectedEntry.stageReferences[stageIndex]}.`);
      }

      if (typeof stage?.purpose !== "string" || stage.purpose.length < 30) {
        failures.push(`${entry.outcome}.stages[${stageIndex}].purpose should explain what the stage records.`);
      }
    }

    if (!Array.isArray(entry.requiredChecks)) {
      failures.push(`${entry.outcome}.requiredChecks should be an array.`);
      continue;
    }

    for (const check of expectedEntry.checks) {
      if (!entry.requiredChecks.includes(check)) {
        failures.push(`${entry.outcome}.requiredChecks should include ${check}.`);
      }
    }
  }
}
