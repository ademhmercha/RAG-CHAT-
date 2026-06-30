#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/ademhmercha/RAG-CHAT-"
APP_DIR="rag-chat"

echo "============================================"
echo " RAG Assistant - Local Installation"
echo "============================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed."
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo "[1/5] Checking Docker is running..."
docker info &> /dev/null || {
    echo "[ERROR] Docker is not running. Please start Docker and try again."
    exit 1
}
echo "      OK"

echo "[2/5] Downloading RAG Assistant..."
if [ -d "$APP_DIR" ]; then
    echo "      Folder exists, pulling latest..."
    cd "$APP_DIR"
    git pull
else
    git clone "$REPO_URL" "$APP_DIR"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to clone repository. Make sure Git is installed."
        exit 1
    fi
    cd "$APP_DIR"
fi
echo "      OK"

echo "[3/5] Creating .env from .env.example..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "      Created .env file"
    else
        echo "[WARN] .env.example not found. Create .env manually."
    fi
else
    echo "      .env already exists, skipping"
fi

echo "[4/5] Building and starting containers..."
docker compose up -d --build
echo "      OK"

echo "[5/5] Waiting for app to be ready..."
until curl -s http://localhost:3001 > /dev/null 2>&1; do
    sleep 2
done

echo ""
echo "============================================"
echo " Installation complete!"
echo " Open http://localhost:3001 in your browser"
echo "============================================"
