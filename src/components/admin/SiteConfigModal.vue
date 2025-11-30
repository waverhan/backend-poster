<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Site Configuration</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
        <form @submit.prevent="handleSave" class="p-6 space-y-8">
          <!-- Branding Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🎨 Branding & Identity
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  v-model="formData.site_name"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Shop Name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                <input
                  v-model="formData.site_description"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your shop"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  v-model="formData.logo_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/logo.png"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                <input
                  v-model="formData.favicon_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/favicon.ico"
                />
              </div>
            </div>
          </div>

          <!-- SEO Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🔍 SEO & Meta Tags
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <input
                  v-model="formData.seo_title"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Page title for search engines"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <textarea
                  v-model="formData.seo_description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description for search engines (150-160 characters)"
                ></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                  <input
                    v-model="formData.seo_keywords"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Open Graph Image</label>
                  <input
                    v-model="formData.og_image_url"
                    type="url"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/og-image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Homepage Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🏠 Homepage Configuration
            </h3>

            <!-- Homepage Type Selection -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label class="block text-sm font-medium text-gray-700 mb-3">Homepage Type</label>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="homepage-landing"
                    v-model="formData.homepage_type"
                    type="radio"
                    value="landing"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="homepage-landing" class="ml-3 block text-sm font-medium text-gray-700">
                    <span class="font-semibold">Landing Page</span>
                    <span class="block text-xs text-gray-500">Show marketing homepage with hero section, features, and call-to-action</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="homepage-shop"
                    v-model="formData.homepage_type"
                    type="radio"
                    value="shop"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="homepage-shop" class="ml-3 block text-sm font-medium text-gray-700">
                    <span class="font-semibold">Direct Shop</span>
                    <span class="block text-xs text-gray-500">Redirect visitors directly to the shop/products page</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Landing Page Content (only show if homepage type is 'landing') -->
            <div v-if="formData.homepage_type === 'landing'" class="space-y-4 border-l-4 border-blue-500 pl-4 bg-gray-50 p-4 rounded-r-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">Landing Page Content</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                  <input
                    v-model="formData.hero_title"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Main headline on homepage"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hero CTA Text</label>
                  <input
                    v-model="formData.hero_cta_text"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start Shopping"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                <textarea
                  v-model="formData.hero_subtitle"
                  rows="2"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Subtitle or description under the main headline"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hero Banner URL</label>
                <input
                  v-model="formData.hero_banner_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/hero-banner.jpg"
                />
              </div>
            </div>

            <!-- Shop Mode Info -->
            <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <div class="text-green-600 text-lg">🛍️</div>
                <div class="text-sm text-green-800">
                  <p class="font-medium mb-1">Direct Shop Mode Active</p>
                  <p>Visitors will be automatically redirected to the shop page when they visit your homepage. This provides a streamlined shopping experience without marketing content.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              📞 Contact Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  v-model="formData.company_name"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Company LLC"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  v-model="formData.company_phone"
                  type="tel"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+380 44 123 45 67"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  v-model="formData.company_email"
                  type="email"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="info@yourshop.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  v-model="formData.company_website"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourshop.com"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  v-model="formData.company_address"
                  rows="2"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street address, city, postal code"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Social Media Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              📱 Social Media Links
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                <input
                  v-model="formData.facebook_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/yourshop"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input
                  v-model="formData.instagram_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://instagram.com/yourshop"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telegram URL</label>
                <input
                  v-model="formData.telegram_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://t.me/yourshop"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Viber URL</label>
                <input
                  v-model="formData.viber_url"
                  type="url"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="viber://chat?number=+380441234567"
                />
              </div>
            </div>
          </div>

          <!-- Business Settings Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              💼 Business Settings
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  v-model="formData.currency"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UAH">UAH (₴)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  v-model="formData.language"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="uk">Ukrainian</option>
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  v-model="formData.timezone"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Europe/Kiev">Europe/Kiev</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Min Order Amount</label>
                <input
                  v-model.number="formData.min_order_amount"
                  type="number"
                  min="0"
                  step="10"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="300"
                />
              </div>
            </div>
          </div>

          <!-- Delivery Pricing Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🚚 Delivery Pricing Configuration
            </h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div class="flex items-start space-x-3">
                <div class="text-blue-600 text-lg">💡</div>
                <div class="text-sm text-blue-800">
                  <p class="font-medium mb-1">How delivery pricing works:</p>
                  <p>• Base fee covers delivery within base distance</p>
                  <p>• Extra fee is charged per km beyond base distance</p>
                  <p>• Free delivery when order exceeds threshold below</p>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Base Delivery Fee ({{ formData.currency }})
                </label>
                <input
                  v-model.number="formData.delivery_base_fee"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="99"
                />
                <p class="text-xs text-gray-500 mt-1">Fee for delivery within base distance</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Base Distance (km)
                </label>
                <input
                  v-model.number="formData.delivery_base_distance_km"
                  type="number"
                  min="0"
                  step="0.5"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                />
                <p class="text-xs text-gray-500 mt-1">Distance included in base fee</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Extra Fee per KM ({{ formData.currency }})
                </label>
                <input
                  v-model.number="formData.delivery_extra_fee_per_km"
                  type="number"
                  min="0"
                  step="1"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="30"
                />
                <p class="text-xs text-gray-500 mt-1">Additional fee per km beyond base</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Free Delivery Threshold ({{ formData.currency }})
                </label>
                <input
                  v-model.number="formData.free_delivery_threshold"
                  type="number"
                  min="0"
                  step="50"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
                <p class="text-xs text-gray-500 mt-1">Free delivery above this amount</p>
              </div>
            </div>
            <!-- Delivery Pricing Preview -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">📊 Pricing Preview</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Within {{ formData.delivery_base_distance_km || 2 }}km:</span>
                  <span class="font-medium text-green-600 ml-2">{{ formData.delivery_base_fee || 99 }} {{ formData.currency }}</span>
                </div>
                <div>
                  <span class="text-gray-600">At 5km:</span>
                  <span class="font-medium text-blue-600 ml-2">
                    {{ (formData.delivery_base_fee || 99) + ((5 - (formData.delivery_base_distance_km || 2)) * (formData.delivery_extra_fee_per_km || 30)) }} {{ formData.currency }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">At 10km:</span>
                  <span class="font-medium text-orange-600 ml-2">
                    {{ (formData.delivery_base_fee || 99) + ((10 - (formData.delivery_base_distance_km || 2)) * (formData.delivery_extra_fee_per_km || 30)) }} {{ formData.currency }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              ⚡ Features & Functionality
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_reviews"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Reviews System</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_untappd"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Untappd Integration</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_likes"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Product Likes</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_ai_chat"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable AI Chat Assistant</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_recommendations"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Product Recommendations</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_notifications"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Push Notifications</span>
              </label>
            </div>
          </div>

          <!-- UI/UX Settings Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🌙 UI/UX Settings
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_dark_mode"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Dark Mode Toggle</span>
              </label>
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.show_fallback_banner"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Show Fallback Hero Banner</span>
              </label>
              <div class="text-xs text-gray-500 mt-1">
                Allow users to switch between light and dark themes
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Display welcome banner when no custom banners are set
              </div>
            </div>
          </div>

          <!-- Payment Settings Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              💳 Payment Settings
            </h3>
            <div class="space-y-4">
              <!-- Enable Online Payment -->
              <label class="flex items-center space-x-3">
                <input
                  v-model="formData.enable_online_payment"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Enable Online Payment (WayForPay)</span>
              </label>

              <!-- WayForPay Settings (shown only when online payment is enabled) -->
              <div v-if="formData.enable_online_payment" class="space-y-4 pl-6 border-l-2 border-blue-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Merchant Account <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.wayforpay_merchant_account"
                      type="text"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="test_merch_n1"
                    />
                    <p class="text-xs text-gray-500 mt-1">Your WayForPay merchant account identifier</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Merchant Domain <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.wayforpay_merchant_domain"
                      type="text"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="opillia.com.ua"
                    />
                    <p class="text-xs text-gray-500 mt-1">Your domain registered with WayForPay</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Merchant Secret Key <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.wayforpay_merchant_secret"
                    type="password"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your secret key"
                  />
                  <p class="text-xs text-gray-500 mt-1">Secret key from your WayForPay merchant account (keep secure!)</p>
                </div>
                <label class="flex items-center space-x-3">
                  <input
                    v-model="formData.wayforpay_test_mode"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Test Mode (use for testing payments)</span>
                </label>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-blue-800">WayForPay Integration</h3>
                      <div class="mt-2 text-sm text-blue-700">
                        <p>To get your WayForPay credentials:</p>
                        <ol class="list-decimal list-inside mt-1 space-y-1">
                          <li>Register at <a href="https://wayforpay.com" target="_blank" class="underline">wayforpay.com</a></li>
                          <li>Complete merchant verification</li>
                          <li>Get your Merchant Account and Secret Key from the dashboard</li>
                          <li>Add your domain to the allowed domains list</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              🎨 Theme Colors
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div class="flex space-x-2">
                  <input
                    v-model="formData.primary_color"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    v-model="formData.primary_color"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div class="flex space-x-2">
                  <input
                    v-model="formData.secondary_color"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    v-model="formData.secondary_color"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#64748b"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                <div class="flex space-x-2">
                  <input
                    v-model="formData.accent_color"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    v-model="formData.accent_color"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
        <button
          @click="handleReset"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          Reset to Defaults
        </button>
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            type="button"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Saving...' : 'Save Configuration' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfig'
import type { SiteConfig } from '@/types'

// Props & Emits
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: [config: SiteConfig]
}>()

// Store
const siteConfigStore = useSiteConfigStore()

// State
const formData = ref<Partial<SiteConfig>>({})
const isLoading = ref(false)

// Methods
const loadFormData = () => {
  formData.value = { ...siteConfigStore.currentConfig }
}

const handleSave = async () => {
  isLoading.value = true
  try {
    const updatedConfig = await siteConfigStore.updateConfig(formData.value)

    // Apply changes immediately
    siteConfigStore.applyTheme()
    siteConfigStore.updateDocumentMeta()

    emit('saved', updatedConfig)
    emit('close')
  } catch (error) {
    console.error('Failed to save site configuration:', error)
    alert('Failed to save configuration. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handleReset = async () => {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    isLoading.value = true
    try {
      await siteConfigStore.resetToDefaults()
      loadFormData()

      // Apply changes immediately
      siteConfigStore.applyTheme()
      siteConfigStore.updateDocumentMeta()
    } catch (error) {
      console.error('Failed to reset configuration:', error)
      alert('Failed to reset configuration. Please try again.')
    } finally {
      isLoading.value = false
    }
  }
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadFormData()
  }
})

// Lifecycle
onMounted(() => {
  if (props.isOpen) {
    loadFormData()
  }
})
</script>
