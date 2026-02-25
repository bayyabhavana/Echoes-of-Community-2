@echo off
echo ========================================
echo  Quick Start - Echoes of Community
echo ========================================
echo.
echo Starting servers...
start "Server" cmd /k "cd /d %~dp0 && node server/server.js"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Servers started!
echo - Backend: http://localhost:3001
echo - Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
echo Done! Press any key to exit...
pause >nul
