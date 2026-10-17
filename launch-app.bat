@echo off
title Y Master Editor (Live Reload Mode)
echo ====================================================
echo Starting Y Master Editor Desktop with Instant Reload...
echo ====================================================
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
exit
