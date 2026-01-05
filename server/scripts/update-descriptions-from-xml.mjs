#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function updateProductDescriptions() {
  try {
    console.log('🚀 Starting product description update from XML...\n')

    // Read XML file
    let xmlPath = path.join(__dirname, '../productss.xml')
    if (!fs.existsSync(xmlPath)) {
      xmlPath = path.join(__dirname, '../../productss.xml')
    }

    if (!fs.existsSync(xmlPath)) {
      throw new Error(`XML file not found at ${xmlPath}`)
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
      const url = record.Посилання?.trim()

      if (!productName) continue

      // Extract slug from URL
      const slugMatch = url?.match(/\/product\/([^\/]+)$/)
      const slug = slugMatch ? slugMatch[1] : null

      try {
        let product = null

        // Try to find by slug first
        if (slug) {
          product = await prisma.product.findFirst({
            where: { slug: slug }
          })
        }

        // If not found by slug, try by name
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

        // If not found, try partial match
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
            attributes: Object.keys(attributes).length > 0 ? JSON.stringify(attributes) : product.attributes
          }
        })

        console.log(`✅ Updated: ${productName}`)
        updated++
      } catch (error) {
        errors.push({ product: productName, error: error.message })
        console.error(`❌ Error updating ${productName}:`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Total: ${records.length}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Not Found: ${notFound}`)
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`)
    }

    if (notFoundProducts.length > 0) {
      console.log('\n⚠️  Not Found Products:')
      notFoundProducts.forEach(p => {
        console.log(`   - ${p.name} (slug: ${p.slug})`)
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductDescriptions()

