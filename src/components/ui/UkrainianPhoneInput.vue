<template>
  <div class="relative">
    <input
      ref="phoneInput"
      :value="formattedDisplay"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      type="text"
      :class="inputClass"
      :placeholder="placeholder"
      :required="required"
      autocomplete="off"
      inputmode="numeric"
    />
    <div v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  required?: boolean
  inputClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '+38(0___) ___-__-__',
  required: false,
  inputClass: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
})

const emit = defineEmits<Emits>()

const phoneInput = ref<HTMLInputElement>()
const error = ref('')

// Format phone number exactly like your examples
const formatPhoneNumber = (phone: string): string => {
  // Always start with the template
  let template = '+38(0___) ___-__-__'

  if (!phone) return template

  let localDigits = phone

  // If it starts with 380, convert to 0XXXXXXXXX format
  if (phone.startsWith('380') && phone.length >= 3) {
    localDigits = '0' + phone.slice(3) // Convert 380XXXXXXXXX to 0XXXXXXXXX
  } else if (!phone.startsWith('0') && phone.length > 0) {
    // If it doesn't start with 0, prepend 0
    localDigits = '0' + phone
  }

  // Limit to 10 digits (0XXXXXXXXX)
  localDigits = localDigits.slice(0, 10)

  let result = '+38('

  // Fill in the template progressively
  if (localDigits.length > 0) {
    // Fill the 0 and next 2 digits (0XX)
    result += localDigits.slice(0, 3).padEnd(3, '_')
    result += ') '

    if (localDigits.length > 3) {
      // Fill next 3 digits (XXX)
      result += localDigits.slice(3, 6).padEnd(3, '_')
      result += '-'

      if (localDigits.length > 6) {
        // Fill next 2 digits (XX)
        result += localDigits.slice(6, 8).padEnd(2, '_')
        result += '-'

        if (localDigits.length > 8) {
          // Fill last 2 digits (XX)
          result += localDigits.slice(8, 10).padEnd(2, '_')
        } else {
          result += '__'
        }
      } else {
        result += '__-__'
      }
    } else {
      result += '___-__-__'
    }
  } else {
    result += '0__) ___-__-__'
  }

  return result
}

// Computed property for display
const formattedDisplay = computed(() => {
  return formatPhoneNumber(props.modelValue)
})

// Validation
const validatePhone = (phone: string): string => {
  if (!phone) return ''

  // If it's a full phone number with 380 prefix (12 digits)
  if (phone.startsWith('380') && phone.length === 12) {
    // Valid phone number - no operator code validation needed
    return ''
  }

  // If it's partial input starting with 0
  if (phone.startsWith('0')) {
    if (phone.length < 10) return 'Номер телефону повинен містити 10 цифр (0XXXXXXXXX)'
    return ''
  }

  // If it's partial input (less than 10 digits)
  if (phone.length < 10) return 'Номер телефону повинен починатися з 0 та містити 10 цифр'

  return ''
}

// Handle input - extract digits only and enforce 10-digit limit
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let inputValue = target.value

  // Extract all digits from the input
  const allDigits = inputValue.replace(/\D/g, '')

  // If user typed digits starting with 380, remove the 380 prefix to get the local digits
  let localDigits = allDigits
  if (allDigits.startsWith('380') && allDigits.length >= 3) {
    localDigits = allDigits.substring(3)
  } else if (allDigits.startsWith('38') && allDigits.length >= 2) {
    localDigits = allDigits.substring(2)
  }

  // Ensure the number starts with 0 (Ukrainian mobile format)
  if (localDigits.length > 0 && !localDigits.startsWith('0')) {
    // If user didn't start with 0, prepend it
    localDigits = '0' + localDigits
  }

  // STRICT LIMIT: Only allow exactly 10 digits maximum
  if (localDigits.length > 10) {
    localDigits = localDigits.slice(0, 10)
  }

  // Emit the full phone number with 380 prefix if we have 10 digits starting with 0
  if (localDigits.length === 10 && localDigits.startsWith('0')) {
    // Convert 0XXXXXXXXX to 380XXXXXXXXX
    const fullNumber = '380' + localDigits.substring(1)
    emit('update:modelValue', fullNumber)
  } else if (localDigits.length > 0) {
    // For partial input, emit the local digits for validation
    emit('update:modelValue', localDigits)
  } else {
    emit('update:modelValue', '')
  }
  error.value = ''
}

// Prevent non-digit input and enforce 10-digit limit
const onKeydown = (event: KeyboardEvent) => {
  // Allow navigation keys
  if ([
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Tab', 'Enter', 'Escape'
  ].includes(event.key)) {
    return
  }

  // Allow copy/paste
  if (event.ctrlKey || event.metaKey) {
    return
  }

  // Only allow digits
  if (!/\d/.test(event.key)) {
    event.preventDefault()
    return
  }

  // Get current value and count digits
  const currentValue = props.modelValue || ''

  // If it's a 12-digit number starting with 380, we have 9 local digits
  if (currentValue.startsWith('380') && currentValue.length === 12) {
    event.preventDefault()
    return
  }

  // If it's a 10-digit number starting with 0, we have 10 local digits
  if (currentValue.startsWith('0') && currentValue.length === 10) {
    event.preventDefault()
    return
  }

  // Count total digits in current value
  const digitCount = currentValue.replace(/\D/g, '').length
  if (digitCount >= 10) {
    event.preventDefault()
  }
}

// Validate on blur
const onBlur = () => {
  error.value = validatePhone(props.modelValue)
}
</script>
