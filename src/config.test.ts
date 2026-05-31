import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { loadConfig, recommendConfigPreset, userConfigForPolicy, userConfigForPreset, validateConfig, writeDefaultConfig, writePolicyConfig } from "./config.js";

async function writeRepoFile(cwd: string, path: string, content: string = ""): Promise<void> {
  const fullPath = join(cwd, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

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

test("builds api preset on top of default config", () => {
  const config = userConfigForPreset("api");

  assert.equal(config.riskTolerance, "medium");
  assert.equal(config.hookFailOn, "block");
  assert.ok(config.blockedCommands?.includes("git reset --hard"));
  assert.ok(config.blockedCommands?.includes("prisma migrate reset --force"));
  assert.ok(config.sensitiveDomains?.includes("request validation"));
  assert.ok(config.customRules?.some((rule) => rule.id === "api-broad-cors"));
  assert.ok(config.customRules?.some((rule) => rule.id === "api-raw-sql-user-input"));
});

test("builds ai preset on top of default config", () => {
  const config = userConfigForPreset("ai");

  assert.equal(config.riskTolerance, "medium");
  assert.equal(config.hookFailOn, "block");
  assert.ok(config.blockedCommands?.includes("git reset --hard"));
  assert.ok(config.sensitiveDomains?.includes("system prompt"));
  assert.ok(config.sensitiveDomains?.includes("mcp"));
  assert.ok(config.customRules?.some((rule) => rule.id === "ai-public-provider-key"));
  assert.ok(config.customRules?.some((rule) => rule.id === "ai-model-output-execution"));
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
  const apiCwd = await mkdtemp(join(tmpdir(), "jester-api-config-"));
  const infraCwd = await mkdtemp(join(tmpdir(), "jester-infra-config-"));
  const aiCwd = await mkdtemp(join(tmpdir(), "jester-ai-config-"));

  await writeDefaultConfig({ cwd: webCwd, preset: "web" });
  await writeDefaultConfig({ cwd: apiCwd, preset: "api" });
  await writeDefaultConfig({ cwd: infraCwd, preset: "infra" });
  await writeDefaultConfig({ cwd: aiCwd, preset: "ai" });

  const web = await validateConfig({ cwd: webCwd });
  const api = await validateConfig({ cwd: apiCwd });
  const infra = await validateConfig({ cwd: infraCwd });
  const ai = await validateConfig({ cwd: aiCwd });

  assert.equal(web.ok, true);
  assert.ok(web.config?.customRules?.some((rule) => rule.id === "web-unsafe-html-injection"));
  assert.equal(api.ok, true);
  assert.ok(api.config?.customRules?.some((rule) => rule.id === "api-auth-bypass"));
  assert.equal(infra.ok, true);
  assert.ok(infra.config?.blockedCommands?.includes("kubectl delete"));
  assert.equal(ai.ok, true);
  assert.ok(ai.config?.customRules?.some((rule) => rule.id === "ai-prompt-injection-shape"));
});

test("recommends node preset from package markers", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-node-"));
  await writeRepoFile(cwd, "package.json", JSON.stringify({ scripts: { test: "node --test" } }));
  await writeRepoFile(cwd, "package-lock.json", "{}");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "node");
  assert.equal(recommendation.confidence, "high");
  assert.ok(recommendation.reasons.includes("Found package.json"));
  assert.ok(recommendation.detectedStacks.includes("Node.js"));
  assert.ok(recommendation.detectedStacks.includes("npm"));
});

test("recommends web preset from frontend markers", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-web-"));
  await writeRepoFile(cwd, "package.json", JSON.stringify({ dependencies: { vite: "^5.0.0", react: "^18.0.0" } }));
  await writeRepoFile(cwd, "vite.config.ts", "export default {};\n");
  await writeRepoFile(cwd, "src/App.tsx", "export function App() { return null; }\n");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "web");
  assert.ok(recommendation.reasons.includes("Found Vite config"));
  assert.ok(recommendation.detectedStacks.includes("Vite"));
  assert.ok(recommendation.detectedStacks.includes("React"));
});

test("recommends api preset from backend markers", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-api-"));
  await writeRepoFile(cwd, "openapi.yaml", "openapi: 3.1.0\n");
  await writeRepoFile(cwd, "prisma/schema.prisma", "datasource db {}\n");
  await writeRepoFile(cwd, "src/routes/users.ts", "export const route = true;\n");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "api");
  assert.ok(recommendation.reasons.includes("Found OpenAPI or Swagger spec"));
  assert.ok(recommendation.detectedStacks.includes("OpenAPI"));
  assert.ok(recommendation.detectedStacks.includes("Prisma"));
});

test("recommends api preset from Python API dependencies", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-fastapi-"));
  await writeRepoFile(cwd, "pyproject.toml", "[project]\ndependencies = [\"fastapi\", \"sqlalchemy\"]\n");
  await writeRepoFile(cwd, "app/main.py", "from fastapi import FastAPI\n");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "api");
  assert.ok(recommendation.detectedStacks.includes("FastAPI"));
  assert.ok(recommendation.detectedStacks.includes("SQLAlchemy"));
  assert.ok(recommendation.candidates.some((candidate) => candidate.preset === "python"));
});

