/**
 * Utility functions for handling product quantities and unit conversions
 */

export interface QuantityDisplay {
  value: number
  unit: string
  displayText: string
}

/**
 * Convert database quantity to display quantity
 * Database stores in base units (kg, L), display shows user-friendly units (г, мл)
 */
export function convertToDisplayQuantity(
  dbQuantity: number,
  dbUnit: string,
  customUnit?: string
): QuantityDisplay {
  // If custom unit is specified, use it directly
  if (customUnit) {
    return {
      value: dbQuantity,
      unit: customUnit,
      displayText: `${dbQuantity}${customUnit}`
    }
  }

  // Convert based on database unit
  switch (dbUnit?.toLowerCase()) {
    case 'kg':
      // Convert kg to grams for small quantities
      if (dbQuantity < 1) {
        const grams = Math.round(dbQuantity * 1000)
        return {
          value: grams,
          unit: 'г',
          displayText: `${grams}г`
        }
      } else {
        return {
          value: dbQuantity,
          unit: 'кг',
          displayText: `${dbQuantity}кг`
        }
      }

    case 'l':
    case 'liter':
    case 'liters':
      // Keep liters as is for beverages
      return {
        value: dbQuantity,
        unit: 'L',
        displayText: `${dbQuantity}L`
      }

    case 'ml':
    case 'мл':
      // Convert ml to liters for large quantities
      if (dbQuantity >= 1000) {
        const liters = dbQuantity / 1000
        return {
          value: liters,
          unit: 'L',
          displayText: `${liters}L`
        }
      } else {
        return {
          value: dbQuantity,
          unit: 'мл',
          displayText: `${dbQuantity}мл`
        }
      }

    case 'g':
    case 'г':
      // Keep grams as is
      return {
        value: dbQuantity,
        unit: 'г',
        displayText: `${dbQuantity}г`
      }

    case 'pcs':
    case 'p':
    case 'шт':
    default:
      // Default to pieces
      return {
        value: dbQuantity,
        unit: 'шт',
        displayText: `${dbQuantity} шт`
      }
  }
}

/**
 * Convert display quantity back to database quantity
 */
export function convertToDbQuantity(
  displayQuantity: number,
  displayUnit: string,
  dbUnit: string
): number {
  // If units match, no conversion needed
  if (displayUnit.toLowerCase() === dbUnit.toLowerCase()) {
    return displayQuantity
  }

  // Convert grams to kg
  if (displayUnit === 'г' && dbUnit.toLowerCase() === 'kg') {
    return displayQuantity / 1000
  }

  // Convert ml to L
  if (displayUnit === 'мл' && dbUnit.toLowerCase() === 'l') {
    return displayQuantity / 1000
  }

  // Convert L to ml
  if (displayUnit === 'L' && dbUnit.toLowerCase() === 'ml') {
    return displayQuantity * 1000
  }

  // Convert kg to g
  if (displayUnit === 'кг' && dbUnit.toLowerCase() === 'g') {
    return displayQuantity * 1000
  }

  // Default: no conversion
  return displayQuantity
}

/**
 * Get appropriate quantity step for a product
 */
export function getQuantityStep(
  customQuantity?: number | null,
  quantityStep?: number | null,
  customUnit?: string
): number {
  // Use explicit quantity step if provided
  if (quantityStep) {
    return quantityStep
  }

  // Use custom quantity as step if provided
  if (customQuantity) {
    return customQuantity
  }

  // Default steps based on unit
  switch (customUnit?.toLowerCase()) {
    case 'г':
      return 50 // 50g increments
    case 'кг':
      return 0.1 // 100g increments
    case 'l':
      return 0.5 // 500ml increments
    case 'мл':
      return 250 // 250ml increments
    case 'шт':
    case 'pcs':
    default:
      return 1 // 1 piece increments
  }
}

/**
 * Get minimum quantity for a product
 */
export function getMinQuantity(
  minQuantity?: number | null,
  customQuantity?: number | null,
  customUnit?: string
): number {
  // Use explicit min quantity if provided
  if (minQuantity) {
    return minQuantity
  }

  // Use custom quantity as minimum if provided
  if (customQuantity) {
    return customQuantity
  }

  // Default minimums based on unit
  switch (customUnit?.toLowerCase()) {
    case 'г':
      return 50 // Minimum 50g
    case 'кг':
      return 0.1 // Minimum 100g
    case 'l':
      return 0.5 // Minimum 500ml
    case 'мл':
      return 250 // Minimum 250ml
    case 'шт':
    case 'pcs':
    default:
      return 1 // Minimum 1 piece
  }
}

/**
 * Get maximum quantity for a product
 */
export function getMaxQuantity(
  maxQuantity?: number | null,
  availableQuantity?: number,
  customUnit?: string
): number {
  // Use available quantity if it's lower than max
  const productMax = maxQuantity || getDefaultMaxQuantity(customUnit)
  
  if (availableQuantity !== undefined && availableQuantity > 0) {
    return Math.min(productMax, availableQuantity)
  }

  return productMax
}

/**
 * Get default maximum quantity based on unit
 */
function getDefaultMaxQuantity(customUnit?: string): number {
  switch (customUnit?.toLowerCase()) {
    case 'г':
      return 1000 // Maximum 1kg
    case 'кг':
      return 5 // Maximum 5kg
    case 'l':
      return 5 // Maximum 5L
    case 'мл':
      return 5000 // Maximum 5L
    case 'шт':
    case 'pcs':
    default:
      return 10 // Maximum 10 pieces
  }
}

/**
 * Format quantity for display
 */
export function formatQuantityDisplay(
  quantity: number,
  unit: string,
  showUnit: boolean = true
): string {
  // Handle decimal places based on unit
  let formattedQuantity: string

  if (unit === 'г' || unit === 'мл' || unit === 'шт') {
    // Show whole numbers for grams, ml, pieces
    formattedQuantity = Math.round(quantity).toString()
  } else {
    // Show decimals for kg, L
    formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1)
  }

  return showUnit ? `${formattedQuantity}${unit}` : formattedQuantity
}

/**
 * Calculate price for quantity
 */
export function calculatePrice(
  basePrice: number,
  quantity: number,
  unit: string
): number {
  // Price calculation might need adjustment based on unit
  // For now, simple multiplication
  return basePrice * quantity
}
