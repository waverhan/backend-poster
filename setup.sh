#!/bin/bash

# 🚀 PWA POS Shop - Quick Setup Script
# This script sets up the development environment automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Welcome message
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    PWA POS Shop Setup                       ║"
echo "║              AI-Powered E-commerce Platform                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_status "Starting setup process..."

# Check Node.js
print_status "Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_warning "Node.js version 18+ recommended. Current: $NODE_VERSION"
        print_status "Consider upgrading: https://nodejs.org/"
    fi
else
    print_error "Node.js not found!"
    print_status "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
print_status "Checking npm installation..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found!"
    exit 1
fi

# Check Git
print_status "Checking Git installation..."
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_warning "Git not found. Install Git for version control."
fi

# Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies!"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# PWA POS Shop Environment Configuration

# Required - Backend API
VITE_BACKEND_URL=http://localhost:3000

# Optional - AI Features (for full functionality)
# Get your API key from: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=

# Optional - Messaging (when backend ready)
# Telegram: Message @BotFather to create bot
VITE_TELEGRAM_BOT_TOKEN=
# Viber: Create bot at https://partners.viber.com
VITE_VIBER_BOT_TOKEN=

# Poster POS Integration (pre-configured)
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
EOF
    print_success ".env file created!"
    print_warning "Please add your API keys to .env file for full functionality"
else
    print_status ".env file already exists"
fi

# Check if we can build the project
print_status "Testing build process..."
if npm run build > /dev/null 2>&1; then
    print_success "Build test successful!"
    # Clean up build files
    rm -rf dist
else
    print_warning "Build test failed - check for any missing dependencies"
fi

# Setup complete
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     Setup Complete! 🎉                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_success "PWA POS Shop is ready for development!"
echo ""
print_status "Next steps:"
echo "  1. Start development server: ${YELLOW}npm run dev${NC}"
echo "  2. Open browser: ${YELLOW}http://localhost:5176${NC}"
echo "  3. Test AI features: ${YELLOW}http://localhost:5176/communication-demo${NC}"
echo ""
print_status "Optional configuration:"
echo "  • Add OpenAI API key to .env for full AI features"
echo "  • Configure Telegram/Viber bots for messaging"
echo "  • Set up backend API for data persistence"
echo ""
print_status "Documentation:"
echo "  • README.md - Complete setup guide"
echo "  • DEPLOYMENT.md - Hosting and deployment"
echo "  • /communication-demo - Feature demonstration"
echo ""

# Ask if user wants to start dev server
echo -n "Start development server now? (y/N): "
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_status "Starting development server..."
    npm run dev
else
    print_status "Run 'npm run dev' when ready to start development"
fi

print_success "Happy coding! 🚀"
