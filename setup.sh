#!/bin/bash

# StudentHotel Quick Start Script

echo "🏨 StudentHotel Quick Start"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running."
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
cd backend
cp .env.example .env
npm install
cd ..

# Install frontend dependencies
cd frontend
cp .env.example .env
npm install
cd ..

echo "🌱 Setting up database with sample data..."
cd backend
npm run seed
cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "👥 Demo Accounts:"
echo "   Student: student1@demo.com / password123"
echo "   Hotel Owner: hotel1@demo.com / password123"
echo "   Admin: admin@studenthotel.com / admin123"
echo ""
echo "📚 Check README.md for detailed documentation"