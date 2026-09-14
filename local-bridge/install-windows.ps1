param(
  [string]$XeLaTeXPath = ""
)

$ErrorActionPreference = "Stop"
$installRoot = Join-Path $env:LOCALAPPDATA "QssedA\LocalBridge"
$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$runName = "QssedA Local Bridge"

function Find-XeLaTeX {
  param([string]$Preferred)

  if ($Preferred -and (Test-Path -LiteralPath $Preferred)) {
    return (Resolve-Path -LiteralPath $Preferred).Path
  }

  $command = Get-Command xelatex.exe -ErrorAction SilentlyContinue
  if ($command -and $command.Source -and (Test-Path -LiteralPath $command.Source)) {
    return $command.Source
  }

  $roots = @(
    "D:\texlive",
    "C:\texlive",
    "E:\texlive",
    (Join-Path $env:USERPROFILE "texlive")
  ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

  foreach ($root in $roots) {
    $years = Get-ChildItem -LiteralPath $root -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($year in $years) {
      $candidate = Join-Path $year.FullName "bin\windows\xelatex.exe"
      if (Test-Path -LiteralPath $candidate) {
        return $candidate
      }
    }

    $direct = Join-Path $root "bin\windows\xelatex.exe"
    if (Test-Path -LiteralPath $direct) {
      return $direct
    }
  }

  return ""
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node -or -not $node.Source) {
  throw "Node.js 18+ is required for this pilot installer. Install Node.js, then run install-windows.cmd again."
}

$nodeVersionText = (& $node.Source --version 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $nodeVersionText) {
  throw "Node.js could not be executed."
}

$nodeMajor = 0
if ($nodeVersionText -match '^v(\d+)\.') {
  $nodeMajor = [int]$Matches[1]
}
if ($nodeMajor -lt 18) {
  throw "Node.js 18 or newer is required. Found $nodeVersionText."
}

$xelatex = Find-XeLaTeX -Preferred $XeLaTeXPath
if (-not $xelatex) {
  Write-Warning "XeLaTeX was not found automatically. The bridge will still install, but TeX status will remain unavailable until config.json is updated or the installer is rerun with -XeLaTeXPath."
}

New-Item -ItemType Directory -Force -Path $installRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "server.mjs") -Destination (Join-Path $installRoot "server.mjs") -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "start-windows.ps1") -Destination (Join-Path $installRoot "start-windows.ps1") -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "uninstall-windows.ps1") -Destination (Join-Path $installRoot "uninstall-windows.ps1") -Force

$config = [ordered]@{
  schema = 1
  node = $node.Source
  xelatex = $xelatex
  installed_at = (Get-Date).ToUniversalTime().ToString("o")
}
$config | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installRoot "config.json") -Encoding utf8

New-Item -Path $runKey -Force | Out-Null
$launcher = Join-Path $installRoot "start-windows.ps1"
$runCommand = "powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launcher`""
Set-ItemProperty -Path $runKey -Name $runName -Value $runCommand -Type String

& $launcher -InstallRoot $installRoot
if ($LASTEXITCODE -ne 0) {
  throw "QssedA Local Bridge could not be started after installation."
}

$health = $null
try {
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:32145/health" -Method Get -TimeoutSec 2
} catch {}
if (-not $health -or $health.service -ne "qsseda-local-bridge") {
  Write-Warning "Autostart was installed, but another local process may currently own port 32145. Restart Windows or close the old manual bridge and run start-windows.ps1 once."
}

Write-Host ""
Write-Host "QssedA Local Bridge is installed for this Windows account." -ForegroundColor Green
Write-Host "Install root: $installRoot"
Write-Host "Autostart: HKCU Run -> $runName"
Write-Host "Node: $($node.Source)"
Write-Host "XeLaTeX: $(if ($xelatex) { $xelatex } else { 'not configured' })"
Write-Host "You no longer need to start the bridge manually each time you open QssedA Studio."
