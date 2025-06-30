<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          📱 Capacitor.js Integration Demo
        </h1>
        <p class="text-xl text-gray-600 mb-6">
          Experience native mobile features in our PWA POS system
        </p>
        <div class="flex justify-center space-x-4 text-sm">
          <span class="badge-primary">{{ platformInfo.platform }}</span>
          <span class="badge-success">{{ platformInfo.isNative ? 'Native App' : 'Web Browser' }}</span>
          <span class="badge-primary">Capacitor {{ platformInfo.version }}</span>
        </div>
      </div>

      <!-- Platform Info -->
      <div class="card p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">🔧 Platform Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl mb-2">{{ platformInfo.isNative ? '📱' : '🌐' }}</div>
            <h3 class="font-semibold">Environment</h3>
            <p class="text-gray-600">{{ platformInfo.isNative ? 'Native Mobile App' : 'Web Browser' }}</p>
          </div>
          <div class="text-center">
            <div class="text-3xl mb-2">⚙️</div>
            <h3 class="font-semibold">Platform</h3>
            <p class="text-gray-600">{{ platformInfo.platform }}</p>
          </div>
          <div class="text-center">
            <div class="text-3xl mb-2">🔌</div>
            <h3 class="font-semibold">Available Plugins</h3>
            <p class="text-gray-600">{{ availablePlugins.length }} plugins</p>
          </div>
        </div>
      </div>

      <!-- Available Plugins -->
      <div class="card p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">🔌 Available Capacitor Plugins</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="plugin in availablePlugins" 
            :key="plugin.name"
            :class="[
              'text-center p-3 rounded-lg border',
              plugin.available 
                ? 'bg-success-50 border-success-200 text-success-800' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            ]"
          >
            <div class="text-2xl mb-1">{{ plugin.icon }}</div>
            <div class="text-xs font-medium">{{ plugin.name }}</div>
            <div class="text-xs">{{ plugin.available ? '✅' : '❌' }}</div>
          </div>
        </div>
      </div>

      <!-- Demo Component -->
      <CapacitorDemo />

      <!-- Usage Instructions -->
      <div class="card p-6 mt-8">
        <h2 class="text-2xl font-bold mb-4">📖 Usage Instructions</h2>
        <div class="space-y-4 text-sm text-gray-600">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">🌐 Web Browser</h3>
              <ul class="space-y-1">
                <li>• Location services work with browser permissions</li>
                <li>• Haptics use vibration API (if supported)</li>
                <li>• Camera/Gallery not available</li>
                <li>• Notifications use browser notifications</li>
                <li>• Clipboard uses web clipboard API</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">📱 Native Mobile App</h3>
              <ul class="space-y-1">
                <li>• Full access to device camera and gallery</li>
                <li>• Native haptic feedback patterns</li>
                <li>• Local file system access</li>
                <li>• Native sharing capabilities</li>
                <li>• Screen orientation controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Build Instructions -->
      <div class="card p-6 mt-8">
        <h2 class="text-2xl font-bold mb-4">🚀 Build for Mobile</h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div class="mb-2"># Build the web app</div>
          <div class="mb-2">npm run build</div>
          <div class="mb-4">npm run cap:sync</div>
          
          <div class="mb-2"># Add mobile platforms</div>
          <div class="mb-2">npm run cap:add ios</div>
          <div class="mb-4">npm run cap:add android</div>
          
          <div class="mb-2"># Open in native IDEs</div>
          <div class="mb-2">npm run cap:open ios</div>
          <div class="mb-2">npm run cap:open android</div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="text-center mt-8">
        <router-link to="/shop" class="btn-primary mr-4">
          🛒 Back to Shop
        </router-link>
        <router-link to="/about" class="btn-outline">
          ℹ️ About PWA POS
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import CapacitorDemo from '@/components/demo/CapacitorDemo.vue'

// Platform info
const platformInfo = ref({
  platform: 'unknown',
  isNative: false,
  version: '5.x'
})

// Available plugins
const availablePlugins = ref([
  { name: 'Geolocation', icon: '📍', available: false },
  { name: 'Camera', icon: '📷', available: false },
  { name: 'Haptics', icon: '📳', available: false },
  { name: 'Network', icon: '🌐', available: false },
  { name: 'Device', icon: '📱', available: false },
  { name: 'Filesystem', icon: '📁', available: false },
  { name: 'Share', icon: '📤', available: false },
  { name: 'Toast', icon: '🍞', available: false },
  { name: 'Notifications', icon: '🔔', available: false },
  { name: 'Clipboard', icon: '📋', available: false },
  { name: 'Browser', icon: '🌍', available: false },
  { name: 'Keyboard', icon: '⌨️', available: false },
  { name: 'Orientation', icon: '🔄', available: false },
  { name: 'Push', icon: '📨', available: false },
  { name: 'StatusBar', icon: '📊', available: false }
])

// Check plugin availability
const checkPluginAvailability = () => {
  const pluginNames = [
    'Geolocation', 'Camera', 'Haptics', 'Network', 'Device',
    'Filesystem', 'Share', 'Toast', 'LocalNotifications', 'Clipboard',
    'Browser', 'Keyboard', 'ScreenOrientation', 'PushNotifications', 'StatusBar'
  ]

  availablePlugins.value.forEach((plugin, index) => {
    plugin.available = Capacitor.isPluginAvailable(pluginNames[index])
  })
}

// Initialize
onMounted(() => {
  platformInfo.value = {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    version: '5.x'
  }
  
  checkPluginAvailability()
})
</script>
