import type { Product, BottleSize, BottleSelection } from '@/types'

// Bottle products mapping - these are real products from the "Тара" category
export const BOTTLE_PRODUCTS = {
  '0.5L': { poster_product_id: '188', name: 'ПЕТ 0,5 + Кришка', price: 4.41 },
  '1L': { poster_product_id: '189', name: 'ПЕТ 1 л + кришка', price: 4.71 },
  '1.5L': { poster_product_id: '190', name: 'ПЕТ 1,5 л + кришка', price: 4.81 },
  '2L': { poster_product_id: '191', name: 'ПЕТ 2 л + кришка', price: 5.31 },
  '3L': { poster_product_id: '412', name: 'ПЕТ 3л + кришка', price: 6.31 }
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
 * Get the default bottle selection for a given beverage quantity
 * This automatically selects the most appropriate bottle(s) for the quantity
 */
export function getDefaultBottleSelection(beverageQuantity: number): BottleSelection {
  const selection: BottleSelection = createEmptyBottleSelection()

  // Auto-select the most efficient bottle combination
  // Priority: 2L > 1.5L > 1L > 0.5L (most cost-effective)

  let remainingQuantity = beverageQuantity

  // First, use as many 2L bottles as possible
  if (remainingQuantity >= 2) {
    const bottles2L = Math.floor(remainingQuantity / 2)
    selection['2L'] = bottles2L
    remainingQuantity -= bottles2L * 2
  }

  // Then use 1.5L if remaining quantity is >= 1.5L
  if (remainingQuantity >= 1.5) {
    selection['1.5L'] = 1
    remainingQuantity -= 1.5
  }

  // Then use 1L if remaining quantity is >= 1L
  if (remainingQuantity >= 1) {
    selection['1L'] = 1
    remainingQuantity -= 1
  }

  // Finally use 0.5L for any remaining quantity
  if (remainingQuantity > 0) {
    const bottles05L = Math.ceil(remainingQuantity / 0.5)
    selection['0.5L'] = bottles05L
  }

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
