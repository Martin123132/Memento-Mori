#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { reviewCommand, reviewDiff, reviewFinalAnswer, reviewPlan } from "./core.js";
import { formatReview } from "./format.js";
import { tones } from "./types.js";

const toneSchema = z.enum(tones).optional();
const sharedShape = {
  context: z.string().optional(),
  tone: toneSchema,
  intensity: z.number().int().min(1).max(5).optional(),
  riskTolerance: z.enum(["low", "medium", "high"]).optional()
};

const server = new McpServer({
  name: "memento-mori-jester",
  version: "0.1.0"
});

server.registerTool(
  "jester_review_plan",
  {
    title: "Review Agent Plan",
    description: "Puncture overconfident plans with a brief jester critique and concrete verification checks.",
    inputSchema: {
      plan: z.string().min(1),
      subject: z.string().optional(),
      ...sharedShape
    }
  },
  async ({ plan, subject, context, tone, intensity, riskTolerance }) => {
    const result = reviewPlan(plan, { subject, context, tone, intensity, riskTolerance });
    return toolResult(result);
  }
);

server.registerTool(
  "jester_check_command",
  {
    title: "Check Shell Command",
    description: "Review a shell command for destructive operations, broad file changes, and other footguns.",
    inputSchema: {
      command: z.string().min(1),
      subject: z.string().optional(),
      ...sharedShape
    }
  },
  async ({ command, subject, context, tone, intensity, riskTolerance }) => {
    const result = reviewCommand(command, { subject, context, tone, intensity, riskTolerance });
    return toolResult(result);
  }
);

server.registerTool(
  "jester_review_diff",
  {
    title: "Review Code Diff",
    description: "Review a diff for risky deletions, suppressed types, debug logs, sensitive areas, and missing checks.",
    inputSchema: {
      diff: z.string().min(1),
      subject: z.string().optional(),
      ...sharedShape
    }
  },
  async ({ diff, subject, context, tone, intensity, riskTolerance }) => {
    const result = reviewDiff(diff, { subject, context, tone, intensity, riskTolerance });
    return toolResult(result);
  }
);

server.registerTool(
  "jester_final_answer_roast",
  {
    title: "Review Final Answer",
    description: "Check whether a final agent answer overclaims, omits verification, or needs a humbling caveat.",
    inputSchema: {
      answer: z.string().min(1),
      subject: z.string().optional(),
      ...sharedShape
    }
  },
  async ({ answer, subject, context, tone, intensity, riskTolerance }) => {
    const result = reviewFinalAnswer(answer, { subject, context, tone, intensity, riskTolerance });
    return toolResult(result);
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

function toolResult(result: ReturnType<typeof reviewPlan>) {
  return {
    content: [
      {
        type: "text" as const,
        text: formatReview(result)
      }
    ],
    structuredContent: result as unknown as Record<string, unknown>
  };
}
