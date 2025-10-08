#!/usr/bin/env node

/**
 * Cron Job Setup Script for Inventory Synchronization
 * 
 * This script sets up automatic inventory synchronization with Poster POS
 * using various cron job services and methods.
 */

import cron from 'node-cron'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'https://backend-api-production-b3a0.up.railway.app'
const SYNC_ENDPOINT = `${BACKEND_URL}/api/sync/inventory`
const LOG_FILE = path.join(__dirname, '../logs/cron.log')

// Ensure logs directory exists
import fs from 'fs'
const logsDir = path.dirname(LOG_FILE)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

/**
 * Log function with timestamp
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}\n`
  
  console.log(logMessage.trim())
  
  // Append to log file
  try {
    fs.appendFileSync(LOG_FILE, logMessage)
  } catch (error) {
    console.error('Failed to write to log file:', error)
  }
}

/**
 * Trigger inventory synchronization
 */
async function triggerInventorySync() {
  try {
    log('🔄 Starting scheduled inventory synchronization...')
    
    const response = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PosterPOS-CronJob/1.0'
      },
      timeout: 120000 // 2 minutes timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.success) {
      log(`✅ Inventory sync completed successfully! Updated ${result.stats?.inventory_records || 0} records`)
      return { success: true, result }
    } else {
      throw new Error(result.message || 'Sync failed')
    }

  } catch (error) {
    log(`❌ Inventory sync failed: ${error.message}`, 'ERROR')
    
    // Send alert if needed (implement notification service)
    await sendSyncAlert(error.message)
    
    return { success: false, error: error.message }
  }
}

/**
 * Send sync failure alert
 */
async function sendSyncAlert(errorMessage) {
  try {
    // You can implement email/Slack/Discord notifications here
    log(`📧 Sync alert: ${errorMessage}`, 'ALERT')
    
    // Example: Send to monitoring endpoint
    // await fetch(`${BACKEND_URL}/api/alerts/sync-failure`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error: errorMessage, timestamp: new Date().toISOString() })
    // })
    
  } catch (alertError) {
    log(`Failed to send sync alert: ${alertError.message}`, 'ERROR')
  }
}

/**
 * Health check function
 */
async function healthCheck() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      timeout: 10000 // 10 seconds timeout
    })
    
    if (response.ok) {
      log('💚 Backend health check passed')
      return true
    } else {
      log(`💔 Backend health check failed: ${response.status}`, 'WARN')
      return false
    }
  } catch (error) {
    log(`💔 Backend health check error: ${error.message}`, 'ERROR')
    return false
  }
}

/**
 * Setup cron jobs
 */
function setupCronJobs() {
  log('🚀 Setting up cron jobs for inventory synchronization...')

  // Main inventory sync - every 15 minutes during business hours (8 AM - 10 PM)
  cron.schedule('*/15 8-22 * * *', async () => {
    log('⏰ Triggered: Main inventory sync (every 15 minutes, 8 AM - 10 PM)')
    await triggerInventorySync()
  }, {
    timezone: 'Europe/Kiev'
  })

  // Frequent sync during peak hours (12 PM - 8 PM) - every 5 minutes
  cron.schedule('*/5 12-20 * * *', async () => {
    log('⏰ Triggered: Peak hours inventory sync (every 5 minutes, 12 PM - 8 PM)')
    await triggerInventorySync()
  }, {
    timezone: 'Europe/Kiev'
  })

  // Health check - every hour
  cron.schedule('0 * * * *', async () => {
    log('⏰ Triggered: Health check (hourly)')
    await healthCheck()
  }, {
    timezone: 'Europe/Kiev'
  })

  // Daily sync for new products and price updates - every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    log('⏰ Triggered: Daily sync for new products and price updates (6 AM)')

    try {
      const dailySyncResponse = await fetch(`${BACKEND_URL}/api/sync/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000 // 5 minutes timeout for daily sync
      })

      if (dailySyncResponse.ok) {
        const result = await dailySyncResponse.json()
        log(`✅ Daily sync completed: ${result.stats.new_products} new products, ${result.stats.updated_prices} price updates`)
        log(`📊 Daily sync stats: ${JSON.stringify(result.stats)}`)
      } else {
        log(`❌ Daily sync failed: ${dailySyncResponse.status}`, 'ERROR')
      }
    } catch (error) {
      log(`❌ Daily sync error: ${error.message}`, 'ERROR')
    }
  }, {
    timezone: 'Europe/Kiev'
  })

  // Log cleanup - every Sunday at 2 AM
  cron.schedule('0 2 * * 0', () => {
    log('⏰ Triggered: Log cleanup (weekly)')
    cleanupLogs()
  }, {
    timezone: 'Europe/Kiev'
  })

  log('✅ Cron jobs setup completed!')
  log('📋 Schedule:')
  log('   • Inventory sync: Every 15 minutes (8 AM - 10 PM)')
  log('   • Peak hours sync: Every 5 minutes (12 PM - 8 PM)')
  log('   • Health check: Every hour')
  log('   • Daily sync (new products + prices): 6 AM daily')
  log('   • Log cleanup: 2 AM every Sunday')
}

/**
 * Cleanup old log files
 */
function cleanupLogs() {
  try {
    const stats = fs.statSync(LOG_FILE)
    const fileSizeInMB = stats.size / (1024 * 1024)
    
    if (fileSizeInMB > 10) { // If log file is larger than 10MB
      const backupFile = `${LOG_FILE}.${Date.now()}.bak`
      fs.renameSync(LOG_FILE, backupFile)
      log(`📁 Log file backed up to: ${backupFile}`)
      
      // Keep only last 5 backup files
      const backupFiles = fs.readdirSync(logsDir)
        .filter(file => file.endsWith('.bak'))
        .sort()
      
      if (backupFiles.length > 5) {
        const filesToDelete = backupFiles.slice(0, backupFiles.length - 5)
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(logsDir, file))
          log(`🗑️ Deleted old backup: ${file}`)
        })
      }
    }
  } catch (error) {
    log(`Failed to cleanup logs: ${error.message}`, 'ERROR')
  }
}

/**
 * Graceful shutdown
 */
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    log(`📴 Received ${signal}. Shutting down gracefully...`)
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

/**
 * Main function
 */
function main() {
  log('🚀 Starting PosterPOS Inventory Sync Cron Service...')
  log(`📡 Backend URL: ${BACKEND_URL}`)
  log(`📝 Log file: ${LOG_FILE}`)
  
  setupCronJobs()
  setupGracefulShutdown()
  
  // Initial health check
  healthCheck()
  
  log('✅ Cron service is running. Press Ctrl+C to stop.')
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
} else {
  // When imported as a module, just setup the cron jobs
  log('🚀 Setting up cron jobs for inventory synchronization...')
  setupCronJobs()
  log('✅ Cron jobs setup completed!')
}

export { triggerInventorySync, healthCheck, setupCronJobs }
