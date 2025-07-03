import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate license key
function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = []
  
  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  
  return segments.join('-')
}

// Calculate expiration date
function getExpirationDate(plan) {
  const now = new Date()
  if (plan === 'yearly') {
    return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  } else {
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  }
}

async function generateLicense() {
  try {
    const domain = process.argv[2] || 'localhost'
    const plan = process.argv[3] || 'yearly'
    
    console.log(`🔑 Generating license for domain: ${domain}`)
    console.log(`📅 Plan: ${plan}`)
    
    const licenseKey = generateLicenseKey()
    const expiresAt = getExpirationDate(plan)
    
    const license = await prisma.license.create({
      data: {
        license_key: licenseKey,
        domain: domain,
        plan: plan,
        status: 'active',
        expires_at: expiresAt,
        features: JSON.stringify(['all'])
      }
    })
    
    console.log('\n✅ License created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🔑 License Key: ${license.license_key}`)
    console.log(`🌐 Domain: ${license.domain}`)
    console.log(`📋 Plan: ${license.plan}`)
    console.log(`📅 Expires: ${license.expires_at.toLocaleDateString()}`)
    console.log(`✨ Status: ${license.status}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log('\n📋 To activate this license:')
    console.log('1. Go to the admin panel')
    console.log('2. Look for the license section')
    console.log(`3. Enter the license key: ${license.license_key}`)
    console.log('4. Click activate')
    
  } catch (error) {
    console.error('❌ Error generating license:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Usage examples
if (process.argv.length < 3) {
  console.log('📖 Usage:')
  console.log('  node generate-license.js [domain] [plan]')
  console.log('')
  console.log('📝 Examples:')
  console.log('  node generate-license.js localhost yearly')
  console.log('  node generate-license.js example.com monthly')
  console.log('  node generate-license.js mystore.com yearly')
  console.log('')
  console.log('🔧 Default: localhost yearly')
  console.log('')
}

generateLicense()
