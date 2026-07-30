@echo off
echo ===================================================
echo Starting CrossSearch AI Servers...
echo ===================================================

echo Starting FastAPI Backend...
cd backend
start "CrossSearch AI - Backend" cmd /k "call .venv\Scripts\activate && uvicorn app.main:app --reload"
cd ..

echo Starting Vite Frontend...
cd desktop
start "CrossSearch AI - Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting in separate windows.
echo You can close this window now.
pause
