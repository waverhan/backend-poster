import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { posterApi } from '@/services/posterApi'
import { backendApi } from '@/services/backendApi'
import type { Product, Category } from '@/types'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const selectedCategory = ref<Category | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Getters
  const availableProducts = computed(() => {
    // Safety check to prevent array errors
    if (!Array.isArray(products.value)) {
      console.warn('⚠️ products.value is not an array:', products.value)
      return []
    }

    return products.value.filter(product => {
      // Safety check for product object
      if (!product || typeof product !== 'object') return false

      // Product must be active
      if (!product.is_active) return false

      // If quantity is defined (inventory data loaded), check availability and quantity
      if (product.quantity !== undefined) {
        return product.available && product.quantity > 0
      }

      // If no inventory data, just check if product is marked as available
      return product.available
    })
  })

  const productsByCategory = computed(() => {
    if (!selectedCategory.value) return availableProducts.value

    const filtered = availableProducts.value.filter(product =>
      String(product.category_id) === String(selectedCategory.value?.id)
    )

    return filtered
  })

  const inStockProducts = computed(() => {
    return availableProducts.value.filter(product => product.quantity > 0)
  })

  const outOfStockProducts = computed(() => {
    return availableProducts.value.filter(product => product.quantity === 0)
  })

  const productById = computed(() => {
    return (id: string) => products.value.find(product => product.id === id)
  })

  const productsOnSale = computed(() => {
    return availableProducts.value.filter(product =>
      product.original_price && product.original_price > product.price
    )
  })

  const categoriesWithProducts = computed(() => {
    // Safety check for categories array
    if (!Array.isArray(categories.value)) {
      console.warn('⚠️ categories.value is not an array:', categories.value)
      return []
    }

    // Always show all active categories for now, regardless of products
    // This ensures categories are visible while we debug the matching
    const activeCategories = categories.value.filter(category => category && category.is_active)

    // Debug: Log category-product matching (disabled for cleaner console)
    // if (Array.isArray(products.value) && products.value.length > 0 && activeCategories.length > 0) {
    //   // Debugging code temporarily disabled
    // }

    return activeCategories
  })

  const isDataStale = computed(() => {
    if (!lastFetched.value) return true
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    return lastFetched.value < thirtyMinutesAgo
  })

  // Actions
  const fetchCategories = async (force = false, useDatabase = true, includeInactive = false) => {
    if (isLoading.value) return
    if (!force && categories.value.length > 0 && !isDataStale.value && !includeInactive) return

    isLoading.value = true
    error.value = null

    try {
      if (useDatabase) {

        const fetchedCategories = await backendApi.getCategories(includeInactive)
        // Only filter by is_active if not explicitly including inactive items
        categories.value = includeInactive ? fetchedCategories : fetchedCategories.filter(category => category.is_active)

      } else {

        const fetchedCategories = await posterApi.getCategories()
        categories.value = includeInactive ? fetchedCategories : fetchedCategories.filter(category => category.is_active)

      }

      lastFetched.value = new Date()
      // Only save to storage if not including inactive items (for normal app usage)
      if (!includeInactive) {
        saveToStorage()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      console.error('❌ Failed to fetch categories:', err)

      // Clear any cached data on error
      categories.value = []
      localStorage.removeItem('pwa-pos-products')
    } finally {
      isLoading.value = false
    }
  }

  const fetchProducts = async (categoryId?: string, force = false, branchId?: string, useDatabase = true, includeInactive = false) => {
    if (isLoading.value) return
    if (!force && products.value.length > 0 && !isDataStale.value && !categoryId && !includeInactive) return

    isLoading.value = true
    error.value = null

    try {
      let fetchedProducts: Product[]

      if (useDatabase) {
        // Fetch from backend API with optional branch filtering

        fetchedProducts = await backendApi.getProducts(categoryId, branchId, includeInactive)

      } else {
        // Fallback to Poster API
        if (branchId) {

          fetchedProducts = await posterApi.getProductsWithInventory(branchId, categoryId)
        } else {

          fetchedProducts = await posterApi.getProducts(categoryId)
        }

      }

      if (categoryId) {
        // When loading specific category, accumulate products instead of replacing
        // Remove any existing products with this category_id first
        products.value = products.value.filter(p => String(p.category_id) !== String(categoryId))
        // Add the new products for this category
        products.value.push(...fetchedProducts)
        
      } else {
        // Replace all products when no specific category
        products.value = fetchedProducts
        
      }

      lastFetched.value = new Date()
      saveToStorage()

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch products'
      console.error('❌ Failed to fetch products:', err)

      // Don't clear products on error, keep existing data
    } finally {
      isLoading.value = false
    }
  }

  const applyInventoryFilter = async (branchId: string) => {
    if (!branchId) return

    try {
      

      // Get inventory data for all products at this branch
      const inventoryProducts = await posterApi.getProductsWithInventory(branchId)

      // Create a map of product IDs to inventory data
      const inventoryMap = new Map()
      inventoryProducts.forEach(invProduct => {
        inventoryMap.set(invProduct.id, {
          quantity: invProduct.quantity,
          available: invProduct.available,
          unit: invProduct.unit
        })
      })

      // Update existing products with inventory data
      products.value.forEach(product => {
        const inventory = inventoryMap.get(product.id)
        if (inventory) {
          product.quantity = inventory.quantity
          product.available = inventory.available
          product.unit = inventory.unit
        } else {
          // Product not available at this branch
          product.quantity = 0
          product.available = false
        }
      })

      
      saveToStorage()
    } catch (error) {
      console.error('❌ Failed to apply inventory filter:', error)
    }
  }

  const fetchProduct = async (productId: string): Promise<Product | null> => {
    try {
      const product = await posterApi.getProduct(productId)

      if (product) {
        // Update or add product in store
        const index = products.value.findIndex(p => p.id === productId)
        if (index > -1) {
          products.value[index] = product
        } else {
          products.value.push(product)
        }
        saveToStorage()
      }

      return product
    } catch (err: any) {
      console.error('Failed to fetch product:', err)
      return null
    }
  }

  const selectCategory = (category: Category | null) => {
    selectedCategory.value = category
    saveToStorage()
  }

  const clearSelectedCategory = () => {
    selectedCategory.value = null
    saveToStorage()
  }

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return availableProducts.value

    const searchTerm = query.toLowerCase().trim()

    return availableProducts.value.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.display_name.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    )
  }

  const getProductsByPriceRange = (minPrice: number, maxPrice: number): Product[] => {
    return availableProducts.value.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    )
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    const product = products.value.find(p => p.id === productId)
    if (product) {
      product.quantity = Math.max(0, quantity)
      product.available = product.quantity > 0
      saveToStorage()
    }
  }

  const refreshProducts = async () => {
    // Clear localStorage cache to force fresh data
    localStorage.removeItem('products')
    localStorage.removeItem('categories')
    await fetchProducts(undefined, true)
  }

  const refreshCategories = async () => {
    await fetchCategories(true)
  }

  const syncFromPoster = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      
      await backendApi.syncFullData()

      // Refresh local data from backend
      await fetchCategories(true, true) // force=true, useDatabase=true
      await fetchProducts(undefined, true, undefined, true) // force=true, useDatabase=true

      
    } catch (err: any) {
      error.value = err.message || 'Failed to sync data from Poster API'
      console.error('❌ Failed to sync data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const quickInventorySync = async () => {
    try {
      
      await backendApi.syncInventory()
      
    } catch (err: any) {
      console.error('❌ Quick inventory sync failed:', err)
    }
  }

  const syncImages = async () => {
    try {

      await backendApi.syncImages()

    } catch (err: any) {
      console.error('❌ Image sync failed:', err)
    }
  }

  const downloadImages = async () => {
    try {

      await backendApi.downloadImages()

    } catch (err: any) {
      console.error('❌ Image download failed:', err)
      throw err
    }
  }

  const clearCache = () => {
    products.value = []
    categories.value = []
    selectedCategory.value = null
    lastFetched.value = null
    localStorage.removeItem('pwa-pos-products')
    localStorage.removeItem('pwa-pos-categories')
    localStorage.removeItem('pwa-pos-selected-category')
    
  }

  // Persistence
  const saveToStorage = () => {
    try {
      const productData = {
        products: products.value,
        categories: categories.value,
        selectedCategory: selectedCategory.value,
        lastFetched: lastFetched.value?.toISOString()
      }
      localStorage.setItem('pwa-pos-products', JSON.stringify(productData))
    } catch (error) {
      console.error('Failed to save products to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-products')

      if (stored) {
        const productData = JSON.parse(stored)
        products.value = productData.products || []
        categories.value = productData.categories || []
        selectedCategory.value = productData.selectedCategory || null
        lastFetched.value = productData.lastFetched ? new Date(productData.lastFetched) : null
      }
    } catch (error) {
      console.error('Failed to load products from storage:', error)
      products.value = []
      categories.value = []
      selectedCategory.value = null
      lastFetched.value = null
    }
  }

  // Validation
  const validateProduct = (product: Product): boolean => {
    return (
      product &&
      product.id &&
      product.name &&
      typeof product.price === 'number' &&
      product.price >= 0 &&
      typeof product.quantity === 'number' &&
      product.quantity >= 0
    )
  }

  const validateCategory = (category: Category): boolean => {
    return (
      category &&
      category.id &&
      category.name &&
      category.display_name
    )
  }

  // Initialize from storage
  loadFromStorage()

  return {
    // State
    products,
    categories,
    selectedCategory,
    isLoading,
    error,
    lastFetched,

    // Getters
    availableProducts,
    productsByCategory,
    inStockProducts,
    outOfStockProducts,
    productById,
    productsOnSale,
    categoriesWithProducts,
    isDataStale,

    // Actions
    fetchCategories,
    fetchProducts,
    fetchProduct,
    applyInventoryFilter,
    selectCategory,
    clearSelectedCategory,
    searchProducts,
    getProductsByPriceRange,
    updateProductQuantity,
    refreshProducts,
    refreshCategories,
    syncFromPoster,
    quickInventorySync,
    syncImages,
    downloadImages,
    validateProduct,
    validateCategory,
    clearCache,

    // Persistence
    saveToStorage,
    loadFromStorage
  }
})
