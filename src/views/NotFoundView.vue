<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 404 Header -->
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Сторінка не знайдена</h1>
        <p class="text-gray-600 mb-8">Сторінка, яку ви шукаєте, не існує</p>
      </div>

      <!-- Search Bar -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Пошук товарів..."
            @keyup.enter="performSearch"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="performSearch"
            class="btn-primary px-6 py-2"
          >
            Пошук
          </button>
          <router-link to="/shop" class="btn-outline px-6 py-2">
            До магазину
          </router-link>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Категорії</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <router-link
            v-for="category in categories"
            :key="category.id"
            :to="`/shop?category=${category.id}`"
            class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow text-center"
          >
            <div class="text-3xl mb-2">{{ getCategoryEmoji(category.name) }}</div>
            <h3 class="font-medium text-gray-900 text-sm">{{ category.display_name || category.name }}</h3>
          </router-link>
        </div>
      </div>

      <!-- Featured Products from "Пиво розлив" Category -->
      <div v-if="availableDraftProducts.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🍺 Пиво розлив</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in availableDraftProducts.slice(0, 8)"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @add-bottle-to-cart="handleAddBottleToCart"
          />
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchPerformed && availableSearchResults.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Результати пошуку</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in availableSearchResults"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @add-bottle-to-cart="handleAddBottleToCart"
          />
        </div>
      </div>

      <!-- No Search Results Message -->
      <div v-if="searchPerformed && availableSearchResults.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-4xl mb-4">😕</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Результатів не знайдено</h3>
        <p class="text-gray-600 mb-4">Спробуйте інший пошуковий запит</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useBranchStore } from '@/stores/branch'
import { useCartStore } from '@/stores/cart'
import { useNotificationStore } from '@/stores/notification'
import ProductCard from '@/components/product/ProductCard.vue'
import type { Product, Category } from '@/types'

const router = useRouter()
const productStore = useProductStore()
const branchStore = useBranchStore()
const cartStore = useCartStore()
const notificationStore = useNotificationStore()

// State
const searchQuery = ref('')
const searchPerformed = ref(false)
const searchResults = ref<Product[]>([])
const categories = ref<Category[]>([])
const draftProducts = ref<Product[]>([])

// Computed
const allProducts = computed(() => productStore.products)

const isProductAvailable = (product: Product): boolean => {
  // Show all products - don't filter by inventory on 404 page
  // This allows users to see what's available even if out of stock
  return true
}

const availableDraftProducts = computed(() => {
  return draftProducts.value.filter(isProductAvailable)
})

const availableSearchResults = computed(() => {
  return searchResults.value.filter(isProductAvailable)
})

// Methods
const performSearch = () => {
  searchPerformed.value = true
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  searchResults.value = allProducts.value.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.display_name?.toLowerCase().includes(query) ||
    product.category?.name.toLowerCase().includes(query)
  )
}

const getCategoryEmoji = (categoryName: string): string => {
  const emojiMap: Record<string, string> = {
    'Пиво розлив': '🍺',
    'Пиво': '🍺',
    'Вино': '🍷',
    'Горілка': '🥃',
    'Коньяк': '🥃',
    'Ром': '🥃',
    'Текіла': '🌵',
    'Шампанське': '🍾',
    'Напої': '🥤',
    'Вода': '💧',
    'Сік': '🧃',
    'Кава': '☕',
    'Чай': '🫖',
    'Закуски': '🍿',
    'Снеки': '🥨',
    'Сніданок': '🥐',
    'Десерти': '🍰',
    'Морозиво': '🍦'
  }
  return emojiMap[categoryName] || '📦'
}

const handleAddToCart = (product: Product, quantity?: number) => {
  try {
    const cartItem = {
      product_id: product.id,
      quantity: quantity || 1,
      price: product.price || 0
    }
    cartStore.addItem(cartItem)
    notificationStore.success(`${product.display_name || product.name} додано до кошика`)
  } catch (error) {
    console.error('Error adding to cart:', error)
    notificationStore.error('Помилка при додаванні до кошика')
  }
}

const handleAddBottleToCart = (bottleItem: any) => {
  try {
    cartStore.addItem(bottleItem)
    notificationStore.success('Тара додана до кошика')
  } catch (error) {
    console.error('Error adding bottle to cart:', error)
    notificationStore.error('Помилка при додаванні тари')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Load categories
    if (productStore.categories.length === 0) {
      await productStore.fetchCategories()
    }
    categories.value = productStore.categories

    // Load products if not already loaded
    if (allProducts.value.length === 0) {
      await productStore.fetchProducts()
    }

    // Get draft beverages from "Пиво розлив" category
    const draftCategory = categories.value.find(c =>
      c.name === 'Пиво розлив' || c.display_name === 'Пиво розлив'
    )

    if (draftCategory) {
      draftProducts.value = allProducts.value.filter(p =>
        p.category_id === draftCategory.id
      ).slice(0, 8)
    }
  } catch (error) {
    console.error('Error loading data for 404 page:', error)
  }
})
</script>
