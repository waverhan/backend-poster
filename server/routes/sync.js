import express from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCategory, createProduct, createBranch, updateInventory, createSyncLog, updateSyncLog, prisma } from '../services/database.js'
import { imageService } from '../services/imageService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const POSTER_API_BASE = 'https://joinposter.com/api'
const POSTER_TOKEN = process.env.POSTER_TOKEN || '218047:05891220e474bad7f26b6eaa0be3f344'

// POST /api/sync/full - Full sync from Poster API
router.post('/full', async (req, res) => {
  try {


    // 1. Sync branches from warehouses/storages

    const branchesResponse = await axios.get(`${POSTER_API_BASE}/storage.getStorages`, {
      params: { token: POSTER_TOKEN }
    })

    const posterBranches = branchesResponse.data.response || []
    const syncedBranches = []

    for (const storage of posterBranches) {
      const branchData = {
        poster_id: storage.storage_id,
        name: storage.storage_name || `Warehouse ${storage.storage_id}`,
        address: `Warehouse Location ${storage.storage_id}`, // Can be configured manually in admin
        phone: '+38 (097) 324 46 68', // Default phone from user requirements
        latitude: 50.4501, // Default Kyiv coordinates - can be configured per warehouse
        longitude: 30.5234,
        delivery_available: true,
        pickup_available: true,
        is_active: true
      }

      // Upsert branch - don't set id, let database auto-generate
      const branch = await prisma.branch.upsert({
        where: { poster_id: branchData.poster_id },
        update: {
          name: branchData.name,
          address: branchData.address,
          phone: branchData.phone,
          latitude: branchData.latitude,
          longitude: branchData.longitude,
          delivery_available: branchData.delivery_available,
          pickup_available: branchData.pickup_available,
          is_active: branchData.is_active
        },
        create: branchData
      })
      syncedBranches.push(branch)
    }

    // 2. Sync categories

    const categoriesResponse = await axios.get(`${POSTER_API_BASE}/menu.getCategories`, {
      params: { token: POSTER_TOKEN }
    })

    const posterCategories = categoriesResponse.data.response || []
    const syncedCategories = []

    for (const posterCat of posterCategories) {
      const categoryData = {
        poster_category_id: posterCat.category_id,
        name: posterCat.category_name,
        display_name: posterCat.category_name,
        description: '',
        image_url: '',
        sort_order: parseInt(posterCat.sort) || 0,
        is_active: posterCat.category_hidden !== '1'
      }

      // Upsert category - use poster_category_id as unique identifier
      const category = await prisma.category.upsert({
        where: { poster_category_id: categoryData.poster_category_id },
        update: {
          name: categoryData.name,
          display_name: categoryData.display_name,
          description: categoryData.description,
          image_url: categoryData.image_url,
          sort_order: categoryData.sort_order,
          is_active: categoryData.is_active
        },
        create: categoryData
      })
      syncedCategories.push(category)
    }

    // 3. Sync products - get all products at once

    const allProducts = []

    // Get all products from Poster API without category filtering
    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []


    for (const posterProduct of posterProducts) {
      // Debug: Log every product being processed
      if (posterProduct.product_id === '267' || posterProduct.product_id === '411' || posterProduct.product_id === '13') {

      }

      // Find the category for this product using menu_category_id
      const category = syncedCategories.find(cat => cat.poster_category_id === posterProduct.menu_category_id)
      if (!category) {

        continue
      }

      // Fix price parsing - Poster API returns prices as object {"1": "15500", "2": "15500", ...}
      let price = 0
      if (posterProduct.price) {
        if (typeof posterProduct.price === 'object') {
          // Get the first price level (usually "1")
          const firstPriceKey = Object.keys(posterProduct.price)[0]
          price = parseFloat(posterProduct.price[firstPriceKey] || 0)
        } else {
          price = parseFloat(posterProduct.price || 0)
        }
      }

      // Convert from kopecks to UAH (divide by 100)
      const priceInUAH = price / 100

      // Get the actual image URL from Poster API response
      let posterImageUrl = ''
      if (posterProduct.photo && posterProduct.photo !== '0') {
        // Use the actual photo URL from the API response
        if (posterProduct.photo_origin) {
          posterImageUrl = `https://joinposter.com${posterProduct.photo_origin}`
        } else if (posterProduct.photo) {
          posterImageUrl = `https://joinposter.com${posterProduct.photo}`
        }
      }

      // Process product image - find correct URL and download locally

      const localImagePath = await imageService.processProductImage(
        posterProduct.product_id,
        !!(posterProduct.photo && posterProduct.photo !== '0'),
        posterImageUrl
      )

      // Check if this is a weight-based product or beverage with kg unit
      const productName = (posterProduct.product_name || '').toLowerCase()
      const isBeverage = productName.includes('пиво') || productName.includes('вино') || productName.includes('сидр') ||
                        productName.includes('beer') || productName.includes('wine') || productName.includes('cocktail') ||
                        productName.includes('коктейль') || productName.includes('напій') || productName.includes('drink') ||
                        productName.includes('лимонад') || productName.includes('квас') || productName.includes('сік') ||
                        productName.includes('juice') || productName.includes('water') || productName.includes('вода') ||
                        productName.includes('tea') || productName.includes('чай') || productName.includes('coffee') ||
                        productName.includes('кава')

      // Note: Disabled automatic weight-based detection to prevent targeting "ікр" products
      const isWeightBased = false // Disabled automatic weight-based detection
      const isBeverageWithKgUnit = posterProduct.ingredient_unit === 'kg' && isBeverage
      let adjustedPrice = isNaN(priceInUAH) ? 0 : priceInUAH

      // For weight-based products, divide price by 10 (convert from per-100g to per-kg storage)
      if (isWeightBased) {
        adjustedPrice = adjustedPrice / 10
      }

      // For beverages with kg unit, store the price as-is (it's already per-100g in Poster, will be converted for display)
      if (isBeverageWithKgUnit) {
        // Price already correct for beverages
      }

      // Store Poster API attributes including ingredient_unit
      const attributes = {
        ingredient_unit: posterProduct.ingredient_unit || 'pcs',
        ingredient_id: posterProduct.ingredient_id,
        out: posterProduct.out,
        photo: posterProduct.photo,
        photo_origin: posterProduct.photo_origin
      }

      const productData = {
        poster_product_id: posterProduct.product_id,
        ingredient_id: posterProduct.ingredient_id || null,
        category_id: category.id,
        name: posterProduct.product_name,
        display_name: posterProduct.product_name,
        description: posterProduct.ingredients || '',
        price: adjustedPrice,
        original_price: adjustedPrice,
        image_url: localImagePath || posterImageUrl || '',
        display_image_url: localImagePath || posterImageUrl || '',
        is_active: posterProduct.out !== '1',
        attributes: attributes,
        custom_quantity: isWeightBased ? 0.05 : (isBeverageWithKgUnit ? 0.5 : null), // 50g for weight-based, 0.5L for beverages
        custom_unit: isWeightBased ? 'г' : (isBeverageWithKgUnit ? 'л' : null),
        quantity_step: (isWeightBased || isBeverageWithKgUnit) ? 1 : null
      }

      // Debug logging for ingredient_id - specific products
      if (posterProduct.product_id === '267' || posterProduct.product_id === '397' || posterProduct.product_id === '13') {

      }

      // Upsert product
      const product = await prisma.product.upsert({
        where: { poster_product_id: productData.poster_product_id },
        update: {
          ingredient_id: productData.ingredient_id,
          category_id: productData.category_id,
          name: productData.name,
          display_name: productData.display_name,
          description: productData.description,
          price: productData.price,
          original_price: productData.original_price,
          image_url: productData.image_url,
          display_image_url: productData.display_image_url,
          is_active: productData.is_active
        },
        create: {
          poster_product_id: productData.poster_product_id,
          ingredient_id: productData.ingredient_id,
          name: productData.name,
          display_name: productData.display_name,
          description: productData.description,
          price: productData.price,
          original_price: productData.original_price,
          image_url: productData.image_url,
          display_image_url: productData.display_image_url,
          is_active: productData.is_active,
          category: {
            connect: { id: productData.category_id }
          }
        }
      })

      // Debug logging after database save
      if (posterProduct.product_id === '267' || posterProduct.product_id === '397' || posterProduct.product_id === '13') {

      }

      allProducts.push(product)
    }

    // 4. Sync inventory for each branch

    let totalInventoryRecords = 0

    for (const branch of syncedBranches) {
      try {
        const inventoryResponse = await axios.get(`${POSTER_API_BASE}/storage.getStorageLeftovers`, {
          params: {
            token: POSTER_TOKEN,
            storage_id: branch.poster_id
          }
        })

        const inventoryData = inventoryResponse.data.response || []


        // Debug: Log sample inventory item to verify field names
        if (inventoryData.length > 0) {

        }

        // Create inventory map
        const inventoryMap = new Map()
        inventoryData.forEach(item => {
          if (item.ingredient_id) {
            inventoryMap.set(item.ingredient_id, {
              quantity: parseFloat(item.storage_ingredient_left) || 0,
              unit: item.ingredient_unit || 'pcs'
            })
          }
        })

        // Update inventory for each product
        for (const product of allProducts) {
          // Use ingredient_id to match with inventory data
          const inventory = inventoryMap.get(product.ingredient_id)

          if (inventory) {
            await updateInventory(
              product.id,
              branch.id,
              inventory.quantity,
              inventory.unit
            )
            totalInventoryRecords++
          } else {
            // Product not available at this branch
            await updateInventory(
              product.id,
              branch.id,
              0,
              'pcs'
            )
          }
        }

      } catch (error) {
        console.error(`❌ Failed to sync inventory for branch ${branch.name}:`, error.message)
      }
    }

    const result = {
      success: true,
      message: 'Full sync completed successfully',
      stats: {
        branches: syncedBranches.length,
        categories: syncedCategories.length,
        products: allProducts.length,
        inventory_records: totalInventoryRecords
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Full sync failed:', error)
    res.status(500).json({
      success: false,
      error: 'Full sync failed',
      message: error.message
    })
  }
})

// POST /api/sync/inventory - Quick inventory sync
router.post('/inventory', async (req, res) => {
  let syncLogId = null

  try {
    // Create sync log entry
    const syncLog = await createSyncLog('inventory', 'running')
    syncLogId = syncLog.id

    const branches = await prisma.branch.findMany({ where: { is_active: true } })
    const products = await prisma.product.findMany({ where: { is_active: true } })

    let totalInventoryRecords = 0

    for (const branch of branches) {
      try {
        const inventoryResponse = await axios.get(`${POSTER_API_BASE}/storage.getStorageLeftovers`, {
          params: {
            token: POSTER_TOKEN,
            storage_id: branch.poster_id
          }
        })

        const inventoryData = inventoryResponse.data.response || []


        // Debug: Log sample inventory item to verify field names
        if (inventoryData.length > 0) {

        }

        // Create inventory map
        const inventoryMap = new Map()
        let sampleProcessed = false
        inventoryData.forEach(item => {
          if (item.ingredient_id) {
            const quantity = parseFloat(item.storage_ingredient_left) || 0
            inventoryMap.set(item.ingredient_id, {
              quantity: quantity,
              unit: item.ingredient_unit || 'pcs'
            })

            // Log first processed item for debugging
            if (!sampleProcessed) {

              sampleProcessed = true
            }
          }
        })

        // Update inventory for each product
        for (const product of products) {
          // Use ingredient_id to match with inventory data
          const inventory = inventoryMap.get(product.ingredient_id)

          if (inventory) {
            await updateInventory(
              product.id,
              branch.id,
              inventory.quantity,
              inventory.unit
            )
            totalInventoryRecords++
          }
        }

      } catch (error) {
        console.error(`❌ Failed to sync inventory for branch ${branch.name}:`, error.message)
      }
    }

    const result = {
      success: true,
      message: 'Inventory sync completed successfully',
      stats: {
        branches: branches.length,
        products: products.length,
        inventory_records: totalInventoryRecords
      }
    }

    // Update sync log with completion
    if (syncLogId) {
      await updateSyncLog(syncLogId, 'completed', totalInventoryRecords)
    }

    res.json(result)

  } catch (error) {
    console.error('❌ Inventory sync failed:', error)

    // Update sync log with error
    if (syncLogId) {
      await updateSyncLog(syncLogId, 'failed', 0, error.message)
    }

    res.status(500).json({
      success: false,
      error: 'Inventory sync failed',
      message: error.message
    })
  }
})

// POST /api/sync/images - Sync images for existing products
router.post('/images', async (req, res) => {
  try {


    // Get all products from database
    const products = await prisma.product.findMany({
      where: { is_active: true }
    })



    // Process images in batches
    const imageResults = await imageService.processProductImages(
      products.map(p => ({
        poster_product_id: p.poster_product_id,
        hasPhoto: true, // Assume all products might have photos
        image_url: p.image_url
      }))
    )

    // Update products with new local image paths
    let updatedCount = 0
    for (const result of imageResults) {
      if (result && result.localImagePath) {
        await prisma.product.updateMany({
          where: { poster_product_id: result.productId },
          data: {
            image_url: result.localImagePath,
            display_image_url: result.localImagePath
          }
        })
        updatedCount++
      }
    }

    const result = {
      success: true,
      message: 'Image sync completed successfully',
      stats: {
        total_products: products.length,
        images_processed: imageResults.filter(r => r && r.localImagePath).length,
        products_updated: updatedCount
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Image sync failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image sync failed',
      message: error.message
    })
  }
})

// POST /api/sync/fix-images - Fix broken local image URLs
router.post('/fix-images', async (req, res) => {
  try {


    // Get all products with local image URLs
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        OR: [
          { image_url: { startsWith: '/images/products/' } },
          { display_image_url: { startsWith: '/images/products/' } }
        ]
      }
    })



    let fixedCount = 0

    for (const product of products) {
      let needsUpdate = false
      const updateData = {}

      // Check if local image files exist
      const imageUrl = product.image_url
      const displayImageUrl = product.display_image_url

      if (imageUrl && imageUrl.startsWith('/images/products/')) {
        const imagePath = path.join(__dirname, '../public', imageUrl)
        if (!fs.existsSync(imagePath)) {
          // Local image doesn't exist, revert to Poster URL
          const posterUrl = await imageService.findCorrectImageUrl(product.poster_product_id, true)
          updateData.image_url = posterUrl || ''
          needsUpdate = true

        }
      }

      if (displayImageUrl && displayImageUrl.startsWith('/images/products/')) {
        const imagePath = path.join(__dirname, '../public', displayImageUrl)
        if (!fs.existsSync(imagePath)) {
          // Local image doesn't exist, revert to Poster URL
          const posterUrl = await imageService.findCorrectImageUrl(product.poster_product_id, true)
          updateData.display_image_url = posterUrl || ''
          needsUpdate = true

        }
      }

      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        })
        fixedCount++
      }
    }

    const result = {
      success: true,
      message: 'Image URLs fixed successfully',
      stats: {
        total_products: products.length,
        fixed_products: fixedCount
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Image URL fix failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image URL fix failed',
      message: error.message
    })
  }
})

