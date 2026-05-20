import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { review } from "./core.js";
import {
  reviewKinds,
  tones,
  type ReviewInput,
  type ReviewKind,
  type RiskTolerance,
  type Tone,
  type UserJesterConfig
} from "./types.js";

export const playgroundHost = "127.0.0.1";
export const playgroundPortDefault = 4818;

export type PlaygroundServerOptions = {
  config?: UserJesterConfig;
};

export type StartPlaygroundOptions = PlaygroundServerOptions & {
  port?: number;
};

export type StartedPlayground = {
  server: Server;
  url: string;
  port: number;
};

type PlaygroundReviewRequest = {
  kind?: unknown;
  content?: unknown;
  subject?: unknown;
  context?: unknown;
  tone?: unknown;
  intensity?: unknown;
  riskTolerance?: unknown;
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

const sampleInputs: Record<ReviewKind, string> = {
  command: "git reset --hard",
  plan: "I will just refactor auth and ship it.",
  final: "Implemented the fix, but tests not run.",
  diff: `diff --git a/.env b/.env
index 1111111..2222222 100644
--- a/.env
+++ b/.env
@@ -1 +1,2 @@
+PUBLIC_TOKEN=redacted-demo-value`
};

export function createPlaygroundServer(options: PlaygroundServerOptions = {}): Server {
  return createServer(async (request, response) => {
    try {
      await handleRequest(request, response, options);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Unexpected playground error.";
      sendJson(response, status, { error: message });
    }
  });
}

export async function startPlaygroundServer(options: StartPlaygroundOptions = {}): Promise<StartedPlayground> {
  const port = options.port ?? playgroundPortDefault;
  const server = createPlaygroundServer({ config: options.config });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, playgroundHost, resolve);
  });

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  return {
    server,
    url: `http://${playgroundHost}:${actualPort}/`,
    port: actualPort
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: PlaygroundServerOptions
): Promise<void> {
  const url = new URL(request.url ?? "/", `http://${playgroundHost}`);

  if (request.method === "GET" && url.pathname === "/") {
    sendHtml(response, renderPlaygroundHtml());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      reviewKinds,
      tones
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/review") {
    const body = await readJsonBody(request);
    const input = requestToReviewInput(body, options.config);
    sendJson(response, 200, review(input));
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

function requestToReviewInput(payload: PlaygroundReviewRequest, config?: UserJesterConfig): ReviewInput {
  const kind = parseReviewKind(payload.kind);
  const content = typeof payload.content === "string" ? payload.content : "";

  if (!content.trim()) {
    throw new HttpError(400, "Content is required.");
  }

  return {
    kind,
    content,
    subject: typeof payload.subject === "string" ? payload.subject : undefined,
    context: typeof payload.context === "string" ? payload.context : undefined,
    tone: parseOptionalTone(payload.tone),
    intensity: parseOptionalIntensity(payload.intensity),
    riskTolerance: parseOptionalRiskTolerance(payload.riskTolerance),
    config
  };
}

function parseReviewKind(value: unknown): ReviewKind {
  if (typeof value === "string" && reviewKinds.includes(value as ReviewKind)) {
    return value as ReviewKind;
  }

  return "plan";
}

function parseOptionalTone(value: unknown): Tone | undefined {
  if (typeof value === "string" && tones.includes(value as Tone)) {
    return value as Tone;
  }

  return undefined;
}

function parseOptionalIntensity(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }

  return Math.min(5, Math.max(1, value));
}

function parseOptionalRiskTolerance(value: unknown): RiskTolerance | undefined {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

async function readJsonBody(request: IncomingMessage): Promise<PlaygroundReviewRequest> {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) {
      throw new HttpError(413, "Request body is too large.");
    }
  }

  try {
    return JSON.parse(body || "{}") as PlaygroundReviewRequest;
  } catch {
    throw new HttpError(400, "Request body must be JSON.");
  }
}

function sendHtml(response: ServerResponse, html: string): void {
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": "text/html; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(html);
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "x-content-type-options": "nosniff"
  });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}

