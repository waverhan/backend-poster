<template>
  <header class="sticky top-0 z-[60] bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Mobile Header -->
      <div class="md:hidden">
        <div class="flex justify-between items-center h-14 gap-2">
          <!-- Logo and Site Name -->
          <router-link to="/" class="flex items-center space-x-2 flex-shrink-0 min-w-0">
            <div class="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                v-if="siteConfig.logo_url && siteConfig.logo_url !== '/logo.png'"
                :src="siteConfig.logo_url"
                :alt="siteConfig.site_name"
                class="w-6 h-6 object-contain"
                @error="showFallbackLogo = true"
              />
              <span v-else class="text-white font-bold text-sm">🛒</span>
            </div>
            <div class="min-w-0 flex-1">
              <h1 class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ siteConfig.site_name }}</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ siteConfig.site_description }}</p>
            </div>
          </router-link>

          <!-- Mobile Right Actions -->
          <div class="flex items-center space-x-1 flex-shrink-0">
            <!-- Language Switcher -->
            <LanguageSwitcher />

            <!-- Theme Toggle -->
            <ThemeToggle v-if="siteConfigStore.currentConfig.enable_dark_mode" />

            <!-- User Account / Login (Mobile) -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center justify-center w-8 h-8 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <div v-if="authStore.isAuthenticated" class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {{ authStore.userInitials }}
                </div>
                <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              <!-- User Dropdown -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                @click.stop
              >
                <div v-if="authStore.isAuthenticated" class="py-2">
                  <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ authStore.user?.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatPhoneNumber(authStore.user?.phone || '') }}</p>
                    <div class="mt-2 flex items-center space-x-2 text-sm">
                      <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-orange-600 dark:text-orange-400 font-medium">{{ authStore.userBonusPoints }} балів</span>
                    </div>
                  </div>

                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span>Особистий кабінет</span>
                    </div>
                  </router-link>

                  <router-link
                    to="/orders"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <span>Мої замовлення</span>
                    </div>
                  </router-link>

                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span>Вийти</span>
                    </div>
                  </button>
                </div>

                <!-- Not Authenticated Menu -->
                <div v-else class="py-2">
                  <router-link
                    to="/login"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1m0-4V7a3 3 0 013-3h4a3 3 0 013 3v4"></path>
                      </svg>
                      <span>Вхід</span>
                    </div>
                  </router-link>
                  <router-link
                    to="/register"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="showUserMenu = false"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      <span>Реєстрація</span>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Header (multi-row) -->
      <div class="hidden md:flex justify-between items-center h-16 gap-4">
        <!-- Logo and Site Name -->
        <div class="flex items-center space-x-3 flex-shrink-0">
          <router-link to="/" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <img
                v-if="siteConfig.logo_url && siteConfig.logo_url !== '/logo.png'"
                :src="siteConfig.logo_url"
                :alt="siteConfig.site_name"
                class="w-6 h-6 object-contain"
                @error="showFallbackLogo = true"
              />
              <span v-else class="text-white font-bold text-sm">🛒</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ siteConfig.site_name }}</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ siteConfig.site_description }}</p>
            </div>
          </router-link>
        </div>

        <!-- Search Icon (Desktop) - Hidden on mobile -->
        <div class="hidden md:flex flex-1 max-w-md justify-center">
          <button
            @click="showSearchModal = true"
            class="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Пошук товарів"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="text-sm">Пошук</span>
          </button>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Contact Info -->
          <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <a
              href="tel:+380973244668"
              class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Зателефонувати нам"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 10.928c-.732.732-.732 1.919 0 2.651l4.261 4.261c.732.732 1.919.732 2.651 0l1.541-3.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+38 (097) 324 46 68</span>
            </a>
            <a
              href="mailto:info@opillia.com.ua"
              class="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title="Написати нам"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@opillia.com.ua</span>
            </a>
          </div>

          <!-- Theme Toggle -->
          <ThemeToggle v-if="siteConfigStore.currentConfig.enable_dark_mode" />

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- User Account / Login -->
          <div class="relative">
            <!-- Authenticated User -->
            <div v-if="authStore.isAuthenticated" class="flex items-center space-x-3">
              <!-- Bonus Points (Desktop) -->
              <div class="hidden lg:flex items-center space-x-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="font-medium">{{ authStore.userBonusPoints }}</span>
              </div>

              <!-- User Menu -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <div class="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {{ authStore.userInitials }}
                  </div>
                  <span class="hidden md:block">{{ authStore.user?.name }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- User Dropdown -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  @click.stop
                >
                  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ authStore.user?.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatPhoneNumber(authStore.user?.phone || '') }}</p>
                    <div class="mt-2 flex items-center space-x-2 text-sm">
                      <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-orange-600 dark:text-orange-400 font-medium">{{ authStore.userBonusPoints }} балів</span>
                    </div>
                  </div>

                  <div class="py-2">
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>Особистий кабінет</span>
                      </div>
                    </router-link>

                    <router-link
                      to="/orders"
                      class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      @click="showUserMenu = false"
                    >
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <span>Мої замовлення</span>
                      </div>
                    </router-link>

                    <button
                      @click="handleLogout"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        <span>Вийти</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login Button -->
            <button
              v-else
              @click="showLoginModal = true"
              class="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="hidden sm:block">Увійти</span>
            </button>
          </div>

          <!-- Cart Button - Hidden on mobile since it's in bottom nav -->
          <router-link
            to="/cart"
            class="relative btn-primary hidden sm:flex"
          >
            🛒 {{ $t('nav.cart') }}
            <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Search Modal (Desktop) -->
    <transition name="fade">
      <div v-if="showSearchModal" class="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-20" @click="showSearchModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4" @click.stop>
          <!-- Search Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">🔍 Пошук товарів</h2>
            <button @click="showSearchModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Content -->
          <div class="p-4">
            <!-- Search Input -->
            <div class="relative mb-4">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                @input="performSearch(searchQuery)"
                @keyup.enter="handleSearchEnter"
                type="text"
                placeholder="Введіть назву товару..."
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
            <div v-if="searchQuery.trim()" class="max-h-96 overflow-y-auto">
              <div v-if="searchResults.length > 0" class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Знайдено {{ searchResults.length }} товарів
              </div>
              <div v-if="searchResults.length === 0 && searchQuery.trim()" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">🔍</div>
                <div>Товарів не знайдено</div>
                <div class="text-sm">Спробуйте інший запит</div>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="product in searchResults.slice(0, 20)"
                  :key="product.id"
                  @click="goToProduct(product)"
                  class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <img
                    :src="getProductImageUrl(product)"
                    :alt="product.name"
                    class="w-12 h-12 object-cover rounded-lg"
                    @error="(e) => { e.target.src = '/images/placeholder.jpg' }"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 dark:text-white truncate">{{ product.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ product.price }}₴</div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Login Modal -->
    <PhoneLoginModal
      v-if="showLoginModal"
      @close="showLoginModal = false"
      @success="onLoginSuccess"
      @requires-profile-completion="onProfileCompletionRequired"
    />

    <!-- Password Setup Modal -->
    <PasswordSetupModal
      v-if="showPasswordSetup"
      @close="showPasswordSetup = false"
      @skip="showPasswordSetup = false"
      @success="onPasswordSetupSuccess"
    />

    <!-- Profile Completion Modal -->
    <ProfileCompletionModal
      v-if="showProfileCompletion"
      :user="pendingUser"
      @success="onProfileCompletionSuccess"
    />
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import { backendApi } from '@/services/backendApi'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import PhoneLoginModal from '@/components/auth/PhoneLoginModal.vue'
import PasswordSetupModal from '@/components/auth/PasswordSetupModal.vue'
import ProfileCompletionModal from '@/components/auth/ProfileCompletionModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const siteConfigStore = useSiteConfigStore()
const authStore = useAuthStore()
const productStore = useProductStore()

