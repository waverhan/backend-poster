<template>
  <div>
    <!-- Mobile Bottom Navigation Bar - Native App Style -->
    <div class="mobile-bottom-nav">
      <!-- Main Navigation Bar -->
      <nav class="mobile-nav-bar">
        <!-- Shop Button -->
        <router-link to="/shop" class="nav-item" active-class="nav-item-active">
          <div class="nav-icon">
            <!-- Simple grid icon (4 squares) -->
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
          </div>
          <span class="nav-label">Товари</span>
        </router-link>

        <!-- Search Button -->
        <button @click.stop="openSearch" class="nav-item" :class="{ 'nav-item-active': showSearch }">
          <div class="nav-icon">
            <!-- Simple search icon -->
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <span class="nav-label">Пошук</span>
        </button>

        <!-- More Button (Account + Footer Info) -->
        <button @click="toggleMore" class="nav-item" :class="{ 'nav-item-active': showMore }">
          <div class="nav-icon">
            <div v-if="isAuthenticated" class="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
              {{ userInitials }}
            </div>
            <!-- Simple menu icon (3 horizontal lines) -->
            <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </div>
          <span class="nav-label">Більше</span>
        </button>

        <!-- Cart Button -->
        <router-link to="/cart" class="nav-item nav-item-cart" active-class="nav-item-active">
          <div class="nav-icon">
            <!-- Simple shopping cart icon -->
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </div>
          <span class="nav-label">Кошик</span>
        </router-link>
      </nav>
    </div>

    <!-- Search Modal -->
    <SearchModal v-model="showSearch" />

    <!-- More Menu (Account + Footer Info) - Positioned outside nav -->
    <transition name="slide-up">
      <div v-if="showMore" class="mobile-menu-overlay" @click="closeMore">
        <div class="mobile-menu" @click.stop>
          <div class="menu-header">
            <h3>{{ $t('nav.more', 'Більше') }}</h3>
            <button @click="closeMore" class="close-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <!-- Account Section -->
            <div v-if="isAuthenticated" class="space-y-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <!-- User Info -->
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ userName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ userPhone }}</p>
              </div>

              <!-- Profile Link -->
              <router-link to="/profile" @click="closeMore" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>{{ $t('menu.profile', 'Особистий кабінет') }}</span>
                </div>
              </router-link>

              <!-- Orders Link -->
              <router-link to="/orders" @click="closeMore" class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ $t('menu.myOrders', 'Мої замовлення') }}</span>
                </div>
              </router-link>

              <!-- Logout Button -->
              <button @click="handleLogout" class="w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left">
                <div class="flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>{{ $t('auth.logout', 'Вихід') }}</span>
                </div>
              </button>
            </div>

            <div v-else class="space-y-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <!-- Login Button -->
              <button @click="handleLogin" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {{ $t('auth.login', 'Вхід') }}
              </button>
            </div>

            <!-- Footer Links Section -->
            <div class="p-4 space-y-4">
              <!-- Company Info -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Компанія</h4>
                <div class="space-y-2">
                  <router-link to="/about" @click="closeMore" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Про нас
                  </router-link>
                  <router-link to="/branches" @click="closeMore" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Наші магазини
                  </router-link>
                  <router-link to="/contact" @click="closeMore" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Зв'язатися з нами
                  </router-link>
                  <a href="https://blog.opillia.com.ua" target="_blank" rel="noopener noreferrer" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    📝 Блог
                  </a>
                  <router-link to="/privacy-policy" @click="closeMore" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    🔒 Політика приватності
                  </router-link>
                </div>
              </div>

              <!-- Contact Info -->
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Контакти</h4>
                <div class="space-y-2">
                  <a href="tel:+380973244668" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    📞 +38 (097) 324 46 68
                  </a>
                  <a href="viber://chat?number=%2B380973244668" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                    💜 Viber
                  </a>
                  <a href="mailto:info@opillia.com.ua" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    ✉️ info@opillia.com.ua
                  </a>
                </div>
              </div>

              <!-- Working Hours -->
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">🕐 Графік роботи</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Щодня: 10:00 - 22:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Expandable Menu - Positioned outside nav -->
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

          <div class="flex-1 overflow-y-auto p-4">
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
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import SearchModal from '@/components/search/SearchModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// State
const showMenu = ref(false)
const showSearch = ref(false)
const showMore = ref(false)

