#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get Railway server URL from environment or use default
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://backend-api-production-b3a0.up.railway.app'
const API_KEY = process.env.API_KEY || ''

async function updateProductsOnRailway() {
  try {
    console.log(`🚀 Connecting to Railway server: ${RAILWAY_URL}`)
    console.log(`📝 Triggering product update from XML...\n`)

    // Try the API endpoint
    const response = await fetch(
      `${RAILWAY_URL}/api/update-products/from-xml`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
        },
        timeout: 120000
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Response text:', text.substring(0, 500))
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    const data = await response.json()

    console.log('✅ Update completed successfully!\n')
    console.log('📊 Summary:')
    console.log(JSON.stringify(data.summary, null, 2))

    if (data.summary.errors) {
      console.log('\n❌ Errors:')
      data.summary.errors.forEach(e => {
        console.log(`   - ${e.product}: ${e.error}`)
      })
    }

    if (data.summary.notFoundProducts) {
      console.log('\n⚠️  Not Found Products:')
      data.summary.notFoundProducts.forEach(p => {
        console.log(`   - ${p.name} (slug: ${p.slug})`)
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating products on Railway:')
    console.error(error.message)
    console.error('\nMake sure:')
    console.error('1. The Railway server is running and accessible')
    console.error('2. The productss.xml file is in the server directory')
    console.error('3. You can access the API at: ' + RAILWAY_URL + '/api/update-products/from-xml')
    process.exit(1)
  }
}

updateProductsOnRailway()

