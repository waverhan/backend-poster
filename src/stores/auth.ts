import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { backendApi } from '@/services/backendApi'

export interface User {
  id: string
  phone: string
  name: string
  email?: string
  role?: string
  posterClientId?: string
  bonusPoints: number
  totalPaidSum: number
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userBonusPoints = computed(() => user.value?.bonusPoints || 0)
  const userTotalSpent = computed(() => user.value?.totalPaidSum || 0)

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
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  /**
   * Set password for user
   */
  const setPassword = async (password: string) => {
    try {
      setLoading(true)
      clearError()

      if (!token.value) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${backendApi.baseUrl}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to set password')
      }

      console.log('✅ Password set successfully')

      // Update user to reflect password is set
      if (user.value) {
        user.value.force_password_setup = false
        user.value.is_password_set = true
      }

      return data
    } catch (err: any) {
      console.error('❌ Set password error:', err)
      setError(err.message || 'Failed to set password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if user exists and has password
   */
  const checkUser = async (phone: string) => {
    try {
      const response = await fetch(`${backendApi.baseUrl}/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to check user')
      }

      return data
    } catch (err: any) {
      console.error('❌ Check user error:', err)
      throw err
    }
  }

  /**
   * Login with phone and password
   */
  const loginWithPassword = async (phone: string, password: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await fetch(`${backendApi.baseUrl}/auth/login-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Login failed')
      }

      // Store authentication data
      token.value = data.token
      user.value = data.user
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_data', JSON.stringify(data.user))

      console.log('✅ Password login successful:', data.user.name)

      return data
    } catch (err: any) {
      console.error('❌ Password login error:', err)
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send SMS verification code
   */
  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await fetch(`${backendApi.baseUrl}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to send verification code')
      }

      return {
        success: true,
        phone: data.phone,
        expiresIn: data.expiresIn
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send verification code'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Verify SMS code and login
   */
  const verifyCodeAndLogin = async (phoneNumber: string, code: string, name?: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await fetch(`${backendApi.baseUrl}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: code,
          ...(name && { name })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Verification failed')
      }

      // Store authentication data
      token.value = data.token
      user.value = data.user

      // Save to localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      return {
        success: true,
        user: data.user,
        isNewUser: data.isNewUser
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Verification failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
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
          phone: '+380973244668',
          name: 'Administrator',
          email: 'admin@opillia.com.ua',
          role: 'admin',
          bonusPoints: 0,
          totalPaidSum: 0
        }

        const adminToken = 'admin_token_' + Date.now()

        user.value = adminUser
        token.value = adminToken

        // Save to localStorage
        localStorage.setItem('auth_token', adminToken)
        localStorage.setItem('auth_user', JSON.stringify(adminUser))

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

  /**
   * Get user profile with latest bonus information
   */
  const refreshProfile = async () => {
    try {
      if (!token.value) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${backendApi.baseUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to get profile')
      }

      user.value = data.user
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      return data.user
    } catch (err: any) {
      console.error('Failed to refresh profile:', err)
      throw err
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      if (token.value) {
        // Call logout endpoint
        await fetch(`${backendApi.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
      }
    } catch (err) {
      console.error('Logout API call failed:', err)
    } finally {
      // Clear local state regardless of API call result
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      clearError()
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (updates: { name?: string; email?: string }) => {
    try {
      setLoading(true)
      clearError()

      if (!token.value) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${backendApi.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to update profile')
      }

      user.value = data.user
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      return data.user
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get current bonus information
   */
  const getBonusInfo = async () => {
    try {
      if (!token.value) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`${backendApi.baseUrl}/auth/bonus`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to get bonus info')
      }

      // Update user bonus points
      if (user.value) {
        user.value.bonusPoints = data.bonusPoints
        user.value.totalPaidSum = data.totalPaidSum
        localStorage.setItem('auth_user', JSON.stringify(user.value))
      }

      return {
        bonusPoints: data.bonusPoints,
        totalPaidSum: data.totalPaidSum,
        clientName: data.clientName,
        phone: data.phone
      }
    } catch (err: any) {
      console.error('Failed to get bonus info:', err)
      throw err
    }
  }

  /**
   * Initialize auth state from localStorage
   */
  const initializeAuth = () => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // Refresh profile in background to get latest bonus info
        refreshProfile().catch(err => {
          console.error('Failed to refresh profile on init:', err)
          // If refresh fails, clear auth state
          logout()
        })
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err)
      // Clear corrupted data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  /**
   * Validate phone number format
   */
  const validatePhoneNumber = (phone: string): boolean => {
    // Ukrainian phone number validation
    const cleaned = phone.replace(/[^\d]/g, '')
    return /^0[0-9]{9}$/.test(cleaned) || /^380[0-9]{9}$/.test(cleaned)
  }

  /**
   * Format phone number for display
   */
  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[^\d]/g, '')
    if (cleaned.startsWith('380')) {
      const number = cleaned.substring(3)
      return `+380 (${number.substring(0, 2)}) ${number.substring(2, 5)} ${number.substring(5, 7)} ${number.substring(7)}`
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
    }
    return phone
  }

  // Initialize from storage on store creation
  initializeAuth()

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
    userBonusPoints,
    userTotalSpent,

    // Actions
    sendVerificationCode,
    verifyCodeAndLogin,
    adminLogin,
    refreshProfile,
    updateProfile,
    getBonusInfo,
    logout,
    initializeAuth,
    validatePhoneNumber,
    formatPhoneNumber,
    setError,
    clearError,
    setPassword,
    loginWithPassword,
    checkUser
  }
})
