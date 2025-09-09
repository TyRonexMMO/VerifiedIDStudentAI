#!/bin/bash

# KIIT Tuition Receipt Generator - Quick Start Script

echo "🚀 Starting KIIT Tuition Receipt Generator setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit server/.env with your configuration:"
    echo "   - GEMINI_API_KEY: Your Google Gemini API key"
    echo "   - TELEGRAM_BOT_TOKEN: Your Telegram bot token"
    echo "   - TELEGRAM_GROUP_CHAT_ID: Your Telegram group chat ID"
    echo ""
    echo "📖 See TELEGRAM_SETUP.md for detailed setup instructions"
    echo ""
    read -p "Press Enter after configuring your .env file..."
fi

# Go back to root
cd ..

# Check if user wants to start the development servers
echo ""
echo "🎯 Setup complete! Choose an option:"
echo "1. Start development servers (frontend + backend)"
echo "2. Start frontend only (port 5173)"
echo "3. Start backend only (port 3000)"
echo "4. Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🌟 Starting both servers..."
        echo "Frontend will be available at: http://localhost:5173"
        echo "Backend will be available at: http://localhost:3000"
        echo ""
        echo "Opening two terminals..."
        
        # Start backend in background
        (cd server && npm start) &
        BACKEND_PID=$!
        
        # Give backend time to start
        sleep 3
        
        # Start frontend
        npm run dev
        
        # Kill backend when frontend exits
        kill $BACKEND_PID
        ;;
    2)
        echo "🎨 Starting frontend development server..."
        echo "Available at: http://localhost:5173"
        npm run dev
        ;;
    3)
        echo "⚙️ Starting backend server..."
        echo "Available at: http://localhost:3000"
        cd server
        npm start
        ;;
    4)
        echo "👋 Setup complete! Run this script again when you're ready to start."
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        ;;
esac

echo ""
echo "✅ Thank you for using KIIT Tuition Receipt Generator!"
echo "💬 For support, contact @TYRoneX97 on Telegram"