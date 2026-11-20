@echo off
title SpeechSense AI - FastAPI Backend Server
echo ======================================================
echo  SpeechSense AI - FastAPI Backend & ML Engine
echo  Target: http://127.0.0.1:8000
echo  Swagger Docs: http://127.0.0.1:8000/docs
echo ======================================================
echo.

python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
