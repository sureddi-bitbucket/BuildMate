@echo off
echo ========================================
echo    Import Goods Dashboard
echo ========================================
echo.
echo Starting Import Goods application...
echo.
echo Please wait while the application loads...
echo.
echo Once started, open your browser and go to:
echo http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r import_goods_requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install required packages
        pause
        exit /b 1
    )
)

REM Start the application
echo Starting application...
python import_goods_app.py

pause
