import express from 'express'
import { getProducts, createProduct, prisma, generateSlug, transliterateCyrillic } from '../services/database.js'

const router = express.Router()

// GET /api/products/admin/all - Get all products for admin panel (no branch required)
router.get('/admin/all', async (req, res) => {
  try {
    const { includeInactive } = req.query
    const includeInactiveFlag = includeInactive === 'true'

    // Get all products without branch filtering for admin use
    const where = includeInactiveFlag ? {} : { is_active: true }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { sort_order: 'asc' }
      ]
    })

    // Format products with parsed attributes and bundle_items
    const formattedProducts = products.map(product => ({
      id: product.id,
      poster_product_id: product.poster_product_id,
      ingredient_id: product.ingredient_id,
      category_id: product.category_id,
      name: product.name,
      display_name: product.display_name,
      slug: product.slug,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url || '',
      display_image_url: product.display_image_url || '',
      sort_order: product.sort_order,
      is_active: product.is_active,
      requires_bottles: product.requires_bottles || false,
      attributes: product.attributes ? JSON.parse(product.attributes) : [],
      custom_quantity: product.custom_quantity,
      custom_unit: product.custom_unit,
      quantity_step: product.quantity_step,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity,
      is_new: product.is_new || false,
      new_until: product.new_until ? product.new_until.toISOString() : null,
      sale_expires_at: product.sale_expires_at ? product.sale_expires_at.toISOString() : null,
      is_bundle: product.is_bundle || false,
      bundle_items: product.bundle_items ? JSON.parse(product.bundle_items) : [],
      category_name: product.category?.display_name,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        display_name: product.category.display_name,
        slug: product.category.slug
      } : null,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString()
    }))

    res.json(formattedProducts)
  } catch (error) {
    console.error('Error fetching admin products:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch products' })
  }
})

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { categoryId, branchId, includeInactive } = req.query

    // branchId is now required to prevent incorrect inventory display
    if (!branchId) {
      return res.status(400).json({
        error: 'branchId is required. Please specify a branch to get accurate inventory data.'
      })
    }

    const includeInactiveFlag = includeInactive === 'true'
    const products = await getProducts(categoryId, branchId, includeInactiveFlag)
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch products' })
  }
})

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const product = await createProduct(req.body)
    res.status(201).json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// GET /api/products/by-slug/:slug - Get product by slug
