@echo off
echo Starting ThermoSense locally...

echo Starting backend server...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
start /B python main.py

timeout /t 3 /nobreak > nul

echo Starting frontend...
cd ..\frontend
call npm install
start npm start

echo.
echo ThermoSense is running!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Press Ctrl+C in each window to stop
pause