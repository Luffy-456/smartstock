@echo off
title StockSmart - Stop Servers
echo ======================================================================
echo           Stopping StockSmart Local Development Servers
echo ======================================================================
echo.

echo Terminating running Django and Vite processes on ports 8000 and 5173...

:: Find and terminate process listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping process PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

:: Find and terminate process listening on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Stopping process PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

:: Terminate cmd windows with specific titles
taskkill /FI "WINDOWTITLE eq StockSmart - Django Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq StockSmart - React Frontend*" /F >nul 2>&1

echo.
echo StockSmart local servers have been stopped.
echo.
pause
