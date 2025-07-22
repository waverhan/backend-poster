// Feed Service - Generate feeds from frontend data
import { useProductStore } from '@/stores/product'
import type { Product } from '@/types'

export class FeedService {
  private baseUrl = 'https://opillia.com.ua'
  
  // Generate XML Sitemap
  generateSitemap(products: Product[] = []): string {
    const currentDate = new Date().toISOString().split('T')[0]
    
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
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add product pages
    for (const product of products) {
      xml += `  <url>
    <loc>${this.baseUrl}/product/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    }

    xml += `</urlset>`
    return xml
  }

  // Generate Google Shopping Feed
  generateGoogleShoppingFeed(products: Product[] = []): string {
    const currentDate = new Date().toISOString()
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Опілля - Найкращі напої та делікатеси</title>
    <link>${this.baseUrl}</link>
    <description>Найкращі напої та делікатеси з доставкою по Києву</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <generator>Опілля PWA Shop</generator>
`

    for (const product of products) {
      const productUrl = `${this.baseUrl}/product/${product.id}`
      const imageUrl = product.image_url ? `${this.baseUrl}${product.image_url}` : `${this.baseUrl}/images/placeholder.jpg`
      const availability = product.quantity > 0 ? 'in stock' : 'out of stock'
      const category = product.category?.name || 'Напої та делікатеси'
      const price = `${product.price} UAH`
      
      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || product.name}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>Опілля</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${category}</g:product_type>
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
    return xml
  }

  // Generate JSON Product Feed
  generateProductFeed(products: Product[] = []): object {
    return {
      title: 'Опілля - Product Feed',
      description: 'Найкращі напої та делікатеси з доставкою по Києву',
      link: this.baseUrl,
      updated: new Date().toISOString(),
      products: products.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description || product.name,
        link: `${this.baseUrl}/product/${product.id}`,
        image: product.image_url ? `${this.baseUrl}${product.image_url}` : `${this.baseUrl}/images/placeholder.jpg`,
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
  }

  // Download feed as file
  downloadFeed(content: string, filename: string, mimeType: string = 'application/xml') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Generate and download sitemap
  async downloadSitemap() {
    try {
      const productStore = useProductStore()
      await productStore.fetchProducts()
      const xml = this.generateSitemap(productStore.products)
      this.downloadFeed(xml, 'sitemap.xml')
    } catch (error) {
      console.error('Error generating sitemap:', error)
    }
  }

  // Generate and download Google Shopping feed
  async downloadGoogleShoppingFeed() {
    try {
      const productStore = useProductStore()
      await productStore.fetchProducts()
      const xml = this.generateGoogleShoppingFeed(productStore.products)
      this.downloadFeed(xml, 'google-shopping.xml')
    } catch (error) {
      console.error('Error generating Google Shopping feed:', error)
    }
  }

  // Generate and download JSON product feed
  async downloadProductFeed() {
    try {
      const productStore = useProductStore()
      await productStore.fetchProducts()
      const json = this.generateProductFeed(productStore.products)
      this.downloadFeed(JSON.stringify(json, null, 2), 'products.json', 'application/json')
    } catch (error) {
      console.error('Error generating product feed:', error)
    }
  }
}

export const feedService = new FeedService()
export default feedService
