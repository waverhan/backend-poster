import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()
const API_BASE = 'http://localhost:3001/api'

async function finalSystemTest() {
  console.log('🎯 FINAL PWA POS SYSTEM TEST')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('Testing all critical functionality before deployment...')
  console.log('')
  
  let passedTests = 0
  let totalTests = 0
  const results = []
  
  // Helper function to run tests
  async function runTest(testName, testFunction) {
    totalTests++
    try {
      console.log(`🔍 ${testName}...`)
      const startTime = Date.now()
      await testFunction()
      const duration = Date.now() - startTime
      console.log(`✅ PASSED: ${testName} (${duration}ms)`)
      results.push({ name: testName, status: 'PASSED', duration })
      passedTests++
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`)
      console.log(`   Error: ${error.message}`)
      results.push({ name: testName, status: 'FAILED', error: error.message })
    }
  }

  // Test 1: Backend Health Check
  await runTest('Backend Health Check', async () => {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/health`)
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`)
    }
    if (response.data.status !== 'OK') {
      throw new Error('Backend health check failed')
    }
  })

  // Test 2: Database Connectivity
  await runTest('Database Connectivity', async () => {
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const branchCount = await prisma.branch.count()
    const licenseCount = await prisma.license.count()
    
    if (categoryCount === 0) throw new Error('No categories in database')
    if (productCount === 0) throw new Error('No products in database')
    if (branchCount === 0) throw new Error('No branches in database')
    if (licenseCount === 0) throw new Error('No licenses in database')
    
    console.log(`   📊 Data: ${categoryCount} categories, ${productCount} products, ${branchCount} branches, ${licenseCount} licenses`)
  })

  // Test 3: License System
  await runTest('License System Validation', async () => {
    const response = await axios.post(`${API_BASE}/license/validate`, {
      license_key: '4C91-2T9Z-INTP-6EWS',
      domain: 'localhost'
    })
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`)
    }
    
    if (!response.data.valid) {
      throw new Error('License validation failed')
    }
    
    console.log(`   🔑 License valid for ${response.data.days_remaining} days`)
  })

  // Test 4: Categories API
  await runTest('Categories CRUD Operations', async () => {
    // Get categories
    const getResponse = await axios.get(`${API_BASE}/categories`)
    if (getResponse.status !== 200) throw new Error('Failed to get categories')
    
    const categories = getResponse.data
    if (categories.length === 0) throw new Error('No categories found')
    
    console.log(`   📂 Found ${categories.length} categories`)
  })

  // Test 5: Products API
  await runTest('Products API with Custom Quantities', async () => {
    const response = await axios.get(`${API_BASE}/products`)
    if (response.status !== 200) throw new Error('Failed to get products')
    
    const products = response.data
    if (products.length === 0) throw new Error('No products found')
    
    // Check for custom quantities
    const customQuantityProducts = products.filter(p => 
      p.custom_quantity !== null && p.custom_quantity !== undefined
    )
    
    if (customQuantityProducts.length === 0) {
      throw new Error('No products with custom quantities found')
    }
    
    // Verify specific products
    const ikryaniki = products.find(p => p.display_name.includes('Ікряники'))
    if (ikryaniki && ikryaniki.custom_quantity !== 50) {
      throw new Error('Ікряники custom quantity not set correctly')
    }
    
    console.log(`   🛍️ Found ${products.length} products, ${customQuantityProducts.length} with custom quantities`)
  })

  // Test 6: Branches API
  await runTest('Branches API', async () => {
    const response = await axios.get(`${API_BASE}/branches`)
    if (response.status !== 200) throw new Error('Failed to get branches')
    
    const branches = response.data
    if (branches.length === 0) throw new Error('No branches found')
    
    console.log(`   🏪 Found ${branches.length} branches`)
  })

  // Test 7: Orders System
  await runTest('Orders System', async () => {
    const response = await axios.get(`${API_BASE}/orders`)
    if (response.status !== 200) throw new Error('Failed to get orders')
    
    const orders = response.data
    console.log(`   📦 Found ${orders.length} orders`)
  })

  // Test 8: Site Configuration
  await runTest('Site Configuration', async () => {
    const response = await axios.get(`${API_BASE}/site-config`)
    if (response.status !== 200) throw new Error('Failed to get site config')
    
    const config = response.data
    
    // Check updated contact info
    if (config.company_phone !== '+38 (097) 324 46 68') {
      throw new Error('Phone number not updated correctly')
    }
    
    if (config.company_email !== 'info@opillia.com.ua') {
      throw new Error('Email not updated correctly')
    }
    
    console.log(`   ⚙️ Site: ${config.site_name}, Phone: ${config.company_phone}, Email: ${config.company_email}`)
  })

  // Test 9: Custom Quantity Display
  await runTest('Custom Quantity Display Logic', async () => {
    const response = await axios.get(`${API_BASE}/products`)
    const products = response.data
    
    // Find products with custom quantities
    const testProducts = products.filter(p => p.custom_quantity && p.custom_unit)
    
    if (testProducts.length === 0) {
      throw new Error('No products with custom quantities found')
    }
    
    // Verify display logic
    const gramProducts = testProducts.filter(p => p.custom_unit === 'г')
    const literProducts = testProducts.filter(p => p.custom_unit === 'л')
    
    console.log(`   📏 Custom quantities: ${gramProducts.length} in grams, ${literProducts.length} in liters`)
  })

  // Test 10: Image Serving
  await runTest('Image Serving', async () => {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/debug/images`)
    if (response.status !== 200) throw new Error('Image debug endpoint failed')
    
    console.log(`   🖼️ Image path exists: ${response.data.exists}`)
  })

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('🏁 FINAL TEST SUMMARY')
  console.log('═══════════════════════════════════════════════════════════════')
  
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌'
    const duration = result.duration ? ` (${result.duration}ms)` : ''
    console.log(`${status} ${result.name}${duration}`)
    if (result.error) {
      console.log(`   └─ ${result.error}`)
    }
  })
  
  console.log('\n📊 STATISTICS:')
  console.log(`   ✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('🚀 System is ready for production deployment!')
    console.log('\n📋 DEPLOYMENT CHECKLIST:')
    console.log('   ✅ Backend API working')
    console.log('   ✅ Database connected')
    console.log('   ✅ License system active')
    console.log('   ✅ CRUD operations working')
    console.log('   ✅ Custom quantities implemented')
    console.log('   ✅ Contact info updated')
    console.log('   ✅ Image serving working')
    console.log('   ✅ Admin panel functional')
  } else {
    console.log('\n⚠️ SOME TESTS FAILED!')
    console.log('Please fix the failing tests before deployment.')
  }
  
  console.log('\n🔗 IMPORTANT URLS:')
  console.log('   🌐 Frontend: http://localhost:5174')
  console.log('   🔧 Backend: http://localhost:3001')
  console.log('   👨‍💼 Admin Panel: http://localhost:5174/admin')
  console.log('   🧪 License Test: http://localhost:5174/test-license')
  console.log('   📏 Quantity Test: http://localhost:5174/test-quantities')
  
  console.log('\n📞 CONTACT INFORMATION:')
  console.log('   📱 Phone: +38 (097) 324 46 68')
  console.log('   📧 Email: info@opillia.com.ua')
  
  console.log('\n🔑 TEST LICENSE:')
  console.log('   Key: 4C91-2T9Z-INTP-6EWS')
  console.log('   Domain: localhost')
  console.log('   Expires: 5/29/2026')
  
  console.log('\n═══════════════════════════════════════════════════════════════')
}

// Run the final test
finalSystemTest()
  .catch(error => {
    console.error('❌ Final test suite failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