// POST /api/sync/download-images - Download all product images from Poster API and store locally
router.post('/download-images', async (req, res) => {
  try {


    // Get all categories to fetch products by category
    const categories = await prisma.category.findMany({ where: { is_active: true } })


    let downloadedCount = 0
    let updatedCount = 0
    let totalProducts = 0

    for (const category of categories) {
      try {
        const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
          params: {
            token: POSTER_TOKEN,
            category_id: category.poster_category_id,
            type: 'products'
          }
        })

        const posterProducts = productsResponse.data.response || []
        totalProducts += posterProducts.length

        for (const posterProduct of posterProducts) {
          // Get the actual image URL from Poster API response
          let posterImageUrl = ''
          if (posterProduct.photo && posterProduct.photo !== '0') {
            // Use the actual photo URL from the API response
            if (posterProduct.photo_origin) {
              posterImageUrl = `https://joinposter.com${posterProduct.photo_origin}`
            } else if (posterProduct.photo) {
              posterImageUrl = `https://joinposter.com${posterProduct.photo}`
            }
          }

          // Download and process the image
          if (posterImageUrl) {
            const localImagePath = await imageService.processProductImage(
              posterProduct.product_id,
              true,
              posterImageUrl
            )

            if (localImagePath) {
              downloadedCount++

              // Update the product with local image path
              const updateResult = await prisma.product.updateMany({
                where: { poster_product_id: posterProduct.product_id },
                data: {
                  image_url: localImagePath,
                  display_image_url: localImagePath
                }
              })

              if (updateResult.count > 0) {
                updatedCount++

              }
            }
          }
        }

      } catch (error) {
        console.error(`❌ Failed to download images for category ${category.name}:`, error.message)
      }
    }

    const result = {
      success: true,
      message: 'Product images downloaded successfully',
      stats: {
        total_products: totalProducts,
        downloaded_images: downloadedCount,
        updated_products: updatedCount
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Image download failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image download failed',
      message: error.message
    })
  }
})

