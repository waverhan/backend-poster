import type { Product, BottleSize, BottleSelection } from '@/types'

// Bottle products mapping - these are real products from the "Тара" category
// Updated with actual database IDs from your Тара category
export const BOTTLE_PRODUCTS = {
  '0.5L': {
    id: 'cmclpuhbu003cstlkvtk6370w',
    poster_product_id: '188',
    name: 'ПЕТ 0,5 + Кришка',
    price: 4.41
  },
  '1L': {
    id: 'cmclpuhc4003dstlk7h9hxdmn',
    poster_product_id: '189',
    name: 'ПЕТ 1 л + кришка',
    price: 4.71
  },
  '1.5L': {
    id: 'cmclpuhcd003estlkt8azael3',
    poster_product_id: '190',
    name: 'ПЕТ 1,5 л + кришка',
    price: 4.81
  },
  '2L': {
    id: 'cmclpuhcn003fstlkqt40lvme',
    poster_product_id: '191',
    name: 'ПЕТ 2 л + кришка',
    price: 5.31
  },
  '3L': {
    id: 'cmclpuhcv003gstlkms24s9gv',
    poster_product_id: '412',
    name: 'ПЕТ 3л + кришка',
    price: 6.31
  }
}

// Bottle sizes for UI display (derived from real products)
export const BOTTLE_SIZES: BottleSize[] = [
  { size: '2L', price: BOTTLE_PRODUCTS['2L'].price, quantity: 0 },
  { size: '1.5L', price: BOTTLE_PRODUCTS['1.5L'].price, quantity: 0 },
  { size: '1L', price: BOTTLE_PRODUCTS['1L'].price, quantity: 0 },
  { size: '0.5L', price: BOTTLE_PRODUCTS['0.5L'].price, quantity: 0 }
]

// Bottle selection is now controlled via admin panel toggle

/**
 * Check if a product requires bottle selection
 */
export function isDraftBeverage(product: Product): boolean {
  if (!product) return false

  // Simply use the requires_bottles field set in admin panel
  return product.requires_bottles || false
}

/**
 * Check if a product is a bottle/tara product
 */
export function isBottledProduct(product: Product): boolean {
  if (!product) return false

  // Check if product is in the "Тара" category
  const category = (product as any).category
  if (category && category.display_name === 'Тара') {
    return true
  }

  // Also check by product ID if it matches known bottle products
  const bottleIds = Object.values(BOTTLE_PRODUCTS).map(bottle => bottle.id)
  if (bottleIds.includes(product.id)) {
    return true
  }

  // Check by poster_product_id
  const bottlePosterIds = Object.values(BOTTLE_PRODUCTS).map(bottle => bottle.poster_product_id)
  if (product.poster_product_id && bottlePosterIds.includes(product.poster_product_id)) {
    return true
  }

  return false
}

/**
 * Get the default bottle selection for a given beverage quantity
 * SIMPLIFIED: Only use 1L bottles for easy calculation
 */
export function getDefaultBottleSelection(beverageQuantity: number): BottleSelection {
  const selection: BottleSelection = createEmptyBottleSelection()

  // Simple approach: Use only 1L bottles
  // Round up to ensure we have enough bottles for the total volume
  const bottles1L = Math.ceil(beverageQuantity)
  selection['1L'] = bottles1L

  return selection
}

/**
 * Get the most common/default bottle size (2L is most popular)
 */
export function getDefaultBottleSize(): string {
  return '2L'
}

/**
 * Create a simple default bottle selection (1x 2L bottle)
 */
export function getSimpleDefaultBottleSelection(): BottleSelection {
  const selection = createEmptyBottleSelection()
  selection['2L'] = 1
  return selection
}

/**
 * Get bottle product information by size
 */
export function getBottleProduct(size: string) {
  return BOTTLE_PRODUCTS[size as keyof typeof BOTTLE_PRODUCTS]
}

/**
 * Get all bottle products that need to be added to cart
 * Returns an array of { product_info, quantity } for each bottle type
 */
export function getBottleCartItems(bottleSelection: BottleSelection) {
  const cartItems = []

  for (const [size, quantity] of Object.entries(bottleSelection)) {
    if (quantity > 0) {
      const bottleProduct = getBottleProduct(size)
      if (bottleProduct) {
        cartItems.push({
          product_id: bottleProduct.id, // Use actual database ID
          poster_product_id: bottleProduct.poster_product_id,
          name: bottleProduct.name,
          price: bottleProduct.price,
          quantity: quantity,
          size: size
        })
      }
    }
  }

  return cartItems
}

/**
 * Check if bottle products are available and active
 * This should be called from the frontend to verify bottle products exist
 */
export async function checkBottleProductsAvailability(): Promise<{
  available: boolean
  missingBottles: string[]
  usesFallback: boolean
}> {
  try {
    // This would need to be implemented to check the actual database
    // For now, we'll assume bottles are available if the hardcoded mapping exists
    const missingBottles = []

    for (const [size, product] of Object.entries(BOTTLE_PRODUCTS)) {
      // In a real implementation, this would check if the product exists and is active in the database
      if (!product.poster_product_id) {
        missingBottles.push(size)
      }
    }

    return {
      available: missingBottles.length === 0,
      missingBottles,
      usesFallback: missingBottles.length > 0
    }
  } catch (error) {
    console.error('Error checking bottle products availability:', error)
    return {
      available: false,
      missingBottles: Object.keys(BOTTLE_PRODUCTS),
      usesFallback: true
    }
  }
}

/**
 * Calculate total bottle cost based on bottle selection
 */
export function calculateBottleCost(bottles: BottleSelection): number {
  let totalCost = 0

  for (const [size, quantity] of Object.entries(bottles)) {
    const bottleSize = BOTTLE_SIZES.find(b => b.size === size)
    if (bottleSize && quantity > 0) {
      totalCost += bottleSize.price * quantity
    }
  }

  return Math.round(totalCost * 100) / 100 // Round to 2 decimal places
}

/**
 * Get total number of bottles selected
 */
export function getTotalBottles(bottles: BottleSelection): number {
  return Object.values(bottles).reduce((total, quantity) => total + quantity, 0)
}

/**
 * Get total volume of bottles selected (in liters)
 */
export function getTotalBottleVolume(bottles: BottleSelection): number {
  let totalVolume = 0

  for (const [size, quantity] of Object.entries(bottles)) {
    const volume = parseFloat(size.replace('L', ''))
    totalVolume += volume * quantity
  }

  return Math.round(totalVolume * 100) / 100
}

/**
 * Validate that bottle selection matches beverage quantity
 */
export function validateBottleSelection(beverageQuantity: number, bottles: BottleSelection): boolean {
  const totalBottleVolume = getTotalBottleVolume(bottles)
  return Math.abs(totalBottleVolume - beverageQuantity) < 0.01 // Allow small floating point differences
}

/**
 * Get bottle selection summary for display
 */
export function getBottleSelectionSummary(bottles: BottleSelection): string {
  const selections = []

  for (const [size, quantity] of Object.entries(bottles)) {
    if (quantity > 0) {
      selections.push(`${size} x ${quantity}`)
    }
  }

  return selections.join(', ')
}

/**
 * Create empty bottle selection
 */
export function createEmptyBottleSelection(): BottleSelection {
  return {
    '2L': 0,
    '1.5L': 0,
    '1L': 0,
    '0.5L': 0
  }
}
