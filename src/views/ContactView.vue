<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            ← Повернутися до магазину
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Зв'язатися з нами</h1>

        <!-- Hero Section -->
        <div class="text-center mb-12">
          <div class="text-6xl mb-4">📞</div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Ми завжди готові допомогти
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Зв'яжіться з нами будь-яким зручним способом. Наша команда відповість на всі ваші питання.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Information -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Контактна інформація</h3>
            
            <!-- Main Office -->
            <div class="mb-8">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🏢 Контакти</h4>
              <div class="space-y-3">
                <div class="flex items-start">
                  <span class="text-primary-600 mr-3 mt-1">📞</span>
                  <div>
                    <p class="font-medium">Телефон:</p>
                    <p class="text-gray-600">+38 (097) 324 46 68</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <span class="text-primary-600 mr-3 mt-1">✉️</span>
                  <div>
                    <p class="font-medium">Email:</p>
                    <p class="text-gray-600">info@opillia.com.ua</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <span class="text-primary-600 mr-3 mt-1">📍</span>
                  <div>
                    <p class="font-medium">Адреса:</p>
                    <p class="text-gray-600">вулиця Костянтина Данькевича, 10, Київ</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <span class="text-primary-600 mr-3 mt-1">🕒</span>
                  <div>
                    <p class="font-medium">Години роботи:</p>
                    <p class="text-gray-600">Щодня 10:00-22:00</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mb-8">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🚚 Доставка</h4>
              <div class="space-y-3">
                <div class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">🕒</span>
                  <div>
                    <p class="font-medium">Час доставки:</p>
                    <p class="text-gray-600">Щодня: 10:00-22:00</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">📍</span>
                  <div>
                    <p class="font-medium">Зона доставки:</p>
                    <p class="text-gray-600">Київ (в межах міста)</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <span class="text-blue-600 mr-3 mt-1">💰</span>
                  <div>
                    <p class="font-medium">Вартість доставки:</p>
                    <p class="text-gray-600">99 ₴ (до 2 км), +30 ₴ за кожен додатковий км</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">🌐 Ми в соціальних мережах</h4>
              <div class="flex space-x-4">
                <a href="https://www.facebook.com/opillia" target="_blank" class="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                  📘 Facebook
                </a>
                <a href="https://www.instagram.com/opillia" target="_blank" class="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors">
                  📷 Instagram
                </a>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Написати нам</h3>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ваше ім'я"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <UkrainianPhoneInput
                  v-model="form.phone"
                  placeholder="+38 (0__) ___-__-__"
                  input-class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Тема звернення *
                </label>
                <select
                  v-model="form.subject"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Оберіть тему</option>
                  <option value="general">Загальні питання</option>
                  <option value="order">Питання по замовленню</option>
                  <option value="delivery">Доставка</option>
                  <option value="quality">Якість продукції</option>
                  <option value="cooperation">Співпраця</option>
                  <option value="complaint">Скарга</option>
                  <option value="suggestion">Пропозиція</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Повідомлення *
                </label>
                <textarea
                  v-model="form.message"
                  required
                  rows="5"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Опишіть ваше питання або пропозицію..."
                ></textarea>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.consent"
                  type="checkbox"
                  required
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label class="ml-2 text-sm text-gray-600">
                  Я погоджуюся з <a href="#" class="text-primary-600 hover:underline">обробкою персональних даних</a> *
                </label>
              </div>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full btn-primary disabled:opacity-50"
              >
                {{ isSubmitting ? 'Відправляємо...' : 'Відправити повідомлення' }}
              </button>
            </form>

            <!-- Success Message -->
            <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center">
                <span class="text-green-500 mr-2">✅</span>
                <p class="text-green-800">Дякуємо! Ваше повідомлення успішно відправлено. Ми зв'яжемося з вами найближчим часом.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16 pt-12 border-t border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Часті питання</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">❓ Як оформити замовлення?</h4>
              <p class="text-gray-600 text-sm">Оберіть товари, додайте їх до кошика та оформіть замовлення через сайт або зателефонуйте нам.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">🚚 Скільки коштує доставка?</h4>
              <p class="text-gray-600 text-sm">Доставка по Києву - 99 грн (до 2 км), +30 грн за кожен додатковий кілометр.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">⏰ Час доставки?</h4>
              <p class="text-gray-600 text-sm">Стандартна доставка - 1-2 години. Експрес доставка - до 1 години.</p>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">💳 Способи оплати?</h4>
              <p class="text-gray-600 text-sm">Готівка, картка, безготівковий розрахунок, онлайн оплата.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UkrainianPhoneInput from '@/components/ui/UkrainianPhoneInput.vue'

// Form state
const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  consent: false
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

// Form submission
const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset form
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      consent: false
    }
    
    showSuccess.value = true
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
    
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Page meta
document.title = 'Зв\'язатися з нами - PWA Shop'
</script>
