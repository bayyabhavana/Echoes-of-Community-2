@echo off
echo ========================================
echo  Echoes of Community - Automated Start
echo ========================================
echo.
echo Starting authentication server...
start "Auth Server" cmd /k "cd /d %~dp0 && npm run server"
timeout /t 3 /nobreak >nul
echo.
echo Starting frontend development server...
start "Frontend Dev" cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo ========================================
echo  Both servers are starting...
echo  - Backend: http://localhost:3001
echo  - Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to run automated tests...
pause >nul
echo.
echo Running authentication tests...
npm run test:auth
echo.
pause
