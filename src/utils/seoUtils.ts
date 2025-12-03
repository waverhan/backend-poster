const DYNAMIC_STRUCTURED_DATA_ATTR = 'data-seo-ld'
const FALLBACK_ORIGIN =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://opillia.com.ua')

export const absoluteUrl = (pathOrUrl: string | undefined): string => {
  if (!pathOrUrl) {
    return FALLBACK_ORIGIN
  }

  try {
    return new URL(pathOrUrl, FALLBACK_ORIGIN).toString()
  } catch (error) {
    return pathOrUrl
  }
}

const ensureMetaTag = (attribute: 'name' | 'property', value: string): HTMLMetaElement => {
  let tag = document.querySelector(`meta[${attribute}="${value}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, value)
    document.head.appendChild(tag)
  }
  return tag
}

export const updateCanonicalLink = (href: string) => {
  const canonicalHref = absoluteUrl(href)
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = canonicalHref
}

interface SeoMetaOptions {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogType?: string
}

export const updateSeoMeta = (options: SeoMetaOptions = {}) => {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage,
    ogType = 'website'
  } = options

  if (title) {
    document.title = title
  }

  if (description) {
    ensureMetaTag('name', 'description').setAttribute('content', description)
  }

  if (keywords) {
    ensureMetaTag('name', 'keywords').setAttribute('content', keywords)
  }

  const canonicalHref = canonical || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')
  updateCanonicalLink(canonicalHref)

  const ogTitle = title || document.title
  const ogDescription = description || ensureMetaTag('name', 'description').getAttribute('content') || ''
  const ogImageUrl = ogImage ? absoluteUrl(ogImage) : ''
  const canonicalUrl = absoluteUrl(canonicalHref)

  ensureMetaTag('property', 'og:title').setAttribute('content', ogTitle)
  ensureMetaTag('property', 'og:description').setAttribute('content', ogDescription)
  ensureMetaTag('property', 'og:url').setAttribute('content', canonicalUrl)
  ensureMetaTag('property', 'og:type').setAttribute('content', ogType)

  if (ogImageUrl) {
    ensureMetaTag('property', 'og:image').setAttribute('content', ogImageUrl)
  }

  ensureMetaTag('name', 'twitter:card').setAttribute('content', 'summary_large_image')
  ensureMetaTag('name', 'twitter:title').setAttribute('content', ogTitle)

  if (ogDescription) {
    ensureMetaTag('name', 'twitter:description').setAttribute('content', ogDescription)
  }

  if (ogImageUrl) {
    ensureMetaTag('name', 'twitter:image').setAttribute('content', ogImageUrl)
  }
}

export interface StructuredDataBlock {
  id: string
  data: Record<string, any>
}

export const removeStructuredData = (ids?: string | string[]) => {
  if (!ids) {
    document.querySelectorAll(`script[${DYNAMIC_STRUCTURED_DATA_ATTR}]`).forEach((node) => node.remove())
    return
  }

  const targetIds = Array.isArray(ids) ? ids : [ids]
  targetIds.forEach((id) => {
    const existing = document.querySelector(`script[${DYNAMIC_STRUCTURED_DATA_ATTR}="${id}"]`)
    existing?.remove()
  })
}

export const appendStructuredData = (blocks: StructuredDataBlock[]) => {
  blocks.forEach((block) => {
    if (!block || !block.id || !block.data) return

    let script = document.querySelector(`script[${DYNAMIC_STRUCTURED_DATA_ATTR}="${block.id}"]`)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute(DYNAMIC_STRUCTURED_DATA_ATTR, block.id)
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(block.data)
  })
}

interface BreadcrumbItem {
  name: string
  url: string
}

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
