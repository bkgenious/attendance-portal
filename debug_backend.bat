@echo off
echo ===========================================
echo Debugging Backend Startup
echo ===========================================

echo Starting backend and saving logs to backend_error_log.txt...
echo Please wait for 5-10 seconds...

cd backend
call npm run dev > ..\backend_error_log.txt 2>&1
cd ..

echo.
echo ===========================================
echo Process finished.
echo Logs are saved in backend_error_log.txt
echo ===========================================
type backend_error_log.txt
pause