test("recommends ai preset from MCP prompt and eval markers", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-ai-"));
  await writeRepoFile(cwd, "mcp.json", "{}\n");
  await writeRepoFile(cwd, "requirements.txt", "openai\nanthropic\n");
  await writeRepoFile(cwd, "prompts/system.md", "You are helpful.\n");
  await writeRepoFile(cwd, "evals/smoke.yml", "cases: []\n");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "ai");
  assert.ok(recommendation.reasons.includes("Found MCP-related files"));
  assert.ok(recommendation.detectedStacks.includes("MCP"));
  assert.ok(recommendation.detectedStacks.includes("OpenAI SDK"));
  assert.ok(recommendation.detectedStacks.includes("Anthropic SDK"));
  assert.ok(recommendation.detectedStacks.includes("Prompt/eval workflow"));
});

test("recommends infra preset from deployment markers", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-infra-"));
  await writeRepoFile(cwd, "main.tf", "resource \"example\" \"demo\" {}\n");
  await writeRepoFile(cwd, "k8s/deployment.yaml", "kind: Deployment\n");
  await writeRepoFile(cwd, "Dockerfile", "FROM node:20\n");

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "infra");
  assert.ok(recommendation.reasons.includes("Found Terraform files"));
  assert.ok(recommendation.detectedStacks.includes("Terraform"));
  assert.ok(recommendation.detectedStacks.includes("Kubernetes"));
  assert.ok(recommendation.detectedStacks.includes("Docker"));
});

test("falls back to default preset when no markers exist", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-empty-"));

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "default");
  assert.equal(recommendation.confidence, "low");
  assert.deepEqual(recommendation.reasons, ["No strong stack markers found."]);
  assert.deepEqual(recommendation.detectedStacks, []);
});

test("reports existing config path with advisory recommendation", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "jester-recommend-config-"));
  await writeRepoFile(cwd, "package.json", "{}\n");
  await writeDefaultConfig({ cwd, preset: "web" });

  const recommendation = await recommendConfigPreset({ cwd });

  assert.equal(recommendation.recommendedPreset, "node");
  assert.match(recommendation.configPath ?? "", /jester\.config\.json$/);
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

test("preset example configs load and validate", async () => {
  const exampleConfigs = [
    "examples/presets/nextjs/jester.config.json",
    "examples/presets/vite-react/jester.config.json",
    "examples/presets/express-api/jester.config.json",
    "examples/presets/fastapi/jester.config.json",
    "examples/presets/terraform-k8s/jester.config.json",
    "examples/presets/ai-mcp/jester.config.json"
  ];

  for (const configPath of exampleConfigs) {
    const result = await validateConfig({ configPath });

    assert.equal(result.ok, true, `${configPath}: ${result.issues.join("; ")}`);
    assert.ok(result.config?.customRules?.length, `${configPath} should include custom rules`);
  }
});

test("preset example index links to real packs", async () => {
  const index = await readFile("examples/presets/README.md", "utf8");
  const packPaths = [
    "examples/presets/nextjs/README.md",
    "examples/presets/vite-react/README.md",
    "examples/presets/express-api/README.md",
    "examples/presets/fastapi/README.md",
    "examples/presets/terraform-k8s/README.md",
    "examples/presets/ai-mcp/README.md"
  ];

  for (const packPath of packPaths) {
    const packName = packPath.split("/").at(-2) ?? "";
    const readme = await readFile(packPath, "utf8");

    assert.match(index, new RegExp(`\\(${packName}\\)`));
    assert.match(readme, /bootstrap --preset/);
    assert.match(readme, /config recommend/);
  }
});

test("framework CI examples use the current action shape", async () => {
  const index = await readFile("examples/ci/README.md", "utf8");
  const workflowPaths = [
    "examples/ci/nextjs.yml",
    "examples/ci/vite-react.yml",
    "examples/ci/express-api.yml",
    "examples/ci/fastapi.yml",
    "examples/ci/terraform-k8s.yml",
    "examples/ci/ai-mcp.yml"
  ];

  for (const workflowPath of workflowPaths) {
    const fileName = workflowPath.split("/").at(-1) ?? "";
    const workflow = await readFile(workflowPath, "utf8");

    assert.match(index, new RegExp(`\\(${fileName}\\)`));
    assert.match(workflow, /actions\/checkout@v6/);
    assert.match(workflow, /Martin123132\/Memento-Mori@main/);
    assert.match(workflow, /format: sarif/);
    assert.match(workflow, /output-file: jester\.sarif/);
    assert.match(workflow, /summary: true/);
    assert.match(workflow, /github\/codeql-action\/upload-sarif@v3/);
    assert.doesNotMatch(workflow, /actions\/checkout@v4|actions\/setup-node@v4|node-version: 20/);
  }

  const infra = await readFile("examples/ci/terraform-k8s.yml", "utf8");

  assert.match(infra, /fail-on: caution/);
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
