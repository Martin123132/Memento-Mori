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

function forbidText(path, pattern, description) {
  const content = read(path);
  if (pattern.test(content)) {
    failures.push(`${path} should not include ${description}.`);
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
  "docs/FRAMEWORK_TUNING.md",
  "docs/MAINTAINER_TRIAGE.md",
  `docs/RELEASE_NOTES_${tag}.md`,
  "action.yml",
  "scripts/check-promo-freshness.mjs",
  "scripts/render-social-card.mjs",
  "scripts/check-site.mjs",
  "scripts/check-framework-tuning.mjs",
  "scripts/doctor-framework-tuning.mjs",
  "scripts/check-ci-adoption.mjs",
  "scripts/check-consumer-quickstart.mjs",
  "scripts/check-report-gallery.mjs",
  "scripts/check-support-triage.mjs",
  "scripts/check-fixtures.mjs",
  "scripts/report-fixtures.mjs",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/false_positive.yml",
  ".github/ISSUE_TEMPLATE/report_gallery_feedback.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/npm-publish.yml",
  ".github/workflows/release.yml",
  "examples/github-action.yml",
  "examples/github-code-scanning.yml",
  "examples/ci/README.md",
  "examples/ci/adoption-smoke.yml",
  "examples/consumer-quickstart/README.md",
  "examples/consumer-quickstart/package.json",
  "examples/reports/README.md",
  "examples/reports/feedback-template.md",
  "examples/reports/report-gallery.json",
  "examples/support/README.md",
  "examples/support/backlog-review.md",
  "examples/support/backlog-review.json",
  "examples/support/backlog-records.md",
  "examples/support/backlog-records.json",
  "examples/support/closeout-checklist.md",
  "examples/support/closeout-checklist.json",
  "examples/support/outcome-prioritization.md",
  "examples/support/outcome-prioritization.json",
  "examples/support/response-snippets.md",
  "examples/support/response-snippets.json",
  "examples/support/support-lifecycle.md",
  "examples/support/support-lifecycle.json",
  "examples/support/triage-playbook.json",
  "examples/presets/README.md",
  "examples/tuning/README.md",
  "examples/tuning/framework-tuning-cookbook.json",
  "examples/fixtures/preset-review-cases.json",
  "site/index.html"
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
requireText("README.md", /fixtures:check/, "fixture authoring check guidance");
requireText("README.md", /fixtures:report/, "fixture coverage report guidance");
requireText("README.md", /fixtures:report -- --markdown/, "Markdown fixture report guidance");
requireText("README.md", /FRAMEWORK_TUNING\.md/, "framework tuning guide link");
requireText("README.md", /examples\/tuning/, "framework tuning cookbook link");
requireText("README.md", /adoption-smoke\.yml/, "adoption smoke CI link");
requireText("README.md", /consumer-quickstart/, "consumer quickstart smoke link");
requireText("README.md", /examples\/reports/, "report gallery link");
requireText("README.md", /feedback-template\.md/, "report gallery feedback template link");
requireText("README.md", /examples\/support/, "support triage playbook link");
requireText("README.md", /response-snippets\.md/, "support response snippets link");
requireText("README.md", /closeout-checklist\.md/, "support closeout checklist link");
requireText("README.md", /support-lifecycle\.md/, "support lifecycle overview link");
requireText("README.md", /outcome-prioritization\.md/, "support outcome prioritization link");
requireText("README.md", /backlog-review\.md/, "support backlog review link");
requireText("README.md", /backlog-records\.md/, "support backlog records link");
requireText("README.md", /report gallery feedback/i, "report gallery feedback guidance");
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
requireText("docs/PRODUCTION_READINESS.md", /fixtures:check/, "fixture authoring check readiness");
requireText("docs/PRODUCTION_READINESS.md", /fixtures:report/, "fixture coverage report readiness");
requireText("docs/PRODUCTION_READINESS.md", /fixtures:report -- --markdown/, "Markdown fixture report readiness");
requireText("docs/PRODUCTION_READINESS.md", /framework:tuning:check/, "framework tuning cookbook readiness");
requireText("docs/PRODUCTION_READINESS.md", /framework:tuning:doctor/, "framework tuning cookbook doctor readiness");
requireText("docs/PRODUCTION_READINESS.md", /adoption-smoke\.yml/, "adoption smoke CI readiness");
requireText("docs/PRODUCTION_READINESS.md", /consumer:quickstart:check/, "consumer quickstart smoke readiness");
requireText("docs/PRODUCTION_READINESS.md", /reports:check/, "report gallery readiness");
requireText("docs/PRODUCTION_READINESS.md", /support:check/, "support triage readiness");
requireText("docs/PRODUCTION_READINESS.md", /examples\/support/, "support triage playbook readiness");
requireText("docs/PRODUCTION_READINESS.md", /response snippets/i, "support response snippets readiness");
requireText("docs/PRODUCTION_READINESS.md", /closeout checklist/i, "support closeout checklist readiness");
requireText("docs/PRODUCTION_READINESS.md", /support lifecycle overview/i, "support lifecycle overview readiness");
requireText("docs/PRODUCTION_READINESS.md", /outcome prioritization guide/i, "support outcome prioritization readiness");
requireText("docs/PRODUCTION_READINESS.md", /backlog review/i, "support backlog review readiness");
requireText("docs/PRODUCTION_READINESS.md", /backlog records/i, "support backlog records readiness");
requireText("docs/PRODUCTION_READINESS.md", /quiet-pass/, "quiet-pass fixture readiness");
requireText("docs/CLI.md", /jester doctor --json/, "doctor JSON CLI docs");
requireText("docs/CLI.md", /quiet-pass fixture/, "quiet-pass fixture CLI docs");
requireText("docs/CLI.md", /FRAMEWORK_TUNING\.md/, "framework tuning CLI link");
requireText("docs/CLI.md", /examples\/tuning/, "framework tuning cookbook CLI link");
requireText("docs/CLI.md", /framework:tuning:doctor/, "framework tuning doctor CLI docs");
requireText("docs/FRAMEWORK_TUNING.md", /Next\.js/, "Next.js framework tuning example");
requireText("docs/FRAMEWORK_TUNING.md", /FastAPI/, "FastAPI framework tuning example");
requireText("docs/FRAMEWORK_TUNING.md", /Terraform/, "Terraform framework tuning example");
requireText("docs/FRAMEWORK_TUNING.md", /jester tune <rule-id> --json/, "framework tuning command guidance");
requireText("docs/FRAMEWORK_TUNING.md", /framework-tuning-cookbook\.json/, "framework tuning cookbook JSON link");
requireText("docs/FRAMEWORK_TUNING.md", /framework:tuning:doctor/, "framework tuning doctor guidance");
requireText("docs/GITHUB_ACTIONS.md", /adoption-smoke\.yml/, "adoption smoke GitHub Actions docs");
requireText("docs/GITHUB_ACTIONS.md", /summary --kind command "git reset --hard"/, "adoption summary smoke docs");
requireText("docs/GITHUB_ACTIONS.md", /framework:tuning:doctor/, "adoption framework tuning doctor docs");
requireText("docs/GITHUB_ACTIONS.md", /consumer:quickstart:check/, "consumer quickstart GitHub Actions docs");
requireText("docs/MAINTAINER_TRIAGE.md", /doctor --json/, "doctor JSON triage prompt");
requireText("docs/MAINTAINER_TRIAGE.md", /tune <rule-id> --json/, "tune JSON triage prompt");
requireText("docs/MAINTAINER_TRIAGE.md", /preset-review-cases\.json/, "fixture suite link");
requireText("docs/MAINTAINER_TRIAGE.md", /expectedRuleIds/, "fixture expected rule guidance");
requireText("docs/MAINTAINER_TRIAGE.md", /absentRuleIds/, "fixture absent rule guidance");
requireText("docs/MAINTAINER_TRIAGE.md", /feedback-template\.md/, "report gallery feedback template link");
requireText("docs/MAINTAINER_TRIAGE.md", /report_gallery_feedback\.yml/, "report gallery issue template link");
requireText("docs/MAINTAINER_TRIAGE.md", /examples\/support/, "support triage playbook link");
requireText("docs/MAINTAINER_TRIAGE.md", /response-snippets\.md/, "support response snippets link");
requireText("docs/MAINTAINER_TRIAGE.md", /closeout-checklist\.md/, "support closeout checklist link");
requireText("docs/MAINTAINER_TRIAGE.md", /support-lifecycle\.md/, "support lifecycle overview link");
requireText("docs/MAINTAINER_TRIAGE.md", /outcome-prioritization\.md/, "support outcome prioritization link");
requireText("docs/MAINTAINER_TRIAGE.md", /backlog-review\.md/, "support backlog review link");
requireText("docs/MAINTAINER_TRIAGE.md", /backlog-records\.md/, "support backlog records link");
requireText("docs/MAINTAINER_TRIAGE.md", /docs-example/, "docs example triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /fixture-backlog/, "fixture backlog triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /rule-review-candidate/, "rule review triage outcome");
requireText("docs/MAINTAINER_TRIAGE.md", /support:check/, "support triage check guidance");
requireText("examples/fixtures/README.md", /MAINTAINER_TRIAGE\.md/, "maintainer triage link");
requireText("examples/fixtures/README.md", /Adding A Fixture From A Report/, "fixture report conversion guidance");
requireText("examples/fixtures/README.md", /fixtures:check/, "fixture authoring check guidance");
requireText("examples/fixtures/README.md", /fixtures:report/, "fixture coverage report guidance");
requireText("examples/fixtures/README.md", /fixtures:report -- --markdown/, "Markdown fixture report guidance");
requireText("examples/ci/README.md", /adoption-smoke\.yml/, "adoption smoke CI index link");
requireText("examples/ci/README.md", /consumer-quickstart/, "consumer quickstart CI index link");
requireText("examples/ci/adoption-smoke.yml", /npx -y memento-mori-jester@latest doctor/, "adoption smoke doctor command");
requireText("examples/ci/adoption-smoke.yml", /summary --kind command "git reset --hard"/, "adoption smoke summary command");
requireText("examples/ci/adoption-smoke.yml", /framework:tuning:doctor/, "adoption smoke tuning doctor command");
requireText("examples/consumer-quickstart/README.md", /npm run consumer:quickstart:check/, "consumer quickstart check command");
requireText("examples/consumer-quickstart/package.json", /jester:summary/, "consumer quickstart summary script");
requireText("examples/consumer-quickstart/package.json", /framework:tuning:doctor/, "consumer quickstart tuning doctor script");
requireText("examples/reports/README.md", /report-gallery\.json/, "report gallery JSON link");
requireText("examples/reports/README.md", /feedback-template\.md/, "report gallery feedback template link");
requireText("examples/reports/README.md", /report_gallery_feedback\.yml/, "report gallery issue template link");
requireText("examples/reports/README.md", /examples\/support|Maintainer Triage Playbook/i, "support triage playbook link");
requireText("examples/reports/README.md", /npm run reports:check/, "report gallery check command");
requireText("examples/reports/README.md", /npm run support:check/, "support triage check command");
requireText("examples/reports/report-gallery.json", /fresh-install-doctor/, "fresh install doctor report");
requireText("examples/reports/report-gallery.json", /destructive-command-summary/, "destructive command summary report");
requireText("examples/reports/report-gallery.json", /blocked-command-review/, "blocked command review report");
requireText("examples/reports/feedback-template.md", /doctor --json/, "feedback template doctor diagnostics");
requireText("examples/reports/feedback-template.md", /summary --kind command "git reset --hard"/, "feedback template summary diagnostics");
requireText("examples/reports/feedback-template.md", /tune <rule-id> --json/, "feedback template tune diagnostics");
requireText("examples/reports/feedback-template.md", /Privacy Checklist/, "feedback template privacy checklist");
requireText("examples/reports/feedback-template.md", /SECURITY\.md/, "feedback template security redirect");
requireText("examples/support/README.md", /triage-playbook\.json/, "support triage playbook JSON link");
requireText("examples/support/README.md", /response-snippets\.md/, "support response snippets link");
requireText("examples/support/README.md", /closeout-checklist\.md/, "support closeout checklist link");
requireText("examples/support/README.md", /support-lifecycle\.md/, "support lifecycle overview link");
requireText("examples/support/README.md", /outcome-prioritization\.md/, "support outcome prioritization link");
requireText("examples/support/README.md", /backlog-review\.md/, "support backlog review link");
requireText("examples/support/README.md", /backlog-records\.md/, "support backlog records link");
requireText("examples/support/README.md", /docs-example/, "support triage docs outcome");
requireText("examples/support/README.md", /fixture-backlog/, "support triage fixture outcome");
requireText("examples/support/README.md", /rule-review-candidate/, "support triage rule-review outcome");
requireText("examples/support/triage-playbook.json", /gallery-expected-block-docs/, "support triage docs example");
requireText("examples/support/triage-playbook.json", /false-positive-fixture-backlog/, "support triage fixture example");
requireText("examples/support/triage-playbook.json", /repeated-risky-domain-rule-review/, "support triage rule-review example");
requireText("examples/support/response-snippets.md", /Maintainer Response Snippets/, "support response snippets heading");
requireText("examples/support/response-snippets.md", /response-snippets\.json/, "support response snippets JSON link");
requireText("examples/support/response-snippets.json", /docs-example-response/, "support docs response snippet");
requireText("examples/support/response-snippets.json", /fixture-backlog-response/, "support fixture response snippet");
requireText("examples/support/response-snippets.json", /rule-review-candidate-response/, "support rule-review response snippet");
requireText("examples/support/closeout-checklist.md", /Support Closeout Checklist/, "support closeout checklist heading");
requireText("examples/support/closeout-checklist.md", /closeout-checklist\.json/, "support closeout checklist JSON link");
requireText("examples/support/closeout-checklist.md", /shipped-or-queued/, "support docs closeout status");
requireText("examples/support/closeout-checklist.md", /backlog-created/, "support fixture closeout status");
requireText("examples/support/closeout-checklist.md", /candidate-opened/, "support rule-review closeout status");
requireText("examples/support/closeout-checklist.json", /docs-clarification-closeout/, "support docs closeout record");
requireText("examples/support/closeout-checklist.json", /fixture-backlog-closeout/, "support fixture closeout record");
requireText("examples/support/closeout-checklist.json", /rule-review-closeout/, "support rule-review closeout record");
requireText("examples/support/support-lifecycle.md", /Support Lifecycle Overview/, "support lifecycle heading");
requireText("examples/support/support-lifecycle.md", /support-lifecycle\.json/, "support lifecycle JSON link");
requireText("examples/support/support-lifecycle.md", /report -> triage -> response -> closeout/, "support lifecycle flow");
requireText("examples/support/support-lifecycle.md", /docs-example/, "support lifecycle docs outcome");
requireText("examples/support/support-lifecycle.md", /fixture-backlog/, "support lifecycle fixture outcome");
requireText("examples/support/support-lifecycle.md", /rule-review-candidate/, "support lifecycle rule-review outcome");
requireText("examples/support/support-lifecycle.json", /docs-example-response/, "support lifecycle docs response");
requireText("examples/support/support-lifecycle.json", /fixture-backlog-response/, "support lifecycle fixture response");
requireText("examples/support/support-lifecycle.json", /rule-review-candidate-response/, "support lifecycle rule-review response");
requireText("examples/support/outcome-prioritization.md", /Support Outcome Prioritization/, "support outcome prioritization heading");
requireText("examples/support/outcome-prioritization.md", /outcome-prioritization\.json/, "support outcome prioritization JSON link");
requireText("examples/support/outcome-prioritization.md", /docs-example/, "support outcome prioritization docs outcome");
requireText("examples/support/outcome-prioritization.md", /fixture-backlog/, "support outcome prioritization fixture outcome");
requireText("examples/support/outcome-prioritization.md", /rule-review-candidate/, "support outcome prioritization rule-review outcome");
requireText("examples/support/outcome-prioritization.md", /at least two sanitized reports/, "support outcome prioritization evidence threshold");
requireText("examples/support/outcome-prioritization.json", /docs-clarification-closeout/, "support outcome prioritization docs closeout");
requireText("examples/support/outcome-prioritization.json", /fixture-backlog-closeout/, "support outcome prioritization fixture closeout");
requireText("examples/support/outcome-prioritization.json", /rule-review-closeout/, "support outcome prioritization rule-review closeout");
requireText("examples/support/backlog-records.md", /Support Backlog Records/, "support backlog records heading");
requireText("examples/support/backlog-records.md", /backlog-records\.json/, "support backlog records JSON link");
requireText("examples/support/backlog-records.md", /docs-clarification-backlog-record/, "support docs backlog record");
requireText("examples/support/backlog-records.md", /fixture-backlog-record/, "support fixture backlog record");
requireText("examples/support/backlog-records.md", /rule-review-candidate-backlog-record/, "support rule-review backlog record");
requireText("examples/support/backlog-records.md", /jester tune <rule-id> --json/, "support backlog tuning evidence");
requireText("examples/support/backlog-records.md", /SECURITY\.md/, "support backlog security redirect");
requireText("examples/support/backlog-records.json", /docs-clarification-backlog-record/, "support docs backlog record JSON");
requireText("examples/support/backlog-records.json", /fixture-backlog-record/, "support fixture backlog record JSON");
requireText("examples/support/backlog-records.json", /rule-review-candidate-backlog-record/, "support rule-review backlog record JSON");
requireText("examples/support/backlog-review.md", /Support Backlog Review/, "support backlog review heading");
requireText("examples/support/backlog-review.md", /backlog-review\.json/, "support backlog review JSON link");
requireText("examples/support/backlog-review.md", /remains-docs-clarification/, "support docs backlog review decision");
requireText("examples/support/backlog-review.md", /remains-fixture-backlog/, "support fixture backlog review decision");
requireText("examples/support/backlog-review.md", /remains-rule-review-candidate/, "support rule-review backlog review decision");
requireText("examples/support/backlog-review.md", /closed-no-action/, "support closed no-action review decision");
requireText("examples/support/backlog-review.md", /SECURITY\.md/, "support backlog review security redirect");
requireText("examples/support/backlog-review.json", /docs-clarification-review/, "support docs backlog review JSON");
requireText("examples/support/backlog-review.json", /fixture-backlog-review/, "support fixture backlog review JSON");
requireText("examples/support/backlog-review.json", /rule-review-candidate-review/, "support rule-review backlog review JSON");
requireText("examples/support/backlog-review.json", /closed-no-action-review/, "support closed no-action review JSON");
requireText("examples/tuning/README.md", /framework-tuning-cookbook\.json/, "framework tuning cookbook JSON link");
requireText("examples/tuning/README.md", /framework:tuning:doctor/, "framework tuning doctor guidance");
requireText("examples/tuning/README.md", /jester tune <rule-id> --json|jester tune [a-z0-9-]+ --json/, "framework tuning command guidance");
requireText("examples/tuning/framework-tuning-cookbook.json", /next-vite-public-config/, "Next/Vite tuning recipe");
requireText("examples/tuning/framework-tuning-cookbook.json", /ai-mcp-tooling/, "AI/MCP tuning recipe");
requireText("scripts/check-fixtures.mjs", /duplicated/, "duplicate fixture id check");
requireText("scripts/check-fixtures.mjs", /unsafeContentPatterns/, "unsafe fixture content checks");
forbidText("scripts/check-fixtures.mjs", /src\/config\.ts|src\/types\.ts/, "source-only fixture validator dependencies");
requireText("scripts/report-fixtures.mjs", /rulesWithoutPassCases/, "rules without pass-case coverage report");
requireText("scripts/report-fixtures.mjs", /rulesWithoutQuietPassCoverage/, "rules without quiet-pass coverage report");
requireText("scripts/report-fixtures.mjs", /quietPassRuleCoverage/, "quiet-pass rule coverage report");
requireText("scripts/report-fixtures.mjs", /presetKindGaps/, "preset and kind gap report");
requireText("scripts/report-fixtures.mjs", /--markdown/, "Markdown fixture report output");
forbidText("scripts/report-fixtures.mjs", /src\/config\.ts|src\/types\.ts/, "source-only fixture report dependencies");
requireText("scripts/check-framework-tuning.mjs", /framework-tuning-cookbook\.json/, "framework tuning cookbook check");
requireText("scripts/check-framework-tuning.mjs", /preset-review-cases\.json/, "framework tuning fixture alignment");
requireText("scripts/check-framework-tuning.mjs", /unsafeContentPatterns/, "unsafe tuning content checks");
requireText("scripts/doctor-framework-tuning.mjs", /dist.*cli\.js|cliPath/, "built CLI doctor path");
requireText("scripts/doctor-framework-tuning.mjs", /config.*init|config", "init"/, "generated preset config doctor");
requireText("scripts/doctor-framework-tuning.mjs", /tune.*--json|tune", ruleId, "--json"/, "tune JSON doctor command");
forbidText("scripts/doctor-framework-tuning.mjs", /src\/config\.ts|src\/types\.ts/, "source-only framework tuning doctor dependencies");
requireText("scripts/check-ci-adoption.mjs", /adoption-smoke\.yml/, "adoption smoke checker target");
requireText("scripts/check-ci-adoption.mjs", /pull_request_target/, "adoption smoke unsafe trigger guard");
requireText("scripts/check-ci-adoption.mjs", /framework:tuning:doctor/, "adoption smoke tuning doctor guard");
requireText("scripts/check-consumer-quickstart.mjs", /consumer-quickstart/, "consumer quickstart checker target");
requireText("scripts/check-consumer-quickstart.mjs", /memento-mori-jester@latest/, "consumer quickstart registry verification option");
requireText("scripts/check-consumer-quickstart.mjs", /framework:tuning:doctor/, "consumer quickstart tuning doctor guard");
requireText("scripts/check-report-gallery.mjs", /report-gallery\.json/, "report gallery checker target");
requireText("scripts/check-report-gallery.mjs", /memento-mori-jester@latest/, "report gallery registry verification option");
requireText("scripts/check-report-gallery.mjs", /destructive-command-summary/, "report gallery summary guard");
requireText("scripts/check-support-triage.mjs", /report_gallery_feedback\.yml/, "support triage issue template guard");
requireText("scripts/check-support-triage.mjs", /feedback-template\.md/, "support triage feedback template guard");
requireText("scripts/check-support-triage.mjs", /triage-playbook\.json/, "support triage playbook guard");
requireText("scripts/check-support-triage.mjs", /response-snippets\.json/, "support response snippets guard");
requireText("scripts/check-support-triage.mjs", /closeout-checklist\.json/, "support closeout checklist guard");
requireText("scripts/check-support-triage.mjs", /support-lifecycle\.json/, "support lifecycle overview guard");
requireText("scripts/check-support-triage.mjs", /outcome-prioritization\.json/, "support outcome prioritization guard");
requireText("scripts/check-support-triage.mjs", /backlog-records\.json/, "support backlog records guard");
requireText("scripts/check-support-triage.mjs", /backlog-review\.json/, "support backlog review guard");
requireText("scripts/check-support-triage.mjs", /unsafeContentPatterns/, "support triage unsafe content checks");
requireText("package.json", /"fixtures:check": "node scripts\/check-fixtures\.mjs"/, "fixture authoring check script");
requireText("package.json", /"fixtures:report": "node scripts\/report-fixtures\.mjs"/, "fixture coverage report script");
requireText("package.json", /"framework:tuning:check": "node scripts\/check-framework-tuning\.mjs"/, "framework tuning cookbook check script");
requireText("package.json", /"framework:tuning:doctor": "node scripts\/doctor-framework-tuning\.mjs"/, "framework tuning cookbook doctor script");
requireText("package.json", /"ci:adoption:check": "node scripts\/check-ci-adoption\.mjs"/, "CI adoption check script");
requireText("package.json", /"consumer:quickstart:check": "node scripts\/check-consumer-quickstart\.mjs"/, "consumer quickstart check script");
requireText("package.json", /"reports:check": "node scripts\/check-report-gallery\.mjs"/, "report gallery check script");
requireText("package.json", /"support:check": "node scripts\/check-support-triage\.mjs"/, "support triage check script");
requireText("package.json", /"promo:card": "node scripts\/render-social-card\.mjs"/, "social card render script");
requireText("package.json", /"promo:card:check": "node scripts\/render-social-card\.mjs --check"/, "social card stale check script");
requireText("package.json", /"promo:check": "node scripts\/check-promo-freshness\.mjs"/, "promo freshness check script");
requireText("package.json", /"site:check": "node scripts\/check-site\.mjs"/, "site check script");
requireText("package.json", /npm run fixtures:check/, "fixture authoring check in npm test");
requireText("package.json", /npm run fixtures:report/, "fixture coverage report in npm test");
requireText("package.json", /npm run framework:tuning:check/, "framework tuning cookbook check in npm test");
requireText("package.json", /npm run framework:tuning:doctor/, "framework tuning cookbook doctor in npm test");
requireText("package.json", /npm run ci:adoption:check/, "CI adoption check in npm test");
requireText("package.json", /npm run consumer:quickstart:check/, "consumer quickstart check in npm test");
requireText("package.json", /npm run reports:check/, "report gallery check in npm test");
requireText("package.json", /npm run support:check/, "support triage check in npm test");
requireText("package.json", /npm run promo:check/, "promo freshness check in npm test");
requireText("package.json", /npm run site:check/, "site check in npm test");
requireText("scripts/check-promo-freshness.mjs", /--require-package-version/, "optional strict package-version promo check");
requireText("scripts/check-promo-freshness.mjs", /social-card\.svg/, "social-card freshness check");
requireText("scripts/check-site.mjs", /site\/index\.html/, "site index check");
requireText("site/index.html", /npx -y memento-mori-jester@latest start/, "site start command");
requireText("site/index.html", /promo\/share-kit\/social-card\.svg/, "site social card");
requireText("SECURITY.md", /doctor --json/, "doctor JSON redaction guidance");
requireText("SECURITY.md", /security\/advisories\/new/, "private vulnerability report link");
requireText(".github/ISSUE_TEMPLATE/bug_report.yml", /doctor --json/, "doctor JSON support prompt");
requireText(".github/ISSUE_TEMPLATE/bug_report.yml", /SECURITY\.md|security policy/i, "security redirect");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /jester tune <rule-id> --json/, "tune JSON prompt");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /false-positive|noisy rule/i, "false-positive scope");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /Jester version/, "false-positive version prompt");
requireText(".github/ISSUE_TEMPLATE/false_positive.yml", /doctor --json/, "false-positive doctor diagnostics");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /doctor --json/, "doctor JSON report gallery prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /summary --kind command "git reset --hard"/, "summary report gallery prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /Sanitized command summary/, "sanitized command report gallery prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /Sanitized output summary/, "sanitized output report gallery prompt");
requireText(".github/ISSUE_TEMPLATE/report_gallery_feedback.yml", /SECURITY\.md/, "report gallery security redirect");
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
