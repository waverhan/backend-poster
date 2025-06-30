<template>
  <div class="card p-6">
    <h2 class="text-2xl font-bold mb-6">📱 Capacitor.js Features Demo</h2>
    
    <!-- Device Info Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📱 Device Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button @click="getDeviceInfo" class="btn-primary">
          Get Device Info
        </button>
        <button @click="getDeviceId" class="btn-secondary">
          Get Device ID
        </button>
      </div>
      <div v-if="deviceInfo" class="bg-gray-50 p-4 rounded-lg">
        <pre class="text-sm">{{ JSON.stringify(deviceInfo, null, 2) }}</pre>
      </div>
    </section>

    <!-- Location Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📍 Location Services</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button @click="getCurrentLocation" class="btn-primary">
          Get Current Location
        </button>
        <button @click="watchLocation" class="btn-secondary">
          {{ isWatching ? 'Stop Watching' : 'Watch Location' }}
        </button>
      </div>
      <div v-if="location" class="bg-gray-50 p-4 rounded-lg">
        <p><strong>Latitude:</strong> {{ location.latitude.toFixed(6) }}</p>
        <p><strong>Longitude:</strong> {{ location.longitude.toFixed(6) }}</p>
        <p><strong>Accuracy:</strong> {{ location.accuracy }}m</p>
      </div>
    </section>

    <!-- Camera Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📷 Camera & Gallery</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button @click="takePhoto" class="btn-primary">
          📷 Take Photo
        </button>
        <button @click="pickImage" class="btn-secondary">
          🖼️ Pick from Gallery
        </button>
      </div>
      <div v-if="capturedImage" class="bg-gray-50 p-4 rounded-lg">
        <img :src="capturedImage" alt="Captured" class="max-w-full h-48 object-cover rounded" />
      </div>
    </section>

    <!-- Haptics Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📳 Haptic Feedback</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button @click="hapticLight" class="btn-outline">
          Light Impact
        </button>
        <button @click="hapticMedium" class="btn-outline">
          Medium Impact
        </button>
        <button @click="hapticHeavy" class="btn-outline">
          Heavy Impact
        </button>
        <button @click="hapticSuccess" class="btn-success">
          Success
        </button>
        <button @click="hapticWarning" class="btn-outline">
          Warning
        </button>
        <button @click="hapticError" class="btn-danger">
          Error
        </button>
        <button @click="hapticSelection" class="btn-secondary">
          Selection
        </button>
      </div>
    </section>

    <!-- Notifications Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">🔔 Notifications & Toast</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button @click="showToast" class="btn-primary">
          Show Toast
        </button>
        <button @click="scheduleNotification" class="btn-secondary">
          Schedule Notification
        </button>
        <button @click="requestNotificationPermissions" class="btn-outline">
          Request Permissions
        </button>
      </div>
    </section>

    <!-- Clipboard Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📋 Clipboard</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button @click="copyToClipboard" class="btn-primary">
          Copy Order Details
        </button>
        <button @click="readFromClipboard" class="btn-secondary">
          Read Clipboard
        </button>
      </div>
      <div v-if="clipboardContent" class="bg-gray-50 p-4 rounded-lg">
        <p><strong>Clipboard:</strong> {{ clipboardContent }}</p>
      </div>
    </section>

    <!-- File System Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📁 File System</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button @click="saveOrderData" class="btn-primary">
          Save Order Data
        </button>
        <button @click="readOrderData" class="btn-secondary">
          Read Order Data
        </button>
        <button @click="deleteOrderData" class="btn-danger">
          Delete Order Data
        </button>
      </div>
      <div v-if="fileContent" class="bg-gray-50 p-4 rounded-lg">
        <p><strong>File Content:</strong> {{ fileContent }}</p>
      </div>
    </section>

    <!-- Sharing Section -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📤 Sharing</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button @click="shareOrder" class="btn-primary">
          Share Order
        </button>
        <button @click="openWebsite" class="btn-secondary">
          Open Website
        </button>
      </div>
    </section>

    <!-- Network Status -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">🌐 Network Status</h3>
      <div class="bg-gray-50 p-4 rounded-lg">
        <p><strong>Status:</strong> {{ networkStatus.connected ? '🟢 Online' : '🔴 Offline' }}</p>
        <p><strong>Type:</strong> {{ networkStatus.connectionType }}</p>
      </div>
    </section>

    <!-- Screen Orientation -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">📱 Screen Orientation</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button @click="lockPortrait" class="btn-primary">
          Lock Portrait
        </button>
        <button @click="lockLandscape" class="btn-secondary">
          Lock Landscape
        </button>
        <button @click="unlockOrientation" class="btn-outline">
          Unlock
        </button>
      </div>
      <div v-if="orientation" class="bg-gray-50 p-4 rounded-lg">
        <p><strong>Current:</strong> {{ orientation }}</p>
      </div>
    </section>

    <!-- Keyboard Controls -->
    <section class="mb-8">
      <h3 class="text-lg font-semibold mb-4">⌨️ Keyboard Controls</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input 
          v-model="testInput" 
          placeholder="Test input field"
          class="input"
        />
        <div class="flex gap-2">
          <button @click="hideKeyboard" class="btn-secondary">
            Hide Keyboard
          </button>
          <button @click="showKeyboard" class="btn-outline">
            Show Keyboard
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { capacitorService } from '@/services/capacitor'
import { useNetworkStore } from '@/stores/network'
import { storeToRefs } from 'pinia'

