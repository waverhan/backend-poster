import express from 'express'
import { prisma } from '../services/database.js'

const router = express.Router()

// Transliterate Cyrillic to Latin characters
const transliterateCyrillic = (text) => {
  const cyrillic = {
    // Ukrainian and Russian lowercase
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    // Ukrainian-specific lowercase
    'ґ': 'g', 'є': 'ye', 'і': 'i', 'ї': 'yi',
    // Ukrainian and Russian uppercase
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya',
    // Ukrainian-specific uppercase
    'Ґ': 'G', 'Є': 'Ye', 'І': 'I', 'Ї': 'Yi'
  }

  return text
    .split('')
    .map(char => cyrillic[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Generate SEO-friendly slug from text
const generateSlug = (text) => {
  if (!text) return ''
  return transliterateCyrillic(text)
}

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
        display_name: true,
        slug: true,
        updated_at: true
      }
    })

    // Get categories with slug
    const categories = await prisma.category.findMany({
      where: {
        is_active: true
      },
      select: {
        id: true,
        slug: true,
        display_name: true,
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

    // Add category pages
    for (const category of categories) {
      const lastmod = category.updated_at ? category.updated_at.toISOString().split('T')[0] : currentDate
      // Use slug if available, otherwise generate from display_name with Latin characters only
      const categorySlug = category.slug && category.slug.trim()
        ? category.slug
        : generateSlug(category.display_name)
      xml += `  <url>
    <loc>${baseUrl}/shop?category=${categorySlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
    }

    // Add product pages
    for (const product of products) {
      const lastmod = product.updated_at ? product.updated_at.toISOString().split('T')[0] : currentDate
      // Use slug if available, otherwise use product ID as fallback
      const productIdentifier = product.slug && product.slug.trim()
        ? product.slug
        : product.id
      xml += `  <url>
    <loc>${baseUrl}/product/${productIdentifier}</loc>
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
