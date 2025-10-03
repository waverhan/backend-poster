import { useCartStore } from '@/stores/cart'
import { useBranchStore } from '@/stores/branch'
import { useProductStore } from '@/stores/product'
import type { CartItem, Branch } from '@/types'

export interface ProductAvailabilityResult {
  availableItems: CartItem[]
  unavailableItems: CartItem[]
  adjustedItems: CartItem[] // Items with reduced quantities
  hasUnavailableItems: boolean
  hasAdjustedItems: boolean
  totalAvailableValue: number
  totalUnavailableValue: number
  totalAdjustedValue: number
}

export interface ProductInventory {
  product_id: string
  available_quantity: number
  unit: string // 'kg', 'p' (pieces), etc.
  is_available: boolean
}

export class ProductAvailabilityService {
  /**
   * Check product availability for a specific branch
   */
  static async checkProductAvailability(
    cartItems: CartItem[],
    targetBranch: Branch
  ): Promise<ProductAvailabilityResult> {
    const productStore = useProductStore()

    // Ensure products are loaded
    if (!productStore.products.length) {
      await productStore.fetchProducts()
    }

    const availableItems: CartItem[] = []
    const unavailableItems: CartItem[] = []
    const adjustedItems: CartItem[] = []
    let totalAvailableValue = 0
    let totalUnavailableValue = 0
    let totalAdjustedValue = 0

    

    for (const item of cartItems) {
      // Skip inventory check for bottle products (they're always available)
      if (item.is_bottle_product) {
        availableItems.push(item)
        totalAvailableValue += item.subtotal || (item.price * item.quantity)
        continue
      }

      // Get detailed inventory information for regular products
      const inventory = await this.getProductInventory(item.product_id, targetBranch.id, item.quantity)
      

      // Helper function to calculate correct price for weight-based products
      const calculateItemValue = (cartItem: CartItem, quantity: number): number => {
        if (cartItem.custom_quantity && cartItem.custom_unit) {
          const pricePerCustomUnit = cartItem.price * cartItem.custom_quantity
          return pricePerCustomUnit * quantity
        }
        return cartItem.price * quantity
      }

      // Helper function to convert cart quantity to inventory units for weight-based products
      const getRequiredInventoryQuantity = (cartItem: CartItem): number => {
        if (cartItem.custom_quantity && cartItem.custom_unit) {
          // For weight-based products: cart quantity × custom_quantity = total weight needed
          // e.g., 5 pieces × 0.05kg = 0.25kg needed
          return cartItem.quantity * cartItem.custom_quantity
        }
        // For regular products, cart quantity = inventory quantity
        return cartItem.quantity
      }

      // Helper function to convert inventory quantity back to cart units
      const getMaxCartQuantity = (cartItem: CartItem, inventoryQuantity: number): number => {
        if (cartItem.custom_quantity && cartItem.custom_unit) {
          // For weight-based products: inventory quantity ÷ custom_quantity = max cart pieces
          // e.g., 0.25kg ÷ 0.05kg = 5 pieces max
          return Math.floor(inventoryQuantity / cartItem.custom_quantity)
        }
        // For regular products, inventory quantity = cart quantity
        return inventoryQuantity
      }

      const requiredInventoryQuantity = getRequiredInventoryQuantity(item)

      if (!inventory.is_available) {
        // Product not available at all
        unavailableItems.push(item)
        totalUnavailableValue += calculateItemValue(item, item.quantity)
      } else if (inventory.available_quantity >= requiredInventoryQuantity) {
        // Full quantity available
        availableItems.push(item)
        totalAvailableValue += calculateItemValue(item, item.quantity)
      } else if (inventory.available_quantity > 0) {
        // Partial quantity available - adjust the item
        const maxCartQuantity = getMaxCartQuantity(item, inventory.available_quantity)

        if (maxCartQuantity > 0) {
          const adjustedItem: CartItem = {
            ...item,
            quantity: maxCartQuantity,
            original_quantity: item.quantity // Store original quantity
          }
          adjustedItems.push(adjustedItem)
          totalAdjustedValue += calculateItemValue(item, maxCartQuantity)

          // Calculate the unavailable portion value but DON'T add to unavailableItems
          // (this was causing the confusion - items were in both arrays)
          const unavailableQuantity = item.quantity - maxCartQuantity
          if (unavailableQuantity > 0) {
            totalUnavailableValue += calculateItemValue(item, unavailableQuantity)
          }
        } else {
          // Available inventory is too small for even one unit
          unavailableItems.push(item)
          totalUnavailableValue += calculateItemValue(item, item.quantity)
        }
      } else {
        // Zero quantity available
        unavailableItems.push(item)
        totalUnavailableValue += calculateItemValue(item, item.quantity)
      }
    }

    return {
      availableItems,
      unavailableItems,
      adjustedItems,
      hasUnavailableItems: unavailableItems.length > 0,
      hasAdjustedItems: adjustedItems.length > 0,
      totalAvailableValue,
      totalUnavailableValue,
      totalAdjustedValue
    }
  }

