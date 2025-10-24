@echo off
echo ========================================
echo BuildMate Standalone - Quick Setup
echo ========================================
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd public
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete! 
echo ========================================
echo.
echo To start the application, run:
echo   npm start
echo.
echo The application will be available at:
echo   http://localhost:5038
echo.
echo Demo accounts:
echo   Distributor: distributor@buildmate.com / distributor123
echo   Consumer: consumer@buildmate.com / consumer123
echo.
pause

