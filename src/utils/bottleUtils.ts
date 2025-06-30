import type { Product, BottleSize, BottleSelection } from '@/types'

// Bottle sizes and their prices (in UAH)
export const BOTTLE_SIZES: BottleSize[] = [
  { size: '2L', price: 5.51, quantity: 0 },
  { size: '1.5L', price: 4.20, quantity: 0 },
  { size: '1L', price: 5.01, quantity: 0 },
  { size: '0.5L', price: 4.81, quantity: 0 }
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
