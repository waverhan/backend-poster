const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'UL',
  'OL',
  'LI',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'STRONG',
  'EM',
  'B',
  'I',
  'A',
  'BLOCKQUOTE',
  'SPAN'
])

const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ['href', 'title', 'target', 'rel']
}

export const sanitizeHtml = (rawHtml?: string | null): string => {
  if (!rawHtml) {
    return ''
  }

  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return rawHtml
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawHtml, 'text/html')

    // Check if doc.body exists before trying to access it
    if (!doc.body) {
      console.warn('Failed to sanitize HTML content: doc.body is null')
      return rawHtml
    }

    const traverse = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toUpperCase()

        if (tagName === 'SCRIPT' || tagName === 'STYLE') {
          el.remove()
          return
        }

        if (tagName === 'H1') {
          const replacement = doc.createElement('h2')
          while (el.firstChild) {
            replacement.appendChild(el.firstChild)
          }
          el.replaceWith(replacement)
          traverse(replacement)
          return
        }

        if (!ALLOWED_TAGS.has(tagName)) {
          const parent = el.parentNode
          if (parent) {
            while (el.firstChild) {
              parent.insertBefore(el.firstChild, el)
            }
            parent.removeChild(el)
          } else {
            el.remove()
          }
          return
        }

        const allowedAttributes = ALLOWED_ATTRS[tagName] || []
        Array.from(el.attributes).forEach((attr) => {
          const attrName = attr.name.toLowerCase()
          if (!allowedAttributes.includes(attrName)) {
            el.removeAttribute(attr.name)
          }
        })

        if (tagName === 'A') {
          const href = el.getAttribute('href')
          if (!href || href.trim().toLowerCase().startsWith('javascript:')) {
            el.removeAttribute('href')
          }
          if (el.getAttribute('target') === '_blank') {
            el.setAttribute('rel', 'noopener nofollow')
          } else if (!el.getAttribute('rel')) {
            el.setAttribute('rel', 'nofollow')
          }
        }
      } else if (node.nodeType === Node.COMMENT_NODE) {
        node.parentNode?.removeChild(node)
        return
      }

      Array.from(node.childNodes).forEach(traverse)
    }

    traverse(doc.body)
    return doc.body.innerHTML.trim()
  } catch (error) {
    console.warn('Failed to sanitize HTML content:', error)
    return rawHtml
  }
}