// POST /api/sync/fix-images-from-api - Fix product images using actual API URLs
router.post('/fix-images-from-api', async (req, res) => {
  try {


    // Get all categories to fetch products by category
    const categories = await prisma.category.findMany({ where: { is_active: true } })


    let updatedCount = 0
    let totalProducts = 0

    for (const category of categories) {
      try {
        const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
          params: {
            token: POSTER_TOKEN,
            category_id: category.poster_category_id,
            type: 'products'
          }
        })

        const posterProducts = productsResponse.data.response || []
        totalProducts += posterProducts.length

        for (const posterProduct of posterProducts) {
          // Get the actual image URL from Poster API response
          let imageUrl = ''
          if (posterProduct.photo && posterProduct.photo !== '0') {
            // Use the actual photo URL from the API response
            if (posterProduct.photo_origin) {
              imageUrl = `https://joinposter.com${posterProduct.photo_origin}`
            } else if (posterProduct.photo) {
              imageUrl = `https://joinposter.com${posterProduct.photo}`
            }
          }

          // Update the product image URL in database
          if (imageUrl) {
            const updateResult = await prisma.product.updateMany({
              where: { poster_product_id: posterProduct.product_id },
              data: {
                image_url: imageUrl,
                display_image_url: imageUrl
              }
            })

            if (updateResult.count > 0) {
              updatedCount++

            }
          }
        }

      } catch (error) {
        console.error(`❌ Failed to fix images for category ${category.name}:`, error.message)
      }
    }

    const result = {
      success: true,
      message: 'Product images fixed successfully',
      stats: {
        total_products: totalProducts,
        updated_products: updatedCount
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Image fix failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image fix failed',
      message: error.message
    })
  }
})

