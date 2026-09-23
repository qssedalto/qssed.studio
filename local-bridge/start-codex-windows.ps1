param(
  [string]$InstallRoot = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$serviceUrl = "http://127.0.0.1:32146/health"
$configPath = Join-Path $InstallRoot "config.json"
$serverPath = Join-Path $InstallRoot "codex-server.mjs"
$pidPath = Join-Path $InstallRoot "codex-bridge.pid"
$tunnelPidPath = Join-Path $InstallRoot "cloudflared.pid"

function Unprotect-LocalSecret([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  $encrypted = Get-Content -LiteralPath $Path -Raw
  if (-not $encrypted) { return "" }
  $secure = ConvertTo-SecureString -String $encrypted.Trim()
  $credential = New-Object System.Management.Automation.PSCredential("qsseda", $secure)
  return $credential.GetNetworkCredential().Password
}

function Test-QssedACodexBridge {
  try {
    $health = Invoke-RestMethod -Uri $serviceUrl -Method Get -Headers @{ Origin = "https://gpt.qsseda.com" } -TimeoutSec 1
    return $health.service -eq "qsseda-codex-bridge" -and [int]$health.protocol -eq 1
  } catch {
    return $false
  }
}

if (-not (Test-Path -LiteralPath $serverPath)) {
  throw "AERTEX Bridge server is missing: $serverPath"
}

$config = $null
if (Test-Path -LiteralPath $configPath) {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

$nodePath = [string]$config.node
$codexPath = [string]$config.codex
$cloudflaredPath = [string]$config.cloudflared
if (-not $nodePath -or -not (Test-Path -LiteralPath $nodePath)) { throw "Node.js was not found. Reinstall AERTEX Bridge." }
if (-not $codexPath -or -not (Test-Path -LiteralPath $codexPath)) { throw "OpenAI Codex CLI was not found. Reinstall Codex CLI and AERTEX Bridge." }

$bridgeToken = Unprotect-LocalSecret (Join-Path $InstallRoot "bridge-token.dpapi")
$tunnelToken = Unprotect-LocalSecret (Join-Path $InstallRoot "tunnel-token.dpapi")

if (-not (Test-QssedACodexBridge)) {
  $env:QSSEDA_CODEX = $codexPath
  $env:QSSEDA_CODEX_BRIDGE_HOME = $InstallRoot
  $env:QSSEDA_CODEX_BRIDGE_TOKEN = $bridgeToken
  $process = Start-Process -FilePath $nodePath -ArgumentList @("`"$serverPath`"") -WorkingDirectory $InstallRoot -WindowStyle Hidden -PassThru
  Set-Content -LiteralPath $pidPath -Value $process.Id -Encoding ascii

  for ($attempt = 0; $attempt -lt 30; $attempt += 1) {
    Start-Sleep -Milliseconds 150
    if (Test-QssedACodexBridge) { break }
    if ($process.HasExited) { throw "AERTEX Bridge exited before becoming ready." }
  }
  if (-not (Test-QssedACodexBridge)) { throw "AERTEX Bridge did not become ready on 127.0.0.1:32146." }
}

if ($tunnelToken -and $cloudflaredPath -and (Test-Path -LiteralPath $cloudflaredPath)) {
  $existingTunnel = $null
  if (Test-Path -LiteralPath $tunnelPidPath) {
    $existingPid = [int](Get-Content -LiteralPath $tunnelPidPath -Raw)
    $existingTunnel = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  }
  if (-not $existingTunnel) {
    $env:TUNNEL_TOKEN = $tunnelToken
    $logPath = Join-Path $InstallRoot "cloudflared.log"
    $tunnel = Start-Process -FilePath $cloudflaredPath -ArgumentList @("tunnel","--loglevel","info","--logfile","`"$logPath`"","run") -WorkingDirectory $InstallRoot -WindowStyle Hidden -PassThru
    Set-Content -LiteralPath $tunnelPidPath -Value $tunnel.Id -Encoding ascii
  }
}

exit 0
