import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetPath = resolve(root, "promo/share-kit/social-card.svg");
const mode = process.argv.includes("--check") ? "check" : "write";

const width = 1200;
const height = 630;

const copy = {
  title: "Memento Mori Jester",
  eyebrow: "For AI agents with ambition",
  headline: ["A local court jester", "for AI coding agents."],
  detail: ["Reviews commands, plans, diffs, and final answers", "before the agent gets too pleased with itself."],
  command: "npx -y memento-mori-jester@latest start",
  footer: "Codex | Claude Code | MCP | hooks | CI"
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function text(value) {
  return escapeXml(value);
}

function renderSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${text(copy.title)} social preview card</title>
  <desc id="desc">${text(copy.detail.join(" "))}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#11100e"/>
      <stop offset="58%" stop-color="#171410"/>
      <stop offset="100%" stop-color="#211b14"/>
    </linearGradient>
    <radialGradient id="heat" cx="78%" cy="16%" r="70%">
      <stop offset="0%" stop-color="#d7a642" stop-opacity="0.36"/>
      <stop offset="42%" stop-color="#d64b3f" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#11100e" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#050403" flood-opacity="0.38"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#heat)"/>
  <g opacity="0.09">
    <path d="M0 90H1200M0 180H1200M0 270H1200M0 360H1200M0 450H1200M0 540H1200" stroke="#f2eadc" stroke-width="1"/>
    <path d="M100 0V630M200 0V630M300 0V630M400 0V630M500 0V630M600 0V630M700 0V630M800 0V630M900 0V630M1000 0V630M1100 0V630" stroke="#f2eadc" stroke-width="1"/>
  </g>
  <g transform="translate(875 74)" opacity="0.55">
    <circle cx="150" cy="150" r="145" fill="none" stroke="#d7a642" stroke-width="3" opacity="0.55"/>
    <circle cx="150" cy="150" r="95" fill="none" stroke="#d64b3f" stroke-width="3" opacity="0.36"/>
    <circle cx="150" cy="150" r="48" fill="none" stroke="#f2eadc" stroke-width="3" opacity="0.28"/>
  </g>
  <text x="-36" y="612" fill="#f2eadc" opacity="0.055" font-family="Georgia, serif" font-size="132" font-weight="900">remember you are shipping code</text>
  <g transform="translate(74 66)">
    <g transform="translate(0 0)">
      <circle cx="27" cy="27" r="27" fill="#f2eadc"/>
      <path d="M27 0A27 27 0 0 1 54 27H27Z" fill="#d64b3f"/>
      <path d="M27 27H54A27 27 0 0 1 13 50Z" fill="#d7a642"/>
      <path d="M27 0V27H0A27 27 0 0 1 27 0Z" fill="#f2eadc"/>
    </g>
    <text x="76" y="36" fill="#f2eadc" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="25" font-weight="800" letter-spacing="4">${text(copy.title.toUpperCase())}</text>
  </g>
  <g transform="translate(76 166)">
    <text x="0" y="0" fill="#d7a642" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="22" font-weight="700" letter-spacing="3">${text(copy.eyebrow.toUpperCase())}</text>
    <text x="0" y="76" fill="#f2eadc" font-family="Georgia, serif" font-size="72" font-weight="900">${text(copy.headline[0])}</text>
    <text x="0" y="146" fill="#f2eadc" font-family="Georgia, serif" font-size="72" font-weight="900">${text(copy.headline[1])}</text>
    <text x="0" y="202" fill="#d8cbb5" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="25">${text(copy.detail[0])}</text>
    <text x="0" y="238" fill="#d8cbb5" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="25">${text(copy.detail[1])}</text>
  </g>
  <g transform="translate(76 432)" filter="url(#soft-shadow)">
    <rect x="0" y="0" width="812" height="88" rx="18" fill="#1b1814" stroke="#d7a642" stroke-opacity="0.48" stroke-width="2"/>
    <text x="32" y="55" fill="#d7a642" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="28">$</text>
    <text x="64" y="55" fill="#f2eadc" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="28" font-weight="700">${text(copy.command)}</text>
  </g>
  <g transform="translate(76 546)">
    <rect x="0" y="-28" width="650" height="48" rx="24" fill="#d64b3f"/>
    <text x="28" y="3" fill="#fff3eb" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="18" font-weight="800" letter-spacing="1.5">${text(copy.footer.toUpperCase())}</text>
  </g>
</svg>
`;
}

const svg = renderSvg();

if (mode === "check") {
  const existing = await readFile(targetPath, "utf8");
  if (existing !== svg) {
    process.stderr.write("promo/share-kit/social-card.svg is stale. Run `npm run promo:card`.\n");
    process.exitCode = 1;
  }
} else {
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, svg, "utf8");
  process.stdout.write(`Wrote ${targetPath}\n`);
}