// Network store
const networkStore = useNetworkStore()
const { networkStatus } = storeToRefs(networkStore)

// Reactive data
const deviceInfo = ref<any>(null)
const deviceId = ref<string | null>(null)
const location = ref<any>(null)
const isWatching = ref(false)
const watchId = ref<string | null>(null)
const capturedImage = ref<string | null>(null)
const clipboardContent = ref<string | null>(null)
const fileContent = ref<string | null>(null)
const orientation = ref<string | null>(null)
const testInput = ref('')

// Device Info Methods
const getDeviceInfo = async () => {
  deviceInfo.value = await capacitorService.getDeviceInfo()
}

const getDeviceId = async () => {
  deviceId.value = await capacitorService.getDeviceId()
  if (deviceId.value) {
    deviceInfo.value = { ...deviceInfo.value, deviceId: deviceId.value }
  }
}

// Location Methods
const getCurrentLocation = async () => {
  try {
    location.value = await capacitorService.getCurrentPosition()
  } catch (error) {
    console.error('Location error:', error)
  }
}

const watchLocation = async () => {
  if (isWatching.value && watchId.value) {
    await capacitorService.clearWatch(watchId.value)
    isWatching.value = false
    watchId.value = null
  } else {
    try {
      watchId.value = await capacitorService.watchPosition((pos) => {
        location.value = pos
      })
      isWatching.value = true
    } catch (error) {
      console.error('Watch location error:', error)
    }
  }
}

// Camera Methods
const takePhoto = async () => {
  try {
    capturedImage.value = await capacitorService.takePhoto()
  } catch (error) {
    console.error('Camera error:', error)
  }
}

const pickImage = async () => {
  try {
    capturedImage.value = await capacitorService.pickImage()
  } catch (error) {
    console.error('Gallery error:', error)
  }
}

// Haptic Methods
const hapticLight = () => capacitorService.hapticImpact('light')
const hapticMedium = () => capacitorService.hapticImpact('medium')
const hapticHeavy = () => capacitorService.hapticImpact('heavy')
const hapticSuccess = () => capacitorService.hapticNotification('success')
const hapticWarning = () => capacitorService.hapticNotification('warning')
const hapticError = () => capacitorService.hapticNotification('error')
const hapticSelection = () => capacitorService.hapticSelection()

// Notification Methods
const showToast = () => {
  capacitorService.showToast('Hello from PWA POS! 🛒', 'long')
}

const scheduleNotification = () => {
  capacitorService.scheduleNotification(
    'Order Ready! 🍕',
    'Your order #12345 is ready for pickup',
    Date.now()
  )
}

const requestNotificationPermissions = async () => {
  const granted = await capacitorService.requestNotificationPermissions()
  await capacitorService.showToast(granted ? 'Permissions granted!' : 'Permissions denied', 'short')
}

// Clipboard Methods
const copyToClipboard = async () => {
  const orderDetails = `Order #12345
Items: 2x Pizza, 1x Coke
Total: 299 UAH
Delivery: 99 UAH
Branch: Main Street Store`
  
  const success = await capacitorService.copyToClipboard(orderDetails)
  if (success) {
    await capacitorService.showToast('Order details copied!', 'short')
  }
}

const readFromClipboard = async () => {
  clipboardContent.value = await capacitorService.readFromClipboard()
}

// File System Methods
const saveOrderData = async () => {
  const orderData = JSON.stringify({
    orderId: '12345',
    items: ['Pizza', 'Coke'],
    total: 299,
    timestamp: new Date().toISOString()
  })
  
  const success = await capacitorService.saveFile('order_12345.json', orderData)
  if (success) {
    await capacitorService.showToast('Order data saved!', 'short')
  }
}

const readOrderData = async () => {
  fileContent.value = await capacitorService.readFile('order_12345.json')
}

const deleteOrderData = async () => {
  const success = await capacitorService.deleteFile('order_12345.json')
  if (success) {
    fileContent.value = null
    await capacitorService.showToast('Order data deleted!', 'short')
  }
}

// Sharing Methods
const shareOrder = async () => {
  await capacitorService.share(
    'PWA POS Order',
    'Check out my order from PWA POS! Order #12345 - Total: 299 UAH',
    'https://pwa-pos.example.com/order/12345'
  )
}

const openWebsite = async () => {
  await capacitorService.openUrl('https://capacitorjs.com')
}

// Orientation Methods
const lockPortrait = async () => {
  const success = await capacitorService.lockOrientation('portrait')
  if (success) {
    orientation.value = 'portrait (locked)'
  }
}

const lockLandscape = async () => {
  const success = await capacitorService.lockOrientation('landscape')
  if (success) {
    orientation.value = 'landscape (locked)'
  }
}

const unlockOrientation = async () => {
  const success = await capacitorService.unlockOrientation()
  if (success) {
    orientation.value = await capacitorService.getCurrentOrientation()
  }
}

// Keyboard Methods
const hideKeyboard = () => {
  capacitorService.hideKeyboard()
}

const showKeyboard = () => {
  capacitorService.showKeyboard()
}

// Lifecycle
onMounted(async () => {
  // Initialize network monitoring
  await networkStore.initialize()
  
  // Get initial orientation
  orientation.value = await capacitorService.getCurrentOrientation()
  
  // Get initial device info
  await getDeviceInfo()
})

onUnmounted(async () => {
  // Clean up location watching
  if (watchId.value) {
    await capacitorService.clearWatch(watchId.value)
  }
  
  // Clean up network monitoring
  networkStore.cleanup()
})
</script>
