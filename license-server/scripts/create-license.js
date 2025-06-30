const crypto = require('crypto')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Database setup
const dbPath = path.join(__dirname, '../licenses.db')
const db = new sqlite3.Database(dbPath)

// Generate license key
function generateLicenseKey() {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(8).toString('hex').toUpperCase()
  const checksum = crypto.createHash('md5').update(timestamp + random).digest('hex').substring(0, 4).toUpperCase()
  
  return `${timestamp.toUpperCase()}-${random.substring(0, 4)}-${random.substring(4, 8)}-${checksum}`
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

// Create license
function createLicense(domain, subscriptionType = 'monthly', customerEmail = 'test@example.com') {
  const licenseKey = generateLicenseKey()
  const expiresAt = calculateExpiryDate(subscriptionType)
  const features = JSON.stringify([
    'ai_recommendations',
    'delivery_management', 
    'analytics',
    'multilanguage',
    'admin_panel'
  ])

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO licenses (license_key, domain, subscription_type, expires_at, features) 
       VALUES (?, ?, ?, ?, ?)`,
      [licenseKey, domain, subscriptionType, expiresAt, features],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({
            licenseKey,
            domain,
            subscriptionType,
            expiryDate: expiresAt,
            features: JSON.parse(features)
          })
        }
      }
    )
  })
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('Usage: node create-license.js <domain> [subscription_type] [customer_email]')
    console.log('Example: node create-license.js example.com monthly customer@example.com')
    console.log('Subscription types: monthly, yearly')
    process.exit(1)
  }

  const domain = args[0]
  const subscriptionType = args[1] || 'monthly'
  const customerEmail = args[2] || 'test@example.com'

  if (!['monthly', 'yearly'].includes(subscriptionType)) {
    console.error('Invalid subscription type. Must be "monthly" or "yearly"')
    process.exit(1)
  }

  try {
    const license = await createLicense(domain, subscriptionType, customerEmail)
    
    console.log('\n✅ License created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🔑 License Key: ${license.licenseKey}`)
    console.log(`🌐 Domain: ${license.domain}`)
    console.log(`📅 Subscription: ${license.subscriptionType}`)
    console.log(`⏰ Expires: ${new Date(license.expiryDate).toLocaleDateString()}`)
    console.log(`✨ Features: ${license.features.join(', ')}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📋 Copy this license key to activate the application:')
    console.log(`\x1b[32m${license.licenseKey}\x1b[0m`)
    console.log('')
    
  } catch (error) {
    console.error('❌ Failed to create license:', error.message)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { createLicense, generateLicenseKey }