// MUST be before /:id route to avoid route matching issues
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    const { branchId } = req.query

    console.log(`🔍 [Backend] Fetching product by slug: "${slug}"`)
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true
      }
    })

    if (!product) {
      console.log(`❌ [Backend] Product not found for slug: "${slug}"`)
      return res.status(404).json({ error: 'Product not found' })
    }

    // Format product response with parsed attributes and bundle_items
    const formattedProduct = {
      id: product.id,
      poster_product_id: product.poster_product_id,
      ingredient_id: product.ingredient_id,
      category_id: product.category_id,
      name: product.name,
      display_name: product.display_name,
      slug: product.slug,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url || '',
      display_image_url: product.display_image_url || '',
      sort_order: product.sort_order,
      is_active: product.is_active,
      requires_bottles: product.requires_bottles || false,
      attributes: product.attributes ? JSON.parse(product.attributes) : [],
      custom_quantity: product.custom_quantity,
      custom_unit: product.custom_unit,
      quantity_step: product.quantity_step,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity,
      is_new: product.is_new || false,
      new_until: product.new_until ? product.new_until.toISOString() : null,
      sale_expires_at: product.sale_expires_at ? product.sale_expires_at.toISOString() : null,
      is_bundle: product.is_bundle || false,
      bundle_items: product.bundle_items ? JSON.parse(product.bundle_items) : [],
      category_name: product.category?.display_name,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        display_name: product.category.display_name,
        slug: product.category.slug
      } : null,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString()
    }

    console.log(`✅ [Backend] Found product: "${product.display_name}" (ID: ${product.id})`)

    // If branchId is provided, include inventory data
    if (branchId) {
      const inventory = await prisma.productInventory.findUnique({
        where: {
          product_id_branch_id: {
            product_id: product.id,
            branch_id: branchId
          }
        }
      })

      return res.json({
        ...formattedProduct,
        quantity: inventory?.quantity || 0,
        unit: inventory?.unit || 'pcs',
        available: (inventory?.quantity || 0) > 0
      })
    }

    res.json({
      ...formattedProduct,
      quantity: 0,
      unit: 'pcs',
      available: false
    })
  } catch (error) {
    console.error(`❌ Error fetching product by slug ${req.params.slug}:`, error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// GET /api/products/:id - Get product by ID
// MUST be after /by-slug route to avoid route matching issues
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Format product response with parsed attributes and bundle_items
    const formattedProduct = {
      id: product.id,
      poster_product_id: product.poster_product_id,
      ingredient_id: product.ingredient_id,
      category_id: product.category_id,
      name: product.name,
      display_name: product.display_name,
      slug: product.slug,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url || '',
      display_image_url: product.display_image_url || '',
      sort_order: product.sort_order,
      is_active: product.is_active,
      requires_bottles: product.requires_bottles || false,
      attributes: product.attributes ? JSON.parse(product.attributes) : [],
      custom_quantity: product.custom_quantity,
      custom_unit: product.custom_unit,
      quantity_step: product.quantity_step,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity,
      is_new: product.is_new || false,
      new_until: product.new_until ? product.new_until.toISOString() : null,
      sale_expires_at: product.sale_expires_at ? product.sale_expires_at.toISOString() : null,
      is_bundle: product.is_bundle || false,
      bundle_items: product.bundle_items ? JSON.parse(product.bundle_items) : [],
      category_name: product.category?.display_name,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        display_name: product.category.display_name,
        slug: product.category.slug
      } : null,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
      quantity: 0,
      unit: 'pcs',
      available: false
    }

    res.json(formattedProduct)
  } catch (error) {
    console.error(`❌ Error fetching product by ID ${req.params.id}:`, error)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products/generate-slugs - Generate missing product slugs
// MUST be before /:id route to avoid route matching issues
router.post('/generate-slugs', async (req, res) => {
  try {


    // Get all products
    const products = await prisma.product.findMany()



    let updated = 0
    for (const product of products) {
      const generatedSlug = generateSlug(product.display_name)
      // Update if slug is missing OR if it doesn't match the display name (renamed in Poster)
      if (generatedSlug && product.slug !== generatedSlug) {
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: generatedSlug }
        })

        updated++
      }
    }

    res.json({
      message: `Generated ${updated} slugs`,
      updated,
      total: products.length
    })
  } catch (error) {
    console.error('❌ Error generating product slugs:', error)
    res.status(500).json({ error: 'Failed to generate product slugs' })
  }
})

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params


    const {
      poster_product_id,
      ingredient_id,
      category_id,
      name,
      display_name,
      subtitle,
      description,
      price,
      original_price,
      image_url,
      display_image_url,
      is_active,
      requires_bottles,
      attributes,
      custom_quantity,
      custom_unit,
      quantity_step,
      min_quantity,
      max_quantity,
      is_new,
      new_until,
      sale_expires_at,
      is_bundle,
      bundle_items
    } = req.body

    // Validation
    if (!display_name || display_name.trim() === '') {
      return res.status(400).json({ error: 'Display name is required' })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        poster_product_id,
        ingredient_id,
        category_id,
        name,
        display_name,
        subtitle,
        description,
        price,
        original_price,
        image_url,
        display_image_url,
        is_active,
        requires_bottles: requires_bottles || false,
        attributes: attributes ? JSON.stringify(attributes) : null,
        custom_quantity: custom_quantity || null,
        custom_unit: custom_unit || null,
        quantity_step: quantity_step || null,
        min_quantity: min_quantity || null,
        max_quantity: max_quantity || null,
        is_new: is_new || false,
        new_until: new_until ? new Date(new_until) : null,
        sale_expires_at: sale_expires_at ? new Date(sale_expires_at) : null,
        is_bundle: is_bundle || false,
        bundle_items: bundle_items ? JSON.stringify(bundle_items) : null
      },
      include: {
        category: true,
        inventory: true
      }
    })

    const inventory = product.inventory[0] // Get first inventory if available

    const formattedProduct = {
      id: product.id,
      poster_product_id: product.poster_product_id,
      ingredient_id: product.ingredient_id,
      category_id: product.category_id,
      name: product.name,
      display_name: product.display_name,
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url || '',
      display_image_url: product.display_image_url || '',
      quantity: inventory?.quantity || 0,
      unit: inventory?.unit || 'pcs',
      available: inventory ? inventory.quantity > 0 : false,
      is_active: product.is_active,
      requires_bottles: product.requires_bottles || false,
      attributes: product.attributes ? JSON.parse(product.attributes) : [],
      custom_quantity: product.custom_quantity,
      custom_unit: product.custom_unit,
      quantity_step: product.quantity_step,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity,
      // New product badge and sale features
      is_new: product.is_new || false,
      new_until: product.new_until ? product.new_until.toISOString() : null,
      sale_expires_at: product.sale_expires_at ? product.sale_expires_at.toISOString() : null,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        display_name: product.category.display_name
      } : null,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString()
    }


    res.json(formattedProduct)
  } catch (error) {
    console.error(`❌ Error updating product ${req.params.id}:`, error)
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      meta: error.meta
    })

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this name already exists' })
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.status(500).json({
      error: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/products/:id/inventory/:branchId - Get detailed inventory information for a product in a specific branch
router.get('/:id/inventory/:branchId', async (req, res) => {
  try {
    const { id: productId, branchId } = req.params


    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        is_available: false,
        available_quantity: 0,
        unit: 'p',
        error: 'Product not found'
      })
    }

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!branch) {
      return res.status(404).json({
        is_available: false,
        available_quantity: 0,
        unit: 'p',
        error: 'Branch not found'
      })
    }

    // Check inventory for this product in this branch
    const inventory = await prisma.productInventory.findUnique({
      where: {
        product_id_branch_id: {
          product_id: productId,
          branch_id: branchId
        }
      }
    })

    const availableQuantity = inventory?.quantity || 0
    const unit = inventory?.unit || 'p'
    const isAvailable = availableQuantity > 0

    res.json({
      product_id: productId,
      is_available: isAvailable,
      available_quantity: availableQuantity,
      unit: unit,
      product_name: product.name,
      branch_name: branch.name
    })

  } catch (error) {
    console.error('❌ Error getting product inventory:', error)
    res.status(500).json({
      is_available: false,
      available_quantity: 0,
      unit: 'p',
      error: 'Failed to get inventory'
    })
  }
})

