@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
set EXITCODE=%ERRORLEVEL%
echo.
if "%EXITCODE%"=="0" (
  echo AERTEX Bridge setup completed.
) else (
  echo AERTEX Bridge setup failed with exit code %EXITCODE%.
)
echo.
pause
exit /b %EXITCODE%
