import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadConfig, userConfigForPolicy, userConfigForPreset, validateConfig, writeDefaultConfig, writePolicyConfig } from "./config.js";

test("loads jester.config.json from the working tree", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeFile(join(cwd, "jester.config.json"), JSON.stringify({
    tone: "professional",
    blockedCommands: ["deploy-prod"],
    disabledRules: ["risky-domain"]
  }), "utf8");

  const loaded = await loadConfig({ cwd });

  assert.equal(loaded.config.tone, "professional");
  assert.deepEqual(loaded.config.blockedCommands, ["deploy-prod"]);
  assert.deepEqual(loaded.config.disabledRules, ["risky-domain"]);
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
  assert.deepEqual(config.disabledRules, []);
  assert.ok(config.customRules?.some((rule) => rule.id === "node-install-script-change"));
});

test("builds web preset on top of default config", () => {
  const config = userConfigForPreset("web");

  assert.ok(config.blockedCommands?.includes("git reset --hard"));
  assert.equal(config.hookFailOn, "block");
  assert.ok(config.sensitiveDomains?.includes("browser storage"));
  assert.ok(config.customRules?.some((rule) => rule.id === "web-public-secret-name"));
  assert.ok(config.customRules?.some((rule) => rule.id === "web-open-redirect-shape"));
});

test("builds infra preset with cautious hooks", () => {
  const config = userConfigForPreset("infra");

  assert.equal(config.riskTolerance, "low");
  assert.equal(config.hookFailOn, "caution");
  assert.ok(config.blockedCommands?.includes("terraform destroy"));
  assert.ok(config.blockedCommands?.includes("docker system prune -a"));
  assert.ok(config.customRules?.some((rule) => rule.id === "infra-production-change"));
  assert.ok(config.customRules?.some((rule) => rule.id === "infra-public-exposure"));
});

test("writes preset config", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-config-"));
  await writeDefaultConfig({ cwd, preset: "security" });

  const loaded = await loadConfig({ cwd });

  assert.equal(loaded.config.riskTolerance, "low");
  assert.ok(loaded.config.customRules?.some((rule) => rule.id === "insecure-tls-disabled"));
});

test("writes web and infra preset configs", async () => {
  const webCwd = await mkdtemp(join(tmpdir(), "jester-web-config-"));
  const infraCwd = await mkdtemp(join(tmpdir(), "jester-infra-config-"));

  await writeDefaultConfig({ cwd: webCwd, preset: "web" });
  await writeDefaultConfig({ cwd: infraCwd, preset: "infra" });

  const web = await validateConfig({ cwd: webCwd });
  const infra = await validateConfig({ cwd: infraCwd });

  assert.equal(web.ok, true);
  assert.ok(web.config?.customRules?.some((rule) => rule.id === "web-unsafe-html-injection"));
  assert.equal(infra.ok, true);
  assert.ok(infra.config?.blockedCommands?.includes("kubectl delete"));
});

test("builds strict policy on top of security defaults", () => {
  const config = userConfigForPolicy("strict");

  assert.equal(config.riskTolerance, "low");
  assert.equal(config.hookFailOn, "caution");
  assert.ok(config.blockedCommands?.includes("docker system prune -a"));
  assert.ok(config.customRules?.some((rule) => rule.id === "policy-secret-added"));
  assert.ok(config.customRules?.some((rule) => rule.id === "insecure-tls-disabled"));
});

test("writes policy config", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-policy-"));
  await writePolicyConfig({ cwd, level: "team" });

  const loaded = await loadConfig({ cwd });

  assert.equal(loaded.config.hookFailOn, "caution");
  assert.ok(loaded.config.customRules?.some((rule) => rule.id === "policy-production-deploy"));
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
