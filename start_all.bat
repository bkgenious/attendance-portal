@echo off
echo ===========================================
echo Starting Attendance Portal System
echo ===========================================

:: Helper to kill process by port
:: [DISABLED] Automatic kill logic - causing crashes on some systems?
:: echo [1/3] Cleaning up existing processes...
:: for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
::     echo Killing Backend running on port 3001 (PID %%a)...
::     taskkill /f /pid %%a >nul 2>&1
:: )
:: for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
::     echo Killing Frontend running on port 3000 (PID %%a)...
::     taskkill /f /pid %%a >nul 2>&1
:: )

echo.
echo [2/3] Starting Backend Server...
cd backend
start "Attendance Backend (Port 3001)" cmd /k npm run dev
cd ..

echo.
echo [3/3] Starting Frontend Server...
cd frontend
start "Attendance Frontend (Port 3000)" cmd /k npm run dev
cd ..

echo.
echo ===========================================
echo Application is starting!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo (The browser should open automatically once the frontend is ready)
echo ===========================================
pause
