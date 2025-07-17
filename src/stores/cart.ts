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
      // For draft beverages with bottle cost (fallback mode)
      if (item.is_draft_beverage && item.bottle_cost) {
        return total + (item.price * item.quantity) + item.bottle_cost
      }
      // For weight-based products, calculate price per custom unit
      if (item.custom_quantity && item.custom_unit) {
        const pricePerCustomUnit = item.price * item.custom_quantity
        return total + (pricePerCustomUnit * item.quantity)
      }
      // For all other products (including separate bottle products), use simple price * quantity
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
    // Find existing item to combine with
    let existingItem: CartItem | undefined

    if (item.is_bottle_product) {
      // For bottle products, check poster_product_id (since they're real products)
      existingItem = items.value.find(i =>
        i.poster_product_id === item.poster_product_id &&
        i.is_bottle_product
      )
    } else {
      // For all other products (including draft beverages), just check product_id
      // This ensures draft beverages with the same product_id are always combined
      existingItem = items.value.find(i =>
        i.product_id === item.product_id &&
        !i.is_bottle_product
      )
    }

    if (existingItem) {
      // Update quantity if item already exists (same product + same bottle selection)
      existingItem.quantity += item.quantity

      // Check max quantity if specified
      if (item.max_quantity && existingItem.quantity > item.max_quantity) {
        existingItem.quantity = item.max_quantity
      }

      // Calculate subtotal correctly
      if (existingItem.is_draft_beverage && existingItem.bottle_cost) {
        // Fallback: draft beverage with bottle cost included (when bottle products are not available)
        existingItem.subtotal = (existingItem.price * existingItem.quantity) + existingItem.bottle_cost
      } else if (existingItem.custom_quantity && existingItem.custom_unit) {
        const pricePerCustomUnit = existingItem.price * existingItem.custom_quantity
        existingItem.subtotal = pricePerCustomUnit * existingItem.quantity
      } else {
        // For all other products (including separate bottle products), use simple price * quantity
        existingItem.subtotal = existingItem.price * existingItem.quantity
      }
    } else {
      // Add new item
      let subtotal: number
      if (item.is_draft_beverage && item.bottle_cost) {
        // Fallback: draft beverage with bottle cost included (when bottle products are not available)
        subtotal = (item.price * item.quantity) + item.bottle_cost
      } else if (item.custom_quantity && item.custom_unit) {
        // For weight-based products, calculate price per custom unit
        const pricePerCustomUnit = item.price * item.custom_quantity
        subtotal = pricePerCustomUnit * item.quantity
      } else {
        // For all other products (including separate bottle products), use simple price * quantity
        subtotal = item.price * item.quantity
      }

      // Generate unique ID for cart item
      const cartItemId = `${item.product_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      items.value.push({
        ...item,
        cart_item_id: cartItemId,
        subtotal
      })
    }

    // Save to localStorage
    saveToStorage()
  }

  const updateItemQuantity = (cartItemId: string, quantity: number) => {
    const item = items.value.find(i => i.cart_item_id === cartItemId)

    if (item) {
      if (quantity <= 0) {
        removeItem(cartItemId)
      } else {
        // Check max quantity if specified
        if (item.max_quantity && quantity > item.max_quantity) {
          quantity = item.max_quantity
        }

        item.quantity = quantity

        // Calculate subtotal correctly
        if (item.is_draft_beverage) {
          item.subtotal = (item.price * quantity) + (item.bottle_cost || 0)
        } else if (item.custom_quantity && item.custom_unit) {
          const pricePerCustomUnit = item.price * item.custom_quantity
          item.subtotal = pricePerCustomUnit * quantity
        } else {
          item.subtotal = item.price * quantity
        }
        saveToStorage()
      }
    }
  }

  const removeItem = (cartItemId: string) => {
    const index = items.value.findIndex(i => i.cart_item_id === cartItemId)

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

  const increaseQuantity = (cartItemId: string) => {
    const item = items.value.find(i => i.cart_item_id === cartItemId)

    if (item) {
      // Use custom quantity step if available, otherwise default to 1
      const step = item.quantity_step || 1
      const newQuantity = item.quantity + step

      // Check max quantity if specified
      if (!item.max_quantity || newQuantity <= item.max_quantity) {
        updateItemQuantity(cartItemId, newQuantity)
      }
    }
  }

  const decreaseQuantity = (cartItemId: string) => {
    const item = items.value.find(i => i.cart_item_id === cartItemId)

    if (item) {
      // Use custom quantity step if available, otherwise default to 1
      const step = item.quantity_step || 1
      const newQuantity = item.quantity - step

      if (newQuantity > 0) {
        updateItemQuantity(cartItemId, newQuantity)
      } else {
        removeItem(cartItemId)
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

        // Migrate existing items to have cart_item_id
        let needsSave = false
        items.value.forEach(item => {
          if (!item.cart_item_id) {
            item.cart_item_id = `${item.product_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            needsSave = true
          }
        })

        branchId.value = cartData.branchId || ''
        deliveryMethod.value = cartData.deliveryMethod || ''
        deliveryFee.value = cartData.deliveryFee || 0

        // Save migrated data
        if (needsSave) {
          saveToStorage()
        }
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
