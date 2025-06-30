<template>
  <div class="bottle-selector bg-gray-100 p-4 rounded-lg mt-4">
    <h4 class="font-semibold text-gray-800 mb-3">Оберіть пляшки для розливу</h4>
    
    <!-- Bottle Options -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div
        v-for="bottleSize in BOTTLE_SIZES"
        :key="bottleSize.size"
        class="bottle-option text-center"
      >
        <!-- Bottle Icon -->
        <div class="bottle-icon mb-2 flex justify-center">
          <div class="w-12 h-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm relative">
            {{ bottleSize.size.replace('L', '') }}
            <div class="absolute -top-1 w-3 h-2 bg-red-600 rounded-t"></div>
          </div>
        </div>
        
        <!-- Quantity Selector -->
        <div class="quantity-selector">
          <div v-if="bottles[bottleSize.size] === 0" class="add-bottle">
            <button
              @click="addBottle(bottleSize.size)"
              class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors"
            >
              +
            </button>
          </div>
          
          <div v-else class="quantity-controls flex items-center justify-center space-x-1">
            <button
              @click="decreaseBottle(bottleSize.size)"
              class="w-6 h-6 bg-gray-300 text-gray-700 rounded flex items-center justify-center text-sm font-bold hover:bg-gray-400 transition-colors"
            >
              −
            </button>
            <span class="w-8 text-center font-semibold text-sm">{{ bottles[bottleSize.size] }}</span>
            <button
              @click="increaseBottle(bottleSize.size)"
              class="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottle Summary -->
    <div v-if="totalBottles > 0" class="bottle-summary text-sm text-gray-600 mb-3">
      <div class="flex justify-between">
        <span>Всього пляшок: {{ totalBottles }}</span>
        <span>Об'єм: {{ totalVolume }}L</span>
      </div>
      <div class="flex justify-between">
        <span>Вартість пляшок: {{ bottleCost.toFixed(2) }} грн</span>
      </div>
    </div>
    
    <!-- Validation Message -->
    <div v-if="showValidation && !isValidSelection" class="validation-message text-red-600 text-sm mb-3">
      ⚠️ Об'єм пляшок ({{ totalVolume }}L) не відповідає кількості напою ({{ beverageQuantity }}L)
    </div>
    
    <!-- Action Buttons -->
    <div class="flex space-x-2">
      <button
        @click="applySelection"
        :disabled="!isValidSelection || totalBottles === 0"
        class="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Застосувати
      </button>
      <button
        @click="cancelSelection"
        class="flex-1 btn-outline text-sm"
      >
        Відмінити
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BottleSelection } from '@/types'
import { 
  BOTTLE_SIZES, 
  calculateBottleCost, 
  getTotalBottles, 
  getTotalBottleVolume,
  validateBottleSelection,
  createEmptyBottleSelection
} from '@/utils/bottleUtils'

interface Props {
  beverageQuantity: number
  initialBottles?: BottleSelection
  showValidation?: boolean
}

interface Emits {
  (e: 'apply', bottles: BottleSelection, cost: number): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  showValidation: true,
  initialBottles: () => createEmptyBottleSelection()
})

const emit = defineEmits<Emits>()

// State
const bottles = ref<BottleSelection>({ ...props.initialBottles })

// Computed
const totalBottles = computed(() => getTotalBottles(bottles.value))
const totalVolume = computed(() => getTotalBottleVolume(bottles.value))
const bottleCost = computed(() => calculateBottleCost(bottles.value))
const isValidSelection = computed(() => 
  validateBottleSelection(props.beverageQuantity, bottles.value)
)

// Methods
const addBottle = (size: string) => {
  bottles.value[size] = 1
}

const increaseBottle = (size: string) => {
  bottles.value[size] = (bottles.value[size] || 0) + 1
}

const decreaseBottle = (size: string) => {
  if (bottles.value[size] > 0) {
    bottles.value[size]--
  }
}

const applySelection = () => {
  if (isValidSelection.value && totalBottles.value > 0) {
    emit('apply', { ...bottles.value }, bottleCost.value)
  }
}

const cancelSelection = () => {
  emit('cancel')
}

// Watch for prop changes
watch(() => props.initialBottles, (newBottles) => {
  bottles.value = { ...newBottles }
}, { deep: true })
</script>

<style scoped>
.bottle-selector {
  border: 2px solid #e5e7eb;
}

.bottle-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.quantity-controls {
  min-height: 32px;
}

.add-bottle {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