// POST /api/sync/fix-prices - Fix product prices from Poster API
router.post('/fix-prices', async (req, res) => {
  try {


    // Get all categories to fetch products by category
    const categories = await prisma.category.findMany({ where: { is_active: true } })


    let updatedCount = 0
    let totalProducts = 0

    for (const category of categories) {
      try {
        const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
          params: {
            token: POSTER_TOKEN,
            category_id: category.poster_category_id,
            type: 'products'
          }
        })

        const posterProducts = productsResponse.data.response || []
        totalProducts += posterProducts.length

        for (const posterProduct of posterProducts) {
          // Fix price parsing - Poster API returns prices as object {"1": "15500", "2": "15500", ...}
          let price = 0
          if (posterProduct.price) {
            if (typeof posterProduct.price === 'object') {
              // Get the first price level (usually "1")
              const firstPriceKey = Object.keys(posterProduct.price)[0]
              price = parseFloat(posterProduct.price[firstPriceKey] || 0)
            } else {
              price = parseFloat(posterProduct.price || 0)
            }
          }

          // Convert from kopecks to UAH (divide by 100)
          const priceInUAH = price / 100

          // Update the product price in database
          const updateResult = await prisma.product.updateMany({
            where: { poster_product_id: posterProduct.product_id },
            data: {
              price: isNaN(priceInUAH) ? 0 : priceInUAH,
              original_price: isNaN(priceInUAH) ? 0 : priceInUAH
            }
          })

          if (updateResult.count > 0) {
            updatedCount++

          }
        }

      } catch (error) {
        console.error(`❌ Failed to fix prices for category ${category.name}:`, error.message)
      }
    }

    const result = {
      success: true,
      message: 'Product prices fixed successfully',
      stats: {
        total_products: totalProducts,
        updated_products: updatedCount
      }
    }


    res.json(result)

  } catch (error) {
    console.error('❌ Price fix failed:', error)
    res.status(500).json({
      success: false,
      error: 'Price fix failed',
      message: error.message
    })
  }
})

