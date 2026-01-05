import express from 'express'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { prisma } from '../index.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// POST /api/update-products/from-csv
// Updates product descriptions and attributes from CSV file
router.post('/from-csv', async (req, res) => {
  try {
    // Read CSV file - try multiple locations
    let csvPath = path.join(__dirname, '../../product-desc.csv')

    if (!fs.existsSync(csvPath)) {
      // Try in server directory
      csvPath = path.join(__dirname, '../product-desc.csv')
    }

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        error: 'CSV file not found',
        tried: [
          path.join(__dirname, '../../product-desc.csv'),
          path.join(__dirname, '../product-desc.csv')
        ]
      })
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      encoding: 'utf-8'
    })

    console.log(`📊 Found ${records.length} products in CSV`)

    let updated = 0
    let notFound = 0
    const errors = []

    for (const record of records) {
      const productName = record['Назва продукту']?.trim()
      const description = record['Опис']?.trim()
      const og = record['Gustav (OG)']?.trim()
      const abv = record['Міцність (ABV)']?.trim()
      const ibu = record['Гіркота (IBU)']?.trim()
      const googleShoppingId = record['Google Shopping ID']?.trim()

      if (!productName) continue

      try {
        // Find product by Google Shopping ID first (most reliable)
        let product = null
        if (googleShoppingId) {
          product = await prisma.product.findFirst({
            where: { google_shopping_id: googleShoppingId }
          })
        }

        // If not found by Google Shopping ID, try by name (exact match)
        if (!product) {
          product = await prisma.product.findFirst({
            where: {
              OR: [
                { name: productName },
                { display_name: productName }
              ]
            }
          })
        }

        // If still not found, try partial matching (contains)
        if (!product) {
          // Remove "Пиво " prefix if present for better matching
          const searchName = productName.replace(/^Пиво\s+/, '')
          product = await prisma.product.findFirst({
            where: {
              OR: [
                { name: { contains: searchName, mode: 'insensitive' } },
                { display_name: { contains: searchName, mode: 'insensitive' } }
              ]
            }
          })
        }

        if (!product) {
          console.log(`⚠️  Product not found: ${productName}`)
          notFound++
          continue
        }

        // Build attributes object
        const attributes = {}
        if (og && og !== '-') attributes.og = og
        if (abv && abv !== '-') attributes.abv = abv
        if (ibu && ibu !== '-') attributes.ibu = ibu

        // Update product
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: description || product.description,
            attributes: Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : product.attributes,
            google_shopping_id: googleShoppingId || product.google_shopping_id
          }
        })

        console.log(`✅ Updated: ${productName}`)
        updated++
      } catch (error) {
        errors.push({ product: productName, error: error.message })
      }
    }

    res.json({
      success: true,
      summary: {
        total: records.length,
        updated,
        notFound,
        errors: errors.length > 0 ? errors : undefined
      }
    })

  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/update-products/from-xml
// Updates product descriptions and attributes from XML file using Google Shopping IDs
router.post('/from-xml', async (req, res) => {
  try {
    // Read XML file
    let xmlPath = path.join(__dirname, '../productss.xml')

    if (!fs.existsSync(xmlPath)) {
      xmlPath = path.join(__dirname, '../../productss.xml')
    }

    if (!fs.existsSync(xmlPath)) {
      return res.status(404).json({
        error: 'XML file not found',
        tried: [
          path.join(__dirname, '../productss.xml'),
          path.join(__dirname, '../../productss.xml')
        ]
      })
    }

    const fileContent = fs.readFileSync(xmlPath, 'utf-8')

    // Parse XML using regex (simple parser for our specific structure)
    const elementRegex = /<element>([\s\S]*?)<\/element>/g
    const records = []
    let match

    while ((match = elementRegex.exec(fileContent)) !== null) {
      const elementContent = match[1]
      const record = {}

      // Extract each field using regex
      const fieldRegex = /<([^>]+)>([^<]*)<\/\1>/g
      let fieldMatch

      while ((fieldMatch = fieldRegex.exec(elementContent)) !== null) {
        const tagName = fieldMatch[1]
        const tagValue = fieldMatch[2]
        record[tagName] = tagValue
      }

      if (Object.keys(record).length > 0) {
        records.push(record)
      }
    }

    console.log(`📊 Found ${records.length} products in XML`)

    let updated = 0
    let notFound = 0
    const errors = []
    const notFoundProducts = []

    for (const record of records) {
      const productName = record.Назва_продукту?.trim()
      const description = record.Опис?.trim()
      const og = record['Gustav_(OG)']?.trim()
      const abv = record['Міцність_(ABV)']?.trim()
      const ibu = record['Гіркота_(IBU)']?.trim()
      let googleShoppingId = record.Google_Shopping_ID?.trim()
      const url = record.Посилання?.trim()

      if (!productName || !googleShoppingId) continue

      // Remove "gid" suffix from Google Shopping ID if present
      if (googleShoppingId.endsWith('gid')) {
        googleShoppingId = googleShoppingId.slice(0, -3)
      }

      // Extract slug from URL
      const slugMatch = url?.match(/\/product\/([^\/]+)$/)
      const slug = slugMatch ? slugMatch[1] : null

      try {
        let product = null

        // Try to find by Google Shopping ID first
        console.log(`🔍 Looking for product with ID: ${googleShoppingId}`)
        product = await prisma.product.findUnique({
          where: { id: googleShoppingId }
        })

        // If not found by ID, try by slug
        if (!product && slug) {
          console.log(`🔍 Looking for product by slug: ${slug}`)
          product = await prisma.product.findFirst({
            where: { slug: slug }
          })
        }

        if (!product) {
          console.log(`⚠️  Product not found with ID: ${googleShoppingId} or slug: ${slug} (${productName})`)
          notFoundProducts.push({
            name: productName,
            googleShoppingId,
            slug,
            url
          })
          notFound++
          continue
        }

        // Build attributes object
        const attributes = {}
        if (og && og !== '-') attributes.og = og
        if (abv && abv !== '-') attributes.abv = abv
        if (ibu && ibu !== '-') attributes.ibu = ibu

        // Update product with description and attributes
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: description || product.description,
            attributes: Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : product.attributes
          }
        })

        console.log(`✅ Updated: ${productName} (ID: ${googleShoppingId})`)
        updated++
      } catch (error) {
        errors.push({ product: productName, googleShoppingId, error: error.message })
      }
    }

    res.json({
      success: true,
      summary: {
        total: records.length,
        updated,
        notFound,
        errors: errors.length > 0 ? errors : undefined,
        notFoundProducts: notFoundProducts.length > 0 ? notFoundProducts : undefined
      }
    })

  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/update-products/populate-ids
