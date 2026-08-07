@echo off
echo ========================================
echo  EduVis AI — Setup Script
echo ========================================
echo.

REM Check Python is installed
python --version 2>NUL
if errorlevel 1 (
    echo ERROR: Python not found.
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment...
python -m venv .venv
if errorlevel 1 ( echo Failed to create venv. & pause & exit /b 1 )

echo [2/4] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/4] Installing Python dependencies...
pip install fastapi "uvicorn[standard]" google-generativeai pydantic pydantic-settings pyyaml python-dotenv moviepy Pillow gTTS duckduckgo-search requests beautifulsoup4 lxml rich typer jsonschema aiofiles python-slugify websockets python-multipart
if errorlevel 1 ( echo pip install failed. & pause & exit /b 1 )

echo [4/4] Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo ========================================
echo  Setup complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Copy .env.example to .env and add your GOOGLE_API_KEY
echo 2. Run backend:  .venv\Scripts\activate ^& python -m uvicorn backend.main:app --reload --port 8000
echo 3. Run frontend: cd frontend ^& npm run dev
echo 4. Open: http://localhost:5173
echo.
echo For Manim + RDKit setup, see: INSTALL.md
echo.
pause
