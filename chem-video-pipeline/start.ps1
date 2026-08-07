# EduVis AI — Start Script (run AFTER setup.bat)
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " EduVis AI — Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check .env
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found. Copy .env.example to .env and add your GOOGLE_API_KEY" -ForegroundColor Red
    exit 1
}

# Start Backend in background
Write-Host "`n[1/2] Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Green
$backend = Start-Process -FilePath ".\.venv\Scripts\python.exe" `
    -ArgumentList "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000" `
    -PassThru -NoNewWindow

Write-Host "[2/2] Starting React frontend on http://localhost:5173..." -ForegroundColor Green
Start-Sleep -Seconds 2

Push-Location frontend
$frontend = Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev" `
    -PassThru -NoNewWindow
Pop-Location

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " EduVis AI is running!" -ForegroundColor Green
Write-Host " Open: http://localhost:5173" -ForegroundColor Yellow
Write-Host " Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop all services."

try {
    Wait-Process -Id $backend.Id
} finally {
    Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
    Write-Host "`nServices stopped." -ForegroundColor Yellow
}
