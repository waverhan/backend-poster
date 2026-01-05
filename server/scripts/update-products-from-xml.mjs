import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prisma = new PrismaClient()

async function updateProductsFromXML() {
  try {
    // Read XML file
    const xmlPath = path.join(__dirname, '../productss.xml')
    
    if (!fs.existsSync(xmlPath)) {
      console.error('❌ XML file not found:', xmlPath)
      process.exit(1)
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

    console.log(`📊 Found ${records.length} products in XML\n`)

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

      if (!productName) continue

      // Remove "gid" suffix from Google Shopping ID if present
      if (googleShoppingId?.endsWith('gid')) {
        googleShoppingId = googleShoppingId.slice(0, -3)
      }

      // Extract slug from URL
      const slugMatch = url?.match(/\/product\/([^\/]+)$/)
      const slug = slugMatch ? slugMatch[1] : null

      try {
        let product = null

        // Try to find by slug first (most reliable)
        if (slug) {
          product = await prisma.product.findFirst({
            where: { slug: slug }
          })
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
        }

        if (!product) {
          console.log(`⚠️  Product not found: ${productName}`)
          notFoundProducts.push({ name: productName, slug, url })
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
        console.error(`❌ Error updating ${productName}:`, error.message)
      }
    }

    console.log(`\n📈 Summary:`)
    console.log(`   Total: ${records.length}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Not Found: ${notFound}`)
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors (${errors.length}):`)
      errors.forEach(e => console.log(`   - ${e.product}: ${e.error}`))
    }

    if (notFoundProducts.length > 0) {
      console.log(`\n⚠️  Not Found Products (${notFoundProducts.length}):`)
      notFoundProducts.forEach(p => console.log(`   - ${p.name} (slug: ${p.slug})`))
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

updateProductsFromXML()

