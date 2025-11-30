<template>
  <div class="fixed top-4 left-4 right-4 z-[70] space-y-2 pointer-events-none">
    <div class="flex justify-end">
      <div class="w-full max-w-sm space-y-2 pointer-events-auto">
        <transition-group name="notification" tag="div">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
              getNotificationClasses(notification.type)
            ]"
          >
            <div class="p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <span class="text-xl">{{ getNotificationIcon(notification.type) }}</span>
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ notification.title }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ notification.message }}
                  </p>
                  <div v-if="notification.action" class="mt-3">
                    <button
                      @click="notification.action.handler"
                      class="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {{ notification.action.label }}
                    </button>
                  </div>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                  <button
                    @click="removeNotification(notification.id)"
                    class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span class="sr-only">Close</span>
                    <span class="text-lg">×</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
import type { NotificationType } from '@/types'

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

const removeNotification = (id: string) => {
  notificationStore.remove(id)
}

const getNotificationIcon = (type: NotificationType): string => {
  return notificationStore.getNotificationIcon(type)
}

const getNotificationClasses = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'border-l-4 border-success-500'
    case 'error':
      return 'border-l-4 border-danger-500'
    case 'warning':
      return 'border-l-4 border-warning-500'
    case 'info':
      return 'border-l-4 border-primary-500'
    default:
      return 'border-l-4 border-gray-500'
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
