<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🎨 Design Customization</h1>

      <!-- Live Preview -->
      <div class="card p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Live Preview</h2>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <div class="space-y-4">
            <!-- Sample Header -->
            <div class="flex items-center justify-between p-4 rounded-lg" :style="{ backgroundColor: designConfig.colors.primary + '20' }">
              <h3 class="text-lg font-semibold" :style="{ color: designConfig.colors.primary, fontSize: designConfig.typography.headingSize }">
                Sample Header
              </h3>
              <button 
                class="px-4 py-2 rounded-lg text-white font-medium"
                :style="{ 
                  backgroundColor: designConfig.colors.primary,
                  fontSize: designConfig.typography.buttonSize,
                  fontFamily: designConfig.typography.fontFamily
                }"
              >
                Primary Button
              </button>
            </div>

            <!-- Sample Card -->
            <div class="bg-white rounded-lg shadow-md p-4" :style="{ borderRadius: designConfig.layout.borderRadius + 'px' }">
              <h4 class="font-medium mb-2" :style="{ fontSize: designConfig.typography.bodySize, fontFamily: designConfig.typography.fontFamily }">
                Sample Card
              </h4>
              <p class="text-gray-600 mb-3" :style="{ fontSize: designConfig.typography.smallSize, fontFamily: designConfig.typography.fontFamily }">
                This is a preview of how your content will look with the current design settings.
              </p>
              <div class="flex space-x-2">
                <button 
                  class="px-3 py-1 rounded text-white text-sm"
                  :style="{ backgroundColor: designConfig.colors.success }"
                >
                  Success
                </button>
                <button 
                  class="px-3 py-1 rounded text-white text-sm"
                  :style="{ backgroundColor: designConfig.colors.warning }"
                >
                  Warning
                </button>
                <button 
                  class="px-3 py-1 rounded text-white text-sm"
                  :style="{ backgroundColor: designConfig.colors.danger }"
                >
                  Danger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Color Scheme -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            🎨 Color Scheme
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Primary Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.primary"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.primary"
                  type="text"
                  class="flex-1 input"
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Secondary Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.secondary"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.secondary"
                  type="text"
                  class="flex-1 input"
                  placeholder="#64748b"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Success Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.success"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.success"
                  type="text"
                  class="flex-1 input"
                  placeholder="#16a34a"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Warning Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.warning"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.warning"
                  type="text"
                  class="flex-1 input"
                  placeholder="#d97706"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Danger Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.danger"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.danger"
                  type="text"
                  class="flex-1 input"
                  placeholder="#dc2626"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Background Color</label>
              <div class="flex space-x-3">
                <input
                  v-model="designConfig.colors.background"
                  type="color"
                  class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="designConfig.colors.background"
                  type="text"
                  class="flex-1 input"
                  placeholder="#f9fafb"
                />
              </div>
            </div>
          </div>

          <!-- Color Presets -->
          <div class="mt-6">
            <label class="block text-sm font-medium mb-3">Color Presets</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in colorPresets"
                :key="preset.name"
                @click="applyColorPreset(preset)"
                class="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div class="flex items-center space-x-2 mb-1">
                  <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: preset.primary }"></div>
                  <span class="text-sm font-medium">{{ preset.name }}</span>
                </div>
                <div class="flex space-x-1">
                  <div class="w-3 h-3 rounded" :style="{ backgroundColor: preset.success }"></div>
                  <div class="w-3 h-3 rounded" :style="{ backgroundColor: preset.warning }"></div>
                  <div class="w-3 h-3 rounded" :style="{ backgroundColor: preset.danger }"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Typography -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            📝 Typography
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Font Family</label>
              <select v-model="designConfig.typography.fontFamily" class="w-full input">
                <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                <option value="system-ui, sans-serif">System Default</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Heading Size</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.typography.headingSizeNum"
                  type="range"
                  min="16"
                  max="32"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.typography.headingSizeNum }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Body Text Size</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.typography.bodySizeNum"
                  type="range"
                  min="12"
                  max="20"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.typography.bodySizeNum }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Small Text Size</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.typography.smallSizeNum"
                  type="range"
                  min="10"
                  max="16"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.typography.smallSizeNum }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Button Text Size</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.typography.buttonSizeNum"
                  type="range"
                  min="12"
                  max="18"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.typography.buttonSizeNum }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Font Weight</label>
              <select v-model="designConfig.typography.fontWeight" class="w-full input">
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Layout & Spacing -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            📐 Layout & Spacing
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Border Radius</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.layout.borderRadius"
                  type="range"
                  min="0"
                  max="20"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.layout.borderRadius }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Card Padding</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.layout.cardPadding"
                  type="range"
                  min="12"
                  max="32"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.layout.cardPadding }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Button Padding</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="designConfig.layout.buttonPadding"
                  type="range"
                  min="8"
                  max="20"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-12">{{ designConfig.layout.buttonPadding }}px</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Shadow Intensity</label>
              <select v-model="designConfig.layout.shadowIntensity" class="w-full input">
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Admin Panel Specific -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            ⚙️ Admin Panel Style
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Sidebar Style</label>
              <select v-model="designConfig.admin.sidebarStyle" class="w-full input">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="colored">Colored (Primary)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Table Style</label>
              <select v-model="designConfig.admin.tableStyle" class="w-full input">
                <option value="default">Default</option>
                <option value="striped">Striped</option>
                <option value="bordered">Bordered</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Button Style</label>
              <select v-model="designConfig.admin.buttonStyle" class="w-full input">
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Card Style</label>
              <select v-model="designConfig.admin.cardStyle" class="w-full input">
                <option value="default">Default</option>
                <option value="flat">Flat</option>
                <option value="elevated">Elevated</option>
                <option value="outlined">Outlined</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center mt-8">
        <div class="flex space-x-3">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button
            @click="exportConfig"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Export Config
          </button>
          <input
            ref="importInput"
            type="file"
            accept=".json"
            @change="importConfig"
            class="hidden"
          />
          <button
            @click="$refs.importInput.click()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Import Config
          </button>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="previewChanges"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Preview Changes
          </button>
          <button
            @click="saveDesign"
            :disabled="isLoading"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Saving...' : 'Save Design' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'

