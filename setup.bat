@echo off
REM StudentHotel Quick Start Script for Windows

echo 🏨 StudentHotel Quick Start
echo ==========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install root dependencies
call npm install

REM Install backend dependencies
cd backend
copy .env.example .env
call npm install
cd ..

REM Install frontend dependencies
cd frontend
copy .env.example .env
call npm install
cd ..

echo 🌱 Setting up database with sample data...
cd backend
call npm run seed
cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    npm run dev
echo.
echo 🔗 URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000/api
echo    Health Check: http://localhost:5000/api/health
echo.
echo 👥 Demo Accounts:
echo    Student: student1@demo.com / password123
echo    Hotel Owner: hotel1@demo.com / password123
echo    Admin: admin@studenthotel.com / admin123
echo.
echo 📚 Check README.md for detailed documentation

pause