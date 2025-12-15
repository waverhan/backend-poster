import { ref, h, render } from 'vue'
import Toast from '@/components/ui/Toast.vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
  showClose?: boolean
}

const activeToasts = ref<HTMLElement[]>([])

export function useToast() {
  const show = (options: ToastOptions) => {
    // Create container
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    // Create toast component
    const vnode = h(Toast, {
      ...options,
      onClose: () => {
        // Remove from DOM
        render(null, container)
        document.body.removeChild(container)
        
        // Remove from active toasts
        const index = activeToasts.value.indexOf(container)
        if (index > -1) {
          activeToasts.value.splice(index, 1)
        }
      }
    })
    
    // Render toast
    render(vnode, container)
    activeToasts.value.push(container)
    
    return {
      close: () => {
        render(null, container)
        document.body.removeChild(container)
      }
    }
  }
  
  const success = (message: string, duration = 3000) => {
    return show({ message, type: 'success', duration })
  }
  
  const error = (message: string, duration = 4000) => {
    return show({ message, type: 'error', duration })
  }
  
  const warning = (message: string, duration = 3500) => {
    return show({ message, type: 'warning', duration })
  }
  
  const info = (message: string, duration = 3000) => {
    return show({ message, type: 'info', duration })
  }
  
  return {
    show,
    success,
    error,
    warning,
    info
  }
}

