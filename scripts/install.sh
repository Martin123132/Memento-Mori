#!/usr/bin/env bash
set -euo pipefail

PACKAGE_SPEC="${PACKAGE_SPEC:-memento-mori-jester@latest}"
MODE="${MODE:-npx}"

if ! command -v node >/dev/null 2>&1; then
  echo "node was not found. Install Node.js 20 or newer, then run this script again." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Install npm with Node.js, then run this script again." >&2
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20 or newer is required. Found: $(node --version)" >&2
  exit 1
fi

if [ "$MODE" = "global" ]; then
  npm install -g "$PACKAGE_SPEC"
  jester doctor
  jester mcp-config --mode global
else
  npx -y "$PACKAGE_SPEC" doctor
  npx -y "$PACKAGE_SPEC" mcp-config --mode npx --package "$PACKAGE_SPEC"
fi
