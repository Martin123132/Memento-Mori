#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const testFiles = await findTestFiles("dist");

if (testFiles.length === 0) {
  console.error("No compiled test files found in dist.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

process.exit(result.status ?? 1);

async function findTestFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return findTestFiles(path);
    }

    return entry.isFile() && entry.name.endsWith(".test.js") ? [path] : [];
  }));

  return files.flat().sort();
}
