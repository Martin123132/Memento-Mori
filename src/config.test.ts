import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadConfig, writeDefaultConfig } from "./config.js";

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
