@echo off
rem Double-click to start MathArt Connect (web + Expo QR code). Extra args pass through, e.g. -Clear
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-mathart.ps1" %*
echo.
pause
