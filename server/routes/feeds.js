import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// Helper function to check if a product is weight-based (same logic as database.js)
function isWeightBasedProduct(product) {
  const name = (product.name || '').toLowerCase()

  // Exclude beverages even if they have ingredient_unit = kg
  const isBeverage = name.includes('пиво') || name.includes('вино') || name.includes('сидр') ||
                    name.includes('beer') || name.includes('wine') || name.includes('cocktail') ||
                    name.includes('коктейль') || name.includes('напій') || name.includes('drink')

  if (isBeverage) {
    return false // Beverages are never weight-based, even with kg unit
  }

  // Check stored ingredient_unit from Poster API attributes first
  if (product.attributes) {
    try {
      const attrs = JSON.parse(product.attributes)
      if (attrs.ingredient_unit === 'kg') {
        return true
      }
    } catch (e) {
      // Invalid JSON, continue to other checks
    }
  }

  // Fallback: Check if product has custom_quantity/custom_unit set
  if (product.custom_quantity && product.custom_unit) {
    return true
  }

  // Fallback: Check inventory unit for weight-based products (kg)
  // This helps with products that don't have proper attributes but are weight-based
  const isWeightCategory = name.includes('сир') || name.includes('м\'ясо') || name.includes('ковбаса') ||
                          name.includes('cheese') || name.includes('meat') || name.includes('sausage') ||
                          name.includes('риба') || name.includes('fish') || name.includes('ікра') ||
                          name.includes('ікрян') || name.includes('caviar') || name.includes('закуск') ||
                          name.includes('snack') || name.includes('арахіс') || name.includes('кукурудза') ||
                          name.includes('горіх') || name.includes('peanut') || name.includes('corn') ||
                          name.includes('nut')

  // If it's in a weight category and has inventory, check if inventory unit is kg
  if (isWeightCategory && product.inventory && product.inventory.length > 0) {
    return product.inventory[0].unit === 'kg'
  }

  return false
}

