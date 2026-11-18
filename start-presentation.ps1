# MathArt Connect - presentation start (run by start-presentation.cmd and the VS Code folder-open task).
#
#   1. If this project's Expo server is already running on port 8081, say so and stop (no duplicate).
#   2. If a Metro cache file is damaged (power cut), start once with a cache rebuild:  expo start --lan -c
#      Otherwise start normally:                                                      expo start --lan
#   3. If a normal start stops before Metro is ready, and its output shows a Metro cache error
#      ("Unable to deserialize cloned data", "Error while reading cache", metro-file-map), retry ONCE
#      with -c. Nothing is remembered, so the next launch is a normal start again.
#
# No expo-doctor, npm install, dependency or native checks. The full checks stay in start-mathart.ps1.

$ErrorActionPreference = 'Continue'
$ProjectDir = $PSScriptRoot
Set-Location -LiteralPath $ProjectDir
$Port = 8081
$Slug = 'mathart-connect'

function Say($msg, $color = 'Cyan') { Write-Host $msg -ForegroundColor $color }

# --- 1. Already running? -------------------------------------------------------
# Metro answers /status without a text content type, so PowerShell returns bytes: decode them first.
function Get-Text($response) {
  if ($response.Content -is [byte[]]) { return [System.Text.Encoding]::UTF8.GetString($response.Content) }
  return [string]$response.Content
}

function Get-ServerState {
  try {
    $status = Invoke-WebRequest -Uri "http://localhost:$Port/status" -UseBasicParsing -TimeoutSec 2
    if ((Get-Text $status) -notmatch 'packager-status:running') { return 'free' }
  } catch { return 'free' }
  # Metro answers on this port. Ask for the Expo manifest to see which project it serves.
  try {
    $manifest = Invoke-WebRequest -Uri "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 5 `
      -Headers @{ 'expo-platform' = 'ios'; 'Accept' = 'application/expo+json,application/json' }
    $text = Get-Text $manifest
    if ($text -match "`"slug`"\s*:\s*`"$Slug`"") { return 'ours' }
    if ($text -match '"slug"') { return 'other' }
  } catch {}
  # Metro is running but its project could not be read: assume it is this one rather than start a duplicate.
  return 'ours'
}

$state = Get-ServerState
if ($state -eq 'ours') {
  Say "MathArt Connect is already running on port $Port - not starting a second server." 'Green'
  Say 'The QR code is in the terminal where it was first started. Web: http://localhost:8081' 'Green'
  exit 0
}
if ($state -eq 'other') {
  Say "Another Expo project is using port $Port. Expo will offer a different port for MathArt Connect." 'Yellow'
}

# --- 2. Damaged Metro cache? ---------------------------------------------------
$LogDir = Join-Path $ProjectDir '.expo'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir 'presentation-start.log'
$Hook = (Join-Path $ProjectDir 'scripts\presentation-output-log.js') -replace '\\', '/'

& node (Join-Path $ProjectDir 'scripts\check-metro-cache.js')
$damaged = ($LASTEXITCODE -eq 1)

function Start-Expo([bool]$rebuild) {
  Remove-Item -LiteralPath $LogFile -Force -ErrorAction SilentlyContinue
  $env:MATHART_PRESENTATION_LOG = $LogFile
  $savedNodeOptions = $env:NODE_OPTIONS
  $env:NODE_OPTIONS = ("$savedNodeOptions --require=$Hook").Trim()
  try {
    # Start-Process -NoNewWindow gives Expo this console directly, so it stays interactive (QR code,
    # r / w / a keys). Capturing its output in PowerShell would make it non-interactive.
    $expoArgs = @('expo', 'start', '--lan')
    if ($rebuild) { $expoArgs += '-c' }
    $process = Start-Process -FilePath 'npx.cmd' -ArgumentList $expoArgs -NoNewWindow -Wait -PassThru
    return $process.ExitCode
  } finally {
    $env:NODE_OPTIONS = $savedNodeOptions
    Remove-Item Env:\MATHART_PRESENTATION_LOG -ErrorAction SilentlyContinue
  }
}

function Read-Log {
  if (Test-Path -LiteralPath $LogFile) { return [System.IO.File]::ReadAllText($LogFile) }
  return ''
}

if ($damaged) {
  Say 'A Metro cache file is damaged - starting once with a cache rebuild (expo start --lan -c).' 'Yellow'
  Say 'The next launch will be a normal start again.' 'Yellow'
  Write-Host ''
  $code = Start-Expo $true
  exit $code
}

Say 'Starting MathArt Connect in presentation mode (expo start --lan)...'
Write-Host ''
$code = Start-Expo $false

# --- 3. One retry if startup stopped because of a Metro cache error ------------------------------
$log = Read-Log
$reachedReady = $log -match 'Logs for your project will appear|Waiting on '
$cacheError = $log -match 'Unable to deserialize cloned data|Error while reading cache|metro-file-map[^\r\n]*cache'
if ($code -ne 0 -and -not $reachedReady -and $cacheError) {
  Write-Host ''
  Say 'Metro stopped during startup because of a damaged cache.' 'Yellow'
  Say 'Retrying once with a cache rebuild (expo start --lan -c). The next launch will be a normal start.' 'Yellow'
  Write-Host ''
  $code = Start-Expo $true
} elseif ($code -ne 0 -and -not $reachedReady) {
  Write-Host ''
  Say "Expo stopped during startup (exit code $code). This was not a Metro cache error, so no rebuild was tried." 'Yellow'
  Say "Its output is saved in $LogFile" 'Yellow'
}
exit $code
