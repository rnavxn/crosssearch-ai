@echo off
echo ===================================================
echo CrossSearch AI - Windows Setup Script
echo ===================================================
echo.

echo Checking prerequisites...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js (npm) is not installed. Please install Node.js.
    pause
    exit /b
)

echo.
echo [1/2] Setting up Backend (FastAPI)...
cd backend
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)
echo Installing Python dependencies...
call .venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo [2/2] Setting up Frontend (React/Vite)...
cd desktop
echo Installing npm dependencies...
call npm install
cd ..

echo.
echo ===================================================
echo Setup Complete! 
echo Make sure PostgreSQL and Ollama are running.
echo You can now use start.bat to run the application.
echo ===================================================
pause
