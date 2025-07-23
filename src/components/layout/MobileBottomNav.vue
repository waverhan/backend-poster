<template>
  <div class="mobile-bottom-nav">
    <!-- Main Navigation Bar -->
    <nav class="mobile-nav-bar">
      <!-- Menu Button -->
      <button
        @click="toggleMenu"
        class="nav-item"
        :class="{ active: showMenu }"
      >
        <div class="nav-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.menu') }}</span>
      </button>

      <!-- Shop Button -->
      <router-link to="/shop" class="nav-item">
        <div class="nav-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.shop') }}</span>
      </router-link>

      <!-- Search Button -->
      <button @click="openSearch" class="nav-item">
        <div class="nav-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span class="nav-label">{{ $t('nav.search', 'Пошук') }}</span>
      </button>

      <!-- Cart Button -->
      <router-link to="/cart" class="nav-item">
        <div class="nav-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </div>
        <span class="nav-label">{{ $t('nav.cart') }}</span>
      </router-link>


    </nav>

    <!-- Search Modal -->
    <transition name="slide-up">
      <div v-if="showSearch" class="mobile-menu-overlay" @click="closeSearch">
        <div class="mobile-search-modal" @click.stop>
          <div class="search-header">
            <h3>🔍 Пошук товарів</h3>
            <button @click="closeSearch" class="close-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="search-content">
            <div class="relative mb-4">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref="searchInput"
                v-model="searchQuery"
                @input="performSearch"
                type="text"
                placeholder="Введіть назву товару..."
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                autofocus
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Search Results -->
            <div v-if="searchQuery.trim()" class="search-results">
              <div v-if="searchResults.length > 0" class="mb-2 text-sm text-gray-600">
                Знайдено {{ searchResults.length }} товарів
              </div>
              <div v-if="searchResults.length === 0 && searchQuery.trim()" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">🔍</div>
                <div>Товарів не знайдено</div>
                <div class="text-sm">Спробуйте інший запит</div>
              </div>
              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div
                  v-for="product in searchResults.slice(0, 10)"
                  :key="product.id"
                  @click="goToProduct(product)"
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <img
                    :src="product.image_url || '/images/placeholder.jpg'"
                    :alt="product.name"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">{{ product.price }}₴</div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Popular Searches or Categories -->
            <div v-else class="popular-searches">
              <h4 class="font-medium text-gray-900 mb-3">Популярні категорії</h4>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="category in popularCategories"
                  :key="category.id"
                  @click="searchCategory(category.name)"
                  class="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <div class="font-medium text-gray-900">{{ category.display_name }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Expandable Menu -->
    <transition name="slide-up">
      <div v-if="showMenu" class="mobile-menu-overlay" @click="closeMenu">
        <div class="mobile-menu" @click.stop>
          <div class="menu-header">
            <h3>Quick Actions</h3>
            <button @click="closeMenu" class="close-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="menu-grid">
            <router-link to="/shop" @click="closeMenu" class="menu-item">
              <div class="menu-icon">🛍️</div>
              <span>{{ $t('menu.browseProducts') }}</span>
            </router-link>

            <router-link to="/branches" @click="closeMenu" class="menu-item">
              <div class="menu-icon">🏪</div>
              <span>{{ $t('menu.storeLocations') }}</span>
            </router-link>

            <router-link to="/orders" @click="closeMenu" class="menu-item">
              <div class="menu-icon">📦</div>
              <span>{{ $t('menu.myOrders') }}</span>
            </router-link>

            <router-link to="/categories" @click="closeMenu" class="menu-item">
              <div class="menu-icon">📂</div>
              <span>{{ $t('menu.categories') }}</span>
            </router-link>

            <router-link to="/contact" @click="closeMenu" class="menu-item">
              <div class="menu-icon">📞</div>
              <span>{{ $t('menu.contactUs') }}</span>
            </router-link>

            <button @click="openAIChat" class="menu-item">
              <div class="menu-icon">🤖</div>
              <span>{{ $t('menu.aiAssistant') }}</span>
            </button>
          </div>

          <!-- Contact Info -->
          <div class="menu-contact">
            <a href="tel:+380973244668" class="contact-link">
              📞 +38 (097) 324 46 68
            </a>
            <a href="mailto:info@opillia.com.ua" class="contact-link">
              ✉️ info@opillia.com.ua
            </a>
          </div>
        </div>
      </div>
    </transition>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import type { Product } from '@/types'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// State
const showMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<Product[]>([])
const searchInput = ref<HTMLInputElement>()

// Computed
const cartCount = computed(() => cartStore.totalItems)

const popularCategories = computed(() => {
  return productStore.categories.slice(0, 6) // Show first 6 categories
})

// Methods
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

// Search methods
const openSearch = async () => {
  showSearch.value = true
  await nextTick()
  searchInput.value?.focus()
}

const closeSearch = () => {
  showSearch.value = false
  clearSearch()
}

const performSearch = () => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    searchResults.value = []
    return
  }

  // Search in products
  searchResults.value = productStore.products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query)
    const descriptionMatch = product.description?.toLowerCase().includes(query) || false
    const categoryMatch = product.category?.name.toLowerCase().includes(query) || false

    return nameMatch || descriptionMatch || categoryMatch
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const searchCategory = (categoryName: string) => {
  searchQuery.value = categoryName
  performSearch()
}

const goToProduct = (product: Product) => {
  closeSearch()
  router.push(`/product/${product.id}`)
}



const openAIChat = () => {
  closeMenu()
  // Trigger AI chat widget
  const chatEvent = new CustomEvent('open-ai-chat')
  window.dispatchEvent(chatEvent)
}



// Close menu when clicking outside or on route change
const handleRouteChange = () => {
  closeMenu()
}

// Listen for route changes
router.afterEach(handleRouteChange)
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.mobile-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.dark .mobile-nav-bar {
  background: rgba(31, 41, 55, 0.95);
  border-top: 1px solid #374151;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  min-width: 80px;
  flex: 1;
  position: relative;
}

.dark .nav-item {
  color: #9ca3af;
}

.nav-item:hover,
.nav-item.active,
.nav-item.router-link-active {
  color: var(--color-primary, #2563eb);
  transform: translateY(-2px);
}

.nav-icon {
  position: relative;
  margin-bottom: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
}



.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 60;
}

.mobile-menu {
  background: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

.mobile-search-modal {
  background: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.dark .mobile-search-modal {
  background: #1f2937;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .search-header h3 {
  color: #f9fafb;
}

.dark .search-header {
  border-bottom-color: #374151;
}

.search-content {
  flex: 1;
}

.search-results {
  margin-top: 1rem;
}

.popular-searches h4 {
  margin: 0;
  color: #111827;
}

.dark .popular-searches h4 {
  color: #f9fafb;
}

.dark .mobile-menu {
  background: #1f2937;
}

.menu-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.menu-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  text-decoration: none;
  color: #374151;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.menu-item:hover {
  background: var(--color-primary, #2563eb);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.menu-item span {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.menu-contact {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-link {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #374151;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.contact-link:hover {
  background: var(--color-primary, #2563eb);
  color: white;
}

/* Animations */
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s ease-in;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}

/* Safe area support for devices with notches */
.mobile-nav-bar {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}
</style>
