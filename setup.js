#!/usr/bin/env node

/**
 * 🚀 PWA POS Shop - Windows Setup Script
 * Cross-platform setup script for Windows users
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = (message, color = 'blue') => {
  console.log(`${colors[color]}[INFO]${colors.reset} ${message}`);
};

const success = (message) => {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
};

const warning = (message) => {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
};

const error = (message) => {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
};

const commandExists = (command) => {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Welcome message
console.log(`${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    PWA POS Shop Setup                       ║
║              AI-Powered E-commerce Platform                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

log('Starting setup process...');

// Check Node.js
log('Checking Node.js installation...');
if (commandExists('node')) {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  success(`Node.js found: ${nodeVersion}`);
  
  // Check version
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion < 18) {
    warning(`Node.js version 18+ recommended. Current: ${nodeVersion}`);
    log('Consider upgrading: https://nodejs.org/');
  }
} else {
  error('Node.js not found!');
  log('Please install Node.js 18+ from https://nodejs.org/');
  process.exit(1);
}

// Check npm
log('Checking npm installation...');
if (commandExists('npm')) {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  success(`npm found: ${npmVersion}`);
} else {
  error('npm not found!');
  process.exit(1);
}

// Check Git
log('Checking Git installation...');
if (commandExists('git')) {
  const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
  success(`Git found: ${gitVersion}`);
} else {
  warning('Git not found. Install Git for version control.');
}

// Install dependencies
log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  success('Dependencies installed successfully!');
} catch (err) {
  error('Failed to install dependencies!');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  log('Creating .env file...');
  const envContent = `# PWA POS Shop Environment Configuration

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
`;
  
  fs.writeFileSync(envPath, envContent);
  success('.env file created!');
  warning('Please add your API keys to .env file for full functionality');
} else {
  log('.env file already exists');
}

// Test build
log('Testing build process...');
try {
  execSync('npm run build', { stdio: 'ignore' });
  success('Build test successful!');
  
  // Clean up build files
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
} catch (err) {
  warning('Build test failed - check for any missing dependencies');
}

// Setup complete
console.log(`${colors.green}
╔══════════════════════════════════════════════════════════════╗
║                     Setup Complete! 🎉                      ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

success('PWA POS Shop is ready for development!');
console.log('');
log('Next steps:');
console.log(`  1. Start development server: ${colors.yellow}npm run dev${colors.reset}`);
console.log(`  2. Open browser: ${colors.yellow}http://localhost:5176${colors.reset}`);
console.log(`  3. Test AI features: ${colors.yellow}http://localhost:5176/communication-demo${colors.reset}`);
console.log('');
log('Optional configuration:');
console.log('  • Add OpenAI API key to .env for full AI features');
console.log('  • Configure Telegram/Viber bots for messaging');
console.log('  • Set up backend API for data persistence');
console.log('');
log('Documentation:');
console.log('  • README.md - Complete setup guide');
console.log('  • DEPLOYMENT.md - Hosting and deployment');
console.log('  • /communication-demo - Feature demonstration');
console.log('');

// Ask if user wants to start dev server
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Start development server now? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    log('Starting development server...');
    try {
      execSync('npm run dev', { stdio: 'inherit' });
    } catch (err) {
      error('Failed to start development server');
    }
  } else {
    log("Run 'npm run dev' when ready to start development");
  }
  
  success('Happy coding! 🚀');
  rl.close();
});
