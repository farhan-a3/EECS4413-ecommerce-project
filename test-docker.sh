#!/bin/bash
# test-docker.sh - Script to test Docker deployment
# Usage: chmod +x test-docker.sh && ./test-docker.sh

set -e

echo "======================================"
echo "EECS4413 E-Commerce Docker Test Script"
echo "======================================"
echo ""

# Check if Docker is running
echo "1. Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if ports are available
echo "2. Checking if required ports are available..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  WARNING: Port 3000 is already in use"
    echo "   The backend might not start properly"
else
    echo "✅ Port 3000 is available"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  WARNING: Port 5173 is already in use"
    echo "   The frontend might not start properly"
else
    echo "✅ Port 5173 is available"
fi
echo ""

# Build and start containers
echo "3. Building and starting Docker containers..."
echo "   This may take a few minutes on first run..."
docker-compose down -v 2>/dev/null || true
docker-compose up --build -d

echo ""
echo "4. Waiting for services to be ready..."
echo "   Waiting for backend..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start within 60 seconds"
        echo ""
        echo "Backend logs:"
        docker-compose logs backend
        exit 1
    fi
    sleep 2
    echo "   Still waiting... ($i/30)"
done

echo "   Waiting for frontend..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend failed to start within 60 seconds"
        echo ""
        echo "Frontend logs:"
        docker-compose logs frontend
        exit 1
    fi
    sleep 2
    echo "   Still waiting... ($i/30)"
done

echo ""
echo "======================================"
echo "✅ Docker deployment successful!"
echo "======================================"
echo ""
echo "Access the application at:"
echo "  • Frontend: http://localhost:5173"
echo "  • Backend:  http://localhost:3000"
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application, run:"
echo "  docker-compose down"
echo ""
echo "To stop and remove all data, run:"
echo "  docker-compose down -v"
echo "======================================"