// POST /api/sync/products-only - Sync only products, preserve existing categories
router.post('/products-only', async (req, res) => {
  let syncLog = null

  try {


    syncLog = await createSyncLog('products-only', 'in_progress')

    // Get existing categories from database (don't sync categories)
    const existingCategories = await prisma.category.findMany({
      where: { is_active: true }
    })

    // Create a map for quick category lookup by poster_category_id
    const categoryMap = new Map()
    existingCategories.forEach(cat => {
      if (cat.poster_category_id) {
        categoryMap.set(cat.poster_category_id, cat)
      }
    })

    // Sync products - get all products from Poster API

    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []


    const allProducts = []
    let syncedProductsCount = 0
    let skippedProductsCount = 0

    for (const posterProduct of posterProducts) {
      // Find the category for this product using menu_category_id
      const category = categoryMap.get(posterProduct.menu_category_id)
      if (!category) {

        skippedProductsCount++
        continue
      }

      // Parse price - handle both object and string formats
      let price = 0
      if (posterProduct.price) {
        if (typeof posterProduct.price === 'object') {
          const firstPriceKey = Object.keys(posterProduct.price)[0]
          price = parseFloat(posterProduct.price[firstPriceKey] || 0)
        } else {
          price = parseFloat(posterProduct.price || 0)
        }
      }

      // Convert from kopecks to UAH if needed
      const adjustedPrice = price > 1000 ? price / 100 : price

      // Determine if product is weight-based or beverage with kg unit
      // Note: Removed automatic targeting of "ікр" products - they should be piece-based unless manually configured
      const isWeightBased = false // Disabled automatic weight-based detection

      const isBeverageWithKgUnit = posterProduct.unit === 'kg' &&
        (posterProduct.product_name.toLowerCase().includes('пиво') ||
         posterProduct.product_name.toLowerCase().includes('beer') ||
         posterProduct.product_name.toLowerCase().includes('квас') ||
         posterProduct.product_name.toLowerCase().includes('лимонад'))

      // Handle image URL
      let posterImageUrl = ''
      if (posterProduct.photo_origin) {
        posterImageUrl = posterProduct.photo_origin
      } else if (posterProduct.photo) {
        posterImageUrl = posterProduct.photo
      }

      // Check if we have a local image
      let localImagePath = ''
      if (posterProduct.product_id) {
        const possibleExtensions = ['.png', '.jpg', '.jpeg']
        for (const ext of possibleExtensions) {
          const imagePath = `/images/products/product_${posterProduct.product_id}${ext}`
          const fullPath = path.join(__dirname, '..', 'public', imagePath)
          if (fs.existsSync(fullPath)) {
            localImagePath = imagePath
            break
          }
        }
      }

      // Parse attributes
      let attributes = null
      if (posterProduct.ingredients) {
        const ingredientsText = posterProduct.ingredients.toLowerCase()
        const alcoholMatch = ingredientsText.match(/(\d+(?:\.\d+)?)\s*%/)
        const alcohol = alcoholMatch ? parseFloat(alcoholMatch[1]) : null

        if (alcohol !== null) {
          attributes = { alcohol_content: alcohol }
        }
      }

      const productData = {
        poster_product_id: posterProduct.product_id,
        ingredient_id: posterProduct.ingredient_id || null,
        category_id: category.id, // Use existing category
        name: posterProduct.product_name,
        display_name: posterProduct.product_name,
        description: posterProduct.ingredients || '',
        price: adjustedPrice,
        original_price: adjustedPrice,
        image_url: localImagePath || posterImageUrl || '',
        display_image_url: localImagePath || posterImageUrl || '',
        is_active: posterProduct.out !== '1',
        attributes: attributes,
        custom_quantity: isWeightBased ? 0.05 : (isBeverageWithKgUnit ? 0.5 : null),
        custom_unit: isWeightBased ? 'г' : (isBeverageWithKgUnit ? 'л' : null),
        quantity_step: (isWeightBased || isBeverageWithKgUnit) ? 1 : null
      }

      // Get existing product to preserve custom quantities
      const existingProduct = await prisma.product.findUnique({
        where: { poster_product_id: posterProduct.product_id }
      })

      // Upsert product (update if exists, create if not)
      const product = await prisma.product.upsert({
        where: { poster_product_id: posterProduct.product_id },
        update: {
          // Update product data but preserve category assignment
          name: productData.name,
          display_name: productData.display_name,
          description: productData.description,
          price: productData.price,
          original_price: productData.original_price,
          image_url: productData.image_url,
          display_image_url: productData.display_image_url,
          is_active: productData.is_active,
          attributes: productData.attributes ? JSON.stringify(productData.attributes) : null,
          // Preserve existing custom quantity fields if they exist, otherwise use defaults
          custom_quantity: existingProduct?.custom_quantity ?? productData.custom_quantity,
          custom_unit: existingProduct?.custom_unit ?? productData.custom_unit,
          quantity_step: existingProduct?.quantity_step ?? productData.quantity_step
        },
        create: {
          ...productData,
          attributes: productData.attributes ? JSON.stringify(productData.attributes) : null
        }
      })

      allProducts.push(product)
      syncedProductsCount++

      if (syncedProductsCount % 50 === 0) {

      }
    }

    // Update sync log
    await updateSyncLog(
      syncLog.id,
      'completed',
      syncedProductsCount, // total_records as integer
      null, // no error message
      JSON.stringify({ // details as JSON string
        synced_products: syncedProductsCount,
        skipped_products: skippedProductsCount,
        total_poster_products: posterProducts.length,
        preserved_categories: existingCategories.length
      })
    )







    res.json({
      success: true,
      message: `Products-only sync completed! Synced ${syncedProductsCount} products while preserving ${existingCategories.length} existing categories.`,
      stats: {
        synced_products: syncedProductsCount,
        skipped_products: skippedProductsCount,
        total_poster_products: posterProducts.length,
        preserved_categories: existingCategories.length,
        sync_type: 'products-only'
      }
    })

  } catch (error) {
    console.error('❌ Products-only sync failed:', error)

    // Update sync log with error
    if (syncLog) {
      await updateSyncLog(syncLog.id, 'failed', null, error.message)
    }

    res.status(500).json({
      success: false,
      error: 'Products-only sync failed',
      message: error.message
    })
  }
})

