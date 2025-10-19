#!/bin/bash

echo "🔧 Setting up Fibs Game - Initial Setup"
echo "======================================"

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

# Seed initial data (only for initial setup)
echo "🌱 Seeding database with initial prompts..."
npm run db:seed

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "💡 Next steps:"
echo "   1. Run './start.sh' to start the development servers"
echo "   2. Or run 'npm run dev' for frontend only"
echo "   3. Or run 'npm run server:dev' for backend only"
echo ""
echo "🎮 Your game will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3002"
echo ""
