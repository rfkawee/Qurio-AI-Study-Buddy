@echo off
setlocal EnableDelayedExpansion
title Qurio Stopper

echo ===================================================================
echo                 MENGHENTIKAN SERVICE QURIO
echo ===================================================================

:: Hentikan proses yang mendengarkan port 8000 (Backend FastAPI)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Menghentikan proses Backend pada port 8000 PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Hentikan proses yang mendengarkan port 5173 (Frontend Vite)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Menghentikan proses Frontend pada port 5173 PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Hentikan jendela terminal dengan judul Qurio
taskkill /FI "WINDOWTITLE eq Qurio Backend*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq Qurio Frontend*" /F /T >nul 2>&1

echo.
echo Semua service Qurio telah berhasil dihentikan.
ping -n 3 127.0.0.1 >nul
