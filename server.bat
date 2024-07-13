@REM @echo off
@REM python -m http.server 8000
@REM pause

@echo off
start "" /b python -m http.server 8000
timeout /t 1 /nobreak >nul
start http://localhost:8000
pause