// POST /api/sync/prices-only - Sync only product prices from Poster POS
router.post('/prices-only', async (req, res) => {
  let syncLog = null

  try {


    syncLog = await createSyncLog('prices-only', 'in_progress')

    // Get all products from Poster API
    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []

    let updatedProductsCount = 0
    let skippedProductsCount = 0

    for (const posterProduct of posterProducts) {
      try {
        // Find existing product by poster_product_id
        const existingProduct = await prisma.product.findFirst({
          where: { poster_product_id: posterProduct.product_id }
        })

        if (existingProduct) {
          // Use price object with key "1" for price level 1
          let priceInKopecks = 0
          if (posterProduct.price && typeof posterProduct.price === 'object') {
            priceInKopecks = parseInt(posterProduct.price['1']) || 0
          }
          let newPrice = priceInKopecks / 100 // Convert from kopecks to UAH

          // For weight-based products (weight_flag = 1), divide by 10
          // to convert from 100g price to 1kg price for display
          if (posterProduct.weight_flag === 1) {
            newPrice = newPrice / 10
          }

          // Only update if price has changed
          if (Math.abs(existingProduct.price - newPrice) > 0.01) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                price: newPrice,
                updated_at: new Date()
              }
            })
            updatedProductsCount++
            console.log(`💰 Updated price for ${existingProduct.name}: ${existingProduct.price} → ${newPrice} UAH`)

          } else {
            skippedProductsCount++
          }
        } else {
          skippedProductsCount++

        }
      } catch (productError) {
        console.error(`❌ Error updating price for product ${posterProduct.product_id}:`, productError)
        skippedProductsCount++
      }
    }

    // Update sync log with success
    await updateSyncLog(syncLog.id, 'completed', updatedProductsCount, null, JSON.stringify({
      updated_products: updatedProductsCount,
      skipped_products: skippedProductsCount,
      total_poster_products: posterProducts.length,
      sync_type: 'prices-only'
    }))



    res.json({
      success: true,
      message: `Price sync completed! Updated prices for ${updatedProductsCount} products from Poster POS.`,
      stats: {
        updated_products: updatedProductsCount,
        skipped_products: skippedProductsCount,
        total_poster_products: posterProducts.length,
        sync_type: 'prices-only'
      }
    })

  } catch (error) {
    console.error('❌ Price sync failed:', error)

    // Update sync log with error
    if (syncLog) {
      await updateSyncLog(syncLog.id, 'failed', null, error.message)
    }

    res.status(500).json({
      success: false,
      error: 'Price sync failed',
      message: error.message
    })
  }
})




// GET /api/sync/check-images - Check image URLs in database
router.get('/check-images', async (req, res) => {
  try {
    // Check products with joinposter URLs
    const posterUrls = await prisma.product.findMany({
      where: {
        OR: [
          { image_url: { contains: 'joinposter.com' } },
          { display_image_url: { contains: 'joinposter.com' } }
        ]
      },
      select: { id: true, name: true, image_url: true, display_image_url: true, poster_product_id: true }
    })

    // Check products with Railway URLs
    const railwayUrls = await prisma.product.findMany({
      where: {
        OR: [
          { image_url: { contains: 'railway.app' } },
          { display_image_url: { contains: 'railway.app' } }
        ]
      },
      select: { id: true, name: true, image_url: true, display_image_url: true, poster_product_id: true }
    })

    // Check products with placeholder images
    const placeholderUrls = await prisma.product.findMany({
      where: {
        OR: [
          { image_url: { contains: 'placeholder' } },
          { display_image_url: { contains: 'placeholder' } }
        ]
      },
      select: { id: true, name: true, image_url: true, display_image_url: true, poster_product_id: true }
    })

    res.json({
      poster_urls: posterUrls.length,
      railway_urls: railwayUrls.length,
      placeholder_urls: placeholderUrls.length,
      examples: {
        poster: posterUrls.slice(0, 3),
        railway: railwayUrls.slice(0, 3),
        placeholder: placeholderUrls.slice(0, 3)
      }
    })

  } catch (error) {
    console.error('❌ Check images failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/sync/fix-image-urls - Force update all image URLs to Railway
router.post('/fix-image-urls', async (req, res) => {
  try {


    // Get all products that have poster_product_id
    const products = await prisma.product.findMany({
      where: {
        poster_product_id: { not: null }
      },
      select: { id: true, name: true, poster_product_id: true, image_url: true, display_image_url: true }
    })



    let updatedCount = 0
    let skippedCount = 0

    for (const product of products) {
      try {
        // Check if local image files exist
        const expectedImagePath = path.join(__dirname, '..', 'public', 'images', 'products', `product_${product.poster_product_id}.png`)
        const expectedImagePathJpeg = path.join(__dirname, '..', 'public', 'images', 'products', `product_${product.poster_product_id}.jpeg`)

        let localImagePath = null
        if (fs.existsSync(expectedImagePath)) {
          localImagePath = `/images/products/product_${product.poster_product_id}.png`
        } else if (fs.existsSync(expectedImagePathJpeg)) {
          localImagePath = `/images/products/product_${product.poster_product_id}.jpeg`
        }

        if (localImagePath) {
          // Update both image_url and display_image_url to local Railway path
          await prisma.product.update({
            where: { id: product.id },
            data: {
              image_url: localImagePath,
              display_image_url: localImagePath
            }
          })

          updatedCount++
        } else {

          skippedCount++
        }

      } catch (error) {
        console.error(`❌ Error updating ${product.name}:`, error)
      }
    }

    const result = {
      total_products: products.length,
      updated: updatedCount,
      skipped: skippedCount
    }


    res.json({ success: true, ...result })

  } catch (error) {
    console.error('❌ Image URL fix failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/sync/images-only - Sync only images from Poster API
router.post('/images-only', async (req, res) => {
  try {


    // Get all products from database (not from API)
    const existingProducts = await prisma.product.findMany({
      select: {
        id: true,
        poster_product_id: true,
        name: true,
        image_url: true
      }
    })



    // Get fresh product data from Poster API to get latest image URLs
    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []


    let downloadedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Process each existing product
    for (const dbProduct of existingProducts) {
      try {
        // Find corresponding product in Poster API data
        const posterProduct = posterProducts.find(p => p.product_id === dbProduct.poster_product_id)

        if (!posterProduct) {

          skippedCount++
          continue
        }

        // Get image URL from Poster API
        let posterImageUrl = ''
        if (posterProduct.photo_origin) {
          posterImageUrl = posterProduct.photo_origin
        } else if (posterProduct.photo) {
          posterImageUrl = posterProduct.photo
        }

        if (!posterImageUrl) {

          skippedCount++
          continue
        }

        // Check if the image file exists locally first
        const expectedImagePath = path.join(__dirname, '..', 'public', 'images', 'products', `product_${dbProduct.poster_product_id}.png`)
        const expectedImagePathJpeg = path.join(__dirname, '..', 'public', 'images', 'products', `product_${dbProduct.poster_product_id}.jpeg`)
        const imageExists = fs.existsSync(expectedImagePath) || fs.existsSync(expectedImagePathJpeg)

        if (imageExists) {
          // Image exists locally - make sure database URL is correct
          const localImagePath = fs.existsSync(expectedImagePath)
            ? `/images/products/product_${dbProduct.poster_product_id}.png`
            : `/images/products/product_${dbProduct.poster_product_id}.jpeg`

          // Always update the database URL to ensure it's correct
          await prisma.product.update({
            where: { id: dbProduct.id },
            data: {
              image_url: localImagePath,
              display_image_url: localImagePath
            }
          })

          skippedCount++
          continue
        }

        // If image doesn't exist locally, we need to download it




        // Download and save the image using imageService
        const localImagePath = await imageService.downloadAndSaveImage(
          posterImageUrl,
          `product_${dbProduct.poster_product_id}`,
          'products'
        )

        if (localImagePath) {
          // Update product with new local image path
          await prisma.product.update({
            where: { id: dbProduct.id },
            data: {
              image_url: localImagePath,
              display_image_url: localImagePath
            }
          })


          downloadedCount++
        } else {

          errorCount++
        }

      } catch (error) {
        console.error(`❌ Error processing ${dbProduct.name}:`, error)
        errorCount++
      }
    }

    const summary = {
      total_products: existingProducts.length,
      images_downloaded: downloadedCount,
      images_skipped: skippedCount,
      errors: errorCount
    }



    res.json({
      success: true,
      message: 'Image sync completed successfully',
      summary
    })

  } catch (error) {
    console.error('❌ Image sync failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image sync failed',
      message: error.message
    })
  }
})

// POST /api/sync/upload-images-to-minio - Upload all product images to MinIO
router.post('/upload-images-to-minio', async (req, res) => {
  try {
    console.log('📤 Starting image upload to MinIO...')

    // Get all products with image URLs (both local and MinIO)
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        image_url: { not: null }
      },
      select: {
        id: true,
        poster_product_id: true,
        name: true,
        image_url: true,
        display_image_url: true
      }
    })

    console.log(`📊 Found ${products.length} products to process`)

    let uploadedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        // Always try to upload - even if URL says minio://, the file might not be there
        // Upload local image to MinIO
        const minioUrl = await imageService.uploadLocalImageToMinIO(product.poster_product_id)

        if (minioUrl) {
          // Update product with MinIO URL if it changed
          if (product.image_url !== minioUrl) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                image_url: minioUrl,
                display_image_url: minioUrl
              }
            })
            uploadedCount++
            console.log(`✅ Uploaded image for ${product.name} to MinIO`)
          } else {
            // Already has correct MinIO URL
            skippedCount++
          }
        } else {
          // No local image file found
          skippedCount++
        }
      } catch (error) {
        console.error(`❌ Error processing ${product.name}:`, error.message)
        errorCount++
      }
    }

    const result = {
      success: true,
      message: `Image upload to MinIO completed! Uploaded ${uploadedCount} images.`,
      stats: {
        total_products: products.length,
        uploaded: uploadedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    }

    console.log('🎉 Image upload completed:', result.stats)
    res.json(result)

  } catch (error) {
    console.error('❌ Image upload to MinIO failed:', error)
    res.status(500).json({
      success: false,
      error: 'Image upload to MinIO failed',
      message: error.message
    })
  }
})

