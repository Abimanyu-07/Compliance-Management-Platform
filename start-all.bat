@echo off
echo ========================================================
echo Starting InnovX Backend (FastAPI) & Frontend (Vite)
echo ========================================================

start "InnovX Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
start "InnovX Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend is running at: http://localhost:8000
echo Frontend is running at: http://localhost:5173
echo Swagger API Docs: http://localhost:8000/docs
echo.
