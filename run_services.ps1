# run_services.ps1 — Launch all 3 services in separate PowerShell windows
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Medical Insurance Premium Prediction Suite" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# 1. FastAPI
Write-Host "`n[1/3] Starting Python FastAPI ML Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'd:\RAGU\Medical Insurance\ml-service'; & 'C:\Users\AMARNATH\anaconda3\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

# 2. Express Backend
Write-Host "[2/3] Starting Express.js Backend API (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'd:\RAGU\Medical Insurance\backend'; npm run dev"

Start-Sleep -Seconds 2

# 3. React Frontend
Write-Host "[3/3] Starting React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'd:\RAGU\Medical Insurance\frontend'; npm run dev"

Write-Host "`nAll 3 services launched:" -ForegroundColor Green
Write-Host "  - ML FastAPI Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Express API:     http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  - React Web App:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
