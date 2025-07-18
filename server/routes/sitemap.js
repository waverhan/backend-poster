import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// XML Sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://opillia.com.ua'
    const currentDate = new Date().toISOString().split('T')[0]

    // Get active products for product pages
    const products = await prisma.product.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        updated_at: true
      }
    })

    // Get categories
    const categories = await prisma.category.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        updated_at: true
      }
    })

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/cart', priority: '0.7', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/branches', priority: '0.8', changefreq: 'monthly' },
      { url: '/orders', priority: '0.6', changefreq: 'weekly' },
      { url: '/profile', priority: '0.5', changefreq: 'weekly' },
      { url: '/sitemap', priority: '0.4', changefreq: 'monthly' }
    ]

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add product pages
    for (const product of products) {
      const lastmod = product.updated_at ? product.updated_at.toISOString().split('T')[0] : currentDate
      xml += `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    }

    xml += `</urlset>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.status(500).json({ error: 'Failed to generate sitemap' })
  }
})

// Sitemap index (if we need multiple sitemaps in the future)
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const baseUrl = 'https://opillia.com.ua'
    const currentDate = new Date().toISOString().split('T')[0]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`

    res.set('Content-Type', 'application/xml; charset=utf-8')
    res.send(xml)
  } catch (error) {
    console.error('Error generating sitemap index:', error)
    res.status(500).json({ error: 'Failed to generate sitemap index' })
  }
})

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = 'https://opillia.com.ua'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/api/sitemap.xml

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /login
Disallow: /register

# Allow important pages
Allow: /
Allow: /shop
Allow: /product/
Allow: /about
Allow: /contact
Allow: /branches
Allow: /sitemap

# Crawl delay
Crawl-delay: 1

# Host
Host: ${baseUrl}
`

  res.set('Content-Type', 'text/plain; charset=utf-8')
  res.send(robotsTxt)
})

export default router
