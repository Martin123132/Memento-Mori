import type { Issue, ReviewKind, ReviewResult } from "./types.js";

type SarifLevel = "error" | "warning" | "note";

export function formatSarif(result: ReviewResult, options: {
  content?: string;
  uri?: string;
} = {}): string {
  const location = sarifLocation({
    kind: result.kind,
    content: options.content,
    uri: options.uri
  });

  return `${JSON.stringify({
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Memento Mori Jester",
            informationUri: "https://github.com/Martin123132/Memento-Mori",
            rules: result.issues.map((issue) => sarifRule(issue, result.kind))
          }
        },
        results: result.issues.map((issue) => sarifResult(issue, result, location))
      }
    ]
  }, null, 2)}\n`;
}

function sarifRule(issue: Issue, kind: ReviewKind) {
  return {
    id: issue.id,
    name: issue.title,
    shortDescription: {
      text: issue.title
    },
    fullDescription: {
      text: issue.detail
    },
    help: {
      text: issue.suggestedCheck
    },
    properties: {
      severity: issue.severity,
      kind
    }
  };
}

function sarifResult(issue: Issue, result: ReviewResult, location: Record<string, unknown> | undefined) {
  return {
    ruleId: issue.id,
    level: sarifLevel(issue.severity),
    message: {
      text: `${issue.title}: ${issue.detail}`
    },
    ...(location ? { locations: [location] } : {}),
    properties: {
      verdict: result.verdict,
      riskScore: result.riskScore,
      severity: issue.severity,
      suggestedCheck: issue.suggestedCheck,
      ...(issue.evidence ? { evidence: issue.evidence } : {})
    }
  };
}

function sarifLevel(severity: Issue["severity"]): SarifLevel {
  if (severity >= 5) {
    return "error";
  }

  if (severity >= 3) {
    return "warning";
  }

  return "note";
}

function sarifLocation(options: {
  kind: ReviewKind;
  content?: string;
  uri?: string;
}): Record<string, unknown> | undefined {
  const uri = options.uri ?? inferUri(options.kind, options.content ?? "");

  if (!uri) {
    return undefined;
  }

  return {
    physicalLocation: {
      artifactLocation: {
        uri
      },
      region: {
        startLine: 1
      }
    }
  };
}

function inferUri(kind: ReviewKind, content: string): string | undefined {
  if (kind === "diff") {
    const match = /^diff --git a\/(.+?) b\/(.+)$/m.exec(content);
    return match?.[2];
  }

  return `${kind}.txt`;
}
