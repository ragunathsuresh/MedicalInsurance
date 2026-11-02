@echo off
echo ========================================================
echo   Launching Medical Insurance Premium Prediction Suite
echo ========================================================
echo.

echo [1/3] Starting Python FastAPI ML Inference Engine (Port 8000)...
start "FastAPI ML Service [Port 8000]" cmd /k "cd ml-service && C:\Users\AMARNATH\anaconda3\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Express.js Backend API Gateway (Port 5000)...
start "Express Backend API [Port 5000]" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak > nul

echo [3/3] Starting React + Vite Frontend UI (Port 5173)...
start "React Vite Frontend [Port 5173]" cmd /k "cd frontend && npm run dev"

echo.
echo All 3 services are launching:
echo   - ML Inference: http://localhost:8000/docs
echo   - Backend API:  http://localhost:5000/api/health
echo   - Frontend App: http://localhost:5173
echo ========================================================
