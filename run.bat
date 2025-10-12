@echo off
REM DCSC Attendance Dashboard Startup Script for Windows
REM This script sets up and runs the application locally

echo ⚽ Starting DCSC Attendance Dashboard...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH.
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

echo 📦 Installing dependencies...
python -m pip install -q -r requirements.txt

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting the Flask application...
echo.
echo 📍 The app will be available at: http://localhost:5000
echo 📍 Press Ctrl+C to stop the server
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Run the Flask app
python app.py

pause

