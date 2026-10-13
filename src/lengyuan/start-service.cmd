@echo off
setlocal
cd /d "%~dp0cold-process-monitor"
where node >nul 2>nul
if not errorlevel 1 goto run
if exist "%ProgramFiles%\nodejs\node.exe" (
  "%ProgramFiles%\nodejs\node.exe" server.mjs
  goto end
)
echo Node.js 18 or newer is required for the local data service.
echo For offline preview, open the HTML file in this folder.
pause
exit /b 1
:run
echo Open http://127.0.0.1:8812 in your browser.
echo Close this window or press Ctrl+C to stop the service.
node server.mjs
:end
pause
