<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Promotion Popup Slider -->
    <div ref="promotionObserverRef">
      <PromotionPopupSlider v-if="showPromotionSlider" />
    </div>

    <!-- Cart Animation Overlay -->
    <CartAnimationOverlay
      v-if="showCartOverlay"
      ref="cartAnimationOverlay"
    />

    <!-- Banner Slider -->
    <div v-if="hasBanners" ref="bannerObserverRef">
      <BannerSlider v-if="showBannerSlider" />
    </div>

    <!-- Fallback Hero Banner Section (shown when no banners and setting is enabled) -->
    <section v-if="!hasBanners && showFallbackBanner" class="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <!-- Welcome Banner -->
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl mx-auto">
            <div class="text-center">
              <div class="text-6xl mb-4">🍺</div>
              <h2 class="text-2xl font-bold mb-2">Ласкаво просимо до Опілля!</h2>
              <p class="text-primary-100 mb-6">Найкращі напої та делікатеси з доставкою додому або самовивозом</p>

              <!-- Features -->
              <div class="flex justify-center space-x-6 text-sm text-primary-200">
                <div class="flex items-center">
                  <span class="mr-1">✅</span>
                  <span>Актуальні залишки</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-1">⚡</span>
                  <span>Швидка доставка</span>
                </div>
                <div class="flex items-center">
                  <span class="mr-1">💰</span>
                  <span>Найкращі ціни</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Heading - Desktop Only -->
      <header class="mb-8 hidden md:block">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          {{ pageHeading }}
        </h1>
        <p v-if="pageSubheading" class="mt-2 text-base text-gray-600 dark:text-gray-300">
          {{ pageSubheading }}
        </p>
      </header>

      <!-- Address Input for Delivery -->
      <section v-if="deliveryMethod === 'delivery' && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🚚 Delivery Address</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Enter your delivery address:
              </label>
              <div class="flex space-x-3">
                <input
                  v-model="deliveryAddress"
                  type="text"
                  placeholder="Type your address or get current location..."
                  class="flex-1 input"
                />
                <button
                  @click="getCurrentLocation"
                  :disabled="loading.location"
                  class="btn-outline flex items-center space-x-2"
                >
                  <span>📍</span>
                  <span>{{ loading.location ? 'Getting...' : 'Get Current Location' }}</span>
                </button>
              </div>
              <p v-if="currentLocationAddress" class="text-sm text-success-600 mt-2">
                📍 Current location: {{ currentLocationAddress }}
              </p>
            </div>
            <button
              @click="findNearestBranch"
              :disabled="!deliveryAddress || loading.branches"
              class="btn-primary w-full"
            >
              {{ loading.branches ? 'Finding nearest branch...' : 'Find nearest branch' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Pickup Branch Selection -->
      <section v-if="deliveryMethod === 'pickup' && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🏪 Choose Pickup Branch</h2>

          <div v-if="!branchesLoaded" class="text-center py-8">
            <button
              @click="loadBranches()"
              :disabled="loading.branches"
              class="btn-primary"
            >
              {{ loading.branches ? 'Loading branches...' : 'Show pickup locations' }}
            </button>
          </div>

          <div v-else-if="loading.branches" class="text-center py-12">
            <div class="spinner w-8 h-8 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading branches...</p>
          </div>

          <div v-else-if="availableBranches.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">🏪</div>
            <p class="text-gray-500">No pickup locations available</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranch(branch)"
              class="card-hover p-4 cursor-pointer"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg">{{ branch.name }}</h3>
                <span v-if="selectedBranch?.id === branch.id" class="text-primary-500 text-xl">✅</span>
              </div>

              <p class="text-gray-600 text-sm mb-3">{{ branch.address || 'Address not available' }}</p>

              <div class="space-y-1 text-sm">
                <div class="text-success-600 font-medium">
                  ✅ Free pickup available
                </div>
                <div class="text-gray-500">
                  📍 Click to select this location
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Delivery Branch Results -->
      <section v-if="deliveryMethod === 'delivery' && availableBranches.length > 0 && !selectedBranch" class="mb-8">
        <div class="card p-6">
          <h2 class="text-2xl font-bold mb-6">🚚 Nearest Branch for Delivery</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranch(branch)"
              class="card-hover p-4 cursor-pointer"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg">{{ branch.name }}</h3>
                <span v-if="selectedBranch?.id === branch.id" class="text-primary-500 text-xl">✅</span>
              </div>

              <p class="text-gray-600 text-sm mb-3">{{ branch.address || 'Address not available' }}</p>

              <div class="space-y-1 text-sm">
                <div v-if="branch.distance_km" class="flex justify-between">
                  <span class="text-gray-500">Distance:</span>
                  <span class="font-medium">{{ branch.distance_km.toFixed(1) }} km</span>
                </div>
                <div v-if="branch.delivery_fee" class="flex justify-between">
                  <span class="text-gray-500">Delivery fee:</span>
                  <span class="font-bold text-primary-600">{{ branch.delivery_fee }} UAH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Initial Loading Screen -->
      <section v-if="loading.initial" class="px-4 py-8">
        <CategorySkeleton :count="4" />
        <CategorySkeleton :count="4" />
        <CategorySkeleton :count="4" />
      </section>

      <!-- Selected Branch & Products -->
      <section v-else-if="selectedBranch">

        <!-- Categories Container - Sticky below header (Desktop Only) -->
        <div class="hidden md:block sticky z-[50] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md w-full" style="top: 64px;">
          <!-- Loading State - Just animation -->
          <div v-if="loading.categories" class="px-4 py-3 flex justify-center">
            <div class="spinner w-5 h-5"></div>
          </div>

          <!-- No Categories State (only show after waiting for retries) -->
          <div v-else-if="categoriesWithProducts.length === 0 && showCategoryError" class="px-4 py-3">
            <ErrorState
              icon="📦"
              title="Категорії не завантажилися"
              message="Перевірте з'єднання з інтернетом та спробуйте ще раз"
              @retry="handleRetryCategories"
            />
          </div>

          <!-- Categories List - Desktop Only -->
          <div v-else class="px-4 sm:px-6 py-3">
            <div class="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
              <!-- Desktop: Daily Deals Tab -->
              <button
                v-if="productsOnSale.length > 0"
                type="button"
                @click="selectDealsCategory()"
                :aria-pressed="selectedCategory?.id === 'deals'"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
                  selectedCategory?.id === 'deals'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                ]"
              >
                <span>🔥 {{ $t('deals.title') }}</span>
                <span class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full text-xs">{{ productsOnSale.length }}</span>
              </button>

              <button
                v-for="category in categoriesWithProducts"
                :key="category.id"
                type="button"
                @click="selectCategory(category)"
                :aria-pressed="selectedCategory?.id === category.id"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                  selectedCategory?.id === category.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                {{ category.display_name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Discount Banners -->
        <div v-if="activeDiscountBanners.length > 0" class="mt-6 space-y-3">
          <div v-for="banner in activeDiscountBanners" :key="banner.id" class="card p-4 bg-gradient-to-r" :class="banner.bgClass">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ banner.icon }}</span>
                <div>
                  <h3 class="font-bold text-lg" :class="banner.textClass">{{ banner.title }}</h3>
                  <p class="text-sm" :class="banner.descClass">{{ banner.description }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold" :class="banner.valueClass">{{ banner.value }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: Sticky Category Navigation (Links to section headers) -->
        <div class="md:hidden sticky z-[40] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm" style="top: 64px;">
          <!-- Loading State -->
          <div v-if="loading.categories" class="px-4 py-3 flex justify-center">
            <div class="spinner w-5 h-5"></div>
          </div>

          <!-- Categories List - Mobile -->
          <div v-else-if="categoriesWithProducts.length > 0" class="px-4 py-3 overflow-x-auto scrollbar-hide">
            <div class="flex gap-2 whitespace-nowrap">
              <!-- Mobile: Daily Deals Tab -->
              <button
                v-if="productsOnSale.length > 0"
                type="button"
                @click="scrollToDealsSection()"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0',
                  'bg-red-100 text-red-700 hover:bg-red-200'
                ]"
              >
                <span>🔥 {{ $t('deals.title') }}</span>
              </button>

              <!-- Mobile: Category Buttons -->
              <button
                v-for="category in categoriesWithProducts"
                :key="category.id"
                type="button"
                @click="scrollToCategorySection(category.id)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0',
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                {{ category.display_name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile: Vertical Category Sections (Native App Style) -->
        <div class="md:hidden mt-4 space-y-6">
          <!-- Loading State -->
          <div v-if="loading.products" class="space-y-6">
            <CategorySkeleton :count="4" />
            <CategorySkeleton :count="4" />
            <CategorySkeleton :count="4" />
          </div>

          <!-- Deals Section (if products on sale) -->
          <div v-else-if="productsOnSale.length > 0" class="space-y-3" id="deals-section">
            <div class="flex items-center justify-between px-1">
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>🔥</span>
                <span>{{ $t('deals.title') }}</span>
              </h2>
              <span class="text-sm text-gray-500">{{ productsOnSale.length }} товарів</span>
            </div>
            <!-- Horizontal Scroll Container (RelatedProducts Style) -->
            <div class="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div class="flex gap-4 pb-2">
                <div
                  v-for="product in productsOnSale"
                  :key="product.id"
                  class="group cursor-pointer flex-shrink-0 w-[160px]"
                  @click="navigateToProduct(product)"
                >
                  <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <!-- Product Image -->
                    <div class="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        v-if="getProductImageUrl(product)"
                        :src="getProductImageUrl(product)"
                        :alt="product.display_name || product.name"
                        class="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                        loading="lazy"
                        @error="handleProductImageError"
                      />
                      <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                        <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Product Info -->
                    <div class="p-4">
                      <h4 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {{ product.display_name || product.name }}
                      </h4>

                      <!-- Price and Cart Icon -->
                      <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                          <div class="flex items-center space-x-2">
                            <span v-if="product.original_price && product.original_price > product.price"
                                  class="text-xs text-gray-500 line-through">
                              {{ formatProductPrice(product.original_price, product) }}₴
                            </span>
                            <span class="text-sm font-bold text-primary-600">
                              {{ formatProductPrice(product.price, product) }}₴
                            </span>
                          </div>
                          <span class="text-xs text-gray-500 mt-0.5">
                            за {{ getProductUnitLabel(product.unit, product) }}
                          </span>
                        </div>

                        <!-- Cart Icon Button -->
                        <button
                          @click.stop="handleQuickAddToCart(product, $event)"
                          :disabled="!isProductAvailableInBranch(product)"
                          class="w-8 h-8 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                          :title="isProductAvailableInBranch(product) ? 'Додати до кошика' : 'Немає в наявності'"
                        >
                          <svg v-if="isProductAvailableInBranch(product)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"/>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

          <!-- Category Sections -->
          <div
            v-for="category in categoriesWithProducts"
            :key="category.id"
            class="space-y-3"
            :id="`category-section-${category.id}`"
          >
            <!-- Category Header -->
            <div class="flex items-center justify-between px-1">
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                {{ category.display_name }}
              </h2>
              <span class="text-sm text-gray-500">{{ getCategoryProductCount(category.id) }} товарів</span>
            </div>
            <!-- Horizontal Scroll Container (RelatedProducts Style) -->
            <div class="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div class="flex gap-4 pb-2">
                <div
                  v-for="product in getCategoryProducts(category.id)"
                  :key="product.id"
                  class="group cursor-pointer flex-shrink-0 w-[160px]"
                  @click="navigateToProduct(product)"
                >
                  <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <!-- Product Image -->
                    <div class="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        v-if="getProductImageUrl(product)"
                        :src="getProductImageUrl(product)"
                        :alt="product.display_name || product.name"
                        class="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                        loading="lazy"
                        @error="handleProductImageError"
                      />
                      <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                        <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Product Info -->
                    <div class="p-4">
                      <h4 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                        {{ product.display_name || product.name }}
                      </h4>

                      <!-- Price and Cart Icon -->
                      <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                          <div class="flex items-center space-x-2">
                            <span v-if="product.original_price && product.original_price > product.price"
                                  class="text-xs text-gray-500 line-through">
                              {{ formatProductPrice(product.original_price, product) }}₴
                            </span>
                            <span class="text-sm font-bold text-primary-600">
                              {{ formatProductPrice(product.price, product) }}₴
                            </span>
                          </div>
                          <span class="text-xs text-gray-500 mt-0.5">
                            за {{ getProductUnitLabel(product.unit, product) }}
                          </span>
                        </div>

                        <!-- Cart Icon Button -->
                        <button
                          @click.stop="handleQuickAddToCart(product, $event)"
                          :disabled="!isProductAvailableInBranch(product)"
                          class="w-8 h-8 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
                          :title="isProductAvailableInBranch(product) ? 'Додати до кошика' : 'Немає в наявності'"
                        >
                          <svg v-if="isProductAvailableInBranch(product)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"/>
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading.products && categoriesWithProducts.length === 0 && productsOnSale.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📦</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Товари відсутні</h3>
            <p class="text-gray-600 mb-4">Товари наразі відсутні в цьому магазині.</p>
          </div>
        </div>

        <!-- Desktop: Single Category View (Original) -->
        <div class="hidden md:block card p-6 mt-6">
          <div class="mb-6">
            <h2 class="text-2xl font-bold">🛍️ Товари</h2>
          </div>

          <div v-if="loading.products" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ProductCardSkeleton v-for="i in 8" :key="i" />
          </div>

          <div v-else-if="displayedProducts.length === 0" class="text-center py-12">
            <div class="text-4xl mb-4">📦</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              {{ selectedCategory?.id === 'deals' ? 'Акції відсутні' : 'Товари відсутні' }}
            </h3>
            <p class="text-gray-600 mb-4">
              {{ selectedCategory?.id === 'deals'
                ? 'Наразі немає товарів зі знижками.'
                : selectedCategory
                  ? `Товари з категорії "${selectedCategory.display_name}" наразі відсутні на складі цього магазину.`
                  : 'Товари наразі відсутні в цьому магазині.'
              }}
            </p>
            <div v-if="selectedCategory?.id !== 'deals'" class="space-y-2 text-sm text-gray-500">
              <p>• Товари відображаються на основі актуальних залишків</p>
              <p>• Спробуйте обрати іншу категорію або магазин</p>
              <p>• Залишки оновлюються з системи Poster POS</p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ProductCard
              v-for="(product, index) in displayedProducts"
              :key="product.id"
              :product="product"
              :priority="index < 4"
              @add-to-cart="addToCart"
              @add-bottle-to-cart="addBottleToCart"
              @cart-animation="handleCartAnimation"
            />
          </div>

          <!-- Desktop Only: Category SEO Description -->
          <div
            v-if="selectedCategory && selectedCategory.seo_content && selectedCategory.id !== 'deals'"
            class="hidden md:block mt-8 bg-white p-8 rounded-lg shadow-sm"
          >
            <div
              class="category-description relative"
              :class="{ 'max-h-48 overflow-hidden': !isCategoryDescExpanded }"
            >
              <div v-html="selectedCategory.seo_content"></div>
              <div
                v-if="!isCategoryDescExpanded && shouldShowExpandButton"
                class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"
              ></div>
            </div>
            <button
              v-if="shouldShowExpandButton"
              @click="isCategoryDescExpanded = !isCategoryDescExpanded"
              class="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              <span>{{ isCategoryDescExpanded ? 'Згорнути' : 'Показати більше' }}</span>
              <span class="text-xs">{{ isCategoryDescExpanded ? '▲' : '▼' }}</span>
            </button>
          </div>
        </div>

      </section>

      <!-- No Branch Selected Fallback -->
      <section v-else class="text-center py-20">
        <div class="text-6xl mb-4">🏪</div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Оберіть філію</h2>
        <p class="text-gray-500 mb-6">Будь ласка, оберіть спосіб отримання та філію для перегляду товарів</p>
        <button
          @click="deliveryMethod = 'pickup'"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Обрати філію
        </button>
      </section>
    </div>

    <!-- Delivery Method Modal -->
    <div v-if="showDeliveryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">Choose Delivery Method</h3>
            <button
              @click="closeDeliveryModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <DeliveryMethodSelector
            :show-back-button="false"
            context="modal"
            @method-selected="handleDeliveryMethodSelected"
          />
        </div>
      </div>
    </div>

    <!-- Pickup Modal -->
    <div v-if="showPickupModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">🏪 Choose Pickup Location</h2>
            <button
              @click="closePickupModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="!branchesLoaded" class="text-center py-8">
            <button
              @click="loadBranches()"
              :disabled="loading.branches"
              class="btn-primary"
            >
              {{ loading.branches ? 'Loading branches...' : 'Show pickup locations' }}
            </button>
          </div>

          <div v-else-if="loading.branches" class="text-center py-8">
            <div class="spinner w-6 h-6 mx-auto mb-2"></div>
            <p class="text-gray-600">Loading branches...</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="branch in availableBranches"
              :key="branch.id"
              @click="selectBranchFromModal(branch)"
              class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 class="font-medium text-gray-900 text-sm">{{ branch.display_name || branch.name }}</h3>
              <p class="text-xs text-gray-600 mt-1">{{ branch.address || 'Address not available' }}</p>
              <div class="text-xs text-success-600 mt-1">
                ✅ Free pickup
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-green-50 border-t border-gray-200">
          <div class="text-center">
            <h3 class="font-medium text-green-900 mb-2 text-sm">Pickup Benefits:</h3>
            <div class="text-xs text-green-700 space-y-1">
              <div>• FREE - No delivery charges</div>
              <div>• Choose your preferred time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useIntersectionObserver } from '@vueuse/core'

// Stores
import { useCartStore } from '@/stores/cart'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useProductStore } from '@/stores/product'
import { useNotificationStore } from '@/stores/notification'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useBannerStore } from '@/stores/banners'
import { useLoadingStore } from '@/stores/loading'
import { useDiscountStore } from '@/stores/discount'

