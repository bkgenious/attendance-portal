@echo off
echo ===========================================
echo Network Diagnosis for Attendance Portal
echo ===========================================

echo [1/3] Checking Port 3001 (Backend)...
netstat -aon | find ":3001" | find "LISTENING"
if %errorlevel% neq 0 (
    echo [ERROR] No service is listening on Port 3001!
    echo The backend IS NOT RUNNING.
    echo Please run 'run_app.bat' and check the backend window for errors.
    pause
    exit /b
) else (
    echo [SUCCESS] Port 3001 is active.
)

echo.
echo [2/3] Testing Connection to Backend Health Endpoint...
echo Testing http://127.0.0.1:3001/health ...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/health' -UseBasicParsing; Write-Host '[SUCCESS] Backend responded (127.0.0.1):' $r.StatusCode } catch { Write-Host '[ERROR] Connection to 127.0.0.1 failed:' $_ }"

echo Testing http://localhost:3001/health ...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/health' -UseBasicParsing; Write-Host '[SUCCESS] Backend responded (localhost):' $r.StatusCode } catch { Write-Host '[ERROR] Connection to localhost failed:' $_ }"

echo.
echo [3/3] Diagnosis Complete.
echo If you see [SUCCESS] above, the backend is working.
echo If you see [ERROR], the backend is unreachable.
echo.
pause
