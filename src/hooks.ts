import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import type { HookFailOn } from "./types.js";

export const hookNames = ["pre-commit", "pre-push"] as const;
export type HookName = (typeof hookNames)[number];

export interface HookInstallOptions {
  hook: HookName;
  commandPrefix: string;
  failOn: HookFailOn;
  force?: boolean;
  cwd?: string;
}

export interface HookResult {
  hook: HookName;
  path: string;
  changed: boolean;
  message: string;
}

const execFileAsync = promisify(execFile);
const marker = "memento-mori-jester managed hook";

export async function installHook(options: HookInstallOptions): Promise<HookResult> {
  const cwd = options.cwd ?? process.cwd();
  const path = await gitHookPath(options.hook, cwd);
  const existing = await readOptional(path);

  if (existing && !existing.includes(marker) && !options.force) {
    throw new Error(`Refusing to overwrite existing ${options.hook} hook at ${path}. Re-run with --force to replace it.`);
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, renderHook(options), "utf8");
  await chmod(path, 0o755);

  return {
    hook: options.hook,
    path,
    changed: true,
    message: `Installed ${options.hook} hook at ${path}.`
  };
}

export async function uninstallHook(hook: HookName, options: { cwd?: string; force?: boolean } = {}): Promise<HookResult> {
  const cwd = options.cwd ?? process.cwd();
  const path = await gitHookPath(hook, cwd);
  const existing = await readOptional(path);

  if (!existing) {
    return {
      hook,
      path,
      changed: false,
      message: `No ${hook} hook found at ${path}.`
    };
  }

  if (!existing.includes(marker) && !options.force) {
    throw new Error(`Refusing to remove non-jester ${hook} hook at ${path}. Re-run with --force to remove it anyway.`);
  }

  await unlink(path);

  return {
    hook,
    path,
    changed: true,
    message: `Removed ${hook} hook at ${path}.`
  };
}

export async function hookStatus(cwd: string = process.cwd()): Promise<HookResult[]> {
  return Promise.all(hookNames.map(async (hook) => {
    const path = await gitHookPath(hook, cwd);
    const existing = await readOptional(path);
    const managed = Boolean(existing?.includes(marker));

    return {
      hook,
      path,
      changed: false,
      message: existing ? managed ? "installed" : "occupied by another hook" : "not installed"
    };
  }));
}

export async function assertGitRepository(cwd: string = process.cwd()): Promise<void> {
  try {
    await execFileAsync("git", ["rev-parse", "--show-toplevel"], { cwd });
  } catch {
    throw new Error("This command must be run inside a git repository.");
  }
}

export function isHookName(value: string | undefined): value is HookName {
  return Boolean(value && hookNames.includes(value as HookName));
}

export function shellCommandPrefixForLocalCli(cliPath: string): string {
  return `node ${shellQuote(toShellPath(cliPath))}`;
}

export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

async function gitHookPath(hook: HookName, cwd: string): Promise<string> {
  await assertGitRepository(cwd);
  const { stdout } = await execFileAsync("git", ["rev-parse", "--git-path", `hooks/${hook}`], { cwd });
  return resolve(cwd, stdout.trim());
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return undefined;
  }
}

function renderHook(options: HookInstallOptions): string {
  if (options.hook === "pre-commit") {
    return renderPreCommitHook(options.commandPrefix, options.failOn);
  }

  return renderPrePushHook(options.commandPrefix, options.failOn);
}

function renderPreCommitHook(commandPrefix: string, failOn: HookFailOn): string {
  return `#!/bin/sh
# ${marker}
set -eu

diff_output="$(git diff --cached --binary --no-ext-diff)"
if [ -z "$diff_output" ]; then
  exit 0
fi

printf "%s\\n" "$diff_output" | ${commandPrefix} diff --fail-on ${failOn} --subject "staged changes"
`;
}

function renderPrePushHook(commandPrefix: string, failOn: HookFailOn): string {
  return `#!/bin/sh
# ${marker}
set -eu

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || true)"
if [ -n "$upstream" ]; then
  diff_range="$upstream..HEAD"
else
  diff_range="HEAD~1..HEAD"
fi

diff_output="$(git diff --binary --no-ext-diff "$diff_range" 2>/dev/null || git diff --binary --no-ext-diff HEAD 2>/dev/null || true)"
if [ -z "$diff_output" ]; then
  exit 0
fi

printf "%s\\n" "$diff_output" | ${commandPrefix} diff --fail-on ${failOn} --subject "unpushed changes"
`;
}

function toShellPath(path: string): string {
  return path.replace(/\\/g, "/");
}
