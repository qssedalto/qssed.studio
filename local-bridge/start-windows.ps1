# 初学者导读：Windows 下启动通用本机桥的包装脚本；优先使用 PowerShell 7，并把启动参数集中传给 Node 服务。
param(
  [string]$InstallRoot = $PSScriptRoot
)

$ErrorActionPreference = "Stop"
$serviceUrl = "http://127.0.0.1:32145/health"
$configPath = Join-Path $InstallRoot "config.json"
$serverPath = Join-Path $InstallRoot "server.mjs"
$pidPath = Join-Path $InstallRoot "bridge.pid"

function Test-QssedABridge {
  try {
    $health = Invoke-RestMethod -Uri $serviceUrl -Method Get -TimeoutSec 1
    return $health.service -eq "qsseda-local-bridge" -and [int]$health.protocol -eq 1
  } catch {
    return $false
  }
}

if (Test-QssedABridge) {
  exit 0
}

if (-not (Test-Path -LiteralPath $serverPath)) {
  throw "AERTEX Bridge server is missing: $serverPath"
}

$config = $null
if (Test-Path -LiteralPath $configPath) {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

$nodePath = [string]$config.node
if (-not $nodePath) {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  $nodePath = [string]$nodeCommand.Source
}
if (-not $nodePath -or -not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js was not found. Install Node.js 18+ and run the AERTEX Bridge installer again."
}

$xelatexPath = [string]$config.xelatex
if ($xelatexPath -and (Test-Path -LiteralPath $xelatexPath)) {
  $env:QSSEDA_XELATEX = $xelatexPath
}

$process = Start-Process -FilePath $nodePath -ArgumentList @("`"$serverPath`"") -WorkingDirectory $InstallRoot -WindowStyle Hidden -PassThru
Set-Content -LiteralPath $pidPath -Value $process.Id -Encoding ascii

for ($attempt = 0; $attempt -lt 15; $attempt += 1) {
  Start-Sleep -Milliseconds 150
  if (Test-QssedABridge) {
    exit 0
  }
  if ($process.HasExited) {
    throw "AERTEX Bridge exited before becoming ready."
  }
}

throw "AERTEX Bridge did not become ready on 127.0.0.1:32145."
