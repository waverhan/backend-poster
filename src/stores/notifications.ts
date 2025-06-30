import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])

  // Actions
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Convenience methods
  const showSuccess = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }

  return {
    // State
    notifications,

    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
