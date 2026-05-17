param(
  [string]$PackageSpec = "memento-mori-jester@latest",
  [ValidateSet("npx", "global")]
  [string]$Mode = "npx"
)

$ErrorActionPreference = "Stop"

function Assert-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $InstallHint"
  }
}

Assert-Command "node" "Install Node.js 20 or newer, then run this script again."
Assert-Command "npm.cmd" "Install npm with Node.js, then run this script again."

$nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
if ($nodeMajor -lt 20) {
  throw "Node.js 20 or newer is required. Found: $(& node --version)"
}

if ($Mode -eq "global") {
  & npm.cmd install -g $PackageSpec
  & jester doctor
  & jester mcp-config --mode global
} else {
  & npx -y $PackageSpec doctor
  & npx -y $PackageSpec mcp-config --mode npx --package $PackageSpec
}
