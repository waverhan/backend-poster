#!/usr/bin/env node

/**
 * Production Preparation Script
 * Removes debug code, console logs, and prepares app for production deployment
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('🚀 Preparing application for production deployment...\n')

// Files and directories to check
const checkPaths = [
  'src/components',
  'src/views', 
  'src/services',
  'src/stores',
  'server/routes',
  'server/services'
]

// Patterns to look for and remove/replace
const debugPatterns = [
  {
    pattern: /console\.log\([^)]*\)/g,
    description: 'console.log statements',
    action: 'remove'
  },
  {
    pattern: /console\.debug\([^)]*\)/g,
    description: 'console.debug statements', 
    action: 'remove'
  },
  {
    pattern: /console\.info\([^)]*\)/g,
    description: 'console.info statements',
    action: 'remove'
  },
  {
    pattern: /\/\/\s*TODO:/gi,
    description: 'TODO comments',
    action: 'flag'
  },
  {
    pattern: /\/\/\s*FIXME:/gi,
    description: 'FIXME comments',
    action: 'flag'
  },
  {
    pattern: /debugger;?/g,
    description: 'debugger statements',
    action: 'remove'
  }
]

// Security patterns to check
const securityPatterns = [
  {
    pattern: /password\s*[:=]\s*['"][^'"]*['"]/gi,
    description: 'Hardcoded passwords',
    severity: 'high'
  },
  {
    pattern: /api[_-]?key\s*[:=]\s*['"][^'"]*['"]/gi,
    description: 'Hardcoded API keys',
    severity: 'high'
  },
  {
    pattern: /secret\s*[:=]\s*['"][^'"]*['"]/gi,
    description: 'Hardcoded secrets',
    severity: 'high'
  },
  {
    pattern: /token\s*[:=]\s*['"][^'"]*['"]/gi,
    description: 'Hardcoded tokens',
    severity: 'medium'
  }
]

let totalIssues = 0
let securityIssues = 0
let filesProcessed = 0

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(rootDir, filePath)
    let fileIssues = 0
    let fileSecurityIssues = 0
    let modifiedContent = content

    // Check for debug patterns
    debugPatterns.forEach(({ pattern, description, action }) => {
      const matches = content.match(pattern)
      if (matches) {
        fileIssues += matches.length
        console.log(`  📝 ${description}: ${matches.length} found`)
        
        if (action === 'remove') {
          // Remove the debug code
          modifiedContent = modifiedContent.replace(pattern, '')
          console.log(`    ✅ Removed ${matches.length} ${description}`)
        }
      }
    })

    // Check for security issues
    securityPatterns.forEach(({ pattern, description, severity }) => {
      const matches = content.match(pattern)
      if (matches) {
        fileSecurityIssues += matches.length
        const icon = severity === 'high' ? '🚨' : '⚠️'
        console.log(`  ${icon} SECURITY: ${description}: ${matches.length} found`)
        matches.forEach(match => {
          console.log(`    ${match}`)
        })
      }
    })

    // Write back modified content if changes were made
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent)
      console.log(`  💾 File updated: ${relativePath}`)
    }

    if (fileIssues > 0 || fileSecurityIssues > 0) {
      console.log(`📄 ${relativePath}:`)
      totalIssues += fileIssues
      securityIssues += fileSecurityIssues
    }

    filesProcessed++

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message)
  }
}

function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath)
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          scanDirectory(itemPath)
        }
      } else if (stat.isFile()) {
        // Only scan relevant file types
        const ext = path.extname(item).toLowerCase()
        if (['.js', '.ts', '.vue', '.jsx', '.tsx'].includes(ext)) {
          scanFile(itemPath)
        }
      }
    })
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message)
  }
}

// Remove debug routes from server
function removeDebugRoutes() {
  const serverIndexPath = path.join(rootDir, 'server/index.js')
  
  if (fs.existsSync(serverIndexPath)) {
    let content = fs.readFileSync(serverIndexPath, 'utf8')
    
    // Remove debug route
    const debugRoutePattern = /\/\/ Debug route[\s\S]*?}\)/g
    if (content.match(debugRoutePattern)) {
      content = content.replace(debugRoutePattern, '')
      fs.writeFileSync(serverIndexPath, content)
      console.log('✅ Removed debug routes from server/index.js')
    }
  }
}

// Create production environment template
function createProductionEnvTemplate() {
  const prodEnvPath = path.join(rootDir, '.env.production')
  const envContent = `# Production Environment Configuration
# Copy this file to .env and update with your production values

# Required - Backend API (UPDATE THIS)
VITE_BACKEND_URL=https://your-domain.com/api

# Optional - AI Features
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional - Messaging
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_VIBER_BOT_TOKEN=your_viber_bot_token

# Poster POS Integration (pre-configured)
VITE_POSTER_API_TOKEN=218047:05891220e474bad7f26b6eaa0be3f344
`

  fs.writeFileSync(prodEnvPath, envContent)
  console.log('✅ Created .env.production template')
}

// Main execution
console.log('🔍 Scanning for debug code and security issues...\n')

// Scan specified directories
checkPaths.forEach(checkPath => {
  const fullPath = path.join(rootDir, checkPath)
  if (fs.existsSync(fullPath)) {
    console.log(`\n📁 Scanning ${checkPath}/`)
    scanDirectory(fullPath)
  }
})

// Remove debug routes
console.log('\n🧹 Cleaning up debug routes...')
removeDebugRoutes()

// Create production environment template
console.log('\n📝 Creating production environment template...')
createProductionEnvTemplate()

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 PRODUCTION PREPARATION SUMMARY')
console.log('='.repeat(60))
console.log(`📄 Files processed: ${filesProcessed}`)
console.log(`🐛 Debug issues found/fixed: ${totalIssues}`)
console.log(`🔒 Security issues found: ${securityIssues}`)

if (securityIssues > 0) {
  console.log('\n🚨 SECURITY WARNINGS:')
  console.log('Please review and fix the security issues above before deploying to production!')
}

console.log('\n✅ PRODUCTION READINESS CHECKLIST:')
console.log('□ Update .env.production with your production values')
console.log('□ Configure production database')
console.log('□ Setup SSL certificate')
console.log('□ Configure email SMTP settings')
console.log('□ Test all functionality in staging environment')
console.log('□ Setup monitoring and logging')
console.log('□ Configure backup system')

console.log('\n🚀 Ready for production deployment!')
console.log('📖 See PRODUCTION_DEPLOYMENT.md for detailed deployment instructions')
