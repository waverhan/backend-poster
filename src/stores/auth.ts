import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, RegisterForm } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return user.value !== null && token.value !== null
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.email === 'admin@opillia.com.ua'
  })

  const canAccessAdmin = computed(() => {
    return isAuthenticated.value && isAdmin.value
  })

  const userInitials = computed(() => {
    if (!user.value?.name) return 'U'
    return user.value.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  // Actions
  const login = async (credentials: LoginForm): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Mock login - in real app, call your API
      
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        phone: '+380501234567',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const mockToken = 'mock_jwt_token_' + Date.now()
      
      setUser(mockUser)
      setToken(mockToken)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const adminLogin = async (password: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Simple admin password check - in production, this should be server-side
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

      if (password === adminPassword) {
        const adminUser: User = {
          id: 'admin',
          email: 'admin@opillia.com.ua',
          name: 'Administrator',
          phone: '+38 (097) 324 46 68',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const adminToken = 'admin_token_' + Date.now()

        setUser(adminUser)
        setToken(adminToken)

        return true
      } else {
        throw new Error('Invalid admin password')
      }
    } catch (err: any) {
      error.value = err.message || 'Admin login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterForm): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Mock registration - in real app, call your API


      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock successful registration
      const mockUser: User = {
        id: '1',
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockToken = 'mock_jwt_token_' + Date.now()

      setUser(mockUser)
      setToken(mockToken)

      return true
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    
    try {
      // In real app, call logout API
      
      
      // Clear user data
      clearAuth()
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!token.value) return false
    
    try {
      // In real app, call refresh token API
      
      
      // Mock token refresh
      const newToken = 'refreshed_token_' + Date.now()
      setToken(newToken)
      
      return true
    } catch (err: any) {
      console.error('Token refresh failed:', err)
      clearAuth()
      return false
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user.value) return false
    
    isLoading.value = true
    error.value = null
    
    try {
      // In real app, call update profile API
      
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user data
      user.value = {
        ...user.value,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      saveToStorage()
      return true
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    saveToStorage()
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    saveToStorage()
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    error.value = null
    clearStorage()
  }

  const clearError = () => {
    error.value = null
  }

  // Persistence
  const saveToStorage = () => {
    try {
      const authData = {
        user: user.value,
        token: token.value
      }
      localStorage.setItem('pwa-pos-auth', JSON.stringify(authData))
    } catch (error) {
      console.error('Failed to save auth to storage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('pwa-pos-auth')
      
      if (stored) {
        const authData = JSON.parse(stored)
        user.value = authData.user
        token.value = authData.token
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error)
      clearAuth()
    }
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem('pwa-pos-auth')
    } catch (error) {
      console.error('Failed to clear auth storage:', error)
    }
  }

  // Token validation
  const isTokenValid = (): boolean => {
    if (!token.value) return false
    
    try {
      // In real app, decode JWT and check expiration
      // For mock, just check if token exists and is not too old
      const tokenParts = token.value.split('_')
      if (tokenParts.length < 3) return false
      
      const timestamp = parseInt(tokenParts[2])
      const oneHour = 60 * 60 * 1000
      
      return Date.now() - timestamp < oneHour
    } catch {
      return false
    }
  }

  // Initialize from storage
  loadFromStorage()

  // Check token validity on initialization
  if (token.value && !isTokenValid()) {
    clearAuth()
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    canAccessAdmin,
    userInitials,

    // Actions
    login,
    adminLogin,
    register,
    logout,
    refreshToken,
    updateProfile,
    setUser,
    setToken,
    clearAuth,
    clearError,
    isTokenValid,

    // Persistence
    saveToStorage,
    loadFromStorage,
    clearStorage
  }
})