// Services
import { capacitorService } from '@/services/capacitor'
import googleAnalytics from '@/services/googleAnalytics'
import { backendApi } from '@/services/backendApi'

// Utils
import { testPosterApi } from '@/utils/testApi'
import {
  isDraftBeverage,
  isBottledProduct,
  getDefaultBottleSelection,
  calculateBottleCost
} from '@/utils/bottleUtils'
import { updateSeoMeta, appendStructuredData, removeStructuredData, absoluteUrl } from '@/utils/seoUtils'

// Components
import ProductCard from '@/components/product/ProductCard.vue'
import AddressAutocomplete from '@/components/AddressAutocomplete.vue'
import DeliveryMethodSelector from '@/components/delivery/DeliveryMethodSelector.vue'

import CategorySkeleton from '@/components/ui/CategorySkeleton.vue'
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

// Types
import type { Branch, Category, Product, FulfillmentType, LocationData } from '@/types'
import type { AddressSuggestion } from '@/services/addressAutocomplete'

const BannerSlider = defineAsyncComponent(() => import('@/components/BannerSlider.vue'))
const PromotionPopupSlider = defineAsyncComponent(() => import('@/components/PromotionPopupSlider.vue'))
const CartAnimationOverlay = defineAsyncComponent(() => import('@/components/CartAnimationOverlay.vue'))

