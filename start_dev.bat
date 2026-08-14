@echo off
echo ===================================================
echo   Starting Dermalytics Full-Stack Platform...
echo ===================================================
echo.

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Dermalytics Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo Starting React + Vite Frontend on http://localhost:5173 ...
start "Dermalytics Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application instances started!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
