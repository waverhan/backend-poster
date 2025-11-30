<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Вакансії</h1>
        <p class="text-gray-600">Приєднайтесь до нашої команди</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Job Listing -->
      <div class="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Продавець консультант</h2>

        <!-- Welcome Section -->
        <div class="mb-8">
          <p class="text-lg text-gray-700 font-semibold mb-2">Вітаємо!</p>
          <p class="text-gray-600">Ми пропонуємо:</p>
        </div>

        <!-- Offers Section -->
        <div class="bg-blue-50 rounded-lg p-6 mb-8">
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="text-blue-600 font-bold mr-3">✓</span>
              <span class="text-gray-700">Стабільну оплату (2 рази на місяць) - 16000-25000 грн. (ставка+% за продаж додаткових товарів+премії)</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 font-bold mr-3">✓</span>
              <span class="text-gray-700">Гнучкий графік роботи (тиждень через тиждень, 7/7, 5/5, 3/3)</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 font-bold mr-3">✓</span>
              <span class="text-gray-700">Офіційне працевлаштування</span>
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 font-bold mr-3">✓</span>
              <span class="text-gray-700">Навчання та можливість кар'єрного зросту</span>
            </li>
          </ul>
        </div>

        <!-- Requirements Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Вимоги до кандидата:</h3>
          <ul class="space-y-2 ml-4">
            <li class="text-gray-700">• Досвід роботи продавцем, досвід роботи з розливним пивом дуже вітається</li>
            <li class="text-gray-700">• Охайність, уважність, націленість на результат</li>
          </ul>
        </div>

        <!-- Responsibilities Section -->
        <div class="mb-8">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Обов'язки:</h3>
          <ul class="space-y-2 ml-4">
            <li class="text-gray-700">• Консультування та обслуговування покупців</li>
            <li class="text-gray-700">• Дотримання корпоративних стандартів</li>
            <li class="text-gray-700">• Прийом товару, мерчендайзинг</li>
            <li class="text-gray-700">• Робота з касовим апаратом (проводимо навчання)</li>
            <li class="text-gray-700">• Проведення інвентаризацій</li>
            <li class="text-gray-700">• Контроль і дотримання термінів придатності</li>
          </ul>
        </div>

        <!-- Call to Action -->
        <div class="bg-green-50 rounded-lg p-6 mb-8">
          <p class="text-lg text-gray-700 font-semibold mb-4">Якщо ви шукаєте цікаву та різноманітну роботу, тоді Вам до нас.</p>
          <p class="text-gray-600 mb-6">Чекаємо на ваші дзвінки та резюме</p>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Зв'язатися з нами</h3>
        <div class="space-y-4">
          <a :href="`tel:${siteConfig.company_phone}`" class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <span class="text-2xl mr-4">📞</span>
            <div>
              <p class="text-sm text-gray-600">Телефон</p>
              <p class="text-lg font-semibold text-gray-900">{{ siteConfig.company_phone }}</p>
            </div>
          </a>
          <a href="viber://chat?number=%2B380973244668" class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <span class="text-2xl mr-4">💜</span>
            <div>
              <p class="text-sm text-gray-600">Viber</p>
              <p class="text-lg font-semibold text-gray-900">+38 (097) 324 46 68</p>
            </div>
          </a>
          <a href="https://t.me/opillia_shop" target="_blank" rel="noopener noreferrer" class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <span class="text-2xl mr-4">📱</span>
            <div>
              <p class="text-sm text-gray-600">Telegram</p>
              <p class="text-lg font-semibold text-gray-900">@opillia_shop</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSiteConfigStore } from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()
const siteConfig = computed(() => siteConfigStore.currentConfig)
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>

