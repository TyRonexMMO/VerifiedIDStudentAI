# KIIT Tuition Receipt Generator - Quick Start Script (PowerShell)

Write-Host "🚀 Starting KIIT Tuition Receipt Generator setup..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Install server dependencies
Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit server/.env with your configuration:" -ForegroundColor Cyan
    Write-Host "   - GEMINI_API_KEY: Your Google Gemini API key" -ForegroundColor White
    Write-Host "   - TELEGRAM_BOT_TOKEN: Your Telegram bot token" -ForegroundColor White
    Write-Host "   - TELEGRAM_GROUP_CHAT_ID: Your Telegram group chat ID" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See TELEGRAM_SETUP.md for detailed setup instructions" -ForegroundColor Cyan
    Write-Host ""
    
    # Open .env file in default editor
    if (Get-Command "code" -ErrorAction SilentlyContinue) {
        Write-Host "Opening .env in VS Code..." -ForegroundColor Green
        code .env
    } elseif (Get-Command "notepad" -ErrorAction SilentlyContinue) {
        Write-Host "Opening .env in Notepad..." -ForegroundColor Green
        notepad .env
    }
    
    Read-Host "Press Enter after configuring your .env file"
}

# Go back to root
Set-Location ..

# Check if user wants to start the development servers
Write-Host ""
Write-Host "🎯 Setup complete! Choose an option:" -ForegroundColor Green
Write-Host "1. Start development servers (frontend + backend)" -ForegroundColor White
Write-Host "2. Start frontend only (port 5173)" -ForegroundColor White
Write-Host "3. Start backend only (port 3000)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🌟 Starting both servers..." -ForegroundColor Green
        Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Note: You'll need to start the backend separately in another terminal." -ForegroundColor Yellow
        Write-Host "Backend command: cd server && npm start" -ForegroundColor White
        Write-Host ""
        Write-Host "Starting frontend development server..." -ForegroundColor Green
        npm run dev
    }
    "2" {
        Write-Host "🎨 Starting frontend development server..." -ForegroundColor Green
        Write-Host "Available at: http://localhost:5173" -ForegroundColor Cyan
        npm run dev
    }
    "3" {
        Write-Host "⚙️ Starting backend server..." -ForegroundColor Green
        Write-Host "Available at: http://localhost:3000" -ForegroundColor Cyan
        Set-Location server
        npm start
    }
    "4" {
        Write-Host "👋 Setup complete! Run this script again when you're ready to start." -ForegroundColor Green
    }
    default {
        Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Thank you for using KIIT Tuition Receipt Generator!" -ForegroundColor Green
Write-Host "💬 For support, contact @TYRoneX97 on Telegram" -ForegroundColor Cyan