// GET /api/products/:id/availability/:branchId - Check product availability in specific branch (legacy endpoint)
router.get('/:id/availability/:branchId', async (req, res) => {
  try {
    const { id: productId, branchId } = req.params


    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({
        available: false,
        quantity: 0,
        error: 'Product not found'
      })
    }

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!branch) {
      return res.status(404).json({
        available: false,
        quantity: 0,
        error: 'Branch not found'
      })
    }

    // Check inventory for this product in this branch
    const inventory = await prisma.productInventory.findUnique({
      where: {
        product_id_branch_id: {
          product_id: productId,
          branch_id: branchId
        }
      }
    })

    const quantity = inventory?.quantity || 0
    const available = quantity > 0

    res.json({
      available,
      quantity,
      unit: inventory?.unit || 'pcs',
      product_name: product.name,
      branch_name: branch.name
    })

  } catch (error) {
    console.error('❌ Error checking product availability:', error)
    res.status(500).json({
      available: false,
      quantity: 0,
      error: 'Failed to check availability'
    })
  }
})

// PUT /api/products/:id/slug - Update product slug
router.put('/:id/slug', async (req, res) => {
  try {
    const { id } = req.params
    const { slug } = req.body

    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Slug is required' })
    }

    // Validate slug format (should be URL-friendly)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ error: 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)' })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if slug is already in use by another product
    const existingSlug = await prisma.product.findFirst({
      where: {
        slug: slug,
        id: { not: id }
      }
    })

    if (existingSlug) {
      return res.status(400).json({ error: 'This slug is already in use by another product' })
    }

    // Update the slug
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { slug },
      include: {
        category: true,
        inventory: true
      }
    })

    const inventory = updatedProduct.inventory[0]

    const formattedProduct = {
      id: updatedProduct.id,
      poster_product_id: updatedProduct.poster_product_id,
      category_id: updatedProduct.category_id,
      name: updatedProduct.name,
      display_name: updatedProduct.display_name,
      slug: updatedProduct.slug,
      subtitle: updatedProduct.subtitle,
      description: updatedProduct.description,
      price: updatedProduct.price,
      original_price: updatedProduct.original_price,
      image_url: updatedProduct.image_url,
      display_image_url: updatedProduct.display_image_url,
      is_active: updatedProduct.is_active,
      requires_bottles: updatedProduct.requires_bottles || false,
      attributes: updatedProduct.attributes ? JSON.parse(updatedProduct.attributes) : [],
      custom_quantity: updatedProduct.custom_quantity,
      custom_unit: updatedProduct.custom_unit,
      quantity_step: updatedProduct.quantity_step,
      min_quantity: updatedProduct.min_quantity,
      max_quantity: updatedProduct.max_quantity,
      is_new: updatedProduct.is_new || false,
      new_until: updatedProduct.new_until ? updatedProduct.new_until.toISOString() : null,
      sale_expires_at: updatedProduct.sale_expires_at ? updatedProduct.sale_expires_at.toISOString() : null,
      category: updatedProduct.category ? {
        id: updatedProduct.category.id,
        name: updatedProduct.category.name,
        display_name: updatedProduct.category.display_name
      } : null,
      created_at: updatedProduct.created_at.toISOString(),
      updated_at: updatedProduct.updated_at.toISOString()
    }

    res.json(formattedProduct)
  } catch (error) {
    console.error(`❌ Error updating product slug ${req.params.id}:`, error)
    res.status(500).json({
      error: 'Failed to update product slug',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// POST /api/products/bulk-edit - Bulk edit multiple products
router.post('/bulk-edit', async (req, res) => {
  try {


    const { productIds, updates } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs are required' })
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Updates object is required' })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each product individually for better error handling
    for (const productId of productIds) {
      try {
        const updateData = {}

        // Handle category update
        if (updates.category_id) {
          updateData.category_id = updates.category_id
        }

        // Handle status updates
        if (updates.is_active !== undefined) {
          updateData.is_active = updates.is_active
        }
        if (updates.requires_bottles !== undefined) {
          updateData.requires_bottles = updates.requires_bottles
        }

        // Handle custom quantity updates with price adjustment
        if (updates.custom_quantity !== undefined) {
          // Get current product to calculate price adjustment
          const currentProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true, custom_quantity: true, original_price: true }
          })

          if (currentProduct) {
            const newCustomQuantity = updates.custom_quantity
            const oldCustomQuantity = currentProduct.custom_quantity

            // If changing from no custom quantity to custom quantity, or changing custom quantity
            if (newCustomQuantity && newCustomQuantity > 0) {
              if (!oldCustomQuantity || oldCustomQuantity === 0) {
                // Converting from regular product to weight-based product
                // Keep the original price as price per kg, calculate display price
                updateData.custom_quantity = newCustomQuantity
                updateData.custom_unit = updates.custom_unit || 'kg'
                updateData.quantity_step = updates.quantity_step || newCustomQuantity
                // Price stays the same (price per kg)
              } else {
                // Changing custom quantity on existing weight-based product
                // Only update the custom quantity fields, keep the price as-is
                updateData.custom_quantity = newCustomQuantity
                updateData.custom_unit = updates.custom_unit || currentProduct.custom_unit || 'г'
                updateData.quantity_step = updates.quantity_step || 1
                // Do not automatically adjust price - let user set it manually
              }
            } else {
              // Removing custom quantity (converting back to regular product)
              updateData.custom_quantity = null
              updateData.custom_unit = null
              updateData.quantity_step = null
              // Keep current price as is
            }
          }
        } else {
          // Handle individual custom quantity fields if not updating as a group
          if (updates.custom_unit !== undefined) {
            updateData.custom_unit = updates.custom_unit
          }
          if (updates.quantity_step !== undefined) {
            updateData.quantity_step = updates.quantity_step
          }
        }

        // Handle price adjustments
        if (updates.priceAdjustment) {
          const { type, value } = updates.priceAdjustment

          // Get current product to calculate new price
          const currentProduct = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true, original_price: true, custom_quantity: true, custom_unit: true }
          })

          if (currentProduct) {
            let newPrice = currentProduct.price
            const isWeightBased = currentProduct.custom_quantity && currentProduct.custom_quantity > 0

            switch (type) {
              case 'set':
                newPrice = parseFloat(value)
                break
              case 'increase_percent':
                newPrice = currentProduct.price * (1 + parseFloat(value) / 100)
                break
              case 'decrease_percent':
                newPrice = currentProduct.price * (1 - parseFloat(value) / 100)
                break
              case 'increase_amount':
                newPrice = currentProduct.price + parseFloat(value)
                break
              case 'decrease_amount':
                newPrice = currentProduct.price - parseFloat(value)
                break
              case 'multiply':
                newPrice = currentProduct.price * parseFloat(value)
                break
              default:
                throw new Error(`Unknown price adjustment type: ${type}`)
            }

            // Ensure price is not negative
            newPrice = Math.max(0, newPrice)

            updateData.price = newPrice
            updateData.original_price = newPrice
          }
        }

        // Update the product
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: updateData,
          include: {
            category: true,
            inventory: true
          }
        })

        results.push({
          id: productId,
          status: 'success',
          product: updatedProduct
        })
        successCount++

      } catch (error) {
        console.error(`❌ Error updating product ${productId}:`, error)
        console.error(`❌ Error details:`, {
          message: error.message,
          code: error.code,
          meta: error.meta,
          updateData: updateData
        })

        // Get product name for better error reporting
        try {
          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { display_name: true, name: true }
          })
          console.error(`❌ Failed product: ${product?.display_name || product?.name || productId}`)
        } catch (e) {
          console.error(`❌ Could not fetch product details for ${productId}`)
        }

        results.push({
          id: productId,
          status: 'error',
          error: error.message,
          details: error.code || 'Unknown error'
        })
        errorCount++
      }
    }



    res.json({
      success: true,
      message: `Bulk edit completed: ${successCount} products updated successfully${errorCount > 0 ? `, ${errorCount} errors` : ''}`,
      results,
      stats: {
        total: productIds.length,
        success: successCount,
        errors: errorCount
      }
    })

  } catch (error) {
    console.error('❌ Bulk edit failed:', error)
    res.status(500).json({
      error: 'Bulk edit failed',
      message: error.message
    })
  }
})