// Computed
const cartCount = computed(() => cartStore.totalItems)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userName = computed(() => authStore.user?.name || '')
const userPhone = computed(() => authStore.formatPhoneNumber(authStore.user?.phone || ''))
const userInitials = computed(() => authStore.userInitials)

// Methods
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const toggleMore = () => {
  showMore.value = !showMore.value
}

const closeMore = () => {
  showMore.value = false
}

const handleLogin = () => {
  closeMore()
  // Emit event or navigate to login
  router.push('/login')
}

const handleLogout = async () => {
  closeMore()
  await authStore.logout()
}

// Search methods
const openSearch = () => {
  showSearch.value = true
}





// Close menu when clicking outside or on route change
const handleRouteChange = () => {
  closeMenu()
}

// Listen for route changes
router.afterEach(handleRouteChange)
</script>

<style scoped>
/* ============================================
   NATIVE APP BOTTOM NAVIGATION
   ============================================ */

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  /* Hardware acceleration for smooth performance */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.mobile-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.5rem 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  width: 100%;
  min-height: 64px;
  /* Safe area support for devices with home indicator */
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.dark .mobile-nav-bar {
  background: rgba(26, 26, 26, 0.98);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  color: #999999;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  min-width: 64px;
  flex: 1;
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.dark .nav-item {
  color: #666666;
}

/* Active State - Native App Style */
.nav-item.nav-item-active,
.nav-item.router-link-active {
  color: #3b82f6;
}

.nav-item.nav-item-active .nav-icon svg,
.nav-item.router-link-active .nav-icon svg {
  stroke-width: 2.5;
}

/* Hover/Press Effect */
.nav-item:active {
  transform: scale(0.92);
  opacity: 0.7;
}

.nav-icon {
  position: relative;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.nav-item.nav-item-active .nav-icon,
.nav-item.router-link-active .nav-icon {
  transform: translateY(-2px);
}

.nav-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
}



/* Cart Badge - Native iOS/Android Style */
.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #FF3B30 0%, #FF453A 100%);
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  z-index: 10;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
  line-height: 1;
}

.dark .cart-badge {
  border-color: rgba(26, 26, 26, 0.98);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 60;
  /* Ensure it's positioned relative to viewport, not parent */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.mobile-search-modal {
  background: white;
  border-radius: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  margin-top: 0;
}

.dark .mobile-search-modal {
  background: #1f2937;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dark .search-header {
  background: #1f2937;
  border-bottom-color: #374151;
}

.search-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.dark .close-btn {
  color: #9ca3af;
}

.dark .close-btn:hover {
  color: #f3f4f6;
}

.search-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-results {
  margin-top: 1rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.popular-searches {
  margin-top: 1rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.popular-searches h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.dark .popular-searches h4 {
  color: #f3f4f6;
}

.mobile-menu {
  background: white;
  border-radius: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-search-modal {
  background: white;
  border-radius: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.search-results {
  margin-top: 1rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
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
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.dark .menu-header {
  background: #1f2937;
  border-bottom-color: #374151;
}

.menu-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .menu-header h3 {
  color: #f9fafb;
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
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

/* Additional fixes for mobile scrolling issues */
@supports (-webkit-touch-callout: none) {
  .mobile-bottom-nav {
    /* iOS specific fixes */
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
}

/* Prevent body scroll affecting fixed elements */
body {
  -webkit-overflow-scrolling: touch;
}

/* Ensure proper stacking context */
.mobile-bottom-nav {
  /* Don't use isolation here as it creates a new stacking context
     that can interfere with fixed positioned modals */
}
</style>
