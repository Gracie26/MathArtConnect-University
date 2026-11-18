@echo off
title MathArt Connect - Presentation Mode
cd /d C:\Users\Grace\projects\MathArtConnect-University

rem The start logic (duplicate check, normal start, one cache-rebuild retry) is in start-presentation.ps1.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-presentation.ps1"

echo.
pause
