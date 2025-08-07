#!/bin/bash

echo "Starting ThermoSense locally..."

# Start backend
echo "Starting backend server..."
cd backend
python3 -m venv venv 2>/dev/null || python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

echo "ThermoSense is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Press Ctrl+C to stop"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait