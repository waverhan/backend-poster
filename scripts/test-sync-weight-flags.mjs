import axios from 'axios'

async function testSyncWeightFlags() {
  try {
    console.log('🧪 Testing sync process with Weight_Flag handling...')
    
    // Trigger a full sync to test the new logic
    console.log('🔄 Starting full sync...')
    const response = await axios.post('http://localhost:3001/api/sync/full')
    
    if (response.data.success) {
      console.log('✅ Sync completed successfully!')
      console.log(`📊 Sync results:`)
      console.log(`  - Categories: ${response.data.categories}`)
      console.log(`  - Products: ${response.data.products}`)
      console.log(`  - Branches: ${response.data.branches}`)
      
      // Now check if weight-based products were properly processed
      console.log('\n🔍 Checking weight-based products...')
      const productsResponse = await axios.get('http://localhost:3001/api/products')
      
      if (productsResponse.data.success) {
        const products = productsResponse.data.products
        const weightBasedProducts = products.filter(p => 
          p.attributes && p.attributes.Weight_Flag === '1'
        )
        
        console.log(`\n🏋️ Found ${weightBasedProducts.length} weight-based products:`)
        weightBasedProducts.forEach(product => {
          console.log(`• ${product.display_name}:`)
          console.log(`  - Price: ${product.price} UAH/kg (display)`)
          console.log(`  - Weight_Flag: ${product.attributes.Weight_Flag}`)
          console.log(`  - Custom quantity: ${product.custom_quantity}kg`)
          console.log(`  - Custom unit: ${product.custom_unit}`)
          
          if (product.custom_quantity) {
            const portionPrice = (product.price * product.custom_quantity).toFixed(2)
            console.log(`  - ${product.custom_quantity * 1000}g portion: ${portionPrice} UAH`)
          }
          console.log('')
        })
        
        // Test name-based fallback
        const nameBasedProducts = products.filter(p => {
          const hasWeightFlag = p.attributes && p.attributes.Weight_Flag === '1'
          const hasWeightKeywords = ['ікра', 'анчоус', 'арахіс'].some(keyword => 
            p.name.toLowerCase().includes(keyword)
          )
          return !hasWeightFlag && hasWeightKeywords
        })
        
        console.log(`🔄 Found ${nameBasedProducts.length} products using name-based fallback:`)
        nameBasedProducts.forEach(product => {
          console.log(`• ${product.display_name} (no Weight_Flag, detected by name)`)
        })
        
      } else {
        console.error('❌ Failed to fetch products:', productsResponse.data.error)
      }
      
    } else {
      console.error('❌ Sync failed:', response.data.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
}

testSyncWeightFlags()
