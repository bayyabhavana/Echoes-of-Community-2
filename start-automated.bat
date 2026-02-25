@echo off
setlocal enabledelayedexpansion

:: Colors and formatting
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

echo %YELLOW%========================================%RESET%
echo %BLUE%  Echoes of Community - Full Automation%RESET%
echo %YELLOW%========================================%RESET%
echo.

:: Step 1: Check if Node is installed
echo %BLUE%[1/6] Checking Node.js installation...%RESET%
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Error: Node.js is not installed!%RESET%
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo %GREEN%✓ Node.js is installed%RESET%
echo.

:: Step 2: Check if dependencies are installed
echo %BLUE%[2/6] Checking dependencies...%RESET%
if not exist "node_modules" (
    echo %YELLOW%Installing dependencies...%RESET%
    call npm install
    if errorlevel 1 (
        echo %RED%Error: Failed to install dependencies%RESET%
        pause
        exit /b 1
    )
)
echo %GREEN%✓ Dependencies are installed%RESET%
echo.

:: Step 3: Migrate passwords to hashed format
echo %BLUE%[3/6] Migrating passwords to hashed format...%RESET%
node server/migrate-passwords.js
if errorlevel 1 (
    echo %RED%Error: Password migration failed%RESET%
    pause
    exit /b 1
)
echo %GREEN%✓ Passwords migrated successfully%RESET%
echo.

:: Step 4: Start the authentication server
echo %BLUE%[4/6] Starting authentication server...%RESET%
start "Auth Server - Port 3001" cmd /k "cd /d %~dp0 && echo %GREEN%Starting server...%RESET% && node server/server.js"
timeout /t 4 /nobreak >nul
echo %GREEN%✓ Server started on http://localhost:3001%RESET%
echo.

:: Step 5: Start the frontend development server
echo %BLUE%[5/6] Starting frontend development server...%RESET%
start "Frontend Dev - Port 5173" cmd /k "cd /d %~dp0 && echo %GREEN%Starting frontend...%RESET% && npm run dev"
timeout /t 5 /nobreak >nul
echo %GREEN%✓ Frontend started on http://localhost:5173%RESET%
echo.

:: Step 6: Run automated tests
echo %BLUE%[6/6] Running automated authentication tests...%RESET%
echo %YELLOW%Waiting for servers to be fully ready...%RESET%
timeout /t 3 /nobreak >nul
echo.

node server/test-auth.js
set TEST_RESULT=%errorlevel%

echo.
echo %YELLOW%========================================%RESET%
echo %BLUE%  Automation Complete!%RESET%
echo %YELLOW%========================================%RESET%
echo.
echo %GREEN%✓ Backend Server:%RESET% http://localhost:3001
echo %GREEN%✓ Frontend App:%RESET% http://localhost:5173
echo.

if %TEST_RESULT% equ 0 (
    echo %GREEN%✓ All automated tests passed!%RESET%
) else (
    echo %YELLOW%⚠ Some tests failed - check output above%RESET%
)

echo.
echo %BLUE%Login Credentials:%RESET%
echo   Email: admin@echoes.com
echo   Password: password123
echo.
echo %YELLOW%Press any key to open the app in your browser...%RESET%
pause >nul

:: Open browser
start http://localhost:5173

echo.
echo %GREEN%Browser opened! You can now test the application.%RESET%
echo %YELLOW%Press any key to exit (servers will keep running)...%RESET%
pause >nul
