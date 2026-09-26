@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js غير مثبت. ثبته أولاً من https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :error
)
echo Building Windows Installer (.exe) only...
call npm run dist
if errorlevel 1 goto :error
echo.
echo تم إنشاء نسخة التثبيت داخل مجلد dist
pause
exit /b 0
:error
echo حدث خطأ أثناء البناء.
pause
exit /b 1
