param(
  [string]$TunnelToken = "",
  [string]$BridgeToken = ""
)

$ErrorActionPreference = "Stop"
$installRoot = Join-Path $env:LOCALAPPDATA "QssedA\CodexBridge"
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$runName = "QssedA Codex Bridge"

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node -or -not $node.Source) {
  throw "Node.js 18 or newer is required."
}
$nodeVersionText = (& $node.Source --version 2>$null)
$nodeMajor = 0
if ($nodeVersionText -match '^v(\d+)\.') { $nodeMajor = [int]$Matches[1] }
if ($nodeMajor -lt 18) {
  throw "Node.js 18 or newer is required. Found $nodeVersionText."
}

$codex = Get-Command codex.exe -ErrorAction SilentlyContinue
if (-not $codex -or -not $codex.Source) { $codex = Get-Command codex -ErrorAction SilentlyContinue }
if (-not $codex -or -not $codex.Source) {
  throw "OpenAI Codex CLI was not found. Install it first with: npm install -g @openai/codex"
}

$cloudflared = Get-Command cloudflared.exe -ErrorAction SilentlyContinue
if (-not $cloudflared -or -not $cloudflared.Source) { $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue }
if (-not $cloudflared -or -not $cloudflared.Source) {
  Write-Warning "cloudflared was not found. The local Bridge can still be installed, but gpt.qsseda.studio will stay offline from other devices until Cloudflare Tunnel is configured."
}

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "codex-server.mjs") -Destination (Join-Path $installRoot "codex-server.mjs") -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "start-codex-windows.ps1") -Destination (Join-Path $installRoot "start-codex-windows.ps1") -Force

if (-not $BridgeToken) {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  $BridgeToken = [Convert]::ToBase64String($bytes)
}

function Protect-LocalSecret([string]$Value, [string]$Path) {
  if (-not $Value) { return }
  $secure = ConvertTo-SecureString -String $Value -AsPlainText -Force
  $encrypted = ConvertFrom-SecureString -SecureString $secure
  Set-Content -LiteralPath $Path -Value $encrypted -Encoding ascii
}

Protect-LocalSecret $BridgeToken (Join-Path $installRoot "bridge-token.dpapi")
if ($TunnelToken) {
  Protect-LocalSecret $TunnelToken (Join-Path $installRoot "tunnel-token.dpapi")
}

$config = [ordered]@{
  schema = 2
  node = $node.Source
  codex = $codex.Source
  cloudflared = if ($cloudflared) { $cloudflared.Source } else { "" }
  installed_at = (Get-Date).ToUniversalTime().ToString("o")
}
$config | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installRoot "config.json") -Encoding utf8

New-Item -Path $runKey -Force | Out-Null
$launcher = Join-Path $installRoot "start-codex-windows.ps1"
$runCommand = "powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launcher`""
Set-ItemProperty -Path $runKey -Name $runName -Value $runCommand -Type String

& $launcher -InstallRoot $installRoot
if ($LASTEXITCODE -ne 0) {
  throw "QssedA Codex Bridge could not be started after installation."
}

Write-Host ""
Write-Host "QssedA Codex Bridge is installed for this Windows account." -ForegroundColor Green
Write-Host "Install root: $installRoot"
Write-Host "Codex: $($codex.Source)"
Write-Host "Local endpoint: http://127.0.0.1:32146"
Write-Host ""
Write-Host "Bridge shared token (save this once for the GPT Worker secret):" -ForegroundColor Yellow
Write-Host $BridgeToken
if (-not $TunnelToken) {
  Write-Host ""
  Write-Host "Cloudflare Tunnel is not configured yet. Re-run this installer with -TunnelToken after creating a remotely-managed tunnel." -ForegroundColor Yellow
}
