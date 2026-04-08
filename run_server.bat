@echo off
echo Starting Team Dashboard Local Server...
echo Access at: http://localhost:8000
echo.
echo To stop the server, close this window.
cd /d "%~dp0"
python -m http.server 8000
pause
