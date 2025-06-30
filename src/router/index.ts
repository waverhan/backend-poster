import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSiteConfigStore } from '@/stores/siteConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'PWA POS - Modern Location-Based Shopping',
        requiresAuth: false
      }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/ShopView.vue'),
      meta: {
        title: 'Shop - Browse Products',
        requiresAuth: false
      }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetailView.vue'),
      meta: {
        title: 'Product Details',
        requiresAuth: false
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: {
        title: 'Shopping Cart',
        requiresAuth: false
      }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: {
        title: 'Checkout',
        requiresAuth: false
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: {
        title: 'Order History',
        requiresAuth: true
      }
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetailView.vue'),
      meta: {
        title: 'Order Details',
        requiresAuth: true
      }
    },
    {
      path: '/order-success/:id?',
      name: 'order-success',
      component: () => import('@/views/OrderSuccessView.vue'),
      meta: {
        title: 'Замовлення оформлено - PWA Shop',
        requiresAuth: false
      }
    },
    {
      path: '/review-order/:orderId',
      name: 'review-order',
      component: () => import('@/views/ReviewOrderView.vue'),
      meta: {
        title: 'Review Your Order',
        requiresAuth: false
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: {
        title: 'User Profile',
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        title: 'Login',
        requiresAuth: false,
        hideForAuth: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: {
        title: 'Register',
        requiresAuth: false,
        hideForAuth: true
      }
    },
    {
      path: '/branches',
      name: 'branches',
      component: () => import('@/views/BranchesView.vue'),
      meta: {
        title: 'Наші магазини - PWA Shop',
        requiresAuth: false
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue'),
      meta: {
        title: 'Зв\'язатися з нами - PWA Shop',
        requiresAuth: false
      }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: {
        title: 'Notifications',
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: 'Про нас - PWA Shop',
        requiresAuth: false
      }
    },
    {
      path: '/capacitor-demo',
      name: 'capacitor-demo',
      component: () => import('@/views/CapacitorDemoView.vue'),
      meta: {
        title: 'Capacitor.js Demo',
        requiresAuth: false
      }
    },
    {
      path: '/location-demo',
      name: 'location-demo',
      component: () => import('@/views/LocationDemo.vue'),
      meta: {
        title: 'Location Services Demo',
        requiresAuth: false
      }
    },
    {
      path: '/communication-demo',
      name: 'communication-demo',
      component: () => import('@/views/CommunicationDemoView.vue'),
      meta: {
        title: 'AI Communication & Review System Demo',
        requiresAuth: false
      }
    },
    {
      path: '/demo/address-map',
      name: 'address-map-demo',
      component: () => import('@/views/AddressMapDemoView.vue'),
      meta: {
        title: 'Address Autocomplete & Map Demo',
        requiresAuth: false
      }
    },
    {
      path: '/test-quantities',
      name: 'test-quantities',
      component: () => import('@/views/TestCustomQuantities.vue'),
      meta: {
        title: 'Test Custom Quantities',
        requiresAuth: false
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: {
        title: 'Shop Admin',
        requiresAuth: false
      }
    },
    {
      path: '/admin/messaging',
      name: 'admin-messaging',
      component: () => import('@/views/admin/MessagingView.vue'),
      meta: {
        title: 'Messaging Configuration',
        requiresAuth: false
      }
    },
    {
      path: '/admin/design',
      name: 'admin-design',
      component: () => import('@/views/admin/DesignView.vue'),
      meta: {
        title: 'Design Customization',
        requiresAuth: false
      }
    },
    {
      path: '/test-license',
      name: 'test-license',
      component: () => import('@/views/TestLicense.vue'),
      meta: {
        title: 'License System Test',
        requiresAuth: false
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found',
        requiresAuth: false
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const siteConfigStore = useSiteConfigStore()

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Handle homepage redirect based on configuration
  if (to.name === 'home') {
    // Ensure site config is loaded
    if (!siteConfigStore.isConfigured) {
      await siteConfigStore.initialize()
    }

    // Redirect to shop if homepage type is set to 'shop'
    if (siteConfigStore.currentConfig.homepage_type === 'shop') {
      next({ name: 'shop', replace: true })
      return
    }
  }

  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if authentication required
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Redirect authenticated users away from auth pages
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
