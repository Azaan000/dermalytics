@echo off
echo ===================================================
echo   DERMALYTICS - AI Skin and Hair Health Platform
echo   Hamdard University FYP Environment Setup
echo ===================================================
echo.

echo [1/2] Installing Backend Python Dependencies...
cd backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency installation failed.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Installing Frontend Node.js Dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependency installation failed.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ===================================================
echo   Setup Completed Successfully!
echo   Run start_dev.bat to launch the application.
echo ===================================================
pause