// First step: Populate Google Shopping IDs by matching product names
router.post('/populate-ids', async (req, res) => {
  try {
    // Read XML file
    let xmlPath = path.join(__dirname, '../productss.xml')

    if (!fs.existsSync(xmlPath)) {
      xmlPath = path.join(__dirname, '../../productss.xml')
    }

    if (!fs.existsSync(xmlPath)) {
      return res.status(404).json({ error: 'XML file not found' })
    }

    const fileContent = fs.readFileSync(xmlPath, 'utf-8')

    // Parse XML using regex
    const elementRegex = /<element>([\s\S]*?)<\/element>/g
    const records = []
    let match

    while ((match = elementRegex.exec(fileContent)) !== null) {
      const elementContent = match[1]
      const record = {}
      const fieldRegex = /<([^>]+)>([^<]*)<\/\1>/g
      let fieldMatch

      while ((fieldMatch = fieldRegex.exec(elementContent)) !== null) {
        const tagName = fieldMatch[1]
        const tagValue = fieldMatch[2]
        record[tagName] = tagValue
      }

      if (Object.keys(record).length > 0) {
        records.push(record)
      }
    }

    console.log(`📊 Found ${records.length} products in XML`)

    let populated = 0
    let notFound = 0

    for (const record of records) {
      const productName = record.Назва_продукту?.trim()
      let googleShoppingId = record.Google_Shopping_ID?.trim()
      const url = record.Посилання?.trim()

      if (!productName || !googleShoppingId || !url) continue

      // Remove "gid" suffix
      if (googleShoppingId.endsWith('gid')) {
        googleShoppingId = googleShoppingId.slice(0, -3)
      }

      // Extract slug from URL
      const slugMatch = url.match(/\/product\/([^\/]+)$/)
      const slug = slugMatch ? slugMatch[1] : null

      try {
        let product = null

        // Try to match by slug first (most reliable)
        if (slug) {
          product = await prisma.product.findFirst({
            where: { slug: slug }
          })
          if (product) {
            console.log(`✅ Found by slug: ${slug}`)
          }
        }

        // If not found by slug, try exact name match
        if (!product) {
          product = await prisma.product.findFirst({
            where: {
              OR: [
                { name: productName },
                { display_name: productName }
              ]
            }
          })
          if (product) {
            console.log(`✅ Found by name: ${productName}`)
          }
        }

        // If not found, try without "Пиво " prefix
        if (!product) {
          const searchName = productName.replace(/^Пиво\s+/, '')
          product = await prisma.product.findFirst({
            where: {
              OR: [
                { name: searchName },
                { display_name: searchName }
              ]
            }
          })
          if (product) {
            console.log(`✅ Found by name (without prefix): ${searchName}`)
          }
        }

        // If not found, try partial match with contains
        if (!product) {
          const searchName = productName.replace(/^Пиво\s+/, '')
          product = await prisma.product.findFirst({
            where: {
              OR: [
                { name: { contains: searchName, mode: 'insensitive' } },
                { display_name: { contains: searchName, mode: 'insensitive' } }
              ]
            }
          })
          if (product) {
            console.log(`✅ Found by partial match: ${searchName}`)
          }
        }

        if (!product) {
          console.log(`⚠️  Product not found: ${productName} (slug: ${slug})`)
          notFound++
          continue
        }

        // Update with Google Shopping ID
        await prisma.product.update({
          where: { id: product.id },
          data: { google_shopping_id: googleShoppingId }
        })

        console.log(`✅ Populated ID for: ${productName} (ID: ${googleShoppingId})`)
        populated++
      } catch (error) {
        console.error(`❌ Error for ${productName}:`, error.message)
      }
    }

    res.json({
      success: true,
      summary: {
        total: records.length,
        populated,
        notFound
      }
    })

  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/update-products/debug/list-products
// Debug endpoint to list all products
router.get('/debug/list-products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        display_name: true,
        google_shopping_id: true
      },
      take: 20
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router