interface CartAnimationOverlayExposed {
  addAnimation: (startX: number, startY: number, endX: number, endY: number) => void
}

const router = useRouter()
const route = useRoute()

// Translation
const { t } = useI18n()

// Stores
const cartStore = useCartStore()
const locationStore = useLocationStore()
const branchStore = useBranchStore()
const productStore = useProductStore()
const notificationStore = useNotificationStore()
const siteConfigStore = useSiteConfigStore()
const bannerStore = useBannerStore()
const loadingStore = useLoadingStore()

// Reactive refs from stores
const { userLocation, locationError } = storeToRefs(locationStore)
const { branches, selectedBranch } = storeToRefs(branchStore)
const { categories, products, selectedCategory, categoriesWithProducts, productsByCategory, productsOnSale } = storeToRefs(productStore)

// Local state
const loading = ref({
  branches: false,
  categories: false,
  products: false,
  location: false,
  initial: true // Add initial loading state
})

const deliveryMethod = ref<FulfillmentType>('pickup') // Default to pickup
const deliveryAddress = ref('')
const currentLocationAddress = ref('')
const availableBranches = ref<Branch[]>([])
const branchesLoaded = ref(false)
const showCategoryError = ref(false) // Show error only after waiting for retries

// Modal state
const showDeliveryModal = ref(false)
const showPickupModal = ref(false)

// Cart animation overlay ref
const cartAnimationOverlay = ref<CartAnimationOverlayExposed | null>(null)

// Search state
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchResults = ref<Product[]>([])

// Category description expand/collapse state
const isCategoryDescExpanded = ref(false)
const shouldShowExpandButton = computed(() => {
  if (!selectedCategory.value?.seo_content) return false
  // Show expand button if content is longer than ~300 characters
  const textContent = selectedCategory.value.seo_content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > 300
})

// Deferred UI state
const showPromotionSlider = ref(false)
const showBannerSlider = ref(false)
const showCartOverlay = ref(false)
const promotionObserverRef = ref<HTMLElement | null>(null)
const bannerObserverRef = ref<HTMLElement | null>(null)

