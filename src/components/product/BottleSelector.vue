<template>
  <div class="bottle-selector bg-gray-50 p-0 rounded-xl mt-4 border border-gray-200 shadow-sm max-w-xs mx-auto">
    <h4 class="font-bold text-gray-800 mb-2 text-sm text-center p-2">🍾 Оберіть пляшки для розливу</h4>

    <!-- Bottle Options -->
    <div class="grid grid-cols-2 gap-1 mb-1 px-2">
      <div
        v-for="bottleSize in BOTTLE_SIZES"
        :key="bottleSize.size"
        class="bottle-option text-center"
      >
        <!-- Bottle Icon -->
        <div class="bottle-icon mb-1 flex justify-center">
          <div class="w-8 h-12 bg-red-500 rounded-md flex items-center justify-center text-white font-bold text-xs relative shadow-md">
            {{ bottleSize.size.replace('L', '') }}
            <div class="absolute -top-0.5 w-2 h-1.5 bg-red-600 rounded-t"></div>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div class="quantity-selector">
          <div v-if="bottles[bottleSize.size] === 0" class="add-bottle">
            <button
              @click="addBottle(bottleSize.size)"
              class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors shadow-sm"
            >
              +
            </button>
          </div>

          <div v-else class="quantity-controls flex items-center justify-center space-x-1">
            <button
              @click="decreaseBottle(bottleSize.size)"
              class="w-5 h-5 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold hover:bg-gray-400 transition-colors shadow-sm"
            >
              −
            </button>
            <span class="w-4 text-center font-bold text-xs text-gray-800">{{ bottles[bottleSize.size] }}</span>
            <button
              @click="increaseBottle(bottleSize.size)"
              class="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottle Summary -->
    <div v-if="totalBottles > 0" class="bottle-summary bg-blue-50 p-2 rounded-lg text-xs text-gray-700 mb-2 mx-2">
      <div class="grid grid-cols-2 gap-2 mb-1">
        <div class="text-center">
          <span class="font-semibold">Всього пляшок:</span>
          <div class="text-sm font-bold text-blue-600">{{ totalBottles }}</div>
        </div>
        <div class="text-center">
          <span class="font-semibold">Об'єм:</span>
          <div class="text-sm font-bold text-blue-600">{{ totalVolume }}L</div>
        </div>
      </div>
      <div class="text-center">
        <span class="font-semibold">Вартість пляшок:</span>
        <div class="text-sm font-bold text-green-600">{{ bottleCost.toFixed(2) }} грн</div>
      </div>
    </div>

    <!-- Validation Message -->
    <div v-if="showValidation && !isValidSelection" class="validation-message bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-lg mb-2 mx-2">
      <div class="flex items-center">
        <span class="text-red-500 mr-1">⚠️</span>
        <span>Об'єм пляшок ({{ totalVolume }}L) не відповідає кількості напою ({{ beverageQuantity }}L)</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-1 mt-2 p-2">
      <button
        @click="applySelection"
        :disabled="!isValidSelection || totalBottles === 0"
        class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors text-xs"
      >
        Застосувати
      </button>
      <button
        @click="cancelSelection"
        class="flex-1 px-2 py-1 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-md transition-colors text-xs"
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  max-width: 320px;
  width: 100%;
}

.bottle-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.2s ease;
}

.bottle-icon:hover {
  transform: translateY(-1px);
}

.quantity-controls {
  min-height: 24px;
  gap: 4px;
}

.add-bottle {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottle-option {
  padding: 4px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.bottle-option:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .bottle-selector {
    max-width: 100%;
  }

  .quantity-controls {
    gap: 3px;
    min-height: 20px;
  }

  .add-bottle {
    min-height: 20px;
  }

  .bottle-option {
    padding: 2px;
  }
}

@media (min-width: 641px) {
  .bottle-selector {
    max-width: 320px;
  }

  .quantity-controls {
    gap: 4px;
    min-height: 24px;
  }

  .add-bottle {
    min-height: 24px;
  }

  .bottle-option {
    padding: 4px;
  }
}
</style>