export function renderPlaygroundHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Memento Mori Jester Playground</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f7f8;
      --ink: #18181b;
      --muted: #62636a;
      --line: #d9d9df;
      --panel: #ffffff;
      --panel-strong: #111113;
      --accent: #0f766e;
      --accent-soft: #d9f4ef;
      --caution: #9a6700;
      --caution-soft: #fff4cc;
      --block: #b42318;
      --block-soft: #fee4df;
      --pass: #137333;
      --pass-soft: #ddf8e5;
      --shadow: 0 18px 50px rgba(24, 24, 27, 0.1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
      min-width: 0;
    }

    .app {
      min-height: 100vh;
      padding: 28px;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
    }

    .shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
      gap: 18px;
      max-width: 1240px;
      margin: 0 auto;
      min-width: 0;
    }

    header {
      grid-column: 1 / -1;
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      padding: 4px 0 8px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      line-height: 1.08;
      font-weight: 760;
      letter-spacing: 0;
    }

    .status {
      color: var(--muted);
      font-size: 14px;
      white-space: nowrap;
    }

    .panel {
      min-width: 0;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      min-height: 58px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
    }

    .panel-title {
      margin: 0;
      font-size: 16px;
      font-weight: 720;
    }

    form {
      display: grid;
      gap: 16px;
      padding: 18px;
    }

    label {
      display: grid;
      gap: 7px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 650;
    }

    textarea,
    input,
    select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--ink);
      outline: none;
    }

    textarea:focus,
    input:focus,
    select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }

    textarea {
      min-height: 310px;
      resize: vertical;
      padding: 14px;
      font: 14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    input,
    select {
      min-height: 42px;
      padding: 9px 11px;
    }

    .segmented {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      padding: 5px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f0f0f2;
    }

    .segmented button {
      min-height: 38px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      font-size: 13px;
      font-weight: 720;
      min-width: 0;
    }

    .segmented button[aria-pressed="true"] {
      background: var(--panel-strong);
      color: #fff;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .primary,
    .secondary {
      min-height: 42px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 760;
      white-space: nowrap;
    }

    .primary {
      padding: 0 18px;
      border: 1px solid var(--panel-strong);
      background: var(--panel-strong);
      color: #fff;
    }

    .secondary {
      padding: 0 14px;
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
    }

    .result-body {
      min-height: 511px;
      padding: 18px;
    }

    .empty {
      display: grid;
      min-height: 478px;
      place-items: center;
      color: var(--muted);
      text-align: center;
      border: 1px dashed var(--line);
      border-radius: 8px;
      padding: 18px;
    }

    .verdict {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 14px;
    }

    .verdict strong {
      display: block;
      font-size: 22px;
      line-height: 1.1;
      letter-spacing: 0;
    }

    .verdict span {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }

    .verdict.pass {
      background: var(--pass-soft);
      color: var(--pass);
    }

    .verdict.caution {
      background: var(--caution-soft);
      color: var(--caution);
    }

    .verdict.block {
      background: var(--block-soft);
      color: var(--block);
    }

    .jab {
      margin: 0 0 16px;
      color: var(--ink);
      font-size: 15px;
    }

    .section {
      margin-top: 16px;
    }

    .section h3 {
      margin: 0 0 8px;
      font-size: 13px;
      letter-spacing: 0;
      text-transform: uppercase;
      color: var(--muted);
    }

    ul {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      font-size: 14px;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.94em;
    }

    .memento {
      margin: 16px 0 0;
      padding: 12px;
      border-radius: 8px;
      background: #f0f0f2;
      color: var(--muted);
      font-size: 14px;
    }

    @media (max-width: 880px) {
      .app {
        padding: 12px;
      }

      .shell {
        grid-template-columns: minmax(0, 1fr);
      }

      header {
        align-items: start;
        flex-direction: column;
      }

      .panel-header {
        align-items: stretch;
        flex-direction: column;
      }

      .status {
        white-space: normal;
      }

      .row {
        grid-template-columns: 1fr;
      }

      .segmented {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .actions {
        align-items: stretch;
        flex-direction: column-reverse;
      }

      .primary,
      .secondary {
        width: 100%;
      }

      textarea {
        min-height: 260px;
      }
    }
  </style>
</head>
<body>
  <main class="app" data-app="memento-mori-playground">
    <div class="shell">
      <header>
        <h1>Memento Mori Jester</h1>
        <div class="status">Local playground on 127.0.0.1</div>
      </header>

      <section class="panel" aria-labelledby="input-title">
        <div class="panel-header">
          <h2 class="panel-title" id="input-title">Input</h2>
          <div class="segmented" aria-label="Review kind">
            <button type="button" data-kind="command" aria-pressed="true">Command</button>
            <button type="button" data-kind="plan" aria-pressed="false">Plan</button>
            <button type="button" data-kind="final" aria-pressed="false">Final</button>
            <button type="button" data-kind="diff" aria-pressed="false">Diff</button>
          </div>
        </div>

        <form id="review-form">
          <label>
            Subject
            <input id="subject" name="subject" value="local playground review">
          </label>

          <label>
            Content
            <textarea id="content" name="content" spellcheck="false"></textarea>
          </label>

          <div class="row">
            <label>
              Tone
              <select id="tone" name="tone">
                <option value="court_jester">court_jester</option>
                <option value="professional">professional</option>
                <option value="gentle_stoic">gentle_stoic</option>
                <option value="absolute_menace">absolute_menace</option>
              </select>
            </label>
            <label>
              Risk
              <select id="risk" name="risk">
                <option value="medium">medium</option>
                <option value="low">low</option>
                <option value="high">high</option>
              </select>
            </label>
          </div>

          <div class="actions">
            <button class="secondary" type="button" id="sample">Reset Sample</button>
            <button class="primary" type="submit">Review</button>
          </div>
        </form>
      </section>

      <section class="panel" aria-labelledby="result-title">
        <div class="panel-header">
          <h2 class="panel-title" id="result-title">Result</h2>
        </div>
        <div class="result-body" id="result">
          <div class="empty">Ready.</div>
        </div>
      </section>
    </div>
  </main>

  <script>
    const samples = ${JSON.stringify(sampleInputs, null, 6)};
    let activeKind = "command";

    const content = document.querySelector("#content");
    const subject = document.querySelector("#subject");
    const tone = document.querySelector("#tone");
    const risk = document.querySelector("#risk");
    const result = document.querySelector("#result");
    const kindButtons = Array.from(document.querySelectorAll("[data-kind]"));

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function setKind(kind) {
      activeKind = kind;
      content.value = samples[kind];
      for (const button of kindButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.kind === kind));
      }
    }

    function issueList(issues) {
      if (!issues.length) {
        return "";
      }

      const rows = issues.map((issue) => {
        const evidence = issue.evidence ? " Evidence: " + issue.evidence : "";
        return "<li><strong>[S" + issue.severity + "] " + escapeHtml(issue.title) + ":</strong> " + escapeHtml(issue.detail + evidence) + "</li>";
      }).join("");
      return '<div class="section"><h3>Concerns</h3><ul>' + rows + "</ul></div>";
    }

    function checkList(checks) {
      if (!checks.length) {
        return "";
      }

      const rows = checks.map((check) => "<li>" + escapeHtml(check) + "</li>").join("");
      return '<div class="section"><h3>Suggested Checks</h3><ul>' + rows + "</ul></div>";
    }

    function renderReview(review) {
      result.innerHTML = [
        '<div class="verdict ' + review.verdict + '">',
        "<div><strong>" + review.verdict.toUpperCase() + "</strong><span>" + review.kind + "</span></div>",
        "<span>" + review.riskScore + "/100</span>",
        "</div>",
        '<p class="jab">' + escapeHtml(review.jab) + "</p>",
        issueList(review.issues),
        checkList(review.suggestedChecks),
        '<p class="memento">' + escapeHtml(review.memento) + "</p>"
      ].join("");
    }

    async function submitReview() {
      result.innerHTML = '<div class="empty">Reviewing.</div>';
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: activeKind,
          content: content.value,
          subject: subject.value,
          tone: tone.value,
          riskTolerance: risk.value
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        result.innerHTML = '<div class="empty">' + escapeHtml(payload.error || "Review failed.") + "</div>";
        return;
      }

      renderReview(payload);
    }

    for (const button of kindButtons) {
      button.addEventListener("click", () => setKind(button.dataset.kind));
    }

    document.querySelector("#sample").addEventListener("click", () => setKind(activeKind));
    document.querySelector("#review-form").addEventListener("submit", (event) => {
      event.preventDefault();
      void submitReview();
    });

    setKind(activeKind);
  </script>
</body>
</html>
`;
}