const cartCount = computed(() => cartStore.totalItems || 0)
const siteConfig = computed(() => siteConfigStore.currentConfig)
const showFallbackLogo = ref(false)
const showLoginModal = ref(false)
const showPasswordSetup = ref(false)
const showProfileCompletion = ref(false)
const showUserMenu = ref(false)
const pendingUser = ref(null)

// Search state
const searchQuery = ref('')
const showSearchModal = ref(false)
const searchResults = ref<any[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)

// Methods
const formatPhoneNumber = (phone: string) => {
  return authStore.formatPhoneNumber(phone)
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

const onLoginSuccess = (user: any, requiresPasswordSetup?: boolean) => {
  console.log('Login successful:', user)
  showLoginModal.value = false

  if (requiresPasswordSetup) {
    showPasswordSetup.value = true
  }
}

const onPasswordSetupSuccess = () => {
  showPasswordSetup.value = false
  console.log('Password setup completed')
}

const onProfileCompletionRequired = (user: any) => {
  console.log('Profile completion required for user:', user)
  pendingUser.value = user
  showProfileCompletion.value = true
}

const onProfileCompletionSuccess = () => {
  showProfileCompletion.value = false
  pendingUser.value = null
  console.log('Profile completion successful')
}

// Search functionality
const performSearch = (query: string) => {
  const trimmedQuery = query.trim().toLowerCase()

  if (!trimmedQuery) {
    searchResults.value = []
    return
  }

  // Search in products, excluding out-of-stock products
  searchResults.value = productStore.products.filter(product => {
    // First check if it matches search criteria
    const nameMatch = product.name.toLowerCase().includes(trimmedQuery)
    const descriptionMatch = product.description?.toLowerCase().includes(trimmedQuery) || false
    const categoryMatch = product.category?.name.toLowerCase().includes(trimmedQuery) || false

    const matchesSearch = nameMatch || descriptionMatch || categoryMatch

    if (!matchesSearch) {
      return false
    }

    // Then check if product is in stock (allow products without stock_quantity field)
    const isInStock = product.stock_quantity === undefined || product.stock_quantity === null || product.stock_quantity > 0

    return isInStock
  })
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const handleSearchEnter = () => {
  if (searchQuery.value.trim()) {
    showSearchModal.value = false
    router.push({
      name: 'shop',
      query: { search: searchQuery.value.trim().toLowerCase() }
    })
  }
}

const goToProduct = (product: any) => {
  showSearchModal.value = false
  router.push(`/product/${product.slug || product.id}`)
}

const getProductImageUrl = (product: any): string => {
  const primaryImage = product.display_image_url || product.image_url
  if (!primaryImage) {
    return '/images/placeholder.jpg'
  }
  // Use the backend API to get the full image URL
  // API returns /api/upload/minio-image/... which gets prepended with backend URL
  return backendApi.getImageUrl(primaryImage)
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Focus search input when modal opens
watch(() => showSearchModal.value, async (newVal) => {
  if (newVal) {
    await nextTick()
    searchInputRef.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
