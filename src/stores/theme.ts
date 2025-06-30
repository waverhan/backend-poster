import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface DesignConfig {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    danger: string
    background: string
  }
  typography: {
    fontFamily: string
    headingSizeNum: number
    bodySizeNum: number
    smallSizeNum: number
    buttonSizeNum: number
    fontWeight: string
    headingSize?: string
    bodySize?: string
    smallSize?: string
    buttonSize?: string
  }
  layout: {
    borderRadius: number
    cardPadding: number
    buttonPadding: number
    shadowIntensity: string
  }
  admin: {
    sidebarStyle: string
    tableStyle: string
    buttonStyle: string
    cardStyle: string
  }
}

export const useThemeStore = defineStore('theme', () => {
  // Default configuration
  const defaultConfig: DesignConfig = {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#f9fafb'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingSizeNum: 24,
      bodySizeNum: 16,
      smallSizeNum: 14,
      buttonSizeNum: 14,
      fontWeight: '500'
    },
    layout: {
      borderRadius: 8,
      cardPadding: 24,
      buttonPadding: 12,
      shadowIntensity: 'md'
    },
    admin: {
      sidebarStyle: 'light',
      tableStyle: 'default',
      buttonStyle: 'rounded',
      cardStyle: 'default'
    }
  }

  // State
  const config = ref<DesignConfig>({ ...defaultConfig })
  const isLoaded = ref(false)

  // Getters
  const currentConfig = computed(() => config.value)
  
  const cssVariables = computed(() => ({
    '--color-primary': config.value.colors.primary,
    '--color-secondary': config.value.colors.secondary,
    '--color-success': config.value.colors.success,
    '--color-warning': config.value.colors.warning,
    '--color-danger': config.value.colors.danger,
    '--color-background': config.value.colors.background,
    '--font-family': config.value.typography.fontFamily,
    '--font-size-heading': config.value.typography.headingSizeNum + 'px',
    '--font-size-body': config.value.typography.bodySizeNum + 'px',
    '--font-size-small': config.value.typography.smallSizeNum + 'px',
    '--font-size-button': config.value.typography.buttonSizeNum + 'px',
    '--font-weight': config.value.typography.fontWeight,
    '--border-radius': config.value.layout.borderRadius + 'px',
    '--card-padding': config.value.layout.cardPadding + 'px',
    '--button-padding': config.value.layout.buttonPadding + 'px'
  }))

  // Actions
  const updateConfig = (newConfig: Partial<DesignConfig>) => {
    config.value = { ...config.value, ...newConfig }
    saveToStorage()
    applyToDOM()
  }

  const updateColors = (colors: Partial<DesignConfig['colors']>) => {
    config.value.colors = { ...config.value.colors, ...colors }
    saveToStorage()
    applyToDOM()
  }

  const updateTypography = (typography: Partial<DesignConfig['typography']>) => {
    config.value.typography = { ...config.value.typography, ...typography }
    saveToStorage()
    applyToDOM()
  }

  const updateLayout = (layout: Partial<DesignConfig['layout']>) => {
    config.value.layout = { ...config.value.layout, ...layout }
    saveToStorage()
    applyToDOM()
  }

  const resetToDefaults = () => {
    config.value = { ...defaultConfig }
    saveToStorage()
    applyToDOM()
  }

  const applyToDOM = () => {
    const root = document.documentElement
    const vars = cssVariables.value

    Object.entries(vars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Apply body background
    document.body.style.backgroundColor = config.value.colors.background
    document.body.style.fontFamily = config.value.typography.fontFamily
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('admin-design-config', JSON.stringify(config.value))
    } catch (error) {
      console.error('Failed to save design config to localStorage:', error)
    }
  }

  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('admin-design-config')
      if (saved) {
        const savedConfig = JSON.parse(saved)
        config.value = { ...defaultConfig, ...savedConfig }
        
        // Ensure computed typography values are set
        config.value.typography.headingSize = config.value.typography.headingSizeNum + 'px'
        config.value.typography.bodySize = config.value.typography.bodySizeNum + 'px'
        config.value.typography.smallSize = config.value.typography.smallSizeNum + 'px'
        config.value.typography.buttonSize = config.value.typography.buttonSizeNum + 'px'
      }
    } catch (error) {
      console.error('Failed to load design config from localStorage:', error)
      config.value = { ...defaultConfig }
    }
    isLoaded.value = true
  }

  const initialize = () => {
    loadFromStorage()
    applyToDOM()
  }

  const exportConfig = () => {
    return JSON.stringify(config.value, null, 2)
  }

  const importConfig = (configString: string) => {
    try {
      const importedConfig = JSON.parse(configString)
      config.value = { ...defaultConfig, ...importedConfig }
      saveToStorage()
      applyToDOM()
      return true
    } catch (error) {
      console.error('Failed to import config:', error)
      return false
    }
  }

  // Color preset management
  const colorPresets = [
    {
      name: 'Blue Ocean',
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#f9fafb'
    },
    {
      name: 'Purple Dream',
      primary: '#7c3aed',
      secondary: '#6b7280',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#faf5ff'
    },
    {
      name: 'Green Nature',
      primary: '#059669',
      secondary: '#6b7280',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#f0fdf4'
    },
    {
      name: 'Orange Sunset',
      primary: '#ea580c',
      secondary: '#6b7280',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#fff7ed'
    },
    {
      name: 'Pink Blossom',
      primary: '#db2777',
      secondary: '#6b7280',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      background: '#fdf2f8'
    },
    {
      name: 'Dark Mode',
      primary: '#3b82f6',
      secondary: '#9ca3af',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      background: '#111827'
    }
  ]

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateColors(preset)
  }

  // Watch for changes and update computed values
  watch(() => config.value.typography, (newTypography) => {
    config.value.typography.headingSize = newTypography.headingSizeNum + 'px'
    config.value.typography.bodySize = newTypography.bodySizeNum + 'px'
    config.value.typography.smallSize = newTypography.smallSizeNum + 'px'
    config.value.typography.buttonSize = newTypography.buttonSizeNum + 'px'
  }, { deep: true })

  return {
    // State
    config,
    isLoaded,
    
    // Getters
    currentConfig,
    cssVariables,
    colorPresets,
    
    // Actions
    updateConfig,
    updateColors,
    updateTypography,
    updateLayout,
    resetToDefaults,
    applyToDOM,
    saveToStorage,
    loadFromStorage,
    initialize,
    exportConfig,
    importConfig,
    applyColorPreset
  }
})
