@echo off
echo ===========================================
echo Stopping Attendance Portal Servers
echo ===========================================

echo [1/2] Stopping Backend (Port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing PID %%a...
    taskkill /f /pid %%a
)

echo.
echo [2/2] Stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing PID %%a...
    taskkill /f /pid %%a
)

echo.
echo Servers stopped.
pause