if (typeof window !== 'undefined') {
  if ('IntersectionObserver' in window) {
    const { stop: stopPromotionObserver } = useIntersectionObserver(
      promotionObserverRef,
      ([entry]) => {
        if (entry?.isIntersecting) {
          showPromotionSlider.value = true
          stopPromotionObserver()
        }
      },
      {
        rootMargin: '160px 0px 0px 0px'
      }
    )

    const { stop: stopBannerObserver } = useIntersectionObserver(
      bannerObserverRef,
      ([entry]) => {
        if (entry?.isIntersecting) {
          showBannerSlider.value = true
          stopBannerObserver()
        }
      },
      {
        rootMargin: '160px 0px 0px 0px'
      }
    )
  } else {
    showPromotionSlider.value = true
    showBannerSlider.value = true
  }

  const scheduleCartOverlayMount = () => {
    if (showCartOverlay.value) return
    const idle = (window as any).requestIdleCallback
    if (typeof idle === 'function') {
      idle(() => {
        showCartOverlay.value = true
      }, { timeout: 2000 })
    } else {
      window.setTimeout(() => {
        showCartOverlay.value = true
      }, 1200)
    }
  }

  scheduleCartOverlayMount()
} else {
  showPromotionSlider.value = true
  showBannerSlider.value = true
  showCartOverlay.value = true
}

const waitForCartOverlay = () => {
  if (cartAnimationOverlay.value) {
    return Promise.resolve()
  }

  showCartOverlay.value = true

  return new Promise<void>((resolve) => {
    const stop = watch(
      cartAnimationOverlay,
      (instance) => {
        if (instance) {
          stop()
          resolve()
        }
      },
      { immediate: true }
    )
  })
}

// Computed
const cartCount = computed(() => cartStore.totalItems)

const totalProductsCount = computed(() => products.value.length)

const hasBanners = computed(() => bannerStore.banners.length > 0)

const showFallbackBanner = computed(() => siteConfigStore.currentConfig.show_fallback_banner === true)

const getCategoryProductCount = (categoryId: string) => {
  // Use the same filter as getCategoryProducts to show accurate count
  return getCategoryProducts(categoryId).length
}