// GET /api/sync/logs - Get sync logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const logs = await prisma.syncLog.findMany({
      orderBy: { created_at: 'desc' },
      take: limit
    })

    res.json({
      success: true,
      logs: logs
    })
  } catch (error) {
    console.error('❌ Failed to fetch sync logs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync logs',
      message: error.message
    })
  }
})

// POST /api/sync/daily - DEPRECATED: Use manual endpoints instead
// Use /api/sync/update-prices for manual price updates
// Use /api/sync/import-new-products for manual new product imports
// Daily sync has been removed - all syncs are now manual through Admin Panel

// POST /api/sync/update-prices - Manual price update from Poster POS
router.post('/update-prices', async (req, res) => {
  let syncLog = null

  try {
    console.log('💰 Starting manual price update...')

    syncLog = await createSyncLog('manual-price-update', 'in_progress')

    // Get all products from Poster API
    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []
    console.log(`📊 Found ${posterProducts.length} products in Poster POS`)

    // Get all existing products from database
    const existingProducts = await prisma.product.findMany({
      select: { poster_product_id: true, price: true, id: true, name: true }
    })

    let updatedPricesCount = 0
    let skippedProductsCount = 0
    let errorCount = 0

    // Process each product from Poster
    for (const posterProduct of posterProducts) {
      try {
        const existingProduct = existingProducts.find(p => String(p.poster_product_id) === String(posterProduct.product_id))

        if (existingProduct) {
          // Calculate new price - use price object with key "1" for price level 1
          let priceInKopecks = 0
          if (posterProduct.price && typeof posterProduct.price === 'object') {
            priceInKopecks = parseInt(posterProduct.price['1']) || 0
          }
          let newPrice = priceInKopecks / 100 // Convert from kopecks to UAH

          if (posterProduct.weight_flag === 1) {
            newPrice = newPrice / 10 // For weight-based products, divide by 10
          }

          // Only update if price has changed
          if (Math.abs(existingProduct.price - newPrice) > 0.01) {
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                price: newPrice,
                updated_at: new Date()
              }
            })

            updatedPricesCount++
            console.log(`💰 Updated price for ${existingProduct.name}: ${existingProduct.price} → ${newPrice} UAH`)
          } else {
            skippedProductsCount++
          }
        }
      } catch (productError) {
        console.error(`❌ Error updating price for product ${posterProduct.product_id}:`, productError)
        errorCount++
      }
    }

    // Update sync log with success
    const syncDetails = {
      updated_prices: updatedPricesCount,
      skipped_products: skippedProductsCount,
      errors: errorCount,
      total_poster_products: posterProducts.length,
      sync_type: 'manual-price-update'
    }

    await updateSyncLog(syncLog.id, 'completed', updatedPricesCount, null, JSON.stringify(syncDetails))

    const result = {
      success: true,
      message: `Price update completed! Updated ${updatedPricesCount} prices.`,
      stats: {
        updated_prices: updatedPricesCount,
        skipped_products: skippedProductsCount,
        errors: errorCount,
        total_poster_products: posterProducts.length,
        sync_type: 'manual-price-update'
      }
    }

    console.log('🎉 Price update completed:', result.stats)
    res.json(result)

  } catch (error) {
    console.error('❌ Price update failed:', error)

    // Update sync log with error
    if (syncLog) {
      await updateSyncLog(syncLog.id, 'failed', null, error.message)
    }

    res.status(500).json({
      success: false,
      error: 'Price update failed',
      message: error.message
    })
  }
})

