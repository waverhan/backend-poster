import { useHead } from '@unhead/vue'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  author?: string
  publishedDate?: string
  modifiedDate?: string
  price?: string
  currency?: string
  availability?: string
  rating?: number
  reviewCount?: number
}

/**
 * Composable for managing SEO meta tags and structured data
 * Usage: const { setSEO } = useSEO()
 */
export function useSEO() {
  const baseUrl = 'https://opillia.com.ua'
  const siteName = 'Опілля'
  const defaultImage = `${baseUrl}/opillia-512x512.png`

  /**
   * Set SEO meta tags for a page
   */
  const setSEO = (config: SEOConfig) => {
    const title = config.title ? `${config.title} | ${siteName}` : siteName
    const description = config.description || 'Найкращі напої та делікатеси з доставкою по Києву'
    const image = config.image || defaultImage
    const url = config.url || baseUrl
    const type = config.type || 'website'

    useHead({
      title,
      meta: [
        {
          name: 'description',
          content: description
        },
        {
          name: 'keywords',
          content: config.keywords || 'напої, делікатеси, доставка, Київ'
        },
        {
          name: 'author',
          content: config.author || siteName
        },
        // Open Graph
        {
          property: 'og:type',
          content: type
        },
        {
          property: 'og:title',
          content: title
        },
        {
          property: 'og:description',
          content: description
        },
        {
          property: 'og:url',
          content: url
        },
        {
          property: 'og:site_name',
          content: siteName
        },
        {
          property: 'og:image',
          content: image
        },
        {
          property: 'og:image:width',
          content: '512'
        },
        {
          property: 'og:image:height',
          content: '512'
        },
        {
          property: 'og:locale',
          content: 'uk_UA'
        },
        // Twitter Card
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:title',
          content: title
        },
        {
          name: 'twitter:description',
          content: description
        },
        {
          name: 'twitter:image',
          content: image
        }
      ],
      link: [
        {
          rel: 'canonical',
          href: url
        }
      ]
    })
  }

  /**
   * Set SEO for a product page
   */
  const setProductSEO = (product: any) => {
    const url = `${baseUrl}/product/${product.id}`
    const image = product.display_image_url || defaultImage

    setSEO({
      title: product.name,
      description: product.description || `Купити ${product.name} з доставкою по Києву`,
      keywords: `${product.name}, ${product.category_name}, доставка, Київ`,
      image,
      url,
      type: 'product',
      price: product.price?.toString(),
      currency: 'UAH',
      availability: product.in_stock ? 'InStock' : 'OutOfStock',
      rating: product.rating,
      reviewCount: product.review_count
    })

    // Add product structured data
    addProductSchema(product, url, image)
  }

  /**
   * Set SEO for a category/shop page
   */
  const setCategorySEO = (categoryName: string, description: string) => {
    setSEO({
      title: categoryName,
      description,
      keywords: `${categoryName}, доставка, Київ`,
      url: `${baseUrl}/shop?category=${categoryName}`,
      type: 'website'
    })
  }

  /**
   * Add product schema structured data
   */
  const addProductSchema = (product: any, url: string, image: string) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: image,
      url: url,
      brand: {
        '@type': 'Brand',
        name: 'Опілля'
      },
      offers: {
        '@type': 'Offer',
        url: url,
        priceCurrency: 'UAH',
        price: product.price,
        availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    }

    if (product.rating && product.review_count) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.review_count
      }
    }

    addStructuredData(schema)
  }

  /**
   * Add breadcrumb schema
   */
  const addBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }

    addStructuredData(schema)
  }

  /**
   * Add generic structured data
   */
  const addStructuredData = (schema: any) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema, null, 2)
    document.head.appendChild(script)
  }

  return {
    setSEO,
    setProductSEO,
    setCategorySEO,
    addBreadcrumbSchema,
    addStructuredData
  }
}

