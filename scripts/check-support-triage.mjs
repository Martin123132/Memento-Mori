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
  "examples/support/backlog-review.md",
  "examples/support/backlog-review.json",
  "examples/support/backlog-records.md",
  "examples/support/backlog-records.json",
  "examples/support/closeout-checklist.md",
  "examples/support/closeout-checklist.json",
  "examples/support/outcome-prioritization.md",
  "examples/support/outcome-prioritization.json",
  "examples/support/README.md",
  "examples/support/response-snippets.md",
  "examples/support/response-snippets.json",
  "examples/support/support-examples-index.md",
  "examples/support/support-examples-index.json",
  "examples/support/support-lifecycle-map.md",
  "examples/support/support-lifecycle-map.json",
  "examples/support/support-lifecycle-worksheet.md",
  "examples/support/support-lifecycle-worksheet.json",
  "examples/support/support-lifecycle-filled-example.md",
  "examples/support/support-lifecycle-filled-example.json",
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
requireText("examples/support/README.md", /backlog-review\.md/, "support backlog review link");
requireText("examples/support/README.md", /backlog-records\.md/, "support backlog records link");
requireText("examples/support/README.md", /support-examples-index\.md/, "support examples index link");
requireText("examples/support/README.md", /support-examples-index\.json/, "support examples index JSON link");
requireText("examples/support/README.md", /support-lifecycle-map\.md/, "support lifecycle map link");
requireText("examples/support/README.md", /support-lifecycle-worksheet\.md/, "support lifecycle worksheet link");
requireText("examples/support/README.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example link");
requireText("examples/support/README.md", /support-lifecycle\.md/, "support lifecycle overview link");
requireText("examples/support/README.md", /support-lifecycle-map\.json/, "support lifecycle map JSON link");
requireText("examples/support/README.md", /support-lifecycle-worksheet\.json/, "support lifecycle worksheet JSON link");
requireText("examples/support/README.md", /support-lifecycle-filled-example\.json/, "filled lifecycle worksheet example JSON link");
requireText("examples/support/README.md", /outcome-prioritization\.md/, "support outcome prioritization link");
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
requireText("examples/support/support-examples-index.md", /Support Examples Index/, "support examples index heading");
requireText("examples/support/support-examples-index.md", /support-examples-index\.json/, "support examples index JSON link");
requireText("examples/support/support-examples-index.md", /support-lifecycle-map\.md/, "support examples index map link");
requireText("examples/support/support-examples-index.md", /support-lifecycle-worksheet\.md/, "support examples index worksheet link");
requireText("examples/support/support-examples-index.md", /support-lifecycle-filled-example\.md/, "support examples index filled example link");
requireText("examples/support/support-examples-index.md", /Quick Maintainer Path/, "support examples index quick path");
requireText("examples/support/support-examples-index.md", /report/, "support examples index report stage");
requireText("examples/support/support-examples-index.md", /backlog-review/, "support examples index backlog review stage");
requireText("examples/support/support-examples-index.md", /synthetic-report-gallery-docs-example/, "support examples index synthetic marker");
requireText("examples/support/support-examples-index.md", /SECURITY\.md/, "support examples index security redirect");
requireText("examples/support/support-examples-index.md", /npm run support:check/, "support examples index support check");
requireText("examples/support/support-examples-index.json", /Support Examples Index/, "support examples index JSON title");
requireText("examples/support/support-examples-index.json", /support-lifecycle-map\.md/, "support examples index JSON map link");
requireText("examples/support/support-examples-index.json", /support-lifecycle-worksheet\.md/, "support examples index JSON worksheet link");
requireText("examples/support/support-examples-index.json", /support-lifecycle-filled-example\.md/, "support examples index JSON filled example link");
requireText("examples/support/support-examples-index.json", /synthetic-report-gallery-docs-example/, "support examples index JSON synthetic marker");
requireText("examples/support/support-lifecycle-map.md", /Support Lifecycle Map/, "support lifecycle map heading");
requireText("examples/support/support-lifecycle-map.md", /support-lifecycle-map\.json/, "support lifecycle map JSON link");
requireText("examples/support/support-lifecycle-map.md", /support-examples-index\.md/, "support examples index link");
requireText("examples/support/support-lifecycle-map.md", /support-lifecycle-worksheet\.md/, "support lifecycle worksheet link");
requireText("examples/support/support-lifecycle-map.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example link");
requireText("examples/support/support-lifecycle-map.md", /report\s*\n\s*-> triage\s*\n\s*-> response\s*\n\s*-> closeout\s*\n\s*-> prioritization\s*\n\s*-> backlog-record\s*\n\s*-> backlog-review/, "support lifecycle compact flow");
requireText("examples/support/support-lifecycle-map.md", /Maintainer question/, "support lifecycle map scan questions");
requireText("examples/support/support-lifecycle-map.md", /docs-clarification-backlog-record/, "docs backlog map record");
requireText("examples/support/support-lifecycle-map.md", /fixture-backlog-record/, "fixture backlog map record");
requireText("examples/support/support-lifecycle-map.md", /rule-review-candidate-backlog-record/, "rule-review backlog map record");
requireText("examples/support/support-lifecycle-map.md", /closed-no-action/, "closed no-action map review");
requireText("examples/support/support-lifecycle-map.md", /SECURITY\.md/, "map security redirect");
requireText("examples/support/support-lifecycle-map.md", /npm run support:check/, "support checker map command");
requireText("examples/support/support-lifecycle-map.json", /Support Lifecycle Map/, "support lifecycle map JSON title");
requireText("examples/support/support-lifecycle-map.json", /backlog-record/, "support lifecycle map backlog-record stage");
requireText("examples/support/support-lifecycle-map.json", /backlog-review/, "support lifecycle map backlog-review stage");
requireText("examples/support/support-lifecycle-map.json", /closed-no-action/, "support lifecycle map closed no-action fallback");
requireText("examples/support/support-lifecycle-worksheet.md", /Support Lifecycle Worksheet/, "support lifecycle worksheet heading");
requireText("examples/support/support-lifecycle-worksheet.md", /support-lifecycle-worksheet\.json/, "support lifecycle worksheet JSON link");
requireText("examples/support/support-lifecycle-worksheet.md", /support-examples-index\.md/, "support examples index link");
requireText("examples/support/support-lifecycle-worksheet.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example link");
requireText("examples/support/support-lifecycle-worksheet.md", /support lifecycle map/, "support lifecycle worksheet map link");
requireText("examples/support/support-lifecycle-worksheet.md", /## Report/, "worksheet report stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Triage/, "worksheet triage stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Response/, "worksheet response stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Closeout/, "worksheet closeout stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Prioritization/, "worksheet prioritization stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Backlog Record/, "worksheet backlog record stage");
requireText("examples/support/support-lifecycle-worksheet.md", /## Backlog Review/, "worksheet backlog review stage");
requireText("examples/support/support-lifecycle-worksheet.md", /Record:/, "worksheet record fields");
requireText("examples/support/support-lifecycle-worksheet.md", /Stop and route through|Stop if/, "worksheet stop conditions");
requireText("examples/support/support-lifecycle-worksheet.md", /SECURITY\.md/, "worksheet security redirect");
requireText("examples/support/support-lifecycle-worksheet.md", /npm run support:check/, "support checker worksheet command");
requireText("examples/support/support-lifecycle-worksheet.json", /Support Lifecycle Worksheet/, "support lifecycle worksheet JSON title");
requireText("examples/support/support-lifecycle-worksheet.json", /support-lifecycle-map\.json/, "worksheet source map");
requireText("examples/support/support-lifecycle-worksheet.json", /docs-example/, "worksheet docs outcome");
requireText("examples/support/support-lifecycle-worksheet.json", /closed-no-action/, "worksheet closed no-action outcome");
requireText("examples/support/support-lifecycle-filled-example.md", /Filled Support Lifecycle Worksheet Example/, "filled lifecycle worksheet heading");
requireText("examples/support/support-lifecycle-filled-example.md", /support-lifecycle-filled-example\.json/, "filled lifecycle worksheet JSON link");
requireText("examples/support/support-lifecycle-filled-example.md", /support-lifecycle-worksheet\.md/, "source worksheet link");
requireText("examples/support/support-lifecycle-filled-example.md", /synthetic-report-gallery-docs-example/, "synthetic filled worksheet case id");
requireText("examples/support/support-lifecycle-filled-example.md", /## Report/, "filled worksheet report stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Triage/, "filled worksheet triage stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Response/, "filled worksheet response stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Closeout/, "filled worksheet closeout stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Prioritization/, "filled worksheet prioritization stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Backlog Record/, "filled worksheet backlog record stage");
requireText("examples/support/support-lifecycle-filled-example.md", /## Backlog Review/, "filled worksheet backlog review stage");
requireText("examples/support/support-lifecycle-filled-example.md", /docs-clarification-backlog-record/, "filled worksheet docs backlog record");
requireText("examples/support/support-lifecycle-filled-example.md", /remains-docs-clarification/, "filled worksheet docs review decision");
requireText("examples/support/support-lifecycle-filled-example.md", /npm run support:check/, "filled worksheet support check");
requireText("examples/support/support-lifecycle-filled-example.md", /SECURITY\.md/, "filled worksheet security redirect");
requireText("examples/support/support-lifecycle-filled-example.json", /Filled Support Lifecycle Worksheet Example/, "filled lifecycle worksheet JSON title");
requireText("examples/support/support-lifecycle-filled-example.json", /support-lifecycle-worksheet\.json/, "filled worksheet source worksheet");
requireText("examples/support/support-lifecycle-filled-example.json", /synthetic-report-gallery-docs-example/, "filled worksheet synthetic case id");
requireText("examples/support/support-lifecycle-filled-example.json", /docs-example/, "filled worksheet docs outcome");
requireText("examples/support/support-lifecycle-filled-example.json", /remains-docs-clarification/, "filled worksheet review decision");
requireText("examples/support/support-lifecycle.md", /Support Lifecycle Overview/, "support lifecycle heading");
requireText("examples/support/support-lifecycle.md", /support-examples-index\.md/, "support examples index link");
requireText("examples/support/support-lifecycle.md", /support-examples-index\.json/, "support examples index JSON link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle-map\.md/, "support lifecycle map link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle-worksheet\.md/, "support lifecycle worksheet link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle-worksheet\.json/, "support lifecycle worksheet JSON link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle-filled-example\.json/, "filled lifecycle worksheet example JSON link");
requireText("examples/support/support-lifecycle.md", /support-lifecycle\.json/, "support lifecycle JSON link");
requireText("examples/support/support-lifecycle.md", /report -> triage -> response -> closeout -> prioritization -> backlog-record -> backlog-review/, "support lifecycle flow");
requireText("examples/support/support-lifecycle.md", /report gallery feedback template/, "report feedback lifecycle link");
requireText("examples/support/support-lifecycle.md", /triage playbook/, "triage lifecycle link");
requireText("examples/support/support-lifecycle.md", /response snippets/, "response lifecycle link");
requireText("examples/support/support-lifecycle.md", /closeout checklist/, "closeout lifecycle link");
requireText("examples/support/support-lifecycle.md", /outcome prioritization guide/, "prioritization lifecycle link");
requireText("examples/support/support-lifecycle.md", /backlog records/, "backlog records lifecycle link");
requireText("examples/support/support-lifecycle.md", /backlog review checklist/, "backlog review lifecycle link");
requireText("examples/support/support-lifecycle.md", /docs-example/, "docs lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /fixture-backlog/, "fixture lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /rule-review-candidate/, "rule-review lifecycle outcome");
requireText("examples/support/support-lifecycle.md", /closed-no-action/, "closed no-action lifecycle review");
requireText("examples/support/support-lifecycle.md", /doctor --json/, "doctor JSON lifecycle prompt");
requireText("examples/support/support-lifecycle.md", /SECURITY\.md/, "lifecycle security redirect");
requireText("examples/support/support-lifecycle.json", /docs-example-response/, "docs lifecycle response");
requireText("examples/support/support-lifecycle.json", /fixture-backlog-response/, "fixture lifecycle response");
requireText("examples/support/support-lifecycle.json", /rule-review-candidate-response/, "rule-review lifecycle response");
requireText("examples/support/support-lifecycle.json", /outcome-prioritization\.json/, "lifecycle prioritization artifact");
requireText("examples/support/support-lifecycle.json", /backlog-records\.json/, "lifecycle backlog records artifact");
requireText("examples/support/support-lifecycle.json", /backlog-review\.json/, "lifecycle backlog review artifact");
requireText("examples/support/outcome-prioritization.md", /Support Outcome Prioritization/, "support outcome prioritization heading");
requireText("examples/support/outcome-prioritization.md", /outcome-prioritization\.json/, "support prioritization JSON link");
requireText("examples/support/outcome-prioritization.md", /support lifecycle overview/, "support lifecycle prioritization link");
requireText("examples/support/outcome-prioritization.md", /docs-example/, "docs prioritization outcome");
requireText("examples/support/outcome-prioritization.md", /fixture-backlog/, "fixture prioritization outcome");
requireText("examples/support/outcome-prioritization.md", /rule-review-candidate/, "rule-review prioritization outcome");
requireText("examples/support/outcome-prioritization.md", /jester tune <rule-id> --json/, "tune JSON prioritization evidence");
requireText("examples/support/outcome-prioritization.md", /at least two sanitized reports/, "rule-review evidence threshold");
requireText("examples/support/outcome-prioritization.md", /SECURITY\.md/, "prioritization security redirect");
requireText("examples/support/outcome-prioritization.json", /docs-clarification-closeout/, "docs prioritization closeout");
requireText("examples/support/outcome-prioritization.json", /fixture-backlog-closeout/, "fixture prioritization closeout");
requireText("examples/support/outcome-prioritization.json", /rule-review-closeout/, "rule-review prioritization closeout");
requireText("examples/support/backlog-records.md", /Support Backlog Records/, "support backlog records heading");
requireText("examples/support/backlog-records.md", /backlog-records\.json/, "support backlog records JSON link");
requireText("examples/support/backlog-records.md", /support lifecycle overview/, "support lifecycle backlog link");
requireText("examples/support/backlog-records.md", /outcome prioritization guide/, "support prioritization backlog link");
requireText("examples/support/backlog-records.md", /closeout checklist/, "support closeout backlog link");
requireText("examples/support/backlog-records.md", /docs-clarification-backlog-record/, "docs backlog record");
requireText("examples/support/backlog-records.md", /fixture-backlog-record/, "fixture backlog record");
requireText("examples/support/backlog-records.md", /rule-review-candidate-backlog-record/, "rule-review backlog record");
requireText("examples/support/backlog-records.md", /docs-example/, "docs backlog outcome");
requireText("examples/support/backlog-records.md", /fixture-backlog/, "fixture backlog outcome");
requireText("examples/support/backlog-records.md", /rule-review-candidate/, "rule-review backlog outcome");
requireText("examples/support/backlog-records.md", /jester tune <rule-id> --json/, "tune JSON backlog evidence");
requireText("examples/support/backlog-records.md", /SECURITY\.md/, "backlog security redirect");
requireText("examples/support/backlog-records.md", /npm run support:check/, "support checker backlog command");
requireText("examples/support/backlog-records.json", /docs-clarification-backlog-record/, "docs backlog record JSON");
requireText("examples/support/backlog-records.json", /fixture-backlog-record/, "fixture backlog record JSON");
requireText("examples/support/backlog-records.json", /rule-review-candidate-backlog-record/, "rule-review backlog record JSON");
requireText("examples/support/backlog-review.md", /Support Backlog Review/, "support backlog review heading");
requireText("examples/support/backlog-review.md", /backlog-review\.json/, "support backlog review JSON link");
requireText("examples/support/backlog-review.md", /backlog-records\.md/, "support backlog records review link");
requireText("examples/support/backlog-review.md", /outcome-prioritization\.md/, "support prioritization review link");
requireText("examples/support/backlog-review.md", /support lifecycle overview/, "support lifecycle review link");
requireText("examples/support/backlog-review.md", /remains-docs-clarification/, "docs clarification review decision");
requireText("examples/support/backlog-review.md", /remains-fixture-backlog/, "fixture backlog review decision");
requireText("examples/support/backlog-review.md", /remains-rule-review-candidate/, "rule-review review decision");
requireText("examples/support/backlog-review.md", /closed-no-action/, "closed no-action review decision");
requireText("examples/support/backlog-review.md", /jester tune <rule-id> --json|fixture evidence|quiet-pass fixture/, "review fixture evidence guidance");
requireText("examples/support/backlog-review.md", /SECURITY\.md/, "review security redirect");
requireText("examples/support/backlog-review.md", /npm run support:check/, "support checker review command");
requireText("examples/support/backlog-review.json", /docs-clarification-review/, "docs review record JSON");
requireText("examples/support/backlog-review.json", /fixture-backlog-review/, "fixture review record JSON");
requireText("examples/support/backlog-review.json", /rule-review-candidate-review/, "rule-review review record JSON");
requireText("examples/support/backlog-review.json", /closed-no-action-review/, "closed no-action review record JSON");
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
requireText("docs/MAINTAINER_TRIAGE.md", /support-examples-index\.md/, "support examples index triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle-map\.md/, "support lifecycle map triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle-worksheet\.md/, "support lifecycle worksheet triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle\.md/, "support lifecycle triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /outcome-prioritization\.md/, "support prioritization triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /backlog-review\.md/, "support backlog review triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /backlog-records\.md/, "support backlog records triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /closeout-checklist\.md/, "support closeout checklist triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /response-snippets\.md/, "maintainer response snippets triage link");
requireText("docs/MAINTAINER_TRIAGE.md", /docs-example/, "docs example triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /fixture-backlog/, "fixture backlog triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /rule-review-candidate/, "rule review triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /npm(?:\.cmd)? run support:check/, "support checker triage command");
requireText("docs/PRODUCTION_READINESS.md", /support:check/, "support checker readiness");
requireText("README.md", /feedback-template\.md/, "feedback template README link");
requireText("README.md", /support-examples-index\.md/, "support examples index README link");
requireText("README.md", /support-lifecycle-map\.md/, "support lifecycle map README link");
requireText("README.md", /support-lifecycle-worksheet\.md/, "support lifecycle worksheet README link");
requireText("README.md", /support-lifecycle-filled-example\.md/, "filled lifecycle worksheet example README link");
requireText("README.md", /support-lifecycle\.md/, "support lifecycle README link");
requireText("README.md", /outcome-prioritization\.md/, "support prioritization README link");
requireText("README.md", /backlog-review\.md/, "support backlog review README link");
requireText("README.md", /backlog-records\.md/, "support backlog records README link");
requireText("README.md", /closeout-checklist\.md/, "support closeout checklist README link");
requireText("README.md", /examples\/support/, "maintainer triage playbook README link");
requireText("README.md", /response-snippets\.md/, "maintainer response snippets README link");
requireText("README.md", /report gallery feedback/i, "report gallery feedback guidance");

requireText("package.json", /"support:check": "node scripts\/check-support-triage\.mjs"/, "support checker script");
requireText("package.json", /npm run support:check/, "support checker in npm test");

checkTriagePlaybook();
checkResponseSnippets();
checkCloseoutChecklist();
checkSupportExamplesIndex();
checkSupportLifecycleWorksheet();
checkSupportLifecycleFilledExample();
checkSupportLifecycleMap();
checkSupportLifecycle();
checkOutcomePrioritization();
checkBacklogRecords();
checkBacklogReview();

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
      stageReferences: [
        "report-gallery-feedback",
        "gallery-expected-block-docs",
        "docs-example-response",
        "docs-clarification-closeout",
        "docs-example",
        "docs-clarification-backlog-record",
        "docs-clarification-review"
      ],
      checks: ["npm run reports:check", "npm run support:check"]
    },
    {
      outcome: "fixture-backlog",
      stageReferences: [
        "false-positive",
        "false-positive-fixture-backlog",
        "fixture-backlog-response",
        "fixture-backlog-closeout",
        "fixture-backlog",
        "fixture-backlog-record",
        "fixture-backlog-review"
      ],
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"]
    },
    {
      outcome: "rule-review-candidate",
      stageReferences: [
        "false-positive",
        "repeated-risky-domain-rule-review",
        "rule-review-candidate-response",
        "rule-review-closeout",
        "rule-review-candidate",
        "rule-review-candidate-backlog-record",
        "rule-review-candidate-review"
      ],
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"]
    }
  ];
  const expectedStageIds = ["report", "triage", "response", "closeout", "prioritization", "backlog-record", "backlog-review"];
  const expectedArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json",
    "examples/support/outcome-prioritization.json",
    "examples/support/backlog-records.json",
    "examples/support/backlog-review.json"
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

    if (!Array.isArray(entry.stages) || entry.stages.length !== 7) {
      failures.push(`${entry.outcome}.stages should contain report, triage, response, closeout, prioritization, backlog-record, and backlog-review.`);
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

function checkSupportLifecycleMap() {
  const path = "examples/support/support-lifecycle-map.json";
  const map = readJson(path);
  if (!map) {
    return;
  }

  const expectedStageIds = ["report", "triage", "response", "closeout", "prioritization", "backlog-record", "backlog-review"];
  const expectedArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json",
    "examples/support/outcome-prioritization.json",
    "examples/support/backlog-records.json",
    "examples/support/backlog-review.json"
  ];
  const expectedOutcomes = [
    {
      outcome: "docs-example",
      backlogRecord: "docs-clarification-backlog-record",
      reviewDecision: "remains-docs-clarification"
    },
    {
      outcome: "fixture-backlog",
      backlogRecord: "fixture-backlog-record",
      reviewDecision: "remains-fixture-backlog"
    },
    {
      outcome: "rule-review-candidate",
      backlogRecord: "rule-review-candidate-backlog-record",
      reviewDecision: "remains-rule-review-candidate"
    }
  ];

  if (map.title !== "Support Lifecycle Map") {
    failures.push(`${path}.title should be Support Lifecycle Map.`);
  }

  if (!Array.isArray(map.flow) || map.flow.join("|") !== expectedStageIds.join("|")) {
    failures.push(`${path}.flow should contain the compact support lifecycle order.`);
  }

  if (!Array.isArray(map.stages) || map.stages.length !== expectedStageIds.length) {
    failures.push(`${path}.stages should contain seven lifecycle stages.`);
  } else {
    for (const [index, stage] of map.stages.entries()) {
      if (stage?.id !== expectedStageIds[index]) {
        failures.push(`${path}.stages[${index}].id should be ${expectedStageIds[index]}.`);
      }

      if (stage?.artifact !== expectedArtifacts[index]) {
        failures.push(`${path}.stages[${index}].artifact should be ${expectedArtifacts[index]}.`);
      }

      if (typeof stage?.question !== "string" || stage.question.length < 40) {
        failures.push(`${path}.stages[${index}].question should be a useful maintainer scan question.`);
      }
    }
  }

  if (!Array.isArray(map.outcomes) || map.outcomes.length !== expectedOutcomes.length) {
    failures.push(`${path}.outcomes should contain three lifecycle outcome summaries.`);
  } else {
    for (const [index, outcome] of map.outcomes.entries()) {
      const expectedOutcome = expectedOutcomes[index];
      if (outcome?.outcome !== expectedOutcome.outcome) {
        failures.push(`${path}.outcomes[${index}].outcome should be ${expectedOutcome.outcome}.`);
      }

      if (outcome?.backlogRecord !== expectedOutcome.backlogRecord) {
        failures.push(`${path}.outcomes[${index}].backlogRecord should be ${expectedOutcome.backlogRecord}.`);
      }

      if (outcome?.reviewDecision !== expectedOutcome.reviewDecision) {
        failures.push(`${path}.outcomes[${index}].reviewDecision should be ${expectedOutcome.reviewDecision}.`);
      }

      if (outcome?.fallbackReviewDecision !== "closed-no-action") {
        failures.push(`${path}.outcomes[${index}].fallbackReviewDecision should be closed-no-action.`);
      }
    }
  }

  if (typeof map.privacyGuardrail !== "string" || !/SECURITY\.md|secrets|private|customer data/i.test(map.privacyGuardrail)) {
    failures.push(`${path}.privacyGuardrail should include public-safe support routing guidance.`);
  }

  const requiredChecks = ["npm run support:check", "npm run production:check"];
  if (!Array.isArray(map.requiredChecks)) {
    failures.push(`${path}.requiredChecks should be an array.`);
  } else {
    for (const check of requiredChecks) {
      if (!map.requiredChecks.includes(check)) {
        failures.push(`${path}.requiredChecks should include ${check}.`);
      }
    }
  }
}

function checkSupportLifecycleWorksheet() {
  const path = "examples/support/support-lifecycle-worksheet.json";
  const worksheet = readJson(path);
  if (!worksheet) {
    return;
  }

  const expectedStageIds = ["report", "triage", "response", "closeout", "prioritization", "backlog-record", "backlog-review"];
  const expectedArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json",
    "examples/support/outcome-prioritization.json",
    "examples/support/backlog-records.json",
    "examples/support/backlog-review.json"
  ];
  const expectedOutcomes = ["docs-example", "fixture-backlog", "rule-review-candidate", "closed-no-action"];

  if (worksheet.title !== "Support Lifecycle Worksheet") {
    failures.push(`${path}.title should be Support Lifecycle Worksheet.`);
  }

  if (worksheet.sourceMap !== "examples/support/support-lifecycle-map.json") {
    failures.push(`${path}.sourceMap should point at examples/support/support-lifecycle-map.json.`);
  }

  if (!Array.isArray(worksheet.flow) || worksheet.flow.join("|") !== expectedStageIds.join("|")) {
    failures.push(`${path}.flow should contain the support lifecycle order.`);
  }

  if (!Array.isArray(worksheet.stages) || worksheet.stages.length !== expectedStageIds.length) {
    failures.push(`${path}.stages should contain seven lifecycle checklist stages.`);
  } else {
    for (const [index, stage] of worksheet.stages.entries()) {
      if (stage?.id !== expectedStageIds[index]) {
        failures.push(`${path}.stages[${index}].id should be ${expectedStageIds[index]}.`);
      }

      if (stage?.artifact !== expectedArtifacts[index]) {
        failures.push(`${path}.stages[${index}].artifact should be ${expectedArtifacts[index]}.`);
      }

      if (!Array.isArray(stage?.checklist) || stage.checklist.length !== 3) {
        failures.push(`${path}.stages[${index}].checklist should contain exactly three checklist items.`);
      } else {
        for (const [itemIndex, item] of stage.checklist.entries()) {
          if (typeof item !== "string" || item.length < 35) {
            failures.push(`${path}.stages[${index}].checklist[${itemIndex}] should be a useful maintainer check.`);
          }
        }
      }

      if (!Array.isArray(stage?.record) || stage.record.length < 3) {
        failures.push(`${path}.stages[${index}].record should name at least three fields to record.`);
      }

      if (typeof stage?.stopIf !== "string" || !/private|secret|SECURITY\.md|sensitive|exploit/i.test(stage.stopIf)) {
        failures.push(`${path}.stages[${index}].stopIf should include public-safe stop guidance.`);
      }
    }
  }

  if (!Array.isArray(worksheet.outcomes) || worksheet.outcomes.join("|") !== expectedOutcomes.join("|")) {
    failures.push(`${path}.outcomes should include docs-example, fixture-backlog, rule-review-candidate, and closed-no-action.`);
  }

  if (typeof worksheet.privacyGuardrail !== "string" || !/secrets|private|customer data|SECURITY\.md|exploitable/i.test(worksheet.privacyGuardrail)) {
    failures.push(`${path}.privacyGuardrail should include public-safe support guidance.`);
  }

  const requiredChecks = ["npm run support:check", "npm run production:check"];
  if (!Array.isArray(worksheet.requiredChecks)) {
    failures.push(`${path}.requiredChecks should be an array.`);
  } else {
    for (const check of requiredChecks) {
      if (!worksheet.requiredChecks.includes(check)) {
        failures.push(`${path}.requiredChecks should include ${check}.`);
      }
    }
  }
}

function checkSupportExamplesIndex() {
  const path = "examples/support/support-examples-index.json";
  const index = readJson(path);
  if (!index) {
    return;
  }

  const expectedArtifacts = [
    {
      id: "lifecycle-map",
      file: "examples/support/support-lifecycle-map.md",
      source: "examples/support/support-lifecycle-map.json",
      synthetic: false,
      markers: ["report -> triage -> response -> closeout -> prioritization -> backlog-record -> backlog-review", "SECURITY.md", "npm run support:check"]
    },
    {
      id: "blank-worksheet",
      file: "examples/support/support-lifecycle-worksheet.md",
      source: "examples/support/support-lifecycle-worksheet.json",
      synthetic: false,
      markers: ["stage checklist", "record fields", "stop conditions", "SECURITY.md", "npm run support:check"]
    },
    {
      id: "filled-synthetic-example",
      file: "examples/support/support-lifecycle-filled-example.md",
      source: "examples/support/support-lifecycle-filled-example.json",
      synthetic: true,
      markers: ["synthetic-report-gallery-docs-example", "placeholder links", "privacy review notes", "SECURITY.md", "npm run support:check"]
    }
  ];
  const expectedStageIds = ["report", "triage", "response", "closeout", "prioritization", "backlog-record", "backlog-review"];
  const expectedStageArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json",
    "examples/support/outcome-prioritization.json",
    "examples/support/backlog-records.json",
    "examples/support/backlog-review.json"
  ];

  if (index.title !== "Support Examples Index") {
    failures.push(`${path}.title should be Support Examples Index.`);
  }

  if (!Array.isArray(index.artifacts) || index.artifacts.length !== expectedArtifacts.length) {
    failures.push(`${path}.artifacts should contain exactly three indexed support artifacts.`);
  } else {
    for (const [indexPosition, artifact] of index.artifacts.entries()) {
      const expected = expectedArtifacts[indexPosition];
      if (artifact?.id !== expected.id) {
        failures.push(`${path}.artifacts[${indexPosition}].id should be ${expected.id}.`);
      }

      if (artifact?.file !== expected.file) {
        failures.push(`${path}.artifacts[${indexPosition}].file should be ${expected.file}.`);
      }

      if (artifact?.source !== expected.source) {
        failures.push(`${path}.artifacts[${indexPosition}].source should be ${expected.source}.`);
      }

      if (artifact?.publicSafe !== true) {
        failures.push(`${path}.artifacts[${indexPosition}].publicSafe should be true.`);
      }

      if (artifact?.synthetic !== expected.synthetic) {
        failures.push(`${path}.artifacts[${indexPosition}].synthetic should be ${expected.synthetic}.`);
      }

      if (typeof artifact?.useWhen !== "string" || artifact.useWhen.length < 60) {
        failures.push(`${path}.artifacts[${indexPosition}].useWhen should explain when maintainers use this artifact.`);
      }

      if (!Array.isArray(artifact?.requiredMarkers)) {
        failures.push(`${path}.artifacts[${indexPosition}].requiredMarkers should be an array.`);
      } else {
        const markerText = artifact.requiredMarkers.join("\n");
        for (const marker of expected.markers) {
          if (!markerText.includes(marker)) {
            failures.push(`${path}.artifacts[${indexPosition}].requiredMarkers should include ${marker}.`);
          }
        }
      }
    }
  }

  if (!Array.isArray(index.quickPath) || index.quickPath.length !== expectedStageIds.length) {
    failures.push(`${path}.quickPath should contain seven lifecycle stages.`);
  } else {
    for (const [stageIndex, stage] of index.quickPath.entries()) {
      if (stage?.stage !== expectedStageIds[stageIndex]) {
        failures.push(`${path}.quickPath[${stageIndex}].stage should be ${expectedStageIds[stageIndex]}.`);
      }

      if (stage?.artifact !== expectedStageArtifacts[stageIndex]) {
        failures.push(`${path}.quickPath[${stageIndex}].artifact should be ${expectedStageArtifacts[stageIndex]}.`);
      }

      if (typeof stage?.maintainerQuestion !== "string" || stage.maintainerQuestion.length < 35) {
        failures.push(`${path}.quickPath[${stageIndex}].maintainerQuestion should be useful.`);
      }

      if (!Array.isArray(stage?.record) || stage.record.length < 3) {
        failures.push(`${path}.quickPath[${stageIndex}].record should include at least three fields.`);
      }
    }
  }

  if (!Array.isArray(index.requiredPublicSafeMarkers) || index.requiredPublicSafeMarkers.length < 4) {
    failures.push(`${path}.requiredPublicSafeMarkers should include at least four public-safe markers.`);
  } else {
    const markerText = index.requiredPublicSafeMarkers.join("\n");
    for (const marker of ["synthetic", "placeholder", "SECURITY.md", "no secrets"]) {
      if (!markerText.includes(marker)) {
        failures.push(`${path}.requiredPublicSafeMarkers should include ${marker}.`);
      }
    }
  }

  const requiredChecks = ["npm run support:check", "npm run production:check"];
  if (!Array.isArray(index.requiredChecks)) {
    failures.push(`${path}.requiredChecks should be an array.`);
  } else {
    for (const check of requiredChecks) {
      if (!index.requiredChecks.includes(check)) {
        failures.push(`${path}.requiredChecks should include ${check}.`);
      }
    }
  }

  if (typeof index.privacyGuardrail !== "string" || !/synthetic|placeholder|secrets|private|SECURITY\.md|exploitable/i.test(index.privacyGuardrail)) {
    failures.push(`${path}.privacyGuardrail should include public-safe support guidance.`);
  }
}

function checkSupportLifecycleFilledExample() {
  const path = "examples/support/support-lifecycle-filled-example.json";
  const example = readJson(path);
  if (!example) {
    return;
  }

  const expectedStageIds = ["report", "triage", "response", "closeout", "prioritization", "backlog-record", "backlog-review"];
  const expectedArtifacts = [
    "examples/reports/feedback-template.md",
    "examples/support/triage-playbook.json",
    "examples/support/response-snippets.json",
    "examples/support/closeout-checklist.json",
    "examples/support/outcome-prioritization.json",
    "examples/support/backlog-records.json",
    "examples/support/backlog-review.json"
  ];
  const requiredChecks = ["npm run reports:check", "npm run support:check", "npm run production:check"];

  if (example.title !== "Filled Support Lifecycle Worksheet Example") {
    failures.push(`${path}.title should be Filled Support Lifecycle Worksheet Example.`);
  }

  if (example.sourceWorksheet !== "examples/support/support-lifecycle-worksheet.json") {
    failures.push(`${path}.sourceWorksheet should point at examples/support/support-lifecycle-worksheet.json.`);
  }

  if (example.synthetic !== true) {
    failures.push(`${path}.synthetic should be true.`);
  }

  if (example.caseId !== "synthetic-report-gallery-docs-example") {
    failures.push(`${path}.caseId should be synthetic-report-gallery-docs-example.`);
  }

  if (example.outcome !== "docs-example") {
    failures.push(`${path}.outcome should be docs-example.`);
  }

  if (!Array.isArray(example.flow) || example.flow.join("|") !== expectedStageIds.join("|")) {
    failures.push(`${path}.flow should contain the support lifecycle order.`);
  }

  if (!Array.isArray(example.stages) || example.stages.length !== expectedStageIds.length) {
    failures.push(`${path}.stages should contain seven completed lifecycle stages.`);
  } else {
    for (const [index, stage] of example.stages.entries()) {
      if (stage?.id !== expectedStageIds[index]) {
        failures.push(`${path}.stages[${index}].id should be ${expectedStageIds[index]}.`);
      }

      if (stage?.artifact !== expectedArtifacts[index]) {
        failures.push(`${path}.stages[${index}].artifact should be ${expectedArtifacts[index]}.`);
      }

      if (!stage?.fields || typeof stage.fields !== "object" || Array.isArray(stage.fields) || Object.keys(stage.fields).length < 3) {
        failures.push(`${path}.stages[${index}].fields should record at least three completed fields.`);
      }

      if (!Array.isArray(stage?.checks) || stage.checks.length !== 3) {
        failures.push(`${path}.stages[${index}].checks should contain exactly three completed checks.`);
      } else {
        for (const [itemIndex, item] of stage.checks.entries()) {
          if (typeof item !== "string" || item.length < 35) {
            failures.push(`${path}.stages[${index}].checks[${itemIndex}] should be a useful completed check.`);
          }
        }
      }

      if (!Array.isArray(stage?.privacyReview) || stage.privacyReview.length !== 3) {
        failures.push(`${path}.stages[${index}].privacyReview should contain exactly three privacy review notes.`);
      } else {
        const privacyText = stage.privacyReview.join("\n");
        if (!/synthetic|placeholder|redacted|private|secret|SECURITY\.md|public/i.test(privacyText)) {
          failures.push(`${path}.stages[${index}].privacyReview should include public-safe or security routing guidance.`);
        }
      }
    }
  }

  if (!Array.isArray(example.requiredChecks)) {
    failures.push(`${path}.requiredChecks should be an array.`);
  } else {
    for (const check of requiredChecks) {
      if (!example.requiredChecks.includes(check)) {
        failures.push(`${path}.requiredChecks should include ${check}.`);
      }
    }
  }

  if (typeof example.privacyGuardrail !== "string" || !/synthetic|secrets|private|customer data|SECURITY\.md|exploitable/i.test(example.privacyGuardrail)) {
    failures.push(`${path}.privacyGuardrail should include synthetic, public-safe support guidance.`);
  }
}

function checkOutcomePrioritization() {
  const path = "examples/support/outcome-prioritization.json";
  const priorities = readJson(path);
  if (!priorities) {
    return;
  }

  if (!Array.isArray(priorities) || priorities.length !== 3) {
    failures.push(`${path} should contain exactly three support outcome priorities.`);
    return;
  }

  const expected = [
    {
      outcome: "docs-example",
      priority: "low",
      nextArtifact: "docs-clarification-closeout",
      checks: ["npm run reports:check", "npm run support:check"],
      evidence: ["Nearest checked report", "Observed output", "No rule behavior change"]
    },
    {
      outcome: "fixture-backlog",
      priority: "medium",
      nextArtifact: "fixture-backlog-closeout",
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"],
      evidence: ["Smallest sanitized", "jester tune <rule-id> --json", "existing pass or quiet-pass fixture"]
    },
    {
      outcome: "rule-review-candidate",
      priority: "high",
      nextArtifact: "rule-review-closeout",
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"],
      evidence: ["At least two sanitized", "fixture report evidence", "single fixture backlog item is not enough"]
    }
  ];
  const seenOutcomes = new Set();

  for (const [index, entry] of priorities.entries()) {
    const expectedEntry = expected[index];
    if (entry?.outcome !== expectedEntry.outcome) {
      failures.push(`${path} entry ${index + 1} should have outcome ${expectedEntry.outcome}.`);
      continue;
    }

    if (seenOutcomes.has(entry.outcome)) {
      failures.push(`${path} has duplicate outcome ${entry.outcome}.`);
    }
    seenOutcomes.add(entry.outcome);

    if (entry.priority !== expectedEntry.priority) {
      failures.push(`${entry.outcome}.priority should be ${expectedEntry.priority}.`);
    }

    if (typeof entry.title !== "string" || entry.title.length < 20) {
      failures.push(`${entry.outcome}.title should explain the prioritization decision.`);
    }

    if (typeof entry.useWhen !== "string" || entry.useWhen.length < 60) {
      failures.push(`${entry.outcome}.useWhen should explain when to choose this outcome.`);
    }

    if (typeof entry.backlogDestination !== "string" || entry.backlogDestination.length < 15) {
      failures.push(`${entry.outcome}.backlogDestination should describe the follow-up destination.`);
    }

    if (entry.nextArtifact !== expectedEntry.nextArtifact) {
      failures.push(`${entry.outcome}.nextArtifact should be ${expectedEntry.nextArtifact}.`);
    }

    if (!Array.isArray(entry.minimumEvidence) || entry.minimumEvidence.length !== 3) {
      failures.push(`${entry.outcome}.minimumEvidence should contain exactly three evidence thresholds.`);
    } else {
      const evidenceText = entry.minimumEvidence.join("\n");
      for (const expectedEvidence of expectedEntry.evidence) {
        if (!evidenceText.includes(expectedEvidence)) {
          failures.push(`${entry.outcome}.minimumEvidence should include ${expectedEvidence}.`);
        }
      }
    }

    if (!Array.isArray(entry.notEnoughEvidence) || entry.notEnoughEvidence.length !== 3) {
      failures.push(`${entry.outcome}.notEnoughEvidence should contain exactly three guardrails.`);
    } else {
      const notEnoughText = entry.notEnoughEvidence.join("\n");
      if (!/private|secret|SECURITY\.md|reproduction|rule/i.test(notEnoughText)) {
        failures.push(`${entry.outcome}.notEnoughEvidence should include privacy, reproduction, or rule-change guardrails.`);
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

function checkBacklogRecords() {
  const path = "examples/support/backlog-records.json";
  const records = readJson(path);
  if (!records) {
    return;
  }

  if (!Array.isArray(records) || records.length !== 3) {
    failures.push(`${path} should contain exactly three support backlog records.`);
    return;
  }

  const expected = [
    {
      id: "docs-clarification-backlog-record",
      outcome: "docs-example",
      priority: "low",
      sourceCloseout: "docs-clarification-closeout",
      backlogType: "docs clarification",
      checks: ["npm run reports:check", "npm run support:check"],
      evidence: ["Nearest checked report", "Observed output", "No rule behavior change"]
    },
    {
      id: "fixture-backlog-record",
      outcome: "fixture-backlog",
      priority: "medium",
      sourceCloseout: "fixture-backlog-closeout",
      backlogType: "pass or quiet-pass fixture",
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"],
      evidence: ["Smallest sanitized", "jester tune <rule-id> --json", "existing pass or quiet-pass fixture"]
    },
    {
      id: "rule-review-candidate-backlog-record",
      outcome: "rule-review-candidate",
      priority: "high",
      sourceCloseout: "rule-review-closeout",
      backlogType: "rule-review candidate",
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"],
      evidence: ["At least two sanitized", "fixture report evidence", "single fixture backlog item is not enough"]
    }
  ];
  const seenIds = new Set();

  for (const [index, record] of records.entries()) {
    const expectedRecord = expected[index];
    if (record?.id !== expectedRecord.id) {
      failures.push(`${path} entry ${index + 1} should have id ${expectedRecord.id}.`);
      continue;
    }

    if (seenIds.has(record.id)) {
      failures.push(`${path} has duplicate id ${record.id}.`);
    }
    seenIds.add(record.id);

    if (record.outcome !== expectedRecord.outcome) {
      failures.push(`${record.id}.outcome should be ${expectedRecord.outcome}.`);
    }

    if (record.priority !== expectedRecord.priority) {
      failures.push(`${record.id}.priority should be ${expectedRecord.priority}.`);
    }

    if (record.sourceCloseout !== expectedRecord.sourceCloseout) {
      failures.push(`${record.id}.sourceCloseout should be ${expectedRecord.sourceCloseout}.`);
    }

    if (record.prioritizationSource !== "outcome-prioritization.json") {
      failures.push(`${record.id}.prioritizationSource should be outcome-prioritization.json.`);
    }

    if (record.backlogType !== expectedRecord.backlogType) {
      failures.push(`${record.id}.backlogType should be ${expectedRecord.backlogType}.`);
    }

    if (typeof record.publicTitle !== "string" || record.publicTitle.length < 20) {
      failures.push(`${record.id}.publicTitle should be a useful public title.`);
    }

    if (typeof record.publicSummary !== "string" || record.publicSummary.length < 50) {
      failures.push(`${record.id}.publicSummary should be a useful public summary.`);
    }

    if (typeof record.nextAction !== "string" || record.nextAction.length < 40) {
      failures.push(`${record.id}.nextAction should describe the backlog action.`);
    }

    if (!Array.isArray(record.evidence) || record.evidence.length !== 3) {
      failures.push(`${record.id}.evidence should contain exactly three evidence items.`);
    } else {
      const evidenceText = record.evidence.join("\n");
      for (const expectedEvidence of expectedRecord.evidence) {
        if (!evidenceText.includes(expectedEvidence)) {
          failures.push(`${record.id}.evidence should include ${expectedEvidence}.`);
        }
      }
    }

    if (!Array.isArray(record.privacyReview) || record.privacyReview.length !== 3) {
      failures.push(`${record.id}.privacyReview should contain exactly three privacy checks.`);
    } else {
      const privacyText = record.privacyReview.join("\n");
      if (!/secret|private|SECURITY\.md|redacted|placeholder/i.test(privacyText)) {
        failures.push(`${record.id}.privacyReview should include privacy and security routing guidance.`);
      }
    }

    if (!Array.isArray(record.requiredChecks)) {
      failures.push(`${record.id}.requiredChecks should be an array.`);
      continue;
    }

    for (const check of expectedRecord.checks) {
      if (!record.requiredChecks.includes(check)) {
        failures.push(`${record.id}.requiredChecks should include ${check}.`);
      }
    }
  }
}

function checkBacklogReview() {
  const path = "examples/support/backlog-review.json";
  const reviews = readJson(path);
  if (!reviews) {
    return;
  }

  if (!Array.isArray(reviews) || reviews.length !== 4) {
    failures.push(`${path} should contain exactly four support backlog review decisions.`);
    return;
  }

  const expected = [
    {
      id: "docs-clarification-review",
      sourceRecord: "docs-clarification-backlog-record",
      reviewDecision: "remains-docs-clarification",
      outcome: "docs-example",
      checks: ["npm run reports:check", "npm run support:check"],
      criteria: ["nearest checked report", "Observed output", "No rule behavior change"]
    },
    {
      id: "fixture-backlog-review",
      sourceRecord: "fixture-backlog-record",
      reviewDecision: "remains-fixture-backlog",
      outcome: "fixture-backlog",
      checks: ["npm run fixtures:check", "npm run fixtures:report", "npm run support:check"],
      criteria: ["smallest sanitized reproduction", "jester tune <rule-id> --json", "pass or quiet-pass fixture"]
    },
    {
      id: "rule-review-candidate-review",
      sourceRecord: "rule-review-candidate-backlog-record",
      reviewDecision: "remains-rule-review-candidate",
      outcome: "rule-review-candidate",
      checks: ["npm run fixtures:report -- --markdown", "npm run support:check"],
      criteria: ["At least two sanitized", "Fixture report or tune evidence", "supporting fixtures"]
    },
    {
      id: "closed-no-action-review",
      sourceRecord: "<backlog-record-id>",
      reviewDecision: "closed-no-action",
      outcome: "closed-no-action",
      checks: ["npm run support:check"],
      criteria: ["no longer reproduces", "private, or security-sensitive", "current checks still pass"]
    }
  ];
  const seenIds = new Set();

  for (const [index, review] of reviews.entries()) {
    const expectedReview = expected[index];
    if (review?.id !== expectedReview.id) {
      failures.push(`${path} entry ${index + 1} should have id ${expectedReview.id}.`);
      continue;
    }

    if (seenIds.has(review.id)) {
      failures.push(`${path} has duplicate id ${review.id}.`);
    }
    seenIds.add(review.id);

    if (review.sourceRecord !== expectedReview.sourceRecord) {
      failures.push(`${review.id}.sourceRecord should be ${expectedReview.sourceRecord}.`);
    }

    if (review.reviewDecision !== expectedReview.reviewDecision) {
      failures.push(`${review.id}.reviewDecision should be ${expectedReview.reviewDecision}.`);
    }

    if (review.outcome !== expectedReview.outcome) {
      failures.push(`${review.id}.outcome should be ${expectedReview.outcome}.`);
    }

    if (typeof review.cadence !== "string" || review.cadence.length < 40) {
      failures.push(`${review.id}.cadence should explain when to review the backlog item.`);
    }

    if (typeof review.nextAction !== "string" || review.nextAction.length < 50) {
      failures.push(`${review.id}.nextAction should describe the maintainer action.`);
    }

    if (!Array.isArray(review.decisionCriteria) || review.decisionCriteria.length !== 3) {
      failures.push(`${review.id}.decisionCriteria should contain exactly three criteria.`);
    } else {
      const criteriaText = review.decisionCriteria.join("\n");
      for (const expectedCriterion of expectedReview.criteria) {
        if (!criteriaText.includes(expectedCriterion)) {
          failures.push(`${review.id}.decisionCriteria should include ${expectedCriterion}.`);
        }
      }
    }

    if (!Array.isArray(review.privacyReview) || review.privacyReview.length !== 3) {
      failures.push(`${review.id}.privacyReview should contain exactly three privacy checks.`);
    } else {
      const privacyText = review.privacyReview.join("\n");
      if (!/secret|private|SECURITY\.md|redacted|placeholder/i.test(privacyText)) {
        failures.push(`${review.id}.privacyReview should include privacy and security routing guidance.`);
      }
    }

    if (!Array.isArray(review.requiredChecks)) {
      failures.push(`${review.id}.requiredChecks should be an array.`);
      continue;
    }

    for (const check of expectedReview.checks) {
      if (!review.requiredChecks.includes(check)) {
        failures.push(`${review.id}.requiredChecks should include ${check}.`);
      }
    }
  }
}
