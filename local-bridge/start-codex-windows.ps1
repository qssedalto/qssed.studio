param(
  [string]$InstallRoot = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$serviceUrl = "http://127.0.0.1:32146/health"
$configPath = Join-Path $InstallRoot "config.json"
$serverPath = Join-Path $InstallRoot "codex-server.mjs"
$pidPath = Join-Path $InstallRoot "codex-bridge.pid"

function Test-QssedACodexBridge {
  try {
    $health = Invoke-RestMethod -Uri $serviceUrl -Method Get -TimeoutSec 1
    return $health.service -eq "qsseda-codex-bridge" -and [int]$health.protocol -eq 1
  } catch {
    return $false
  }
}

if (Test-QssedACodexBridge) { exit 0 }

if (-not (Test-Path -LiteralPath $serverPath)) {
  throw "QssedA Codex Bridge server is missing: $serverPath"
}

$config = $null
if (Test-Path -LiteralPath $configPath) {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

$nodePath = [string]$config.node
$codexPath = [string]$config.codex
if (-not $nodePath -or -not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js was not found. Reinstall QssedA Codex Bridge."
}
if (-not $codexPath -or -not (Test-Path -LiteralPath $codexPath)) {
  throw "OpenAI Codex CLI was not found. Reinstall Codex CLI and QssedA Codex Bridge."
}

$env:QSSEDA_CODEX = $codexPath
$env:QSSEDA_CODEX_BRIDGE_HOME = $InstallRoot

$process = Start-Process -FilePath $nodePath -ArgumentList @("`"$serverPath`"") -WorkingDirectory $InstallRoot -WindowStyle Hidden -PassThru
Set-Content -LiteralPath $pidPath -Value $process.Id -Encoding ascii

for ($attempt = 0; $attempt -lt 20; $attempt += 1) {
  Start-Sleep -Milliseconds 150
  if (Test-QssedACodexBridge) { exit 0 }
  if ($process.HasExited) {
    throw "QssedA Codex Bridge exited before becoming ready."
  }
}

throw "QssedA Codex Bridge did not become ready on 127.0.0.1:32146."
