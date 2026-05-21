import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetPath = resolve(root, "docs/demo-terminal.svg");
const mode = process.argv.includes("--check") ? "check" : "write";

const lines = [
  { text: "$ npx -y memento-mori-jester@latest doctor", kind: "command" },
  { text: "Memento Mori Jester doctor", kind: "muted" },
  { text: "PASS node-version: Node 24; required >=20.", kind: "pass" },
  { text: "PASS review-engine: Dangerous git command is blocked.", kind: "pass" },
  { text: "The fool is fit for court.", kind: "plain" },
  { text: "", kind: "plain" },
  { text: "$ npx -y memento-mori-jester@latest command \"git reset --hard\"", kind: "command" },
  { text: "Jester verdict: BLOCK (100/100)", kind: "block" },
  { text: "[S5] Destructive git operation: can discard local work.", kind: "plain" },
  { text: "Check: inspect git status, then stash or back up first.", kind: "suggestion" },
  { text: "", kind: "plain" },
  { text: "$ npx -y memento-mori-jester@latest plan \"I will just refactor auth and ship it\"", kind: "command" },
  { text: "Jester verdict: CAUTION (40/100)", kind: "caution" },
  { text: "[S2] Confidence theater: \"just\" is doing too much work.", kind: "plain" },
  { text: "[S2] No verification step: name the check before the crown goes on.", kind: "plain" },
  { text: "", kind: "plain" },
  { text: "$ npx -y memento-mori-jester@latest config presets", kind: "command" },
  { text: "default   node   python   web   api   infra   ai   security", kind: "accent" },
  { text: "", kind: "plain" },
  { text: "$ npx -y memento-mori-jester@latest mcp-config --mode npx", kind: "command" },
  { text: "{", kind: "json" },
  { text: "  \"mcpServers\": {", kind: "json" },
  { text: "    \"memento-mori-jester\": {", kind: "json" },
  { text: "      \"command\": \"npx\",", kind: "json" },
  { text: "      \"args\": [\"-y\", \"memento-mori-jester@latest\", \"mcp-server\"]", kind: "json" },
  { text: "    }", kind: "json" },
  { text: "  }", kind: "json" },
  { text: "}", kind: "json" }
];

const styleByKind = {
  accent: "fill:#7dd3fc",
  block: "fill:#ff6b6b;font-weight:700",
  caution: "fill:#facc15;font-weight:700",
  command: "fill:#f8fafc;font-weight:700",
  json: "fill:#c4b5fd",
  muted: "fill:#94a3b8",
  pass: "fill:#86efac",
  plain: "fill:#dbeafe",
  suggestion: "fill:#fef3c7"
};

const width = 1120;
const paddingX = 34;
const chromeHeight = 54;
const lineHeight = 24;
const contentTop = 88;
const height = contentTop + lines.length * lineHeight + 34;

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function renderLine(line, index) {
  const y = contentTop + index * lineHeight;
  const style = styleByKind[line.kind] ?? styleByKind.plain;
  return `  <text x="${paddingX}" y="${y}" style="${style}">${escapeXml(line.text)}</text>`;
}

function renderSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Memento Mori Jester terminal demo</title>
  <desc id="desc">A terminal-style demo showing doctor, command review, plan review, config presets, and MCP setup.</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="62%" stop-color="#172033"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="108%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#020617" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="18" fill="url(#bg)" filter="url(#shadow)"/>
  <rect x="18" y="18" width="${width - 36}" height="${chromeHeight}" rx="18" fill="#0b1120"/>
  <rect x="18" y="${18 + chromeHeight - 18}" width="${width - 36}" height="18" fill="#0b1120"/>
  <circle cx="48" cy="45" r="7" fill="#ff5f57"/>
  <circle cx="72" cy="45" r="7" fill="#febc2e"/>
  <circle cx="96" cy="45" r="7" fill="#28c840"/>
  <text x="132" y="50" style="fill:#94a3b8;font:600 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">memento-mori-jester@latest</text>
  <g style="font:15px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
${lines.map(renderLine).join("\n")}
  </g>
</svg>
`;
}

const svg = renderSvg();

if (mode === "check") {
  const existing = await readFile(targetPath, "utf8");
  if (existing !== svg) {
    process.stderr.write("docs/demo-terminal.svg is stale. Run `npm run demo:svg`.\n");
    process.exitCode = 1;
  }
} else {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, svg, "utf8");
  process.stdout.write(`Wrote ${targetPath}\n`);
}
