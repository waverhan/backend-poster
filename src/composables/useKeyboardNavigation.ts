/**
 * Keyboard Navigation Composable
 * Provides keyboard navigation support for better accessibility
 */

import { onMounted, onUnmounted, Ref } from 'vue'

export interface KeyboardNavigationOptions {
  // Enable arrow key navigation
  enableArrowKeys?: boolean
  // Enable Enter key to activate
  enableEnter?: boolean
  // Enable Escape key to close/cancel
  enableEscape?: boolean
  // Enable Tab key navigation
  enableTab?: boolean
  // Callback when arrow up is pressed
  onArrowUp?: () => void
  // Callback when arrow down is pressed
  onArrowDown?: () => void
  // Callback when arrow left is pressed
  onArrowLeft?: () => void
  // Callback when arrow right is pressed
  onArrowRight?: () => void
  // Callback when Enter is pressed
  onEnter?: () => void
  // Callback when Escape is pressed
  onEscape?: () => void
  // Callback when Tab is pressed
  onTab?: (event: KeyboardEvent) => void
  // Container element ref (optional)
  containerRef?: Ref<HTMLElement | null>
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enableArrowKeys = true,
    enableEnter = true,
    enableEscape = true,
    enableTab = false,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onEscape,
    onTab,
    containerRef
  } = options

  const handleKeyDown = (event: KeyboardEvent) => {
    // Check if we should handle this event
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

    // Arrow keys
    if (enableArrowKeys && !isInput) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          onArrowDown?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          onArrowLeft?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onArrowRight?.()
          break
      }
    }

    // Enter key
    if (enableEnter && event.key === 'Enter') {
      onEnter?.()
    }

    // Escape key
    if (enableEscape && event.key === 'Escape') {
      event.preventDefault()
      onEscape?.()
    }

    // Tab key
    if (enableTab && event.key === 'Tab') {
      onTab?.(event)
    }
  }

  onMounted(() => {
    const element = containerRef?.value || document
    element.addEventListener('keydown', handleKeyDown as EventListener)
  })

  onUnmounted(() => {
    const element = containerRef?.value || document
    element.removeEventListener('keydown', handleKeyDown as EventListener)
  })

  return {
    handleKeyDown
  }
}

/**
 * Focus trap utility for modals and dialogs
 */
export function useFocusTrap(containerRef: Ref<HTMLElement | null>) {
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.value) return []

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    return Array.from(containerRef.value.querySelectorAll(selector))
  }

  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Shift + Tab (backwards)
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    }
    // Tab (forwards)
    else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleTabKey)

    // Focus first element when mounted
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleTabKey)
  })

  return {
    getFocusableElements
  }
}

