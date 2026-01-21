@echo off
echo ===========================================
echo Updating Attendance Portal Database
echo ===========================================
echo.
echo IMPORTANT: Attempting to stop existing backend server on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing process %%a...
    taskkill /f /pid %%a
)
echo.

pause

cd backend
echo.
echo [1/2] Pushing Schema Changes...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Error pushing DB changes.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Seeding Database Users...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo Error seeding database.
    pause
    exit /b %errorlevel%
)

echo.
echo ===========================================
echo Success! You can now start the backend.
echo ===========================================
pause
