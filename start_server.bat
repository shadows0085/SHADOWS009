@echo off
title SHADOW Studio Server
cd /d "%~dp0"
echo ============================================================
echo   Starting SHADOW Studio Local Server (Single-Port 3000)
echo ============================================================
echo.
node server.js
pause