// POST /api/sync/import-new-products - Manual import of new products from Poster POS
router.post('/import-new-products', async (req, res) => {
  let syncLog = null

  try {
    console.log('🆕 Starting manual new products import...')

    syncLog = await createSyncLog('manual-new-products-import', 'in_progress')

    // Get all products from Poster API
    const productsResponse = await axios.get(`${POSTER_API_BASE}/menu.getProducts`, {
      params: {
        token: POSTER_TOKEN
      }
    })

    const posterProducts = productsResponse.data.response || []
    console.log(`📊 Found ${posterProducts.length} products in Poster POS`)

    // Get all existing products from database
    const existingProducts = await prisma.product.findMany({
      select: { poster_product_id: true }
    })

    const existingProductIds = new Set(existingProducts.map(p => String(p.poster_product_id)))

    let newProductsCount = 0
    let skippedProductsCount = 0
    let errorCount = 0

    // Process each product from Poster
    for (const posterProduct of posterProducts) {
      try {
        const isNewProduct = !existingProductIds.has(String(posterProduct.product_id))

        if (isNewProduct) {
          // NEW PRODUCT: Import it
          console.log(`🆕 New product found: ${posterProduct.product_name} (ID: ${posterProduct.product_id})`)

          // Get category for the product
          let categoryId = null
          if (posterProduct.menu_category_id) {
            const category = await prisma.category.findFirst({
              where: { poster_category_id: String(posterProduct.menu_category_id) }
            })
            categoryId = category?.id
          }

          // If no category found, try to get any category or create a default one
          if (!categoryId) {
            let defaultCategory = await prisma.category.findFirst({
              where: { name: 'Інші' }
            })
            if (!defaultCategory) {
              defaultCategory = await prisma.category.create({
                data: {
                  name: 'Інші',
                  display_name: 'Інші товари',
                  is_active: true
                }
              })
            }
            categoryId = defaultCategory.id
          }

          // Calculate price - use price object with key "1" for price level 1
          let priceInKopecks = 0
          if (posterProduct.price && typeof posterProduct.price === 'object') {
            priceInKopecks = parseInt(posterProduct.price['1']) || 0
          }
          let price = priceInKopecks / 100 // Convert from kopecks to UAH

          if (posterProduct.weight_flag === 1) {
            price = price / 10 // For weight-based products, divide by 10
          }

          // Create new product
          await prisma.product.create({
            data: {
              poster_product_id: String(posterProduct.product_id),
              name: posterProduct.product_name || `Product ${posterProduct.product_id}`,
              display_name: posterProduct.product_name || `Product ${posterProduct.product_id}`,
              description: posterProduct.product_name || '',
              price: price,
              category_id: categoryId,
              is_active: true,
              custom_unit: posterProduct.weight_flag === 1 ? 'кг' : 'шт',
              created_at: new Date(),
              updated_at: new Date()
            }
          })

          newProductsCount++
          console.log(`✅ Imported new product: ${posterProduct.product_name} (Price: ${price} UAH)`)
        } else {
          skippedProductsCount++
        }

      } catch (productError) {
        console.error(`❌ Error processing product ${posterProduct.product_id}:`, productError.message || productError)
        console.error(`   Product details: ${posterProduct.product_name}`)
        console.error(`   Full error:`, productError)
        errorCount++
      }
    }

    // Update sync log with success
    const syncDetails = {
      new_products: newProductsCount,
      skipped_products: skippedProductsCount,
      errors: errorCount,
      total_poster_products: posterProducts.length,
      sync_type: 'manual-new-products-import'
    }

    await updateSyncLog(syncLog.id, 'completed', newProductsCount, null, JSON.stringify(syncDetails))

    const result = {
      success: true,
      message: `New products import completed! Added ${newProductsCount} new products.`,
      stats: {
        new_products: newProductsCount,
        skipped_products: skippedProductsCount,
        errors: errorCount,
        total_poster_products: posterProducts.length,
        sync_type: 'manual-new-products-import'
      }
    }

    console.log('🎉 New products import completed:', result.stats)
    res.json(result)

  } catch (error) {
    console.error('❌ New products import failed:', error)

    // Update sync log with error
    if (syncLog) {
      await updateSyncLog(syncLog.id, 'failed', null, error.message)
    }

    res.status(500).json({
      success: false,
      error: 'New products import failed',
      message: error.message
    })
  }
})

export default router
