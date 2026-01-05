import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function updateProductDescriptions() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '../../product-desc.csv')
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

    for (const record of records) {
      const productName = record['Назва продукту']?.trim()
      const description = record['Опис']?.trim()
      const og = record['Gustav (OG)']?.trim()
      const abv = record['Міцність (ABV)']?.trim()
      const ibu = record['Гіркота (IBU)']?.trim()

      if (!productName) continue

      // Find product by name
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { name: productName },
            { display_name: productName }
          ]
        }
      })

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
          attributes: Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : product.attributes
        }
      })

      console.log(`✅ Updated: ${productName}`)
      updated++
    }

    console.log(`\n📈 Summary:`)
    console.log(`✅ Updated: ${updated}`)
    console.log(`⚠️  Not found: ${notFound}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductDescriptions()

