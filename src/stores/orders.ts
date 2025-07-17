import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Branch, LocationData } from '@/types'

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  unit?: string
  image_url?: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: 'delivery' | 'pickup'
  delivery_address?: string
  pickup_branch?: Branch
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed'
  notes?: string
  no_callback_confirmation?: boolean
  created_at: string
  updated_at: string
  estimated_delivery?: string
}

export interface OrderFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_method: 'delivery' | 'pickup'
  delivery_address?: string
  pickup_branch?: Branch
  notes?: string
  no_callback_confirmation?: boolean
}

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const orderCount = computed(() => orders.value.length)
  const pendingOrders = computed(() => orders.value.filter(order => order.status === 'pending'))
  const completedOrders = computed(() => orders.value.filter(order => order.status === 'delivered'))

  // Actions
  const createOrder = async (
    orderData: OrderFormData,
    cartItems: OrderItem[],
    deliveryFee: number
  ): Promise<Order> => {
    loading.value = true
    error.value = null

    try {
      // Import backend API dynamically to avoid circular dependencies
      const { backendApi } = await import('@/services/backendApi')

      // Create order via backend API
      const order = await backendApi.createOrder(orderData, cartItems, deliveryFee)

      // Update local state
      orders.value.unshift(order)
      currentOrder.value = order

      // Send email notification
      await sendOrderConfirmationEmail(order)

      // Note: Order is automatically sent to Poster POS by the backend
      

      return order
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create order'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Import backend API dynamically to avoid circular dependencies
      const { backendApi } = await import('@/services/backendApi')

      // Update order status via backend API
      const updatedOrder = await backendApi.updateOrderStatus(orderId, status)

      // Update local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex] = updatedOrder
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
      throw err
    }
  }

  const getOrder = (orderId: string): Order | undefined => {
    return orders.value.find(order => order.id === orderId)
  }

  const loadOrders = async () => {
    try {
      // Import backend API dynamically to avoid circular dependencies
      const { backendApi } = await import('@/services/backendApi')

      // Load orders from backend API
      const loadedOrders = await backendApi.getOrders()
      orders.value = loadedOrders
    } catch (err) {
      console.error('Failed to load orders from backend:', err)
      // Fallback to localStorage for offline support
      try {
        const stored = localStorage.getItem('orders')
        if (stored) {
          orders.value = JSON.parse(stored)
        }
      } catch (localErr) {
        console.error('Failed to load orders from localStorage:', localErr)
      }
    }
  }

  const clearOrders = () => {
    orders.value = []
    currentOrder.value = null
    localStorage.removeItem('orders')
  }

  // Helper functions (these will be handled by the backend)
  // const generateOrderId, generateOrderNumber, calculateEstimatedDelivery
  // are now handled by the backend API

  const sendOrderConfirmationEmail = async (order: Order): Promise<void> => {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('@/services/emailService')
      await emailService.sendOrderConfirmation(order)
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      // Don't throw error here as email failure shouldn't prevent order creation
    }
  }

  // Initialize
  loadOrders()

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,

    // Computed
    orderCount,
    pendingOrders,
    completedOrders,

    // Actions
    createOrder,
    updateOrderStatus,
    getOrder,
    loadOrders,
    clearOrders
  }
})
