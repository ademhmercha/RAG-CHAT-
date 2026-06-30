@echo off
title RAG Assistant Installer
echo ============================================
echo  RAG Assistant - Local Installation
echo ============================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/4] Checking Docker is running...
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo       OK

echo [2/4] Creating .env from .env.example...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo       Created .env file
    ) else (
        echo [WARN] .env.example not found. Create .env manually.
    )
) else (
    echo       .env already exists, skipping
)

echo [3/4] Building and starting containers...
docker compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers.
    pause
    exit /b 1
)
echo       OK

echo [4/4] Waiting for app to be ready...
:waitloop
timeout /t 2 /nobreak >nul
curl -s http://localhost:3001 >nul 2>nul
if %errorlevel% neq 0 goto waitloop

echo.
echo ============================================
echo  Installation complete!
echo  Open http://localhost:3001 in your browser
echo ============================================
pause
