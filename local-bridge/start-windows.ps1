<#
【初学者导读】
文件：local-bridge/start-windows.ps1
AERTEX 本地桥接组件：连接网页与用户电脑上的本地能力。
阅读顺序：先看参数和环境检查，再看文件/注册表/进程副作用，最后看回滚或卸载逻辑。
修改注意：PowerShell 脚本会直接改变用户电脑；路径、权限、编码和重复执行必须保持安全且幂等。
#>
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
