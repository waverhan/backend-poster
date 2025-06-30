import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  },
})

// Initialize Capacitor plugins
const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    // Configure status bar for native platforms
    await StatusBar.setStyle({ style: Style.Default })
    await StatusBar.setBackgroundColor({ color: '#2563eb' })
  }
}

// Create Vue app
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Use i18n for internationalization
app.use(i18n)

// Initialize Capacitor
initializeCapacitor().catch(console.error)

// Mount the app
app.mount('#app')

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err, info)
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Log app initialization
console.log('PWA POS System initialized')
console.log('Platform:', Capacitor.getPlatform())
console.log('Native:', Capacitor.isNativePlatform())
