@echo off
echo ===========================================
echo Installing Dependencies with Local Cache
echo ===========================================
echo.
echo Target Directory: %CD%

:: Create local cache directory if it doesn't exist
if not exist ".npm-cache" mkdir ".npm-cache"

:: Set NPM cache to local folder to avoid C: drive usage
set "npm_config_cache=%CD%\.npm-cache"
echo [Configuration] Using local NPM cache at: %npm_config_cache%
echo.

echo [1/2] Installing Backend Dependencies (using --legacy-peer-deps for compatibility)...
cd backend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo Error installing backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Installing Frontend Dependencies (using --legacy-peer-deps)...
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ===========================================
echo All dependencies installed successfully!
echo Cache is stored locally in: %CD%\.npm-cache
echo ===========================================
pause
