import assert from "node:assert/strict";
import test from "node:test";
import { reviewCommand, reviewFinalAnswer, reviewPlan } from "./core.js";

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

test("blocks commands listed in project config", () => {
  const result = reviewCommand("deploy-prod --now", {
    config: {
      blockedCommands: ["deploy-prod"]
    }
  });

  assert.equal(result.verdict, "block");
  assert.ok(result.issues.some((issue) => issue.id === "blocked-command-deploy-prod"));
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
