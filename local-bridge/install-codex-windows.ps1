param()

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
if (-not $codex -or -not $codex.Source) {
  $codex = Get-Command codex -ErrorAction SilentlyContinue
}
if (-not $codex -or -not $codex.Source) {
  throw "OpenAI Codex CLI was not found. Install it first with: npm install -g @openai/codex"
}

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "codex-server.mjs") -Destination (Join-Path $installRoot "codex-server.mjs") -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "start-codex-windows.ps1") -Destination (Join-Path $installRoot "start-codex-windows.ps1") -Force

$config = [ordered]@{
  schema = 1
  node = $node.Source
  codex = $codex.Source
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
Write-Host "Open https://gpt.qsseda.studio and connect your ChatGPT account there."
