import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useLocationStore } from '@/stores/location'
import { useBranchStore } from '@/stores/branch'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'

export function useClientStores() {
  // Only initialize stores on client side
  if (!import.meta.client) {
    return {
      cartStore: null,
      ordersStore: null,
      locationStore: null,
      branchStore: null,
      siteConfigStore: null,
      notificationStore: null,
      authStore: null,
      productStore: null,
    }
  }

  return {
    cartStore: useCartStore(),
    ordersStore: useOrdersStore(),
    locationStore: useLocationStore(),
    branchStore: useBranchStore(),
    siteConfigStore: useSiteConfigStore(),
    notificationStore: useNotificationStore(),
    authStore: useAuthStore(),
    productStore: useProductStore(),
  }
}