  /**
   * Get detailed product inventory for a specific branch
   */
  static async getProductInventory(productId: string, branchId: string, requiredQuantity: number = 1): Promise<ProductInventory> {
    try {
      // Call backend API to get detailed inventory using correct backend URL
      const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api`
      const apiUrl = `${API_BASE_URL}/inventory/check/${productId}/${branchId}?quantity=${requiredQuantity}`

      console.log(`🔍 Checking inventory: ${apiUrl}`)
      const response = await fetch(apiUrl)

      if (!response.ok) {
        // Check if it's a 404 (endpoint not found) vs other errors
        if (response.status === 404) {
          console.warn(`Inventory endpoint not found or product/branch not found: ${apiUrl}`)
        } else {
          console.warn(`Failed to get inventory (${response.status}): ${apiUrl}`)
        }

        return {
          product_id: productId,
          available_quantity: 999, // Assume high availability if check fails
          unit: 'p',
          is_available: true
        }
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Expected JSON response but got ${contentType} from ${apiUrl}`)
        return {
          product_id: productId,
          available_quantity: 999,
          unit: 'p',
          is_available: true
        }
      }

      const data = await response.json()
      console.log(`📊 Inventory response for ${productId}:`, data)

      return {
        product_id: productId,
        available_quantity: data.stock_level || 0,
        unit: data.unit || 'p',
        is_available: (data.stock_level || 0) > 0 // Product is available if stock > 0, regardless of requested quantity
      }
    } catch (error) {
      // Only log the error if it's not a JSON parsing error from HTML response
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        console.warn(`Inventory API returned HTML instead of JSON for product ${productId} in branch ${branchId} - likely endpoint not available`)
      } else {
        console.error('Error getting product inventory:', error)
      }

      return {
        product_id: productId,
        available_quantity: 999, // Assume high availability if check fails
        unit: 'p',
        is_available: true
      }
    }
  }

  /**
   * Check if a specific product is available in a branch (legacy method)
   */
  static async isProductAvailableInBranch(productId: string, branchId: string, quantity: number = 1): Promise<boolean> {
    const inventory = await this.getProductInventory(productId, branchId, quantity)
    return inventory.is_available
  }

  /**
   * Handle unavailable and adjusted items with user confirmation
   */
  static async handleInventoryConflicts(
    result: ProductAvailabilityResult,
    targetBranch: Branch
  ): Promise<boolean> {
    if (!result.hasUnavailableItems && !result.hasAdjustedItems) return true

    const cartStore = useCartStore()

    let message = `Зміни в кошику для філії "${targetBranch.name}":\n\n`

    // Handle completely unavailable items
    if (result.hasUnavailableItems) {
      const unavailableNames = result.unavailableItems.map(item =>
        `• ${item.name} (${item.quantity} ${item.unit || 'шт.'}) - НЕДОСТУПНО`
      ).join('\n')
      message += `❌ Товари для видалення:\n${unavailableNames}\n\n`
    }

    // Handle quantity adjustments
    if (result.hasAdjustedItems) {
      const adjustedNames = result.adjustedItems.map(item =>
        `• ${item.name}: ${(item as any).original_quantity} → ${item.quantity} ${item.unit || 'шт.'}`
      ).join('\n')
      message += `⚠️ Зменшення кількості:\n${adjustedNames}\n\n`
    }

    const totalLoss = result.totalUnavailableValue
    message += `Загальна втрата: ${totalLoss.toFixed(2)} UAH\n\nПродовжити з цими змінами?`

    const confirmed = confirm(message)

    if (confirmed) {
      // Remove completely unavailable items
      for (const item of result.unavailableItems) {
        if (!result.adjustedItems.find(adj => adj.product_id === item.product_id)) {
          cartStore.removeItem(item.product_id)
        }
      }

      // Update quantities for adjusted items
      for (const item of result.adjustedItems) {
        cartStore.updateItemQuantity(item.product_id, item.quantity)
      }

      return true
    }

    return false
  }

  /**
   * Remove unavailable items from cart with user confirmation (legacy method)
   */
  static async handleUnavailableItems(
    unavailableItems: CartItem[],
    targetBranch: Branch
  ): Promise<boolean> {
    const result: ProductAvailabilityResult = {
      availableItems: [],
      unavailableItems,
      adjustedItems: [],
      hasUnavailableItems: unavailableItems.length > 0,
      hasAdjustedItems: false,
      totalAvailableValue: 0,
      totalUnavailableValue: unavailableItems.reduce((sum, item) => {
        if (item.custom_quantity && item.custom_unit) {
          const pricePerCustomUnit = item.price * item.custom_quantity
          return sum + (pricePerCustomUnit * item.quantity)
        }
        return sum + (item.price * item.quantity)
      }, 0),
      totalAdjustedValue: 0
    }

    return this.handleInventoryConflicts(result, targetBranch)
  }

  /**
   * Get alternative branches where unavailable products are available
   */
  static async findAlternativeBranches(
    unavailableItems: CartItem[]
  ): Promise<{ [productId: string]: Branch[] }> {
    const branchStore = useBranchStore()
    const alternatives: { [productId: string]: Branch[] } = {}

    for (const item of unavailableItems) {
      alternatives[item.product_id] = []

      for (const branch of branchStore.branches) {
        const isAvailable = await this.isProductAvailableInBranch(item.product_id, branch.id)
        if (isAvailable) {
          alternatives[item.product_id].push(branch)
        }
      }
    }

    return alternatives
  }

  /**
   * Show detailed availability report to user
   */
  static showAvailabilityReport(
    result: ProductAvailabilityResult,
    targetBranch: Branch
  ): void {
    if (!result.hasUnavailableItems && !result.hasAdjustedItems) {
      alert(`✅ Всі товари доступні у філії "${targetBranch.name}"`)
      return
    }

    const availableCount = result.availableItems.length
    const unavailableCount = result.unavailableItems.length
    const adjustedCount = result.adjustedItems.length
    const totalItems = availableCount + unavailableCount + adjustedCount

    let report = `📊 Звіт про наявність товарів у філії "${targetBranch.name}":\n\n`

    if (availableCount > 0) {
      report += `✅ Повністю доступно: ${availableCount} товарів (${result.totalAvailableValue.toFixed(2)} UAH)\n`
    }

    if (adjustedCount > 0) {
      report += `⚠️ Часткова наявність: ${adjustedCount} товарів (${result.totalAdjustedValue.toFixed(2)} UAH)\n`
      report += `Товари з обмеженою кількістю:\n`
      report += result.adjustedItems.map(item =>
        `• ${item.name}: доступно ${item.quantity} з ${(item as any).original_quantity} ${item.unit || 'шт.'}`
      ).join('\n') + '\n\n'
    }

    if (unavailableCount > 0) {
      report += `❌ Недоступно: ${unavailableCount} позицій (${result.totalUnavailableValue.toFixed(2)} UAH)\n`
      report += `Недоступні товари:\n`
      report += result.unavailableItems.map(item =>
        `• ${item.name} (${item.quantity} ${item.unit || 'шт.'})`
      ).join('\n')
    }

    alert(report.trim())
  }

  /**
   * Validate cart against selected branch and handle conflicts
   */
  static async validateCartForBranch(
    targetBranch: Branch,
    showReport: boolean = true
  ): Promise<ProductAvailabilityResult> {
    const cartStore = useCartStore()
    const result = await this.checkProductAvailability(cartStore.items, targetBranch)

    if (showReport) {
      this.showAvailabilityReport(result, targetBranch)
    }

    if (result.hasUnavailableItems || result.hasAdjustedItems) {
      await this.handleInventoryConflicts(result, targetBranch)
    }

    return result
  }
}

export default ProductAvailabilityService
