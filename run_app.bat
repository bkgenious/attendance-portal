@echo off
echo ===========================================
echo Running Attendance Portal
echo ===========================================

:: Check for dependencies
if not exist "backend\node_modules" (
    echo [ERROR] Backend dependencies are missing!
    echo Please run 'install_dependencies.bat' first.
    pause
    exit /b
)

if not exist "frontend\node_modules" (
    echo [ERROR] Frontend dependencies are missing!
    echo Please run 'install_dependencies.bat' first.
    pause
    exit /b
)

:: Run the start script
call start_all.bat
pause
