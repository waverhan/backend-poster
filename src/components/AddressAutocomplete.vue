<template>
  <div class="relative">
    <!-- Input Field -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        autocomplete="off"
      />

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>

      <!-- Clear Button -->
      <button
        v-if="inputValue && !isLoading"
        @click="clearInput"
        type="button"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Suggestions Dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.id"
        :class="[
          'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0',
          'hover:bg-blue-50 transition-colors',
          selectedIndex === index ? 'bg-blue-100' : ''
        ]"
        @click="selectSuggestion(suggestion)"
        @mouseenter="selectedIndex = index"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">
              {{ suggestion.street }}
              <span v-if="suggestion.house_number" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded font-semibold">
                {{ suggestion.house_number }}
              </span>
            </div>
            <div class="text-sm text-gray-500 truncate mt-1">
              {{ suggestion.full_address }}
            </div>
            <div v-if="suggestion.district" class="text-xs text-gray-400 mt-1">
              📍 {{ suggestion.district }}
            </div>
          </div>

          <!-- Source Badge -->
          <div class="ml-2 flex-shrink-0">
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                suggestion.source === 'google' ? 'bg-green-100 text-green-800' :
                suggestion.source === 'osm' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              ]"
            >
              {{ getSourceLabel(suggestion.source) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div
      v-if="showSuggestions && suggestions.length === 0 && inputValue.length > 2 && !isLoading"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500"
    >
      <div class="text-sm">
        🔍 Адресу не знайдено в Києві
      </div>
      <div class="text-xs text-gray-400 mt-1">
        Спробуйте ввести назву вулиці та номер будинку. Наприклад: "Хрещатик 22"
      </div>
    </div>

    <!-- Manual Entry Option -->
    <div v-if="showManualEntry && inputValue.length > 2" class="mt-2">
      <button
        @click="useManualAddress"
        type="button"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        🔍 Знайти на карті: "{{ inputValue }}"
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Help Text -->
    <div v-if="showHelp" class="mt-2 text-xs text-gray-500">
      Почніть вводити назву вулиці та номер будинку. Наприклад: "Хрещатик 22", "Володимирська 15А"
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { addressAutocomplete, type AddressSuggestion } from '@/services/addressAutocomplete'

// Props
interface Props {
  modelValue?: string
  placeholder?: string
  provider?: 'google' | 'osm' | 'local' | 'auto'
  limit?: number
  showManualEntry?: boolean
  showHelp?: boolean
  disabled?: boolean
  required?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Введіть вулицю та номер будинку в Києві...',
  provider: 'auto',
  limit: 5,
  showManualEntry: true,
  showHelp: true,
  disabled: false,
  required: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [suggestion: AddressSuggestion]
  'manual': [address: string]
  'error': [error: string]
}>()

// State
const inputRef = ref<HTMLInputElement>()
const inputValue = ref('')
const suggestions = ref<AddressSuggestion[]>([])
const selectedIndex = ref(-1)
const showSuggestions = ref(false)
const isLoading = ref(false)
const error = ref('')
const searchTimeout = ref<number>()

// Computed
const inputClasses = computed(() => [
  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
  error.value ? 'border-red-300' : 'border-gray-300',
  props.class
])

// Methods
const handleInput = () => {
  error.value = ''
  emit('update:modelValue', inputValue.value)

  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Debounce search
  searchTimeout.value = window.setTimeout(async () => {
    await searchAddresses()
  }, 300)
}

const handleFocus = () => {
  if (suggestions.value.length > 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  // Delay hiding to allow click on suggestions
  setTimeout(() => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 150)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        selectSuggestion(suggestions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedIndex.value = -1
      break
  }
}

const searchAddresses = async () => {
  if (!inputValue.value || inputValue.value.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const results = await addressAutocomplete.searchAddresses(inputValue.value, {
      provider: props.provider,
      limit: props.limit
    })

    suggestions.value = results
    showSuggestions.value = results.length > 0
    selectedIndex.value = -1
  } catch (err) {
    error.value = 'Помилка пошуку адреси. Спробуйте ще раз.'
    emit('error', error.value)
    console.error('Address search error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectSuggestion = async (suggestion: AddressSuggestion) => {
  try {
    // Get detailed information if needed
    const detailedSuggestion = await addressAutocomplete.getAddressDetails(suggestion)

    inputValue.value = detailedSuggestion.full_address
    showSuggestions.value = false
    selectedIndex.value = -1

    emit('update:modelValue', detailedSuggestion.full_address)
    emit('select', detailedSuggestion)
  } catch (err) {
    error.value = 'Помилка отримання деталей адреси'
    emit('error', error.value)
  }
}

const useManualAddress = () => {
  const manualAddress = `${inputValue.value}, Київ, Україна`
  inputValue.value = manualAddress
  showSuggestions.value = false

  emit('update:modelValue', manualAddress)
  emit('manual', manualAddress)
}

const clearInput = () => {
  inputValue.value = ''
  suggestions.value = []
  showSuggestions.value = false
  selectedIndex.value = -1
  error.value = ''

  emit('update:modelValue', '')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const getSourceLabel = (source: string): string => {
  switch (source) {
    case 'google': return 'Google'
    case 'osm': return 'Карта'
    case 'local': return 'Локально'
    default: return source
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value) {
    inputValue.value = newValue || ''
  }
})

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    inputValue.value = props.modelValue
  }
})

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Expose methods for parent component
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: clearInput
})
</script>
