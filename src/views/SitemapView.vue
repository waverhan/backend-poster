<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🗺️ Карта сайту
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Знайдіть всі сторінки нашого сайту
        </p>
      </div>

      <!-- Main Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <!-- Main Pages -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            🏠 Основні сторінки
          </h2>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Головна сторінка
              </router-link>
            </li>
            <li>
              <router-link to="/shop" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Магазин
              </router-link>
            </li>
            <li>
              <router-link to="/cart" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Кошик
              </router-link>
            </li>
            <li>
              <router-link to="/orders" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Мої замовлення
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Company Info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            🏢 Компанія
          </h2>
          <ul class="space-y-2">
            <li>
              <router-link to="/about" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Про нас
              </router-link>
            </li>
            <li>
              <router-link to="/branches" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Наші магазини
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Зв'язатися з нами
              </router-link>
            </li>
            <li>
              <a href="https://blog.opillia.com.ua" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                📝 Блог
              </a>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            👤 Акаунт
          </h2>
          <ul class="space-y-2">
            <li>
              <router-link to="/profile" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Профіль
              </router-link>
            </li>
            <li>
              <router-link to="/login" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Вхід
              </router-link>
            </li>
            <li>
              <router-link to="/register" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Реєстрація
              </router-link>
            </li>
            <li>
              <router-link to="/notifications" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Сповіщення
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" v-if="categories.length > 0">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          📂 Категорії товарів
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="category in categories" :key="category.id" class="text-sm">
            <router-link
              :to="`/shop?category=${category.slug || category.id}`"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {{ category.display_name }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Popular Products -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" v-if="popularProducts.length > 0">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          ⭐ Популярні товари
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="product in popularProducts" :key="product.id" class="text-sm">
            <router-link
              :to="`/product/${product.slug || product.id}`"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {{ product.display_name }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- All Products -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" v-if="allProducts.length > 0">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          📦 Всі товари ({{ allProducts.length }})
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          <div v-for="product in allProducts" :key="product.id" class="text-sm">
            <router-link
              :to="`/product/${product.slug || product.id}`"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate"
            >
              {{ product.display_name }}
            </router-link>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Показано перші 100 товарів. Повний список доступний у XML Sitemap.
        </p>
      </div>

      <!-- Technical Links -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          🔧 Технічні сторінки
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Static Files (Frontend) -->
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Статичні файли:</h3>
            <div class="space-y-1">
              <a href="/sitemap.xml" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                📄 XML Sitemap
              </a>
              <a href="/robots.txt" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                🤖 Robots.txt
              </a>
              <a href="/google-shopping.xml" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                🛒 Google Shopping (зразок)
              </a>
              <a href="/products.json" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                📦 Product Feed (зразок)
              </a>
            </div>
          </div>

          <!-- Dynamic API (Backend) -->
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">API (актуальні дані):</h3>
            <div class="space-y-1">
              <a href="https://backend-api-production-b3a0.up.railway.app/api/sitemap.xml" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                📄 Dynamic Sitemap
              </a>
              <a href="https://backend-api-production-b3a0.up.railway.app/api/robots.txt" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                🤖 Dynamic Robots.txt
              </a>
              <a href="https://backend-api-production-b3a0.up.railway.app/api/feeds/google-shopping.xml" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                🛒 Google Shopping (API)
              </a>
              <a href="https://backend-api-production-b3a0.up.railway.app/api/feeds/products.json" target="_blank" class="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                📦 Product Feed (API)
              </a>
            </div>
          </div>
        </div>

        <!-- Generate & Download Section -->
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">🔄 Генерувати актуальні файли:</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              @click="downloadSitemap"
              :disabled="isGenerating"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              {{ isGenerating ? '⏳' : '📄' }} Sitemap XML
            </button>
            <button
              @click="downloadGoogleFeed"
              :disabled="isGenerating"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              {{ isGenerating ? '⏳' : '🛒' }} Google Shopping
            </button>
            <button
              @click="downloadProductFeed"
              :disabled="isGenerating"
              class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              {{ isGenerating ? '⏳' : '📦' }} Product JSON
            </button>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Ці кнопки генерують файли з актуальними даними товарів
          </p>
        </div>
      </div>

      <!-- Back to top -->
      <div class="text-center mt-8">
        <button 
          @click="scrollToTop"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          ⬆️ Вгору
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { storeToRefs } from 'pinia'
import type { Product, Category } from '@/types'
import feedService from '@/services/feedService'

// Stores
const productStore = useProductStore()
const { categories } = storeToRefs(productStore)

// Local state
const popularProducts = ref<Product[]>([])
const allProducts = ref<Product[]>([])
const isGenerating = ref(false)

// Methods
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Feed generation methods
const downloadSitemap = async () => {
  isGenerating.value = true
  try {
    await feedService.downloadSitemap()
  } catch (error) {
    console.error('Error downloading sitemap:', error)
  } finally {
    isGenerating.value = false
  }
}

const downloadGoogleFeed = async () => {
  isGenerating.value = true
  try {
    await feedService.downloadGoogleShoppingFeed()
  } catch (error) {
    console.error('Error downloading Google Shopping feed:', error)
  } finally {
    isGenerating.value = false
  }
}

const downloadProductFeed = async () => {
  isGenerating.value = true
  try {
    await feedService.downloadProductFeed()
  } catch (error) {
    console.error('Error downloading product feed:', error)
  } finally {
    isGenerating.value = false
  }
}

const loadData = async () => {
  try {
    // Load categories
    await productStore.fetchCategories()

    // Load all products
    await productStore.fetchProducts()

    // Set popular products (first 12 active products)
    popularProducts.value = productStore.products.slice(0, 12)

    // Set all products (first 100 for display, full list in XML sitemap)
    allProducts.value = productStore.products.slice(0, 100)
  } catch (error) {
    console.error('Error loading sitemap data:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>
