import type { ReviewResult } from "./types.js";

export function formatReview(result: ReviewResult): string {
  const lines = [
    `Jester verdict: ${result.verdict.toUpperCase()} (${result.riskScore}/100)`,
    result.jab,
    ""
  ];

  if (result.issues.length > 0) {
    lines.push("Concerns:");
    for (const issue of result.issues) {
      const evidence = issue.evidence ? ` Evidence: ${issue.evidence}` : "";
      lines.push(`- [S${issue.severity}] ${issue.title}: ${issue.detail}${evidence}`);
    }
    lines.push("");
  }

  if (result.suggestedChecks.length > 0) {
    lines.push("Suggested checks:");
    for (const check of result.suggestedChecks) {
      lines.push(`- ${check}`);
    }
    lines.push("");
  }

  lines.push(result.memento);
  return lines.join("\n").trimEnd();
}
