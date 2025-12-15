import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

export function useHaptic() {
  const isNative = () => {
    return (window as any).Capacitor?.isNativePlatform?.() || false
  }
  
  /**
   * Light impact - for UI interactions like button taps
   */
  const light = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Medium impact - for selections and confirmations
   */
  const medium = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Heavy impact - for important actions
   */
  const heavy = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Success notification - for successful operations
   */
  const success = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.notification({ type: NotificationType.Success })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Warning notification - for warnings
   */
  const warning = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.notification({ type: NotificationType.Warning })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Error notification - for errors
   */
  const error = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.notification({ type: NotificationType.Error })
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Selection changed - for picker/selector changes
   */
  const selectionChanged = async () => {
    if (!isNative()) return
    
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.warn('Haptic feedback not available:', error)
    }
  }
  
  /**
   * Vibrate - custom vibration pattern (fallback for web)
   */
  const vibrate = (pattern: number | number[] = 100) => {
    if (isNative()) {
      // Use Capacitor haptics for native
      medium()
    } else if ('vibrate' in navigator) {
      // Use web vibration API
      navigator.vibrate(pattern)
    }
  }
  
  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selectionChanged,
    vibrate,
    isNative
  }
}

