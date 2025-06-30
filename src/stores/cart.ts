import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Cart } from '@/types'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const branchId = ref<string>('')
  const deliveryMethod = ref<'delivery' | 'pickup' | ''>('')
  const deliveryFee = ref(0)

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      // For weight-based products, calculate price per custom unit
      if (item.custom_quantity && item.custom_unit) {
        const pricePerCustomUnit = item.price * item.custom_quantity
        return total + (pricePerCustomUnit * item.quantity)
      }
      // For regular products, use price as is
      return total + (item.price * item.quantity)
    }, 0)
  })

  const total = computed(() => {
    return subtotal.value + deliveryFee.value
  })

  const cart = computed((): Cart => ({
    items: items.value,
    total_items: totalItems.value,
    subtotal: subtotal.value,
    delivery_fee: deliveryFee.value,
    total: total.value,
    branch_id: branchId.value,
    delivery_method: deliveryMethod.value as any
  }))

  const isEmpty = computed(() => items.value.length === 0)

  const getItemById = computed(() => {
    return (productId: string) => items.value.find(item => item.product_id === productId)
  })

  // Actions
  const addItem = (item: CartItem) => {
    const existingItem = items.value.find(i => i.product_id === item.product_id)

    if (existingItem) {
      // For draft beverages, don't merge - add as separate item
      if (item.is_draft_beverage) {
        items.value.push({
          ...item,
          subtotal: (item.price * item.quantity) + (item.bottle_cost || 0)
        })
      } else {
        // Update quantity if item already exists
        existingItem.quantity += item.quantity

        // Check max quantity if specified
        if (item.max_quantity && existingItem.quantity > item.max_quantity) {
          existingItem.quantity = item.max_quantity
        }

        // Calculate subtotal correctly for weight-based products
        if (existingItem.custom_quantity && existingItem.custom_unit) {
          const pricePerCustomUnit = existingItem.price * existingItem.custom_quantity
          existingItem.subtotal = pricePerCustomUnit * existingItem.quantity
        } else {
          existingItem.subtotal = existingItem.price * existingItem.quantity
        }
      }
    } else {
      // Add new item
      let subtotal: number
      if (item.is_draft_beverage) {
        subtotal = (item.price * item.quantity) + (item.bottle_cost || 0)
      } else if (item.custom_quantity && item.custom_unit) {
        // For weight-based products, calculate price per custom unit
        const pricePerCustomUnit = item.price * item.custom_quantity
        subtotal = pricePerCustomUnit * item.quantity
      } else {
        subtotal = item.price * item.quantity
      }

      items.value.push({
        ...item,
        subtotal
      })
    }

    // Save to localStorage
    saveToStorage()
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(i => i.product_id === productId)

    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        // Check max quantity if specified
        if (item.max_quantity && quantity > item.max_quantity) {
          quantity = item.max_quantity
        }

        item.quantity = quantity

        // Calculate subtotal correctly for weight-based products
        if (item.custom_quantity && item.custom_unit) {
          const pricePerCustomUnit = item.price * item.custom_quantity
          item.subtotal = pricePerCustomUnit * quantity
        } else {
          item.subtotal = item.price * quantity
        }
        saveToStorage()
      }
    }
  }

  const removeItem = (productId: string) => {
    const index = items.value.findIndex(i => i.product_id === productId)

    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    branchId.value = ''
    deliveryMethod.value = ''
    deliveryFee.value = 0
    saveToStorage()
  }

  const setBranch = (id: string) => {
    branchId.value = id
    saveToStorage()
  }

  const setDeliveryMethod = (method: 'delivery' | 'pickup') => {
    deliveryMethod.value = method

    // Reset delivery fee if pickup
    if (method === 'pickup') {
      deliveryFee.value = 0
    }

    saveToStorage()
  }

  const setDeliveryFee = (fee: number) => {
    deliveryFee.value = fee
    saveToStorage()
  }

  const increaseQuantity = (productId: string) => {
    const item = items.value.find(i => i.product_id === productId)

    if (item) {
      // Use custom quantity step if available, otherwise default to 1
      const step = item.quantity_step || 1
      const newQuantity = item.quantity + step

      // Check max quantity if specified
      if (!item.max_quantity || newQuantity <= item.max_quantity) {
        updateItemQuantity(productId, newQuantity)
      }
    }
  }

  const decreaseQuantity = (productId: string) => {
    const item = items.value.find(i => i.product_id === productId)

    if (item) {
      // Use custom quantity step if available, otherwise default to 1
      const step = item.quantity_step || 1
      const newQuantity = item.quantity - step

      if (newQuantity > 0) {
        updateItemQuantity(productId, newQuantity)
      } else {
        removeItem(productId)
      }
    }
  }

  // Persistence
  const saveToStorage = () => {
    try {
      const cartData = {
        items: items.value,
        branchId: branchId.value,
        deliveryMethod: deliveryMethod.value,
        deliveryFee: deliveryFee.value
      }
      localStorage.setItem('pwa-pos-cart', JSON.stringify(cartData))
    } catch (error) {
      console.error('Failed to save cart to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-cart')

      if (stored) {
        const cartData = JSON.parse(stored)
        items.value = cartData.items || []
        branchId.value = cartData.branchId || ''
        deliveryMethod.value = cartData.deliveryMethod || ''
        deliveryFee.value = cartData.deliveryFee || 0
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
      clearCart()
    }
  }

  // Validation
  const validateCart = () => {
    const errors: string[] = []

    if (isEmpty.value) {
      errors.push('Cart is empty')
    }

    if (!branchId.value) {
      errors.push('No branch selected')
    }

    if (!deliveryMethod.value) {
      errors.push('No delivery method selected')
    }

    // Check item availability
    items.value.forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`${item.name} has invalid quantity`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Initialize from storage
  loadFromStorage()

  return {
    // State
    items,
    branchId,
    deliveryMethod,
    deliveryFee,

    // Getters
    totalItems,
    subtotal,
    total,
    cart,
    isEmpty,
    getItemById,

    // Actions
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    setBranch,
    setDeliveryMethod,
    setDeliveryFee,
    increaseQuantity,
    decreaseQuantity,
    validateCart,

    // Persistence
    saveToStorage,
    loadFromStorage
  }
})