// POST /api/products/fix-weight-quantity-steps - Fix quantity_step for weight-based products
router.post('/fix-weight-quantity-steps', async (req, res) => {
  try {


    // Get all weight-based products (products with custom_quantity)
    const weightBasedProducts = await prisma.product.findMany({
      where: {
        AND: [
          {
            custom_quantity: {
              not: null
            }
          },
          {
            custom_quantity: {
              gt: 0
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        custom_quantity: true,
        custom_unit: true,
        quantity_step: true
      }
    })



    let updatedCount = 0
    const results = []

    for (const product of weightBasedProducts) {
      // For weight-based products, quantity_step should always be 1 (representing 1 piece)
      if (product.quantity_step !== 1) {


        await prisma.product.update({
          where: { id: product.id },
          data: { quantity_step: 1 }
        })

        results.push({
          name: product.name,
          old_quantity_step: product.quantity_step,
          new_quantity_step: 1,
          status: 'updated'
        })

        updatedCount++
      } else {
        results.push({
          name: product.name,
          quantity_step: 1,
          status: 'already_correct'
        })
      }
    }

    res.json({
      success: true,
      message: `Fixed quantity_step for ${updatedCount} weight-based products`,
      stats: {
        total_products: weightBasedProducts.length,
        updated_count: updatedCount,
        already_correct: weightBasedProducts.length - updatedCount
      },
      results
    })

  } catch (error) {
    console.error('❌ Error fixing quantity steps:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fix quantity steps',
      message: error.message
    })
  }
})

// POST /api/products/bulk-update-attributes - Bulk update product attributes
router.post('/bulk-update-attributes', async (req, res) => {
  try {
    const { updates } = req.body

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' })
    }



    const results = []

    for (const update of updates) {
      try {
        const { searchTerm, attributes, removeAttributes } = update

        // Find products matching the search term
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { display_name: { contains: searchTerm, mode: 'insensitive' } },
              { name: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            display_name: true,
            attributes: true
          }
        })



        for (const product of products) {
          if (removeAttributes) {
            // Remove attributes
            await prisma.product.update({
              where: { id: product.id },
              data: { attributes: null }
            })

            results.push({
              productId: product.id,
              productName: product.display_name,
              action: 'removed_attributes',
              success: true
            })


          } else if (attributes && Array.isArray(attributes)) {
            // Add/update attributes
            await prisma.product.update({
              where: { id: product.id },
              data: { attributes: JSON.stringify(attributes) }
            })

            results.push({
              productId: product.id,
              productName: product.display_name,
              action: 'updated_attributes',
              attributes: attributes,
              success: true
            })


          }
        }

      } catch (updateError) {
        console.error(`❌ Error processing update for "${update.searchTerm}":`, updateError)
        results.push({
          searchTerm: update.searchTerm,
          action: 'error',
          error: updateError.message,
          success: false
        })
      }
    }

    res.json({
      success: true,
      message: `Processed ${updates.length} attribute updates`,
      results: results
    })

  } catch (error) {
    console.error('❌ Bulk attribute update failed:', error)
    res.status(500).json({
      success: false,
      error: 'Bulk attribute update failed',
      message: error.message
    })
  }
})

