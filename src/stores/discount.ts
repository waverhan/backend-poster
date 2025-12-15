import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { backendApi } from '@/services/backendApi'

export interface Discount {
  id: string
  name: string
  type: string
  description?: string
  discount_value: number
  discount_type: string
  min_order_amount?: number
  max_order_amount?: number
  day_of_week?: string
  start_time?: string
  end_time?: string
  product_category?: string
  promo_type?: string
  enabled: boolean
}

export const useDiscountStore = defineStore('discount', () => {
  const discounts = ref<Discount[]>([])
  const applicableDiscounts = ref<Discount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all discounts (admin)
  const getAllDiscounts = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await backendApi.get<Discount[]>('/discounts')
      discounts.value = data
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching discounts:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get enabled discounts
  const getEnabledDiscounts = async () => {
    try {
      const { data } = await backendApi.get<Discount[]>('/discounts/enabled')
      
      discounts.value = data
      return data
    } catch (err: any) {
      console.error('Error fetching enabled discounts:', err)
      return []
    }
  }

  // Get applicable discounts for current order
  const getApplicableDiscounts = async (customerId: string | null, userId: string | null, subtotal: number, items: any[]) => {
    try {
      
      const { data } = await backendApi.post<Discount[]>('/discounts/applicable', {
        customerId,
        userId,
        subtotal,
        items
      })
      
      applicableDiscounts.value = data
      return data
    } catch (err: any) {
      console.error('Error getting applicable discounts:', err)
      return []
    }
  }

  // Create discount (admin)
  const createDiscount = async (data: Partial<Discount>) => {
    try {
      const { data: created } = await backendApi.post<Discount>('/discounts', data)
      discounts.value.push(created)
      return created
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Update discount (admin)
  const updateDiscount = async (id: string, data: Partial<Discount>) => {
    try {
      const { data: updated } = await backendApi.put<Discount>(`/discounts/${id}`, data)
      const index = discounts.value.findIndex(d => d.id === id)
      if (index !== -1) {
        discounts.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Delete discount (admin)
  const deleteDiscount = async (id: string) => {
    try {
      await backendApi.delete(`/discounts/${id}`)
      discounts.value = discounts.value.filter(d => d.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Calculate total discount amount
  const calculateTotalDiscount = (discounts: Discount[], subtotal: number) => {
    let totalDiscount = 0
    for (const discount of discounts) {
      if (discount.discount_type === 'percentage') {
        totalDiscount += (subtotal * discount.discount_value) / 100
      } else if (discount.discount_type === 'fixed_amount') {
        totalDiscount += discount.discount_value
      }
    }
    return totalDiscount
  }

  return {
    discounts,
    applicableDiscounts,
    loading,
    error,
    getAllDiscounts,
    getEnabledDiscounts,
    getApplicableDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    calculateTotalDiscount
  }
})
