<template>
  <footer class="bg-white border-t mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation Links -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Компанія</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/about" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Про нас
              </router-link>
            </li>
            <li>
              <router-link to="/branches" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Наші магазини
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Зв'язатися з нами
              </router-link>
            </li>
            <li>
              <a href="https://blog.opillia.com.ua" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                📝 Блог
              </a>
            </li>
            <li>
              <router-link to="/sitemap" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                🗺️ Карта сайту
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Shopping -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Покупки</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Магазин
              </router-link>
            </li>
            <li>
              <router-link to="/cart" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Кошик
              </router-link>
            </li>
            <li>
              <router-link to="/orders" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Мої замовлення
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Services -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Послуги</h3>
          <ul class="space-y-2">
            <li>
              <span class="text-sm text-gray-600">🚚 Доставка по Києву</span>
            </li>
            <li>
              <span class="text-sm text-gray-600">🏪 Самовивіз</span>
            </li>
            <li>
              <span class="text-sm text-gray-600">💳 Онлайн оплата</span>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Контакти</h3>
          <ul class="space-y-2">
            <li>
              <a :href="`tel:${siteConfig.company_phone}`" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                📞 {{ siteConfig.company_phone }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${siteConfig.company_email}`" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                ✉️ {{ siteConfig.company_email }}
              </a>
            </li>
            <li>
              <span class="text-sm text-gray-600">📍 {{ siteConfig.company_address }}</span>
            </li>
            <li>
              <span class="text-sm text-gray-600">🕒 Щодня 9:00-22:00</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-gray-200 pt-6">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">
            © {{ new Date().getFullYear() }} {{ siteConfig.company_name }}. {{ siteConfig.site_description }}
          </p>
          <div class="flex justify-center space-x-4 text-xs text-gray-400 mb-4">
            <span>🚀 Vue 3 + Capacitor.js</span>
            <span>•</span>
            <span>📱 Progressive Web App</span>
            <span>•</span>
            <span>🔌 Poster API</span>
            <span>•</span>
            <span>🤖 AI-Powered</span>
          </div>

          <!-- Social Media Links -->
          <div v-if="hasSocialLinks" class="flex justify-center space-x-4">
            <a
              v-if="siteConfig.facebook_url"
              :href="siteConfig.facebook_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-blue-600 transition-colors"
            >
              📘 Facebook
            </a>
            <a
              v-if="siteConfig.instagram_url"
              :href="siteConfig.instagram_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-pink-600 transition-colors"
            >
              📷 Instagram
            </a>
            <a
              v-if="siteConfig.telegram_url"
              :href="siteConfig.telegram_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-blue-500 transition-colors"
            >
              📱 Telegram
            </a>
            <a
              v-if="siteConfig.viber_url"
              :href="siteConfig.viber_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-400 hover:text-purple-600 transition-colors"
            >
              💜 Viber
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()
const siteConfig = computed(() => siteConfigStore.currentConfig)

const hasSocialLinks = computed(() => {
  const config = siteConfig.value
  return config.facebook_url || config.instagram_url || config.telegram_url || config.viber_url
})
</script>
