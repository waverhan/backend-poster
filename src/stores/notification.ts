import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification, NotificationType } from '@/types'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const maxNotifications = ref(5)

  // Getters
  const activeNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const unreadCount = computed(() => {
    return activeNotifications.value.length
  })

  const hasUnread = computed(() => {
    return unreadCount.value > 0
  })

  // Actions
  const add = (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const newNotification: Notification = {
      id: generateId(),
      created_at: new Date().toISOString(),
      read: false,
      duration: 5000, // Default 5 seconds
      ...notification
    }

    notifications.value.unshift(newNotification)

    // Limit number of notifications
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }

    // Auto-remove if duration is set and not persistent
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        remove(newNotification.id)
      }, newNotification.duration)
    }

    return newNotification.id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  const clear = () => {
    notifications.value = []
  }

  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read)
  }

  // Convenience methods for different types
  const success = (title: string, message: string, options?: Partial<Notification>) => {
    return add({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message: string, options?: Partial<Notification>) => {
    return add({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    })
  }

  const warning = (title: string, message: string, options?: Partial<Notification>) => {
    return add({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message: string, options?: Partial<Notification>) => {
    return add({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  // Utility functions
  const generateId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return 'success'
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'primary'
      default:
        return 'primary'
    }
  }

  return {
    // State
    notifications,
    maxNotifications,
    
    // Getters
    activeNotifications,
    unreadCount,
    hasUnread,
    
    // Actions
    add,
    remove,
    markAsRead,
    markAllAsRead,
    clear,
    clearRead,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor
  }
})
