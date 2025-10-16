#!/bin/bash

echo "🚀 Starting Fibs Game - All Services"
echo "=================================="

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Check if services are ready
echo "🔍 Checking service health..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker services failed to start"
    exit 1
fi

# Setup database tables
echo "🗄️ Setting up database tables..."
npm run db:push

# Seed initial data
echo "🌱 Seeding database with initial prompts..."
npm run db:seed

# Start backend server in background
echo "🔧 Starting backend server (port 3002)..."
npm run server:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3002/health > /dev/null; then
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server in background
echo "⚛️  Starting frontend server (port 3000)..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Frontend server failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

# Open browser
echo "🌐 Opening game in browser..."
open http://localhost:3000

echo ""
echo "✅ All services started successfully!"
echo "🎮 Game URL: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3002"
echo ""
echo "📋 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "💡 To stop everything, run: ./stop.sh"
echo "   Or press Ctrl+C and run: ./stop.sh"
echo ""

# Keep script running
echo "🔄 Services are running... Press Ctrl+C to stop"
trap 'echo ""; echo "🛑 Stopping services..."; ./stop.sh; exit 0' INT

# Wait for user interrupt
wait