// Helper function to format image URLs for feeds
const formatImageUrl = (imageUrl, baseUrl) => {
  if (!imageUrl) {
    return `${baseUrl}/images/placeholder.jpg`
  }

  // If it's a MinIO URL, convert it to backend API endpoint
  // minio://products/product_125.png -> /api/upload/minio-image/product_125.png
  if (imageUrl.includes('minio://')) {
    const fileName = imageUrl.replace('minio://', '').replace('products/', '')
    return `${baseUrl}/api/upload/minio-image/${fileName}`
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  // If it's a relative path starting with /, prepend baseUrl
  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`
  }

  // Otherwise prepend baseUrl with /
  return `${baseUrl}/${imageUrl}`
}

// Google Shopping Feed (XML)
router.get('/google-shopping.xml', async (req, res) => {
  try {
    // Get all active products (including those with price 0 or null)
    const allProducts = await prisma.product.findMany({
      where: {
        is_active: true
      },
      include: {
        category: true
      }
    })

    // Log products without prices
    const productsWithoutPrice = allProducts.filter(p => !p.price || p.price <= 0)
    if (productsWithoutPrice.length > 0) {
      console.warn(`⚠️ Found ${productsWithoutPrice.length} products without valid prices:`)
      productsWithoutPrice.forEach(p => {
        console.warn(`  - ${p.name} (ID: ${p.id}, Price: ${p.price})`)
      })
    }

    // Filter to only products with valid prices for Google Shopping
    const products = allProducts.filter(p => p.price && p.price > 0)
    

    const frontendUrl = 'https://opillia.com.ua'
    const backendUrl = 'https://backend-api-production-b3a0.up.railway.app'
    const currentDate = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Найкращі напої та делікатеси</title>
    <link>${frontendUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <generator>Опілля PWA Shop</generator>
`

    for (const product of products) {
      const productUrl = `${frontendUrl}/product/${product.id}`
      const imageUrl = formatImageUrl(product.image_url, backendUrl)
      // If quantity is null or not set, assume in stock (active products are available)
      // Only mark as out of stock if quantity is explicitly 0
      const availability = (product.quantity === null || product.quantity === undefined || product.quantity > 0) ? 'in stock' : 'out of stock'
      const condition = 'new'
      const brand = 'Опілля'
      const category = product.category?.name || 'Напої та делікатеси'

      // Format price (Google expects price with currency)
      const price = `${product.price} UAH`

      // Product type based on category
      const productType = category

      // GTIN (if available) - using product ID as identifier
      const gtin = product.poster_id || product.id

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${brand}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:product_type>${productType}</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco</g:google_product_category>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Доставка по Києву</g:service>
        <g:price>99 UAH</g:price>
      </g:shipping>
      <g:custom_label_0>${product.weight_flag ? 'По вазі' : 'Поштучно'}</g:custom_label_0>
      <g:custom_label_1>${category}</g:custom_label_1>
    </item>
`
    }

    xml += `  </channel>
</rss>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (error) {
    console.error('Error generating Google Shopping feed:', error)
    res.status(500).json({ error: 'Failed to generate product feed' })
  }
})

// Facebook Product Catalog Feed (XML)
router.get('/facebook-catalog.xml', async (req, res) => {
  try {
    // Get all active products
    const allProducts = await prisma.product.findMany({
      where: {
        is_active: true
      },
      include: {
        category: true
      }
    })

    // Filter to only products with valid prices
    const products = allProducts.filter(p => p.price && p.price > 0)
    

    const frontendUrl = 'https://opillia.com.ua'
    const backendUrl = 'https://backend-api-production-b3a0.up.railway.app'
    const currentDate = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Facebook Product Catalog</title>
    <link>${frontendUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
`

    for (const product of products) {
      const productUrl = `${frontendUrl}/product/${product.id}`
      const imageUrl = formatImageUrl(product.image_url, backendUrl)
      // If quantity is null or not set, assume in stock (active products are available)
      const availability = (product.quantity === null || product.quantity === undefined || product.quantity > 0) ? 'in stock' : 'out of stock'
      const category = product.category?.name || 'Напої та делікатеси'

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <title><![CDATA[${product.name}]]></title>
      <description><![CDATA[${product.description || product.name}]]></description>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${product.price} UAH</g:price>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>Опілля</g:brand>
      <g:product_type>${category}</g:product_type>
    </item>
`
    }

    xml += `  </channel>
</rss>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (error) {
    console.error('Error generating Facebook catalog feed:', error)
    res.status(500).json({ error: 'Failed to generate Facebook catalog feed' })
  }
})

// JSON Product Feed (for other integrations)
router.get('/products.json', async (req, res) => {
  try {
    // Get all active products
    const allProducts = await prisma.product.findMany({
      where: {
        is_active: true
      },
      include: {
        category: true
      }
    })

    // Filter to only products with valid prices
    const products = allProducts.filter(p => p.price && p.price > 0)
    

    const frontendUrl = 'https://opillia.com.ua'
    const backendUrl = 'https://backend-api-production-b3a0.up.railway.app'

    const jsonFeed = {
      title: 'Опілля - Product Feed',
      description: 'Найкращі напої та делікатеси з доставкою по Києву',
      link: frontendUrl,
      updated: new Date().toISOString(),
      total_products: products.length,
      products: products.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || product.name,
        link: `${frontendUrl}/product/${product.id}`,
        image: formatImageUrl(product.image_url, backendUrl),
        price: product.price,
        currency: 'UAH',
        availability: (product.quantity === null || product.quantity === undefined || product.quantity > 0) ? 'in_stock' : 'out_of_stock',
        category: product.category?.name || 'Напої та делікатеси',
        brand: 'Опілля',
        weight_based: product.weight_flag,
        quantity: product.quantity,
        poster_id: product.poster_id
      }))
    }

    res.json(jsonFeed)
  } catch (error) {
    console.error('Error generating JSON product feed:', error)
    res.status(500).json({ error: 'Failed to generate JSON product feed' })
  }
})

// Frontend-based Google Shopping Feed (with actual inventory and custom quantities)
router.get('/google-shopping-frontend.xml', async (req, res) => {
  try {
    // Get all active products with their inventory across all branches
    const allProducts = await prisma.product.findMany({
      where: {
        is_active: true,
        price: { gt: 0 }
      },
      include: {
        category: true,
        inventory: true
      }
    })

    // Filter to only products that have inventory > 0 in at least one branch
    const productsWithInventory = allProducts.filter(p =>
      p.inventory && p.inventory.some(inv => inv.quantity > 0)
    )

    

    // Debug: Log weight-based products
    const weightBasedProducts = productsWithInventory.filter(p => p.custom_quantity && p.custom_unit)
    
    if (weightBasedProducts.length > 0) {
      
      weightBasedProducts.slice(0, 3).forEach(p => {
        
      })
    }

    const frontendUrl = 'https://opillia.com.ua'
    const backendUrl = 'https://backend-api-production-b3a0.up.railway.app'
    const currentDate = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Найкращі напої та делікатеси</title>
    <link>${frontendUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <generator>Опілля PWA Shop</generator>
`

    for (const product of productsWithInventory) {
      // Use slug for product URL if available, fallback to ID
      const productSlug = product.slug || product.id
      const productUrl = `${frontendUrl}/product/${productSlug}`

      // Handle image URLs - use display_image_url first, fallback to image_url
      // Use backend URL for image endpoint since it doesn't exist on frontend domain
      const rawImageUrl = product.display_image_url || product.image_url
      const imageUrl = formatImageUrl(rawImageUrl, backendUrl)

      const availability = 'in stock' // Only products with inventory are included
      const condition = 'new'
      const brand = 'Опілля'
      const category = product.category?.name || 'Напої та делікатеси'

      // Determine if product is weight-based and apply defaults if needed
      const isWeightBased = isWeightBasedProduct(product)
      const customQuantity = product.custom_quantity || (isWeightBased ? 0.05 : null)
      const customUnit = product.custom_unit || (isWeightBased ? 'г' : null)

      // Calculate display price based on custom quantity
      let displayPrice = product.price
      let displayUnit = 'шт'

      if (customQuantity && customUnit) {
        // For weight-based products, show price per custom unit (e.g., per 50g)
        displayPrice = product.price * customQuantity
        if (customUnit === 'г') {
          displayUnit = `${Math.round(customQuantity * 1000)}г`
        } else if (customUnit === 'мл') {
          displayUnit = `${Math.round(customQuantity * 1000)}мл`
        } else {
          displayUnit = customUnit
        }
      }

      const price = `${displayPrice.toFixed(2)} UAH`
      const productType = category

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.display_name || product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${brand}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:product_type>${productType}</g:product_type>
      <g:google_product_category>Food, Beverages &amp; Tobacco</g:google_product_category>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Доставка по Києву</g:service>
        <g:price>99 UAH</g:price>
      </g:shipping>
      <g:custom_label_0>${customQuantity ? 'По вазі' : 'Поштучно'}</g:custom_label_0>
      <g:custom_label_1>${category}</g:custom_label_1>
      <g:custom_label_2>${displayUnit}</g:custom_label_2>
    </item>
`
    }

    xml += `  </channel>
</rss>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (error) {
    console.error('Error generating frontend Google Shopping feed:', error)
    res.status(500).json({ error: 'Failed to generate product feed' })
  }
})

export default router