const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

// Use theme store configuration
const designConfig = computed({
  get: () => themeStore.currentConfig,
  set: (value) => themeStore.updateConfig(value)
})

// Use color presets from theme store
const colorPresets = computed(() => themeStore.colorPresets)

const isLoading = ref(false)

// Methods
const applyColorPreset = (preset: any) => {
  themeStore.applyColorPreset(preset)

  notificationStore.add({
    type: 'success',
    title: 'Color preset applied!',
    message: `Applied ${preset.name} color scheme`,
    duration: 3000
  })
}

const previewChanges = () => {
  themeStore.applyToDOM()

  notificationStore.add({
    type: 'info',
    title: 'Preview applied!',
    message: 'Design changes are now visible. Save to make them permanent.',
    duration: 5000
  })
}

const saveDesign = async () => {
  isLoading.value = true

  try {
    // Save using theme store
    themeStore.saveToStorage()
    themeStore.applyToDOM()

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    notificationStore.add({
      type: 'success',
      title: 'Design saved!',
      message: 'Your design customizations have been saved successfully.',
      duration: 5000
    })

  } catch (error) {
    console.error('Failed to save design:', error)
    notificationStore.add({
      type: 'error',
      title: 'Save failed',
      message: 'Failed to save design configuration. Please try again.',
      duration: 5000
    })
  } finally {
    isLoading.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all design settings to defaults?')) {
    themeStore.resetToDefaults()

    notificationStore.add({
      type: 'success',
      title: 'Reset complete!',
      message: 'Design settings have been reset to defaults.',
      duration: 3000
    })
  }
}

const exportConfig = () => {
  const dataStr = themeStore.exportConfig()
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'admin-design-config.json'
  link.click()

  URL.revokeObjectURL(url)

  notificationStore.add({
    type: 'success',
    title: 'Config exported!',
    message: 'Design configuration has been downloaded.',
    duration: 3000
  })
}

const importConfig = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const configString = e.target?.result as string
      const success = themeStore.importConfig(configString)

      if (success) {
        notificationStore.add({
          type: 'success',
          title: 'Config imported!',
          message: 'Design configuration has been imported successfully.',
          duration: 3000
        })
      } else {
        throw new Error('Invalid configuration')
      }
    } catch (error) {
      notificationStore.add({
        type: 'error',
        title: 'Import failed',
        message: 'Invalid configuration file. Please check the file format.',
        duration: 5000
      })
    }
  }
  reader.readAsText(file)
}

// Lifecycle
onMounted(() => {
  themeStore.initialize()
})
</script>
