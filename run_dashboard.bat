@echo off
echo Starting Molecule Import Dashboard...
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting Flask application...
echo Dashboard will be available at: http://localhost:5001
echo.
echo Press Ctrl+C to stop the application
echo.
python molecule_dashboard.py
pause
