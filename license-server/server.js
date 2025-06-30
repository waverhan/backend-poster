const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Database setup
const dbPath = path.join(__dirname, 'licenses.db')
const db = new sqlite3.Database(dbPath)

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      domain TEXT NOT NULL,
      subscription_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      features TEXT DEFAULT '["ai_recommendations","delivery_management","analytics","multilanguage"]',
      device_fingerprint TEXT,
      last_validated DATETIME
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS license_validations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL,
      domain TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN NOT NULL
    )
  `)
})

// Encryption key for license generation
const ENCRYPTION_KEY = 'your-super-secret-license-key-2024'

// Generate license key
function generateLicenseKey() {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(8).toString('hex').toUpperCase()
  const checksum = crypto.createHash('md5').update(timestamp + random).digest('hex').substring(0, 4).toUpperCase()
  
  return `${timestamp.toUpperCase()}-${random.substring(0, 4)}-${random.substring(4, 8)}-${checksum}`
}

// Validate license format
function isValidLicenseFormat(licenseKey) {
  const pattern = /^[A-Z0-9]{4,}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return pattern.test(licenseKey)
}

// Calculate expiry date
function calculateExpiryDate(subscriptionType) {
  const now = new Date()
  if (subscriptionType === 'yearly') {
    now.setFullYear(now.getFullYear() + 1)
  } else {
    now.setMonth(now.getMonth() + 1)
  }
  return now.toISOString()
}

// API Routes

// Create new license (for purchase)
app.post('/api/create-license', (req, res) => {
  const { domain, subscriptionType, customerEmail } = req.body

  if (!domain || !subscriptionType || !customerEmail) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: domain, subscriptionType, customerEmail'
    })
  }

  if (!['monthly', 'yearly'].includes(subscriptionType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription type. Must be "monthly" or "yearly"'
    })
  }

  const licenseKey = generateLicenseKey()
  const expiresAt = calculateExpiryDate(subscriptionType)
  const features = JSON.stringify([
    'ai_recommendations',
    'delivery_management', 
    'analytics',
    'multilanguage',
    'admin_panel'
  ])

  db.run(
    `INSERT INTO licenses (license_key, domain, subscription_type, expires_at, features) 
     VALUES (?, ?, ?, ?, ?)`,
    [licenseKey, domain, subscriptionType, expiresAt, features],
    function(err) {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          success: false,
          error: 'Failed to create license'
        })
      }

      res.json({
        success: true,
        license: {
          licenseKey,
          domain,
          subscriptionType,
          expiryDate: expiresAt,
          features: JSON.parse(features)
        }
      })
    }
  )
})

// Validate license
app.post('/api/validate', (req, res) => {
  const { licenseKey, domain, fingerprint, timestamp } = req.body
  const clientIP = req.ip || req.connection.remoteAddress
  const userAgent = req.get('User-Agent')

  // Log validation attempt
  db.run(
    `INSERT INTO license_validations (license_key, domain, ip_address, user_agent, success) 
     VALUES (?, ?, ?, ?, ?)`,
    [licenseKey, domain, clientIP, userAgent, false]
  )

  if (!licenseKey || !domain) {
    return res.status(400).json({
      valid: false,
      error: 'Missing license key or domain'
    })
  }

  if (!isValidLicenseFormat(licenseKey)) {
    return res.status(400).json({
      valid: false,
      error: 'Invalid license key format'
    })
  }

  // Check license in database
  db.get(
    `SELECT * FROM licenses WHERE license_key = ? AND domain = ? AND is_active = 1`,
    [licenseKey, domain],
    (err, row) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({
          valid: false,
          error: 'Database error'
        })
      }

      if (!row) {
        return res.status(404).json({
          valid: false,
          error: 'License not found or not valid for this domain'
        })
      }

      const now = new Date()
      const expiryDate = new Date(row.expires_at)
      const isExpired = now > expiryDate

      if (isExpired) {
        return res.status(403).json({
          valid: false,
          error: 'License has expired'
        })
      }

      // Update last validated timestamp
      db.run(
        `UPDATE licenses SET last_validated = CURRENT_TIMESTAMP, device_fingerprint = ? WHERE id = ?`,
        [fingerprint, row.id]
      )

      // Update validation log
      db.run(
        `UPDATE license_validations SET success = 1 WHERE license_key = ? AND domain = ? ORDER BY id DESC LIMIT 1`,
        [licenseKey, domain]
      )

      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      const warningDays = daysRemaining <= 7 ? daysRemaining : null

      res.json({
        valid: true,
        license: {
          licenseKey: row.license_key,
          domain: row.domain,
          expiryDate: row.expires_at,
          subscriptionType: row.subscription_type,
          features: JSON.parse(row.features || '[]'),
          isValid: true,
          daysRemaining
        },
        warningDays
      })
    }
  )
})

// Renew license
app.post('/api/renew', (req, res) => {
  const { licenseKey, domain, subscriptionType } = req.body

  if (!licenseKey || !domain || !subscriptionType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    })
  }

  db.get(
    `SELECT * FROM licenses WHERE license_key = ? AND domain = ?`,
    [licenseKey, domain],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({
          success: false,
          error: 'License not found'
        })
      }

      const newExpiryDate = calculateExpiryDate(subscriptionType)

      db.run(
        `UPDATE licenses SET expires_at = ?, subscription_type = ?, is_active = 1 WHERE id = ?`,
        [newExpiryDate, subscriptionType, row.id],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to renew license'
            })
          }

          res.json({
            success: true,
            license: {
              licenseKey: row.license_key,
              domain: row.domain,
              expiryDate: newExpiryDate,
              subscriptionType,
              features: JSON.parse(row.features || '[]')
            }
          })
        }
      )
    }
  )
})

// Deactivate license
app.post('/api/deactivate', (req, res) => {
  const { licenseKey, domain } = req.body

  db.run(
    `UPDATE licenses SET is_active = 0 WHERE license_key = ? AND domain = ?`,
    [licenseKey, domain],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to deactivate license'
        })
      }

      res.json({
        success: true,
        message: 'License deactivated successfully'
      })
    }
  )
})

// Get license statistics (admin endpoint)
app.get('/api/admin/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM licenses',
    'SELECT COUNT(*) as active FROM licenses WHERE is_active = 1',
    'SELECT COUNT(*) as expired FROM licenses WHERE expires_at < datetime("now")',
    'SELECT subscription_type, COUNT(*) as count FROM licenses GROUP BY subscription_type'
  ]

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  )).then(results => {
    res.json({
      total: results[0][0].total,
      active: results[1][0].active,
      expired: results[2][0].expired,
      byType: results[3]
    })
  }).catch(err => {
    res.status(500).json({ error: 'Failed to get statistics' })
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`License server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app