const slugify = (value: string) => {
  if (!value) return ''
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Computed property for displayed products (either by category, deals, or search)
const displayedProducts = computed(() => {
  if (showSearchResults.value && searchQuery.value.trim()) {
    return searchResults.value
  }
  if (selectedCategory.value?.id === 'deals') {
    return productsOnSale.value
  }
  return productsByCategory.value
})

const topDisplayedProduct = computed(() => displayedProducts.value[0])

// Helper method for vertical category sections (mobile native app style)
// Filter to show only in-stock products
const getCategoryProducts = (categoryId) => {
  if (!products.value) return []
  return products.value.filter(product => {
    // Must match category
    if (product.category_id !== categoryId) return false

    // Must be active
    if (!product.is_active) return false

    // Check availability - be more lenient
    // If quantity is explicitly 0, hide it
    if (product.quantity !== undefined && product.quantity === 0) {
      return false
    }

    // Otherwise, if product is marked as available, show it
    return product.available !== false
  })
}

const lcpProductImagePath = computed(() => {
  const topProduct = topDisplayedProduct.value
  if (!topProduct) return ''
  return topProduct.display_image_url || topProduct.image_url || ''
})

const hasActiveSearch = computed(() => showSearchResults.value && !!searchQuery.value.trim())

const normalizedCategorySlug = computed(() => {
  if (!selectedCategory.value || selectedCategory.value.id === 'deals') return null
  return selectedCategory.value.slug || slugify(selectedCategory.value.display_name)
})

const shopCanonicalPath = computed(() => {
  if (hasActiveSearch.value) {
    return '/shop'
  }
  if (!selectedCategory.value) {
    return '/shop'
  }
  if (selectedCategory.value.id === 'deals') {
    return '/shop?category=deals'
  }
  if (normalizedCategorySlug.value) {
    return `/shop?category=${normalizedCategorySlug.value}`
  }
  return '/shop'
})

// Default branch ID for inventory - always use this for product loading
const defaultBranchId = computed(() => {
  // Use configured default branch, or fall back to selectedBranch, or first available branch
  return siteConfigStore.currentConfig.default_shop_branch_id
    || selectedBranch.value?.id
    || branches.value[0]?.id
})

const pageHeading = computed(() => {
  if (hasActiveSearch.value) {
    return `Пошук: "${searchQuery.value.trim()}"`
  }
  if (selectedCategory.value?.id === 'deals') {
    return 'Акції та знижки'
  }
  if (selectedCategory.value) {
    return selectedCategory.value.display_name
  }
  return 'Магазин Опілля'
})

const pageSubheading = computed(() => {
  if (hasActiveSearch.value) {
    return `Знайдено ${displayedProducts.value.length} товарів у каталозі`
  }
  if (selectedBranch.value) {
    const branchLabel = selectedBranch.value.display_name || selectedBranch.value.name
    return ``
  }
  return 'Оберіть спосіб отримання, щоб бачити актуальні залишки та ціни'
})

const activeCategoryForSeo = computed(() => {
  if (!selectedCategory.value || selectedCategory.value.id === 'deals') return null
  return selectedCategory.value
})

const categorySeoContent = computed(() => {
  if (hasActiveSearch.value) return ''
  // Use seo_content if available, otherwise fallback to description
  return activeCategoryForSeo.value?.seo_content || activeCategoryForSeo.value?.description || ''
})

// Discount banners for homepage
const activeDiscountBanners = computed(() => {
  const banners: any[] = []

  // Get discount store
  const discountStore = useDiscountStore()

  // First Order Discount
  const firstOrderDiscount = discountStore.discounts.find(d => d.type === 'first_order' && d.enabled)
  if (firstOrderDiscount) {
    banners.push({
      id: 'first_order',
      icon: '🎁',
      title: 'Знижка для нових клієнтів',
      description: 'Отримайте знижку на перше замовлення',
      value: `${firstOrderDiscount.discount_value}%`,
      bgClass: 'from-blue-50 to-blue-100',
      textClass: 'text-blue-900',
      descClass: 'text-blue-700',
      valueClass: 'text-blue-600'
    })
  }

  // Happy Hours Discount
  const happyHoursDiscount = discountStore.discounts.find(d => d.type === 'happy_hours' && d.enabled)
  if (happyHoursDiscount) {
    banners.push({
      id: 'happy_hours',
      icon: '⏰',
      title: 'Щасливі години',
      description: 'Пн-Чт з 10:00 до 17:00',
      value: `${happyHoursDiscount.discount_value}%`,
      bgClass: 'from-purple-50 to-purple-100',
      textClass: 'text-purple-900',
      descClass: 'text-purple-700',
      valueClass: 'text-purple-600'
    })
  }

  // Free Delivery Discount
  const freeDeliveryDiscount = discountStore.discounts.find(d => d.type === 'free_delivery' && d.enabled)
  if (freeDeliveryDiscount) {
    const minAmount = freeDeliveryDiscount.min_order_amount || 1500
    banners.push({
      id: 'free_delivery',
      icon: '🚚',
      title: 'Безплатна доставка',
      description: `При замовленні від ${minAmount} ₴`,
      value: 'БЕЗПЛАТНО',
      bgClass: 'from-green-50 to-green-100',
      textClass: 'text-green-900',
      descClass: 'text-green-700',
      valueClass: 'text-green-600'
    })
  }

  return banners
})

// Search functionality
const performSearch = (query: string) => {
  const trimmedQuery = query.trim().toLowerCase()

  if (!trimmedQuery) {
    clearSearch()
    return
  }

  // Search in product names and descriptions, excluding out-of-stock products
  const results = products.value.filter(product => {
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

  searchResults.value = results
  showSearchResults.value = true

  // Track search in Google Analytics
  if (googleAnalytics) {
    googleAnalytics.trackSearch(trimmedQuery, results.length)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

const SHOP_ITEM_LIST_ID = 'shop-item-list'
const SHOP_LCP_PRELOAD_ATTR = 'data-shop-lcp-preload'

const buildItemListSchema = () => {
  const items = displayedProducts.value.slice(0, 12).map((product, index) => {
    const productSlugOrId = product.slug || product.id
    const imagePath = product.display_image_url || product.image_url
    const imageUrl = imagePath ? backendApi.getImageUrl(imagePath) : undefined
    const productUrl = absoluteUrl(`/product/${productSlugOrId}`)

    return {
      '@type': 'ListItem',
      position: index + 1,
      name: product.display_name || product.name,
      url: productUrl,
      item: {
        '@type': 'Product',
        name: product.display_name || product.name,
        image: imageUrl,
        sku: product.poster_product_id || product.id,
        offers: {
          '@type': 'Offer',
          price: product.price?.toString() || '0',
          priceCurrency: 'UAH',
          availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: productUrl
        }
      }
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${selectedCategory.value?.name || 'Каталог'} | ${siteConfigStore.currentConfig.site_name}`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: displayedProducts.value.length,
    itemListElement: items
  }
}

const updateShopSeoMetadata = () => {
  const cfg = siteConfigStore.currentConfig
  const categoryLabel = hasActiveSearch.value
    ? `Результати пошуку "${searchQuery.value.trim()}"`
    : selectedCategory.value?.display_name || 'Каталог'
  const branchLabel = selectedBranch.value?.display_name || selectedBranch.value?.name

  const descriptionSegments: string[] = []

  if (hasActiveSearch.value) {
    descriptionSegments.push(`Пошук "${searchQuery.value.trim()}" у каталозі ${cfg.site_name}.`)
    descriptionSegments.push(`Знайдено ${displayedProducts.value.length} товарів, доступних для доставки чи самовивозу у Києві.`)
  } else if (activeCategoryForSeo.value) {
    if (activeCategoryForSeo.value.seo_meta_description) {
      descriptionSegments.push(activeCategoryForSeo.value.seo_meta_description)
      descriptionSegments.push(`Доступно ${displayedProducts.value.length} товарів у наявності.`)
    } else {
      descriptionSegments.push(`${categoryLabel} в ${cfg.site_name}: ${displayedProducts.value.length} товарів у наявності.`)
      if (activeCategoryForSeo.value.description) {
        descriptionSegments.push(activeCategoryForSeo.value.description)
      }
    }
  } else {
    descriptionSegments.push(`Онлайн-магазин ${cfg.site_name}: свіже пиво, сидри та делікатеси з доставкою по Києву.`)
    descriptionSegments.push(`Зараз доступно ${displayedProducts.value.length} товарів.`)
  }

  if (branchLabel) {
    descriptionSegments.push(`Поточна філія: ${branchLabel}.`)
  } else {
    descriptionSegments.push('Оберіть філію, щоб бачити актуальні залишки.')
  }

  const resolvedTitle = hasActiveSearch.value
    ? `${categoryLabel} – ${cfg.site_name}`
    : activeCategoryForSeo.value?.seo_title || `${categoryLabel} – ${cfg.site_name}`

  updateSeoMeta({
    title: resolvedTitle,
    description: descriptionSegments.join(' '),
    canonical: shopCanonicalPath.value || '/shop',
    ogType: 'website'
  })

  if (!displayedProducts.value.length) {
    removeStructuredData(SHOP_ITEM_LIST_ID)
    return
  }

  appendStructuredData([
    {
      id: SHOP_ITEM_LIST_ID,
      data: buildItemListSchema()
    }
  ])
}

const updateLcpPreloadLink = () => {
  if (typeof document === 'undefined') return

  const existingLink = document.head.querySelector(`link[${SHOP_LCP_PRELOAD_ATTR}]`) as HTMLLinkElement | null

  // Only add preload if we have displayed products
  if (!displayedProducts.value || displayedProducts.value.length === 0) {
    existingLink?.remove()
    return
  }

  const imagePath = lcpProductImagePath.value

  if (!imagePath || imagePath.trim() === '') {
    existingLink?.remove()
    return
  }

  const optimizedHref =
    backendApi.getOptimizedImageUrl(imagePath, { width: 640, format: 'webp', quality: 80 }) ||
    backendApi.getImageUrl(imagePath)

  // Validate href before setting it - be very strict
  if (!optimizedHref ||
      typeof optimizedHref !== 'string' ||
      optimizedHref.trim() === '' ||
      optimizedHref === 'undefined' ||
      optimizedHref === 'null' ||
      !optimizedHref.startsWith('http')) {
    existingLink?.remove()
    return
  }

  let linkEl = existingLink
  if (!linkEl) {
    linkEl = document.createElement('link')
    linkEl.rel = 'preload'
    linkEl.as = 'image'
    linkEl.fetchpriority = 'high'
    linkEl.setAttribute(SHOP_LCP_PRELOAD_ATTR, 'true')
    document.head.appendChild(linkEl)
  }

  linkEl.href = optimizedHref
}

// Methods
const openDeliveryModal = () => {
  showDeliveryModal.value = true
  deliveryMethod.value = 'delivery'
}

const closeDeliveryModal = () => {
  showDeliveryModal.value = false
}

const handleDeliveryMethodSelected = (data: any) => {
  

  // Store the delivery method and fee in cart store
  cartStore.setDeliveryMethod(data.method)
  cartStore.setDeliveryFee(data.fee)

  // Store branch selection
  if (data.branch) {
    cartStore.setBranch(data.branch.id)
    branchStore.selectBranch(data.branch)
  }

  // Store location if delivery
  if (data.method === 'delivery' && data.location) {
    locationStore.setLocation(data.location)
  }

  // Close modal
  closeDeliveryModal()

  // Navigate to cart
  router.push('/cart')
}

const openPickupModal = () => {
  showPickupModal.value = true
  deliveryMethod.value = 'pickup'
}

const closePickupModal = () => {
  showPickupModal.value = false
}

const confirmDelivery = async () => {
  if (!deliveryAddress.value) return

  await findNearestBranch()
  closeDeliveryModal()
}

const handleAddressSelected = async (suggestion: AddressSuggestion) => {
  deliveryAddress.value = suggestion.full_address

  if (suggestion.coordinates) {
    // Store the location for later use
    locationStore.setLocation({
      latitude: suggestion.coordinates.lat,
      longitude: suggestion.coordinates.lng,
      address: suggestion.full_address
    })
  }
}

const handleManualAddress = async (address: string) => {
  deliveryAddress.value = address
}

const handleAddressError = (error: string) => {
  notificationStore.add({
    type: 'error',
    title: 'Address Error',
    message: error,
    duration: 3000
  })
}

const selectBranchFromModal = async (branch: Branch) => {
  await selectBranch(branch)
  closePickupModal()
}

const selectDeliveryMethod = async (method: FulfillmentType) => {
  deliveryMethod.value = method
  await capacitorService.hapticImpact('medium')
  await capacitorService.hapticSelection()

  // Clear previous selections
  availableBranches.value = []
  branchStore.clearSelectedBranch()

  // Reset address for delivery
  if (method === 'delivery') {
    deliveryAddress.value = ''
    currentLocationAddress.value = ''
  }
}

const getCurrentLocation = async () => {
  loading.value.location = true

  try {
    const location = await capacitorService.getCurrentPosition()

    if (location) {
      // Convert coordinates to address using reverse geocoding
      const address = await reverseGeocode(location.latitude, location.longitude)
      currentLocationAddress.value = address
      deliveryAddress.value = address

      notificationStore.add({
        type: 'success',
        title: 'Location detected',
        message: 'Your current location has been set as delivery address',
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Failed to get location:', error)
    notificationStore.add({
      type: 'error',
      title: 'Location error',
      message: 'Failed to get your current location. Please enter address manually.',
      duration: 5000
    })
  } finally {
    loading.value.location = false
  }
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using a simple reverse geocoding service (you can replace with your preferred service)
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`)
    const data = await response.json()

    if (data && data.locality && data.principalSubdivision) {
      return `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
    } else {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

const findNearestBranch = async () => {
  if (!deliveryAddress.value) {
    notificationStore.add({
      type: 'warning',
      title: 'Address required',
      message: 'Please enter your delivery address',
      duration: 3000
    })
    return
  }

  loading.value.branches = true

  try {
    await loadBranches()

    if (branches.value.length > 0) {
      // For demo, select first branch and calculate mock delivery fee
      const nearestBranch = branches.value[0]
      const mockDistance = Math.random() * 8 + 1 // 1-9 km
      const deliveryFee = calculateDeliveryFee(mockDistance)

      availableBranches.value = [{
        ...nearestBranch,
        distance_km: mockDistance,
        delivery_fee: deliveryFee
      }]

      // Automatically select the nearest branch and load its products
      
      await selectBranch(nearestBranch)

      notificationStore.add({
        type: 'success',
        title: 'Branch found!',
        message: `Nearest branch: ${nearestBranch.name}`,
        duration: 3000
      })
    }
  } catch (error) {
    console.error('Failed to find nearest branch:', error)
    notificationStore.add({
      type: 'error',
      title: 'Error finding branch',
      message: 'Please try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const loadBranches = async () => {
  loading.value.branches = true

  try {
    
    await branchStore.fetchBranches(true) // force = true to get fresh data
    availableBranches.value = branches.value
    branchesLoaded.value = true
    
  } catch (error) {
    console.error('❌ Failed to load branches:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to load branches from Poster API',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const loadDefaultBranch = async () => {
  loading.value.branches = true

  try {
    // Only fetch branches if we don't have them cached
    if (branches.value.length === 0) {
      await branchStore.fetchBranches(true)
    }

    // Find Branch 4 or the first available branch
    const defaultBranch = branches.value.find(b => b.name.includes('4')) || branches.value[0]

    if (defaultBranch) {
      branchStore.selectBranch(defaultBranch)
      await loadCategories()
    }
  } catch (error) {
    console.error('❌ Failed to load default branch:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to load branch',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.branches = false
  }
}

const selectBranch = async (branch: Branch) => {
  branchStore.selectBranch(branch)
  await capacitorService.hapticImpact('medium')

  // Load categories and products for this branch
  
  await loadCategories()
}

const loadCategories = async (retryCount = 0, maxRetries = 5) => {
  loading.value.categories = true
  // Don't show global loading overlay - removed for better UX
  // loadingStore.setGlobalLoading(true)

  try {
    // Check if categories are already loaded (from App.vue preloading)
    const hasCategories = categoriesWithProducts.value.length > 0

    // STEP 1: Load categories first (CRITICAL - must succeed before loading products)
    if (!hasCategories) {
      
      loadingStore.startLoading('categories')
      try {
        // Force fetch categories to ensure we get fresh data
        const fetchedCategories = await productStore.fetchCategories(true, true, false)

        if (!fetchedCategories || fetchedCategories.length === 0) {
          console.error('❌ No categories returned from fetchCategories!')
          throw new Error('No categories available')
        }

        
      } catch (catError) {
        console.error('❌ Failed to fetch categories:', catError)
        throw catError
      }
    } else {
      
    }

    // Verify categories are loaded before proceeding
    if (categoriesWithProducts.value.length === 0) {
      console.error('❌ Categories still empty after fetch!')
      throw new Error('Categories failed to load')
    }

    // STEP 2: Load ALL products (not just first category) for mobile view
    
    loading.value.products = true
    loadingStore.startLoading('products')

    try {
      // Load ALL products with inventory for default branch (categoryId=undefined loads all)
      await productStore.fetchProducts(undefined, true, defaultBranchId.value, true)
      
    } catch (prodError) {
      console.error('❌ Failed to fetch products:', prodError)
      throw prodError
    } finally {
      loading.value.products = false
      loadingStore.stopLoading('products')
    }

    // Auto-select first category for desktop view
    if (!selectedCategory.value && categoriesWithProducts.value.length > 0) {
      const firstCategory = categoriesWithProducts.value[0]
      productStore.selectCategory(firstCategory)
      
    }

  } catch (error) {
    if (retryCount < maxRetries) {
      const waitTime = 1000 * (retryCount + 1)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return loadCategories(retryCount + 1, maxRetries)
    }

    console.error('❌ Failed to load categories after retries:', error)

    // Show error message only after all retries are exhausted
    showCategoryError.value = true

    notificationStore.add({
      type: 'error',
      title: 'Failed to load categories',
      message: 'Please check your internet connection and try again. You can click "Retry" to try again.',
      duration: 5000,
      action: {
        label: 'Retry',
        handler: () => {
          showCategoryError.value = false
          loadCategories(0, maxRetries)
        }
      }
    })
  } finally {
    loading.value.categories = false
    loadingStore.stopLoading('categories')
    // Don't show global loading overlay - removed for better UX
    // loadingStore.setGlobalLoading(false)
  }
}

const selectCategory = async (category: Category | null) => {
  productStore.selectCategory(category)

  // Reset category description expanded state when changing categories
  isCategoryDescExpanded.value = false

  // Update URL with category slug for bookmarkable links
  if (category && category.slug) {
    router.push({ query: { category: category.slug } })
  } else if (category) {
    // Fallback to display_name if slug not available
    router.push({ query: { category: category.display_name } })
  } else {
    // Clear category from URL
    router.push({ query: {} })
  }

  // Always show loading when switching categories
  if (category) {
    await loadProductsForCategory(category.id)
  }
}

const selectDealsCategory = () => {
  // Create a special "deals" category
  const dealsCategory = {
    id: 'deals',
    name: 'deals',
    display_name: t('deals.title'),
    description: 'Products on sale',
    slug: 'deals',
    seo_title: '',
    seo_meta_description: '',
    seo_content: '',
    image_url: null,
    sort_order: -1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  productStore.selectCategory(dealsCategory)
  router.push({ query: { ...route.query, category: 'deals' } })
}

const loadProducts = async () => {
  loading.value.products = true

  try {
    // Clear cache to force fresh data
    productStore.clearCache()

    // Load products with inventory for default branch (from config)
    await productStore.fetchProducts(undefined, true, defaultBranchId.value, true) // categoryId=undefined, force=true, branchId, useDatabase=true
  } catch (error) {
    console.error('❌ Failed to refresh products:', error)
    notificationStore.add({
      type: 'error',
      title: 'Failed to refresh products',
      message: 'Please check your internet connection and try again',
      duration: 5000
    })
  } finally {
    loading.value.products = false
  }
}

const handleCartAnimation = async (data: { startX: number; startY: number }) => {
  

  if (!cartAnimationOverlay.value) {
    await waitForCartOverlay()
  }

  if (!cartAnimationOverlay.value) {
    console.error('❌ cartAnimationOverlay ref is not available')
    return
  }

  // Determine if mobile or desktop
  const isMobile = window.innerWidth < 768 // md breakpoint

  let endX: number
  let endY: number

  if (isMobile) {
    // Mobile: target the cart icon in mobile bottom nav (center bottom)
    endX = window.innerWidth / 2
    endY = window.innerHeight - 30 // Bottom nav height
  } else {
    // Desktop: target the cart icon in top right area
    endX = window.innerWidth - 60
    endY = 80
  }

  
  cartAnimationOverlay.value?.addAnimation(data.startX, data.startY, endX, endY)
}

const addToCart = async (product: Product, quantity?: number, bottles?: any, bottleCost?: number) => {
  // Haptic feedback for better UX
  await capacitorService.hapticImpact('light')

  
  
  
  
  

  // Check if this is a bundle product
  if (product.is_bundle) {
    
    try {
      await cartStore.addBundleProduct(product, quantity || 1)
      
      // Success haptic feedback
      await capacitorService.hapticNotification('success')
      return
    } catch (error) {
      console.error('🛒 [ShopView] Failed to add bundle product:', error)
      await capacitorService.hapticNotification('error')
      return
    }
  }

  

  const cartItem: any = {
    product_id: product.id,
    poster_product_id: product.poster_product_id || product.id,
    name: product.display_name,
    price: product.price,
    quantity: quantity || 1,
    image_url: product.display_image_url,
    unit: product.unit,
    max_quantity: product.max_quantity
  }

  // Mark as draft beverage if requires bottles
  if (product.requires_bottles) {
    cartItem.is_draft_beverage = true
    cartItem.bottle_selection = bottles
  }

  // Add custom quantity information for weight-based products
  if (product.custom_quantity) {
    cartItem.custom_quantity = product.custom_quantity
    cartItem.custom_unit = product.custom_unit
    cartItem.quantity_step = product.quantity_step || product.custom_quantity
  }

  // Check if this is a draft beverage (requires bottles)
  if (isDraftBeverage(product)) {
    cartItem.is_draft_beverage = true

    // Add bottle information if provided (fallback mode)
    if (bottles) {
      cartItem.bottles = bottles
    }
    if (bottleCost !== undefined) {
      cartItem.bottle_cost = bottleCost
    }
  }

  cartStore.addItem(cartItem)

  // Add 1L bottles for draft beverages automatically
  if (isDraftBeverage(product)) {
    const beverageQuantity = quantity || 1
    const bottleQuantity = Math.ceil(beverageQuantity) // 1L = 1 bottle, 2L = 2 bottles

    const bottle1L = {
      product_id: 'cmclpuhc4003dstlk7h9hxdmn', // 1L bottle ID
      poster_product_id: '189',
      name: 'ПЕТ 1 л + кришка',
      price: 4.71,
      quantity: bottleQuantity,
      image_url: '',
      unit: 'шт',
      is_bottle_product: true,
      is_auto_added: true
    }
    cartStore.addItem(bottle1L)
    
  }

  // Success haptic feedback
  await capacitorService.hapticNotification('success')
}

const addBottleToCart = async (bottleItem: any) => {
  // Haptic feedback for better UX
  await capacitorService.hapticImpact('light')

  const cartItem: any = {
    product_id: bottleItem.product_id || bottleItem.id, // Use actual database ID
    poster_product_id: bottleItem.poster_product_id,
    name: bottleItem.name,
    price: bottleItem.price,
    quantity: bottleItem.quantity,
    image_url: '',
    unit: 'шт',
    is_bottle_product: true,
    is_auto_added: true // Mark as auto-added so it can't be edited/deleted separately
  }

  cartStore.addItem(cartItem)
  
}

const calculateDeliveryFee = (distanceKm: number): number => {
  const config = siteConfigStore.currentConfig
  const baseFee = config.delivery_base_fee || 99
  const baseDistance = config.delivery_base_distance_km || 2
  const extraFeePerKm = config.delivery_extra_fee_per_km || 30

  if (distanceKm <= baseDistance) {
    return baseFee
  } else {
    const extraDistance = distanceKm - baseDistance
    return baseFee + (extraDistance * extraFeePerKm)
  }
}





// Handle category query parameter (supports both slug and display_name)
const handleCategoryFromURL = () => {
  const categoryParam = route.query.category as string
  if (categoryParam && categoriesWithProducts.value.length > 0) {
    if (categoryParam === 'deals') {
      selectDealsCategory()
      return
    }
    // Find category by slug first (preferred), then by display_name (legacy support)
    const category = categoriesWithProducts.value.find(cat =>
      cat.slug === categoryParam ||
      cat.display_name === categoryParam ||
      cat.name === categoryParam ||
      cat.display_name.toLowerCase() === categoryParam.toLowerCase()
    )

    if (category) {
      productStore.selectCategory(category)
      // Lazy load products for this category if not already loaded
      if (!productsByCategory.value.length) {
        loadProductsForCategory(category.id)
      }
    } else {
      console.warn('⚠️ Category not found for URL parameter:', categoryParam)
    }
  }
}

// Lazy load products for a specific category
const loadProductsForCategory = async (categoryId: string) => {
  try {
    
    // Don't show global loading overlay when switching categories
    // loadingStore.setGlobalLoading(true)
    // loadingStore.startLoading('products')
    // Load products with inventory for default branch (from config)
    await productStore.fetchProducts(categoryId, false, defaultBranchId.value, true)
  } catch (error) {
    console.error('❌ Failed to lazy load category products:', error)
  } finally {
    // loadingStore.stopLoading('products')
    // loadingStore.setGlobalLoading(false)
  }
}

// Watch for route changes to handle category parameter
watch(
  [displayedProducts, selectedCategory, searchQuery, showSearchResults, selectedBranch],
  () => {
    updateShopSeoMetadata()
    updateLcpPreloadLink()
  },
  { immediate: true }
)

watch(() => route.query.category, () => {
  handleCategoryFromURL()
}, { immediate: false })

// Watch for search query parameter
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    
    searchQuery.value = newSearch
    performSearch(newSearch)
  }
}, { immediate: true })

// Watch for categories to be loaded, then handle URL parameter
watch(() => categoriesWithProducts.value.length, (newLength) => {
  if (newLength > 0) {
    handleCategoryFromURL()
    // Also check if there's a search query to perform
    const searchParam = route.query.search as string
    if (searchParam) {
      searchQuery.value = searchParam
      performSearch(searchParam)
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  try {
    // Track page view
    googleAnalytics.trackPageView('Магазин - Опілля | Найкращі напої та делікатеси з доставкою по Києву')

    // Check if we already have cached data
    const hasCategories = categoriesWithProducts.value.length > 0
    const hasProducts = products.value.length > 0
    const hasBranches = branches.value.length > 0

    

    // STEP 1: Load banners, branches, and discounts in parallel (lightweight)
    
    const discountStore = useDiscountStore()
    const initialPromises: Promise<any>[] = [
      bannerStore.fetchBanners(),
      discountStore.getEnabledDiscounts()
    ]

    if (!hasBranches) {
      initialPromises.push(branchStore.fetchBranches(true))
    }

    await Promise.all(initialPromises)

    // Auto-select a branch for cart operations (uses default from config for inventory)
    if (!selectedBranch.value && branches.value.length > 0) {
      // Find branch matching default_shop_branch_id from config, or use first available
      const configBranchId = siteConfigStore.currentConfig.default_shop_branch_id
      const defaultBranch = branches.value.find(b => b.id === configBranchId) || branches.value[0]
      branchStore.selectBranch(defaultBranch)
      
    }

    // STEP 2: Load categories and products using optimized sequence (uses defaultBranchId for inventory)
    if (!hasCategories || !hasProducts) {
      
      await loadCategories()
    }

    // Handle category from URL after data is loaded
    handleCategoryFromURL()

    // Track product list view when products are loaded
    if (products.value.length > 0) {
      googleAnalytics.trackViewItemList(products.value, 'Shop Page - All Products')
    }
  } catch (error) {
    console.error('❌ Failed to initialize shop:', error)
  } finally {
    // Always set initial loading to false when done
    loading.value.initial = false
  }
})

onUnmounted(() => {
  removeStructuredData(SHOP_ITEM_LIST_ID)
  if (typeof document !== 'undefined') {
    const preloadLink = document.head.querySelector(`link[${SHOP_LCP_PRELOAD_ATTR}]`)
    preloadLink?.remove()
  }
})

// Helper functions for product cards (RelatedProducts style)
const navigateToProduct = (product: Product) => {
  router.push(`/product/${product.slug || product.id}`)
}

const getProductImageUrl = (product: Product): string => {
  const primaryImage = product.display_image_url || product.image_url
  if (!primaryImage) return ''
  return backendApi.getImageUrl(primaryImage)
}

const handleProductImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const handleRetryCategories = () => {
  showCategoryError.value = false
  loadCategories(0, 3)
}

const formatProductPrice = (price: number, product?: Product): string => {
  // If product has custom quantity (weight-based), show price per custom unit
  if (product?.custom_quantity && product?.custom_unit) {
    // Convert price per kg to price per custom unit (e.g., per 50g)
    const pricePerCustomUnit = price * product.custom_quantity
    return pricePerCustomUnit.toFixed(2)
  }

  // For regular products, show price as is
  return price.toFixed(2)
}

const getProductUnitLabel = (unit: string | undefined, product?: Product): string => {
  // If product has custom quantity, show the custom unit
  if (product?.custom_quantity && product?.custom_unit) {
    // Convert custom_quantity to display format
    if (product.custom_unit === 'г') {
      const grams = product.custom_quantity * 1000
      return `${grams}г`
    } else if (product.custom_unit === 'мл') {
      const ml = product.custom_quantity * 1000
      return `${ml}мл`
    }
    return product.custom_unit
  }

  // For regular products, show the unit
  if (!unit) return 'шт'

  switch (unit.toLowerCase()) {
    case 'kg':
    case 'кг':
      return '1 кг'
    case 'l':
    case 'л':
      return '1 л'
    case 'g':
    case 'г':
      return '100 г'
    case 'ml':
    case 'мл':
      return '100 мл'
    default:
      return 'шт'
  }
}

const isProductAvailableInBranch = (product: Product): boolean => {
  if (!product.is_active) return false

  if (product.quantity !== undefined) {
    return product.available && product.quantity > 0
  }

  return product.available
}

const handleQuickAddToCart = async (product: Product, event: Event) => {
  if (!isProductAvailableInBranch(product)) return

  const button = event.target as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const startX = rect.left + rect.width / 2
  const startY = rect.top + rect.height / 2

  // Emit animation event
  handleCartAnimation({ startX, startY })

  // Add to cart using the same logic as RelatedProducts
  await quickAddToCart(product)
}

const quickAddToCart = async (product: Product) => {
  if (!isProductAvailableInBranch(product)) return

  try {
    // Check if this is a bundle product
    if (product.is_bundle) {
      await cartStore.addBundleProduct(product, 1)
      return
    }

    // Check if this is a draft beverage that requires bottles (but not if it's already a bottled product)
    if (isDraftBeverage(product) && !isBottledProduct(product)) {
      // For draft beverages, use default 1L quantity and auto bottle selection
      const quantity = 1 // Default 1L
      const autoBottles = getDefaultBottleSelection(quantity)
      const bottleCost = calculateBottleCost(autoBottles)

      // Create cart item for the beverage
      const cartItem: any = {
        product_id: product.id,
        poster_product_id: product.poster_product_id,
        name: product.display_name || product.name,
        price: product.price,
        quantity: quantity,
        image_url: product.display_image_url || product.image_url,
        unit: product.unit || 'L',
        max_quantity: product.max_quantity,
        is_draft_beverage: true
      }

      // For draft beverages, ONLY add auto bottles to the main product (no separate bottle items)
      cartItem.bottles = autoBottles
      cartItem.bottle_cost = bottleCost

      cartStore.addItem(cartItem)
    } else {
      // Regular product (non-draft) or bottled product
      cartStore.addItem({
        product_id: product.id,
        poster_product_id: product.poster_product_id,
        name: product.display_name || product.name,
        price: product.price,
        quantity: 1,
        image_url: product.display_image_url || product.image_url,
        unit: product.unit || 'шт',
        max_quantity: product.max_quantity
      })
    }
  } catch (error) {
    console.error('Failed to add product to cart:', error)
  }
}

const selectCategoryAndScroll = async (categoryId: string) => {
  const category = categoriesWithProducts.value.find(cat => cat.id === categoryId)
  if (category) {
    // Switch to desktop view by setting isMobileView to false
    isMobileView.value = false

    // Use the selectCategory function to properly load products and update URL
    await selectCategory(category)

    // Scroll to top to show the desktop category view
    scrollToTop()

    
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scroll to deals section
const scrollToDealsSection = () => {
  const dealsSection = document.getElementById('deals-section')
  if (dealsSection) {
    const headerHeight = 64 + 56 // header + sticky nav height
    const elementPosition = dealsSection.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - headerHeight,
      behavior: 'smooth'
    })
  }
}

// Scroll to category section
const scrollToCategorySection = (categoryId: string) => {
  const categorySection = document.getElementById(`category-section-${categoryId}`)
  if (categorySection) {
    const headerHeight = 64 + 56 // header + sticky nav height
    const elementPosition = categorySection.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - headerHeight,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
/* Hide scrollbar for mobile categories */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

/* Line clamp for product names */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Category Description Styling */
.category-description :deep(h2) {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.category-description :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.category-description :deep(p) {
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #4b5563;
}

.category-description :deep(ul),
.category-description :deep(ol) {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  list-style: disc;
}

.category-description :deep(li) {
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #4b5563;
}

.category-description :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.category-description :deep(a:hover) {
  color: #2563eb;
}

.category-description :deep(strong),
.category-description :deep(b) {
  font-weight: 600;
  color: #1f2937;
}
</style>
