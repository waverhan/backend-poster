import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { updateSeoMeta, removeStructuredData, appendStructuredData, buildBreadcrumbSchema, absoluteUrl } from '@/utils/seoUtils'

// Prefetch critical routes on idle
const prefetchRoute = (routeName: string) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      router.getRoutes().find(r => r.name === routeName)
    })
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
      meta: {
        title: 'Опілля - Найкращі напої та делікатеси з доставкою по Києву',
        description: 'Онлайн-магазин Опілля — крафтове пиво, сидри та делікатеси з доставкою по Києву та області.',
        breadcrumb: 'Головна',
        requiresAuth: false,
        prefetch: true
      }
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import(/* webpackChunkName: "shop" */ '@/views/ShopView.vue'),
      meta: {
        title: 'Магазин - Опілля | Найкращі напої та делікатеси з доставкою по Києву',
        description: 'Каталог напоїв, делікатесів та наборів. Фільтри за стилем, міцністю та акційними пропозиціями.',
        breadcrumb: 'Магазин',
        requiresAuth: false,
        prefetch: true
      }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import(/* webpackChunkName: "product-detail" */ '@/views/ProductDetailView.vue'),
      meta: {
        title: 'Деталі товару - Опілля',
        description: 'Детальні характеристики, наявність по магазинах, відгуки та рекомендації для кожного товару.',
        requiresAuth: false,
        disableDefaultBreadcrumb: true
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import(/* webpackChunkName: "cart" */ '@/views/CartView.vue'),
      meta: {
        title: 'Кошик - Опілля',
        description: 'Перевірте товари перед оформленням: змінюйте кількість, застосовуйте промокоди та подарункові набори.',
        breadcrumb: 'Кошик',
        requiresAuth: false
      }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import(/* webpackChunkName: "checkout" */ '@/views/CheckoutView.vue'),
      meta: {
        title: 'Оформлення замовлення - Опілля',
        description: 'Вкажіть адресу доставки, контактні дані та спосіб оплати, щоб завершити покупку.',
        breadcrumb: 'Оформлення',
        requiresAuth: false
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import(/* webpackChunkName: "orders" */ '@/views/OrdersView.vue'),
      meta: {
        title: 'Order History',
        requiresAuth: true
      }
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import(/* webpackChunkName: "order-detail" */ '@/views/OrderDetailView.vue'),
      meta: {
        title: 'Order Details',
        requiresAuth: true
      }
    },
    {
      path: '/order-success/:id?',
      name: 'order-success',
      component: () => import(/* webpackChunkName: "order-success" */ '@/views/OrderSuccessView.vue'),
      meta: {
        title: 'Замовлення оформлено - PWA Shop',
        description: 'Підтвердження успішного замовлення та наступні кроки для отримання доставки.',
        breadcrumb: 'Замовлення оформлено',
        requiresAuth: false
      }
    },
    {
      path: '/review-order/:orderId',
      name: 'review-order',
      component: () => import(/* webpackChunkName: "review-order" */ '@/views/ReviewOrderView.vue'),
      meta: {
        title: 'Review Your Order',
        requiresAuth: false
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import(/* webpackChunkName: "profile" */ '@/views/ProfileView.vue'),
      meta: {
        title: 'Профіль користувача - Опілля',
        description: 'Керуйте адресами доставки, вподобаннями та історією замовлень у своєму акаунті.',
        breadcrumb: 'Профіль',
        requiresAuth: true
      }
    },
    {
      path: '/orders',
      name: 'order-history',
      component: () => import(/* webpackChunkName: "order-history" */ '@/views/OrderHistoryView.vue'),
      meta: {
        title: 'Історія замовлень - Опілля',
        description: 'Усі попередні замовлення з можливістю повторити покупку в один клік.',
        breadcrumb: 'Історія замовлень',
        requiresAuth: false // Allow access but show login prompt if not authenticated
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "auth" */ '@/views/auth/LoginView.vue'),
      meta: {
        title: 'Login',
        requiresAuth: false,
        hideForAuth: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import(/* webpackChunkName: "auth" */ '@/views/auth/RegisterView.vue'),
      meta: {
        title: 'Register',
        requiresAuth: false,
        hideForAuth: true
      }
    },
    {
      path: '/branches',
      name: 'branches',
      component: () => import(/* webpackChunkName: "branches" */ '@/views/BranchesView.vue'),
      meta: {
        title: 'Наші магазини - PWA Shop',
        description: 'Адреси фірмових магазинів Опілля, графік роботи та доступні сервіси.',
        breadcrumb: 'Магазини',
        requiresAuth: false
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import(/* webpackChunkName: "contact" */ '@/views/ContactView.vue'),
      meta: {
        title: 'Зв\'язатися з нами - PWA Shop',
        description: 'Контактний центр, месенджери та форма зворотного зв’язку Опілля.',
        breadcrumb: 'Контакти',
        requiresAuth: false
      }
    },
    {
      path: '/vacancies',
      name: 'vacancies',
      component: () => import(/* webpackChunkName: "vacancies" */ '@/views/VacanciesView.vue'),
      meta: {
        title: 'Вакансії - Опілля',
        requiresAuth: false
      }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import(/* webpackChunkName: "notifications" */ '@/views/NotificationsView.vue'),
      meta: {
        title: 'Notifications',
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
      meta: {
        title: 'Про нас - PWA Shop',
        description: 'Дізнайтесь історію бренду Опілля, цінності команди та наші підходи до сервісу.',
        breadcrumb: 'Про нас',
        requiresAuth: false
      }
    },
    {
      path: '/capacitor-demo',
      name: 'capacitor-demo',
      component: () => import(/* webpackChunkName: "demos" */ '@/views/CapacitorDemoView.vue'),
      meta: {
        title: 'Capacitor.js Demo',
        requiresAuth: false
      }
    },
    {
      path: '/location-demo',
      name: 'location-demo',
      component: () => import(/* webpackChunkName: "demos" */ '@/views/LocationDemo.vue'),
      meta: {
        title: 'Location Services Demo',
        requiresAuth: false
      }
    },
    {
      path: '/communication-demo',
      name: 'communication-demo',
      component: () => import(/* webpackChunkName: "demos" */ '@/views/CommunicationDemoView.vue'),
      meta: {
        title: 'AI Communication & Review System Demo',
        requiresAuth: false
      }
    },
    {
      path: '/demo/address-map',
      name: 'address-map-demo',
      component: () => import(/* webpackChunkName: "demos" */ '@/views/AddressMapDemoView.vue'),
      meta: {
        title: 'Address Autocomplete & Map Demo',
        requiresAuth: false
      }
    },
    {
      path: '/test-quantities',
      name: 'test-quantities',
      component: () => import(/* webpackChunkName: "tests" */ '@/views/TestCustomQuantities.vue'),
      meta: {
        title: 'Test Custom Quantities',
        requiresAuth: false
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue'),
      meta: {
        title: 'Shop Admin',
        requiresAuth: false
      }
    },
    {
      path: '/admin/messaging',
      name: 'admin-messaging',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/MessagingView.vue'),
      meta: {
        title: 'Messaging Configuration',
        requiresAuth: false
      }
    },
    {
      path: '/admin/design',
      name: 'admin-design',
      component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/DesignView.vue'),
      meta: {
        title: 'Design Customization',
        requiresAuth: false
      }
    },
    {
      path: '/test-license',
      name: 'test-license',
      component: () => import(/* webpackChunkName: "tests" */ '@/views/TestLicense.vue'),
      meta: {
        title: 'License System Test',
        requiresAuth: false
      }
    },
    {
      path: '/sitemap',
      name: 'sitemap',
      component: () => import(/* webpackChunkName: "sitemap" */ '@/views/SitemapView.vue'),
      meta: {
        title: 'Карта сайту - Опілля',
        requiresAuth: false
      }
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import(/* webpackChunkName: "privacy" */ '@/views/PrivacyPolicyView.vue'),
      meta: {
        title: 'Політика приватності - Опілля',
        description: 'Як ми обробляємо персональні дані, куки та інформацію про замовлення клієнтів.',
        breadcrumb: 'Політика приватності',
        requiresAuth: false
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import(/* webpackChunkName: "not-found" */ '@/views/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found',
        requiresAuth: false
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // If we have a saved position (back button), use it
    if (savedPosition) {
      return savedPosition
    }

    // If only query parameters changed (same route/path), don't scroll
    if (to.path === from.path) {
      return false
    }

    // For actual route changes, scroll to top
    return { top: 0 }
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

router.afterEach((to) => {
  const siteConfigStore = useSiteConfigStore()
  const defaultTitle = siteConfigStore.currentConfig.seo_title
  const defaultDescription = siteConfigStore.currentConfig.seo_description

  const canonicalTarget = typeof to.meta.canonical === 'string' ? to.meta.canonical : to.fullPath

  updateSeoMeta({
    title: (to.meta.title as string) || defaultTitle,
    description: (to.meta.description as string) || defaultDescription,
    canonical: canonicalTarget,
    ogType: (to.meta.ogType as string) || 'website'
  })

  removeStructuredData()

  if (!to.meta.disableDefaultBreadcrumb) {
    const breadcrumbItems = [
      { name: 'Головна', url: absoluteUrl('/') }
    ]

    if (to.name !== 'home') {
      const breadcrumbLabel = (to.meta.breadcrumb as string) || (to.meta.title as string) || 'Сторінка'
      breadcrumbItems.push({
        name: breadcrumbLabel,
        url: absoluteUrl(to.fullPath || '/')
      })
    }

    if (breadcrumbItems.length > 1) {
      appendStructuredData([
        {
          id: 'route-breadcrumb',
          data: buildBreadcrumbSchema(breadcrumbItems)
        }
      ])
    }
  }
})

export default router
