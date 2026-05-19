import assert from "node:assert/strict";
import test from "node:test";
import { userConfigForPreset } from "./config.js";
import { reviewCommand, reviewDiff, reviewFinalAnswer, reviewPlan } from "./core.js";

test("blocks recursive force deletion", () => {
  const result = reviewCommand("Remove-Item .\\build -Recurse -Force");

  assert.equal(result.verdict, "block");
  assert.equal(result.issues[0]?.id, "recursive-force-delete");
});

test("warns on overconfident plans without verification", () => {
  const result = reviewPlan("I will just refactor the auth flow and ship it.");

  assert.equal(result.verdict, "caution");
  assert.ok(result.issues.some((issue) => issue.id === "confidence-theater"));
  assert.ok(result.issues.some((issue) => issue.id === "missing-verification-step"));
});

test("does not complain about completion claim when evidence is present", () => {
  const result = reviewFinalAnswer("Implemented the fix and ran npm test successfully.");

  assert.notEqual(result.verdict, "block");
  assert.ok(!result.issues.some((issue) => issue.id === "done-without-evidence"));
});

test("warns when final answer admits tests were not run", () => {
  const result = reviewFinalAnswer("Implemented the fix, but tests not run.");

  assert.equal(result.verdict, "caution");
  assert.ok(result.issues.some((issue) => issue.id === "untested-final"));
});

test("warns on package install scripts in diffs", () => {
  const result = reviewDiff(`diff --git a/package.json b/package.json
--- a/package.json
+++ b/package.json
@@ -4,6 +4,7 @@
   "scripts": {
+    "postinstall": "node scripts/setup.js",
     "test": "node --test"
   }
`);

  assert.equal(result.verdict, "caution");
  assert.ok(result.issues.some((issue) => issue.id === "package-install-script"));
});

test("warns on sensitive environment changes in diffs", () => {
  const result = reviewDiff(`diff --git a/.env.example b/.env.example
--- a/.env.example
+++ b/.env.example
@@ -1 +1,2 @@
+DATABASE_URL=postgres://example
`);

  assert.equal(result.verdict, "caution");
  assert.ok(result.issues.some((issue) => issue.id === "sensitive-env-change"));
});

test("blocks commands listed in project config", () => {
  const result = reviewCommand("deploy-prod --now", {
    config: {
      blockedCommands: ["deploy-prod"]
    }
  });

  assert.equal(result.verdict, "block");
  assert.ok(result.issues.some((issue) => issue.id === "blocked-command-deploy-prod"));
});

test("web preset flags sensitive browser storage", () => {
  const result = reviewDiff(`diff --git a/app.ts b/app.ts
--- a/app.ts
+++ b/app.ts
@@ -1 +1,2 @@
+localStorage.setItem("token", sessionToken);
`, {
    config: userConfigForPreset("web")
  });

  assert.equal(result.verdict, "block");
  assert.ok(result.issues.some((issue) => issue.id === "custom-web-storage-sensitive-value"));
});

test("infra preset blocks destructive infra commands", () => {
  const result = reviewCommand("terraform destroy", {
    config: userConfigForPreset("infra")
  });

  assert.equal(result.verdict, "block");
  assert.ok(result.issues.some((issue) => issue.id === "blocked-command-terraform-destroy"));
});

test("disabled rules do not affect review verdicts", () => {
  const result = reviewCommand("git reset --hard", {
    config: {
      disabledRules: ["destructive-git-history"]
    }
  });

  assert.equal(result.verdict, "pass");
  assert.ok(!result.issues.some((issue) => issue.id === "destructive-git-history"));
});

test("applies custom project rules", () => {
  const result = reviewPlan("I will update the payroll exporter.", {
    config: {
      customRules: [
        {
          id: "payroll-needs-review",
          pattern: "payroll",
          severity: 4,
          title: "Payroll touched",
          detail: "Payroll changes need a second set of eyes.",
          suggestedCheck: "Get review from the payroll owner.",
          kinds: ["plan"]
        }
      ]
    }
  });

  assert.equal(result.verdict, "caution");
  assert.ok(result.issues.some((issue) => issue.id === "custom-payroll-needs-review"));
});

test("custom rules can be disabled by raw or generated id", () => {
  const result = reviewPlan("I will update the payroll exporter.", {
    config: {
      disabledRules: ["payroll-needs-review"],
      customRules: [
        {
          id: "payroll-needs-review",
          pattern: "payroll",
          severity: 4,
          title: "Payroll touched",
          detail: "Payroll changes need a second set of eyes.",
          suggestedCheck: "Get review from the payroll owner.",
          kinds: ["plan"]
        }
      ]
    }
  });

  assert.equal(result.verdict, "pass");
  assert.ok(!result.issues.some((issue) => issue.id === "custom-payroll-needs-review"));
});
