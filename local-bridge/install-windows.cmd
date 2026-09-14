@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
if "%EXITCODE%"=="0" (
  echo QssedA Local Bridge setup completed.
) else (
  echo QssedA Local Bridge setup failed with exit code %EXITCODE%.
)
echo.
pause
exit /b %EXITCODE%
