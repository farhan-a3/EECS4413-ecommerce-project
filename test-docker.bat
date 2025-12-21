@echo off
REM test-docker.bat - Windows script to test Docker deployment
REM Usage: Double-click this file or run from command prompt

echo ======================================
echo EECS4413 E-Commerce Docker Test Script
echo ======================================
echo.

REM Check if Docker is running
echo 1. Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo Docker is running
echo.

REM Clean up previous containers
echo 2. Cleaning up previous containers...
docker-compose down -v 2>nul
echo.

REM Build and start containers
echo 3. Building and starting Docker containers...
echo    This may take a few minutes on first run...
docker-compose up --build -d
if errorlevel 1 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)
echo.

REM Wait for services
echo 4. Waiting for services to be ready...
echo    This may take 30-60 seconds...
timeout /t 30 /nobreak >nul
echo.

echo ======================================
echo Docker deployment complete!
echo ======================================
echo.
echo Access the application at:
echo   * Frontend: http://localhost:5173
echo   * Backend:  http://localhost:3000
echo.
echo To view logs, run in Command Prompt:
echo   docker-compose logs -f
echo.
echo To stop the application, run:
echo   docker-compose down
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Application opened in browser!
echo To stop the application, close this window and run: docker-compose down
echo.
pause