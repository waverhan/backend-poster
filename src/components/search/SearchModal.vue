<template>
  <!-- Search Modal Overlay -->
  <transition name="fade">
    <div v-if="modelValue" class="search-overlay" @click="close">
      <!-- Search Modal Content -->
      <transition name="slide-up">
        <div v-if="modelValue" class="search-modal" @click.stop>
          <!-- Header -->
          <div class="search-header">
            <h3 class="search-title">Пошук товарів</h3>
            <button @click="close" class="close-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Input -->
          <div class="search-input-wrapper">
            <svg class="search-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Введіть назву товару..."
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Search Results / Popular Categories -->
          <div class="search-content">
            <!-- Loading State -->
            <div v-if="isSearching" class="loading-state">
              <div class="spinner"></div>
              <p>Пошук...</p>
            </div>

            <!-- Search Results -->
            <div v-else-if="searchQuery && searchResults.length > 0" class="search-results">
              <h4 class="results-title">Знайдено {{ searchResults.length }} товарів</h4>
              <div class="results-list">
                <div
                  v-for="product in searchResults"
                  :key="product.id"
                  class="result-item"
                  @click="selectProduct(product)"
                >
                  <img
                    v-if="product.display_image_url || product.image_url"
                    :src="getProductImage(product)"
                    :alt="product.display_name"
                    class="result-image"
                  />
                  <div class="result-info">
                    <p class="result-name">{{ product.display_name || product.name }}</p>
                    <p class="result-price">{{ product.price }} ₴</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="searchQuery && searchResults.length === 0 && !isSearching" class="no-results">
              <svg class="no-results-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Нічого не знайдено</p>
              <p class="no-results-hint">Спробуйте інший запит</p>
            </div>

            <!-- Popular Categories (when no search) -->
            <div v-else class="popular-categories">
              <h4 class="categories-title">Популярні категорії</h4>
              <div class="categories-grid">
                <button
                  v-for="category in popularCategories"
                  :key="category.id"
                  class="category-btn"
                  @click="selectCategory(category)"
                >
                  {{ category.display_name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { backendApi } from '@/services/backendApi'
import type { Product, Category } from '@/types'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const productStore = useProductStore()

// State
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const isSearching = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
let searchTimeout: NodeJS.Timeout | null = null

// Computed
const popularCategories = computed(() => {
  return productStore.categoriesWithProducts.slice(0, 6)
})

// Methods
const close = () => {
  emit('update:modelValue', false)
  searchQuery.value = ''
  searchResults.value = []
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInput.value?.focus()
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const query = searchQuery.value.trim().toLowerCase()
      const allProducts = productStore.products

      // Simple client-side search
      searchResults.value = allProducts.filter(product => {
        const name = (product.display_name || product.name || '').toLowerCase()
        return name.includes(query)
      }).slice(0, 20) // Limit to 20 results
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const selectProduct = (product: Product) => {
  close()
  router.push(`/product/${product.slug || product.id}`)
}

const selectCategory = (category: Category) => {
  close()
  router.push(`/shop?category=${category.id}`)
}

const getProductImage = (product: Product): string => {
  const primaryImage = product.display_image_url || product.image_url
  if (!primaryImage) return ''
  return backendApi.getImageUrl(primaryImage)
}

// Watch for modal open to focus input
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    searchInput.value?.focus()
  }
})
</script>

<style scoped>
/* Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  /* Ensure it's positioned relative to viewport, not parent */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* Modal */
.search-modal {
  background: white;
  width: 100%;
  height: 100%;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dark .search-modal {
  background: #1f2937;
}

/* Header */
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .search-header {
  border-bottom-color: #374151;
}

.search-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.dark .search-title {
  color: #f9fafb;
}

.close-btn {
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.dark .close-btn {
  color: #9ca3af;
}

.dark .close-btn:hover {
  background-color: #374151;
  color: #f3f4f6;
}

/* Search Input */
.search-input-wrapper {
  position: relative;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .search-input-wrapper {
  border-bottom-color: #374151;
}

.search-icon {
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  background: white;
  color: #111827;
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  color: #9ca3af;
  border-radius: 9999px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.dark .clear-btn:hover {
  background-color: #374151;
  color: #f3f4f6;
}

/* Content */
.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Search Results */
.search-results {
  padding-bottom: 1rem;
}

.results-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f3f4f6;
}

.result-image {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-price {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
  text-align: center;
}

.no-results-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.no-results-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

/* Popular Categories */
.popular-categories {
  padding-bottom: 1rem;
}

.categories-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.category-btn {
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.75rem;
  font-weight: 500;
  color: #111827;
  text-align: center;
  transition: all 0.2s;
}

.category-btn:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Desktop Styles */
@media (min-width: 768px) {
  .search-overlay {
    align-items: flex-start;
    justify-content: center;
    padding-top: 4rem;
  }

  .search-modal {
    max-width: 600px;
    max-height: 80vh;
    border-radius: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

