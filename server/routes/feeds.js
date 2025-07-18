import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// Google Shopping Feed (XML)
router.get('/google-shopping.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        price: { gt: 0 }
      },
      include: {
        category: true
      }
    })

    const baseUrl = 'https://opillia.com.ua'
    const currentDate = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Найкращі напої та делікатеси</title>
    <link>${baseUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <generator>Опілля PWA Shop</generator>
`

    for (const product of products) {
      const productUrl = `${baseUrl}/product/${product.id}`
      const imageUrl = product.image_url ? `${baseUrl}${product.image_url}` : `${baseUrl}/images/placeholder.jpg`
      const availability = product.quantity > 0 ? 'in stock' : 'out of stock'
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
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        price: { gt: 0 }
      },
      include: {
        category: true
      }
    })

    const baseUrl = 'https://opillia.com.ua'
    const currentDate = new Date().toISOString()

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Facebook Product Catalog</title>
    <link>${baseUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
`

    for (const product of products) {
      const productUrl = `${baseUrl}/product/${product.id}`
      const imageUrl = product.image_url ? `${baseUrl}${product.image_url}` : `${baseUrl}/images/placeholder.jpg`
      const availability = product.quantity > 0 ? 'in stock' : 'out of stock'
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
    const products = await prisma.product.findMany({
      where: {
        is_active: true,
        price: { gt: 0 }
      },
      include: {
        category: true
      }
    })

    const baseUrl = 'https://opillia.com.ua'
    
    const jsonFeed = {
      title: 'Опілля - Product Feed',
      description: 'Найкращі напої та делікатеси з доставкою по Києву',
      link: baseUrl,
      updated: new Date().toISOString(),
      products: products.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || product.name,
        link: `${baseUrl}/product/${product.id}`,
        image: product.image_url ? `${baseUrl}${product.image_url}` : `${baseUrl}/images/placeholder.jpg`,
        price: product.price,
        currency: 'UAH',
        availability: product.quantity > 0 ? 'in_stock' : 'out_of_stock',
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

export default router
