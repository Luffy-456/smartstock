@echo off
title StockSmart - One-Click Launcher
echo ======================================================================
echo           StockSmart: Retail Inventory Optimization Platform
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python Virtual Environment in backend\venv...
if not exist "backend\venv\Scripts\python.exe" (
    echo Virtual environment not found. Creating backend\venv...
    python -m venv backend\venv
    if errorlevel 1 (
        echo ERROR: Python is required to create the virtual environment.
        pause
        exit /b 1
    )
    echo Installing backend dependencies into backend\venv...
    backend\venv\Scripts\pip install -r backend\requirements.txt
)

echo [2/4] Applying Database Migrations ^& Verifying Seed Data...
backend\venv\Scripts\python backend\manage.py migrate --noinput
if errorlevel 1 goto :startup_failed
backend\venv\Scripts\python backend\manage.py seed_data
if errorlevel 1 goto :startup_failed

echo.
echo [3/4] Checking Frontend Node Dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend packages...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [4/4] Starting Backend and Frontend Servers...
echo.

:: Launch Django backend in a separate terminal window
start "StockSmart - Django Backend (Port 8000)" cmd /k "cd /d %~dp0backend && venv\Scripts\python manage.py runserver 127.0.0.1:8000"

:: Launch Vite React frontend in a separate terminal window
start "StockSmart - React Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ======================================================================
echo  StockSmart servers started successfully!
echo ======================================================================
echo.
echo   * Backend API:       http://127.0.0.1:8000/api/
echo   * API Health Check:  http://127.0.0.1:8000/api/health/
echo   * Admin Panel:       http://127.0.0.1:8000/admin/
echo   * Frontend Web App:  http://localhost:5173/
echo.
echo  Seed accounts use the unique STOCKSMART_SEED_PASSWORD configured in backend\.env.
echo.
echo  Opening http://localhost:5173/ in your browser...
echo.
timeout /t 3 >nul
start http://localhost:5173/

echo You can keep the server windows open while using StockSmart.
echo To shut down the servers, close the windows or double-click stop.bat.
echo.
pause
exit /b 0

:startup_failed
echo.
echo ERROR: Database setup failed. Check backend\.env and the command output above.
pause
exit /b 1
