import assert from "node:assert/strict";
import { request } from "node:http";
import test from "node:test";
import { renderPlaygroundHtml, startPlaygroundServer, type StartedPlayground } from "./playground.js";

type HttpResult = {
  statusCode: number;
  body: string;
};

test("playground html renders the local review surface", () => {
  const html = renderPlaygroundHtml();

  assert.match(html, /data-app="memento-mori-playground"/);
  assert.match(html, /id="review-form"/);
  assert.match(html, /data-kind="command"/);
  assert.match(html, /data-kind="diff"/);
  assert.match(html, /\/api\/review/);
});

test("playground api reviews commands with the core engine", async () => {
  const started = await startPlaygroundServer({ port: 0 });

  try {
    const response = await postJson(started, "/api/review", {
      kind: "command",
      content: "git reset --hard"
    });
    const result = JSON.parse(response.body) as { kind: string; verdict: string };

    assert.equal(response.statusCode, 200);
    assert.equal(result.kind, "command");
    assert.equal(result.verdict, "block");
  } finally {
    await closePlayground(started);
  }
});

test("playground api applies project config rules", async () => {
  const started = await startPlaygroundServer({
    port: 0,
    config: {
      blockedCommands: ["deploy-prod"]
    }
  });

  try {
    const response = await postJson(started, "/api/review", {
      kind: "command",
      content: "deploy-prod"
    });
    const result = JSON.parse(response.body) as { verdict: string; issues: Array<{ id: string }> };

    assert.equal(response.statusCode, 200);
    assert.equal(result.verdict, "block");
    assert.ok(result.issues.some((issue) => issue.id === "blocked-command-deploy-prod"));
  } finally {
    await closePlayground(started);
  }
});

test("playground api rejects empty reviews", async () => {
  const started = await startPlaygroundServer({ port: 0 });

  try {
    const response = await postJson(started, "/api/review", {
      kind: "plan",
      content: "   "
    });
    const result = JSON.parse(response.body) as { error: string };

    assert.equal(response.statusCode, 400);
    assert.match(result.error, /Content is required/);
  } finally {
    await closePlayground(started);
  }
});

async function postJson(started: StartedPlayground, path: string, payload: unknown): Promise<HttpResult> {
  const body = JSON.stringify(payload);
  return httpRequest(started, path, {
    method: "POST",
    body,
    headers: {
      "content-length": Buffer.byteLength(body).toString(),
      "content-type": "application/json"
    }
  });
}

function httpRequest(
  started: StartedPlayground,
  path: string,
  options: { method: "GET" | "POST"; body?: string; headers?: Record<string, string> }
): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: "127.0.0.1",
      port: started.port,
      path,
      method: options.method,
      headers: options.headers
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode ?? 0,
          body
        });
      });
    });

    req.on("error", reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function closePlayground(started: StartedPlayground): Promise<void> {
  return new Promise((resolve, reject) => {
    started.server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