// GET /api/products/:id/bundle-items - Get bundle items with full product details
router.get('/:id/bundle-items', async (req, res) => {
  try {
    const { id } = req.params

    // Get the bundle product
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (!product.is_bundle || !product.bundle_items) {
      return res.json({ bundle_items: [] })
    }

    // Parse bundle items
    const bundleItems = JSON.parse(product.bundle_items)

    // Get full product details for each bundle item
    const productIds = bundleItems.map(item => item.product_id)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        category: true,
        inventory: true
      }
    })

    // Map bundle items with full product details
    const bundleItemsWithDetails = bundleItems.map(bundleItem => {
      const product = products.find(p => p.id === bundleItem.product_id)
      if (!product) return null

      const inventory = product.inventory[0]

      return {
        ...bundleItem,
        product: {
          id: product.id,
          poster_product_id: product.poster_product_id,
          name: product.name,
          display_name: product.display_name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          display_image_url: product.display_image_url,
          category_id: product.category_id,
          category_name: product.category?.display_name || product.category?.name,
          is_active: product.is_active,
          requires_bottles: product.requires_bottles,
          attributes: product.attributes ? JSON.parse(product.attributes) : null,
          custom_quantity: product.custom_quantity,
          custom_unit: product.custom_unit,
          quantity_step: product.quantity_step,
          min_quantity: product.min_quantity,
          max_quantity: product.max_quantity,
          quantity: inventory?.quantity || 0,
          unit: inventory?.unit || 'pcs',
          available: product.is_active && (inventory?.quantity || 0) > 0
        }
      }
    }).filter(item => item !== null)

    res.json({ bundle_items: bundleItemsWithDetails })

  } catch (error) {
    console.error('❌ Error fetching bundle items:', error)
    res.status(500).json({ error: 'Failed to fetch bundle items' })
  }
})

export default router
