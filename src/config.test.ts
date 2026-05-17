import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadConfig, userConfigForPreset, validateConfig, writeDefaultConfig } from "./config.js";

test("loads jester.config.json from the working tree", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeFile(join(cwd, "jester.config.json"), JSON.stringify({
    tone: "professional",
    blockedCommands: ["deploy-prod"]
  }), "utf8");

  const loaded = await loadConfig({ cwd });

  assert.equal(loaded.config.tone, "professional");
  assert.deepEqual(loaded.config.blockedCommands, ["deploy-prod"]);
  assert.match(loaded.path ?? "", /jester\.config\.json$/);
});

test("writes a default config without overwriting by default", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  const path = await writeDefaultConfig({ cwd });

  await assert.rejects(() => writeDefaultConfig({ cwd }));
  assert.match(path, /jester\.config\.json$/);
});

test("builds node preset on top of default config", () => {
  const config = userConfigForPreset("node");

  assert.ok(config.blockedCommands?.includes("git reset --hard"));
  assert.ok(config.blockedCommands?.includes("npm unpublish"));
  assert.ok(config.customRules?.some((rule) => rule.id === "node-install-script-change"));
});

test("writes preset config", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeDefaultConfig({ cwd, preset: "security" });

  const loaded = await loadConfig({ cwd });

  assert.equal(loaded.config.riskTolerance, "low");
  assert.ok(loaded.config.customRules?.some((rule) => rule.id === "insecure-tls-disabled"));
});

test("validates a good config", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeDefaultConfig({ cwd, preset: "node" });

  const result = await validateConfig({ cwd });

  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test("reports invalid config issues", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeFile(join(cwd, "jester.config.json"), JSON.stringify({
    tone: "too_spicy",
    customRules: [
      {
        id: "",
        pattern: ""
      }
    ]
  }), "utf8");

  const result = await validateConfig({ cwd });

  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.includes("tone")));
  assert.ok(result.issues.some((issue) => issue.includes("customRules.0.id")));
});
