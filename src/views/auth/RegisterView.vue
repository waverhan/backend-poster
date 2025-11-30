<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
    <!-- Background with logo -->
    <div class="absolute inset-0 opacity-10">
      <div class="text-center pt-20">
        <div class="text-9xl">🍺</div>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🍺</div>
        <h1 class="text-4xl font-bold text-white mb-2">{{ $t('shop.name', 'Опілля') }}</h1>
        <p class="text-blue-100">{{ $t('auth.registerSubtitle', 'Створіть акаунт для отримання бонусів') }}</p>
      </div>

      <!-- Login Modal (registration is done through phone login) -->
      <PhoneLoginModal
        @close="handleClose"
        @success="onLoginSuccess"
        @requires-profile-completion="onProfileCompletionRequired"
      />

      <!-- Guest Option -->
      <div class="mt-6 text-center">
        <p class="text-blue-100 mb-3">{{ $t('auth.orContinueAsGuest', 'Або продовжити як гість') }}</p>
        <router-link
          to="/shop"
          class="inline-block px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          {{ $t('auth.continueAsGuest', 'Продовжити як гість') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PhoneLoginModal from '@/components/auth/PhoneLoginModal.vue'

const router = useRouter()

const handleClose = () => {
  router.push('/shop')
}

const onLoginSuccess = (user: any) => {
  router.push('/profile')
}

const onProfileCompletionRequired = (user: any) => {
  router.push('/profile')
}
</script>
