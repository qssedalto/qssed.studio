param(
  [string]$InstallRoot = (Join-Path $env:LOCALAPPDATA "QssedA\LocalBridge")
)

$ErrorActionPreference = "Stop"
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$runName = "AERTEX Bridge"
$pidPath = Join-Path $InstallRoot "bridge.pid"
$serverPath = Join-Path $InstallRoot "server.mjs"

try {
  Remove-ItemProperty -Path $runKey -Name $runName -ErrorAction SilentlyContinue
} catch {}

if (Test-Path -LiteralPath $pidPath) {
  $pidText = (Get-Content -LiteralPath $pidPath -Raw -ErrorAction SilentlyContinue).Trim()
  $bridgePid = 0
  if ([int]::TryParse($pidText, [ref]$bridgePid) -and $bridgePid -gt 0) {
    try {
      $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$bridgePid" -ErrorAction SilentlyContinue
      $commandLine = [string]$processInfo.CommandLine
      if ($commandLine -and $commandLine.IndexOf($serverPath, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
        Stop-Process -Id $bridgePid -Force -ErrorAction SilentlyContinue
      }
    } catch {}
  }
}

try {
  Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
} catch {}

Write-Host "AERTEX Bridge autostart has been removed for this Windows account." -ForegroundColor Green
Write-Host "Installed files remain at $InstallRoot so they can be inspected or removed manually."
