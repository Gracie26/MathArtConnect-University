# Start MathArt Connect for local development (web + Expo Go QR code).
#
# Usage (from the project folder):
#   .\start-mathart.cmd                  double-click, or run from any terminal
#   .\start-mathart.ps1 -Clear           force a Metro cache clear
#   .\start-mathart.ps1 -SkipDoctor      skip the expo-doctor health check
#   .\start-mathart.ps1 -NoBrowser       don't open the web app automatically
#
# What it does:
#   1. Installs dependencies if node_modules is missing.
#   2. Checks that the Windows native build tools (lightningcss, noxcturnal) load.
#   3. Runs expo-doctor (warns only; never blocks startup).
#   4. Starts Expo on the LAN so the QR code works for Expo Go on a phone.
#      The Metro cache is cleared (-c) only when dependencies changed since the
#      last start, or when -Clear is passed.
#   5. Waits until Metro reports it is running, then opens the web app.

[CmdletBinding()]
param(
  [switch]$Clear,
  [switch]$SkipDoctor,
  [switch]$NoBrowser,
  [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'
$ProjectDir = 'C:\Users\Grace\projects\MathArtConnect-University'
if (-not (Test-Path (Join-Path $ProjectDir 'package.json'))) { $ProjectDir = $PSScriptRoot }
Set-Location $ProjectDir
$Host.UI.RawUI.WindowTitle = 'MathArt Connect - Expo'

# Keep a record of each start (overwritten every time) so a failed start can be diagnosed afterwards.
$LogFile = Join-Path $ProjectDir '.expo\start-mathart.log'
New-Item -ItemType Directory -Force (Split-Path $LogFile) | Out-Null
try { Start-Transcript -Path $LogFile -Force | Out-Null } catch {}
trap {
  Write-Host "`n    ! Start failed: $_" -ForegroundColor Red
  Write-Host "    ! Details were saved to $LogFile" -ForegroundColor Yellow
  break
}

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "    ! $msg" -ForegroundColor Yellow }
function Write-Ok($msg) { Write-Host "    $msg" -ForegroundColor Green }

$WebUrl = "http://localhost:$Port"
$StatusUrl = "$WebUrl/status"

function Test-MetroRunning {
  try {
    $r = Invoke-WebRequest -Uri $StatusUrl -UseBasicParsing -TimeoutSec 2
    return ($r.Content -match 'packager-status:running')
  } catch { return $false }
}

# --- Already running? Don't start a second server. ---------------------------
if (Test-MetroRunning) {
  Write-Step "MathArt Connect is already running on port $Port."
  Write-Ok "The QR code is in the terminal window where it was started."
  if (-not $NoBrowser) { Start-Process $WebUrl; Write-Ok "Opened $WebUrl" }
  return
}

# --- 1. Dependencies ----------------------------------------------------------
$justInstalled = $false
if (-not (Test-Path 'node_modules\.package-lock.json')) {
  Write-Step 'node_modules is missing or incomplete - installing dependencies (this can take a few minutes)...'
  & npm.cmd install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'npm install failed - see the output above.' }
  $justInstalled = $true
} else {
  Write-Step 'Dependencies found.'
}

# --- 2. Native binary sanity check --------------------------------------------
# A previous power cut left truncated .node files that broke bundling. Catch that early.
Write-Step 'Checking native build tools...'
& node -e "require('lightningcss').transform({filename:'a.css',code:Buffer.from('a{}')}); require('noxcturnal');"
if ($LASTEXITCODE -ne 0) {
  Write-Warn 'A native build tool failed to load - node_modules may be corrupted.'
  Write-Warn 'Fix: close this window, then run:  npm.cmd cache verify ; npm.cmd ci'
  throw 'Native dependency check failed.'
}
Write-Ok 'lightningcss and noxcturnal OK.'

# --- 3. expo-doctor (informational) -------------------------------------------
if (-not $SkipDoctor) {
  Write-Step 'Running expo-doctor...'
  & npx.cmd expo-doctor
  if ($LASTEXITCODE -ne 0) { Write-Warn 'expo-doctor reported issues (see above). Starting anyway.' }
}

# --- 4. Decide whether to clear the Metro cache --------------------------------
$stampFile = '.expo\mathart-start-lock.sha256'
$lockHash = (Get-FileHash 'package-lock.json' -Algorithm SHA256).Hash
$lastHash = if (Test-Path $stampFile) { (Get-Content $stampFile -Raw).Trim() } else { '' }
$clearCache = $Clear -or $justInstalled -or ($lockHash -ne $lastHash)
New-Item -ItemType Directory -Force '.expo' | Out-Null
Set-Content -Path $stampFile -Value $lockHash -Encoding ascii

$expoArgs = @('expo', 'start', '--lan', '--port', "$Port")
if ($clearCache) {
  $expoArgs += '-c'
  Write-Step 'Dependencies changed since last start - clearing the Metro cache.'
}

# --- 5. Open the browser once Metro is actually ready --------------------------
$browserJob = $null
if (-not $NoBrowser) {
  $browserJob = Start-Job -ArgumentList $StatusUrl, $WebUrl -ScriptBlock {
    param($statusUrl, $webUrl)
    $deadline = (Get-Date).AddMinutes(5)
    while ((Get-Date) -lt $deadline) {
      try {
        $r = Invoke-WebRequest -Uri $statusUrl -UseBasicParsing -TimeoutSec 2
        if ($r.Content -match 'packager-status:running') { Start-Process $webUrl; return }
      } catch {}
      Start-Sleep -Seconds 2
    }
  }
}

Write-Step "Starting Expo: npx.cmd $($expoArgs -join ' ')"
Write-Ok "Web:   $WebUrl  (opens automatically when ready)"
Write-Ok 'Phone: scan the QR code below with the iPhone Camera app (Expo Go must be installed;'
Write-Ok '       phone and PC must be on the same Wi-Fi). Press Ctrl+C to stop the server.'
Write-Host ''

try {
  & npx.cmd @expoArgs
} finally {
  if ($browserJob) { Stop-Job $browserJob -ErrorAction SilentlyContinue; Remove-Job $browserJob -Force -ErrorAction SilentlyContinue }
  try { Stop-Transcript | Out-Null } catch {}
}
