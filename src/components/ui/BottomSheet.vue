<template>
  <teleport to="body">
    <transition name="bottom-sheet">
      <div
        v-if="modelValue"
        class="bottom-sheet-overlay"
        @click="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'bottom-sheet-title' : undefined"
      >
        <div
          ref="sheetRef"
          class="bottom-sheet"
          :class="{ 'bottom-sheet-full': fullHeight }"
          @click.stop
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          tabindex="-1"
        >
          <!-- Drag Handle -->
          <div class="bottom-sheet-handle-container" aria-hidden="true">
            <div class="bottom-sheet-handle"></div>
          </div>

          <!-- Header -->
          <div v-if="title || $slots.header" class="bottom-sheet-header">
            <slot name="header">
              <h3 id="bottom-sheet-title" class="bottom-sheet-title">{{ title }}</h3>
            </slot>
            <button
              v-if="showClose"
              @click="close"
              class="bottom-sheet-close"
              aria-label="Закрити"
              type="button"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="bottom-sheet-content" :class="{ 'with-footer': $slots.footer }">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="bottom-sheet-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'

interface Props {
  modelValue: boolean
  title?: string
  showClose?: boolean
  fullHeight?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showClose: true,
  fullHeight: false,
  closeOnOverlay: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const sheetRef = ref<HTMLElement>()
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Keyboard navigation
useKeyboardNavigation({
  enableEscape: true,
  onEscape: close
})

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

const handleTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY
  isDragging.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  
  currentY.value = e.touches[0].clientY
  const deltaY = currentY.value - startY.value
  
  // Only allow dragging down
  if (deltaY > 0 && sheetRef.value) {
    sheetRef.value.style.transform = `translateY(${deltaY}px)`
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value) return
  
  const deltaY = currentY.value - startY.value
  
  // Close if dragged down more than 100px
  if (deltaY > 100) {
    close()
  }
  
  // Reset position
  if (sheetRef.value) {
    sheetRef.value.style.transform = ''
  }
  
  isDragging.value = false
}

// Lock body scroll when bottom sheet is open
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    // Focus the sheet container after it's rendered
    await nextTick()
    sheetRef.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.bottom-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Desktop: Center the modal at top */
@media (min-width: 768px) {
  .bottom-sheet-overlay {
    align-items: flex-start;
    justify-content: center;
    padding: 2rem;
    padding-top: 4rem;
  }
}

.bottom-sheet {
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Desktop: Make it a centered modal */
@media (min-width: 768px) {
  .bottom-sheet {
    border-radius: 1.5rem;
    max-width: 600px;
    max-height: 80vh;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding-bottom: 0;
  }
}

.bottom-sheet-full {
  max-height: 95vh;
}

/* Desktop: Full height modal */
@media (min-width: 768px) {
  .bottom-sheet-full {
    max-height: 90vh;
  }
}

.dark .bottom-sheet {
  background: #1f2937;
}

.bottom-sheet-handle-container {
  padding: 0.75rem 0;
  display: flex;
  justify-content: center;
  cursor: grab;
}

/* Desktop: Hide drag handle */
@media (min-width: 768px) {
  .bottom-sheet-handle-container {
    display: none;
  }
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
}

.dark .bottom-sheet-handle {
  background: #4b5563;
}

.bottom-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .bottom-sheet-header {
  border-bottom-color: #374151;
}

.bottom-sheet-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dark .bottom-sheet-title {
  color: #f9fafb;
}

.bottom-sheet-close {
  background: none;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-sheet-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .bottom-sheet-close {
  color: #9ca3af;
}

.dark .bottom-sheet-close:hover {
  background: #374151;
  color: #f9fafb;
}

.bottom-sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  -webkit-overflow-scrolling: touch;
}

.bottom-sheet-content.with-footer {
  padding-bottom: 0;
}

.bottom-sheet-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.dark .bottom-sheet-footer {
  border-top-color: #374151;
  background: #1f2937;
}

/* Animations - Slide up from bottom (like More menu) */
.bottom-sheet-enter-active {
  transition: all 0.3s ease-out;
}

.bottom-sheet-leave-active {
  transition: all 0.3s ease-in;
}

.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .bottom-sheet,
.bottom-sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}

.bottom-sheet-enter-to .bottom-sheet {
  transform: translateY(0);
}

/* Desktop: Scale animation */
@media (min-width: 768px) {
  .bottom-sheet-enter-from .bottom-sheet,
  .bottom-sheet-leave-to .bottom-sheet {
    transform: translateY(0) scale(0.95);
  }

  .bottom-sheet-enter-to .bottom-sheet {
    transform: translateY(0) scale(1);
  }
}
</style>
