#!/bin/bash

echo "🛑 Stopping Fibs Game - All Services"
echo "===================================="

# Stop frontend server (Next.js)
echo "⚛️  Stopping frontend server..."
pkill -f "next dev" || pkill -f "npm run dev" || true
pkill -f "next-server" || true

# Stop backend server
echo "🔧 Stopping backend server..."
pkill -f "tsx server/src/server.ts" || pkill -f "npm run server" || true
pkill -f "tsx watch" || true

# Stop any remaining Node.js processes related to this project
echo "🔄 Stopping any remaining project processes..."
pkill -f "node.*fibs" || true

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

# Wait a moment for processes to stop
sleep 2

# Check what's still running
echo "🔍 Checking for any remaining processes..."
REMAINING=$(ps aux | grep -E "(next|tsx|node.*fibs)" | grep -v grep | wc -l)

if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Some processes may still be running. Force killing..."
    pkill -9 -f "next dev" || true
    pkill -9 -f "tsx server" || true
    pkill -9 -f "npm run dev" || true
    pkill -9 -f "npm run server" || true
fi

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To start everything again, run: ./start.sh"
echo ""
