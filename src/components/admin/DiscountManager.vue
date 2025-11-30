<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-900">Manage Discounts</h2>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        + Add Discount
      </button>
    </div>

    <!-- Discounts List -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Value</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="discount in discounts" :key="discount.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-900">{{ discount.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ discount.type }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ discount.discount_value }}{{ discount.discount_type === 'percentage' ? '%' : discount.discount_type === 'fixed_amount' ? ' ₴' : '' }}
            </td>
            <td class="px-6 py-4 text-sm">
              <button
                @click="toggleDiscountStatus(discount)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  discount.enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ discount.enabled ? 'Enabled' : 'Disabled' }}
              </button>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button
                @click="editDiscount(discount)"
                class="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                @click="deleteDiscount(discount.id)"
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ showEditModal ? 'Edit Discount' : 'Create Discount' }}</h3>
        
        <form @submit.prevent="saveDiscount" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="formData.name" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select v-model="formData.type" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
              <option value="first_order">First Order (10%)</option>
              <option value="happy_hours">Happy Hours (15%)</option>
              <option value="free_delivery">Free Delivery (1500+ UAH)</option>
              <option value="fixed_shipping">Fixed Shipping (700+ UAH)</option>
              <option value="beer_promo">Beer Promo</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
            <input v-model.number="formData.discount_value" type="number" step="0.01" class="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select v-model="formData.discount_type" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount (₴)</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>

          <div class="flex items-center">
            <input v-model="formData.enabled" type="checkbox" class="rounded" />
            <label class="ml-2 text-sm text-gray-700">Enabled</label>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModals"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDiscountStore, type Discount } from '@/stores/discount'

const discountStore = useDiscountStore()
const discounts = ref<Discount[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  name: '',
  type: 'first_order',
  discount_value: 10,
  discount_type: 'percentage',
  enabled: true
})

onMounted(async () => {
  await loadDiscounts()
})

const loadDiscounts = async () => {
  discounts.value = await discountStore.getAllDiscounts()
}

const editDiscount = (discount: Discount) => {
  editingId.value = discount.id
  formData.value = { ...discount }
  showEditModal.value = true
}

const saveDiscount = async () => {
  try {
    if (showEditModal.value && editingId.value) {
      // Remove id and timestamps from formData before sending
      const { id, created_at, updated_at, ...updateData } = formData.value as any
      await discountStore.updateDiscount(editingId.value, updateData)
    } else {
      await discountStore.createDiscount(formData.value)
    }
    await loadDiscounts()
    closeModals()
  } catch (error) {
    console.error('Error saving discount:', error)
  }
}

const deleteDiscount = async (id: string) => {
  if (confirm('Are you sure you want to delete this discount?')) {
    try {
      await discountStore.deleteDiscount(id)
      await loadDiscounts()
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }
}

const toggleDiscountStatus = async (discount: Discount) => {
  try {
    await discountStore.updateDiscount(discount.id, { enabled: !discount.enabled })
    await loadDiscounts()
  } catch (error) {
    console.error('Error toggling discount status:', error)
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  formData.value = {
    name: '',
    type: 'first_order',
    discount_value: 10,
    discount_type: 'percentage',
    enabled: true
  }
}
</script>

