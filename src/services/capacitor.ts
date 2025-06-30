import { Capacitor } from '@capacitor/core'
import { Geolocation, type Position } from '@capacitor/geolocation'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Network } from '@capacitor/network'
import { PushNotifications } from '@capacitor/push-notifications'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Device } from '@capacitor/device'
import { Share } from '@capacitor/share'
import { Toast } from '@capacitor/toast'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Clipboard } from '@capacitor/clipboard'
import { Browser } from '@capacitor/browser'
import { Keyboard } from '@capacitor/keyboard'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import type { LocationData, NetworkStatus } from '@/types'

class CapacitorService {
  private isNative = Capacitor.isNativePlatform()

  /**
   * Get current position using Capacitor Geolocation
   */
  async getCurrentPosition(): Promise<LocationData | null> {
    try {
      if (!this.isNative) {
        // Fallback to web geolocation API
        return await this.getWebGeolocation()
      }

      // Request permissions first
      const permissions = await Geolocation.requestPermissions()

      if (permissions.location !== 'granted') {
        throw new Error('Location permission denied')
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      })

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      }
    } catch (error) {
      console.error('Failed to get current position:', error)
      throw error
    }
  }

  /**
   * Fallback web geolocation
   */
  private async getWebGeolocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  /**
   * Watch position changes
   */
  async watchPosition(callback: (position: LocationData) => void): Promise<string> {
    try {
      if (!this.isNative) {
        // Web fallback
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            })
          },
          (error) => {
            console.error('Position watch error:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
        return watchId.toString()
      }

      // Capacitor native
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000
        },
        (position) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            })
          }
        }
      )

      return watchId
    } catch (error) {
      console.error('Failed to watch position:', error)
      throw error
    }
  }

  /**
   * Clear position watch
   */
  async clearWatch(watchId: string): Promise<void> {
    try {
      if (!this.isNative) {
        navigator.geolocation.clearWatch(parseInt(watchId))
        return
      }

      await Geolocation.clearWatch({ id: watchId })
    } catch (error) {
      console.error('Failed to clear position watch:', error)
    }
  }

  /**
   * Trigger haptic feedback
   */
  async hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    try {
      if (!this.isNative) {
        // Web fallback - vibration API
        if ('vibrate' in navigator) {
          const duration = style === 'light' ? 50 : style === 'medium' ? 100 : 200
          navigator.vibrate(duration)
        }
        return
      }

      const impactStyle = style === 'light'
        ? ImpactStyle.Light
        : style === 'heavy'
        ? ImpactStyle.Heavy
        : ImpactStyle.Medium

      await Haptics.impact({ style: impactStyle })
    } catch (error) {
      console.error('Haptic feedback failed:', error)
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      if (!this.isNative) {
        return {
          connected: navigator.onLine,
          connectionType: 'unknown'
        }
      }

      const status = await Network.getStatus()
      return {
        connected: status.connected,
        connectionType: status.connectionType
      }
    } catch (error) {
      console.error('Failed to get network status:', error)
      return {
        connected: true,
        connectionType: 'unknown'
      }
    }
  }

  /**
   * Listen to network changes
   */
  addNetworkListener(callback: (status: NetworkStatus) => void): void {
    if (!this.isNative) {
      // Web fallback
      const handleOnline = () => callback({ connected: true, connectionType: 'unknown' })
      const handleOffline = () => callback({ connected: false, connectionType: 'none' })

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return
    }

    // Capacitor native
    Network.addListener('networkStatusChange', (status) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType
      })
    })
  }

  /**
   * Initialize push notifications
   */
  async initializePushNotifications(): Promise<void> {
    try {
      if (!this.isNative) {
        
        return
      }

      // Request permission
      const permission = await PushNotifications.requestPermissions()

      if (permission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register()

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          
        })

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error)
        })

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          
        })

        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          
        })
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
    }
  }

  /**
   * Check if running on native platform
   */
  isNativePlatform(): boolean {
    return this.isNative
  }

  /**
   * Get platform info
   */
  getPlatform(): string {
    return Capacitor.getPlatform()
  }

  /**
   * Check if specific plugin is available
   */
  isPluginAvailable(pluginName: string): boolean {
    return Capacitor.isPluginAvailable(pluginName)
  }

  // ==================== CAMERA METHODS ====================

  /**
   * Take a photo using device camera
   */
  async takePhoto(): Promise<string | null> {
    try {
      if (!this.isNative) {
        
        return null
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      })

      return image.webPath || null
    } catch (error) {
      console.error('Failed to take photo:', error)
      throw error
    }
  }

  /**
   * Pick image from gallery
   */
  async pickImage(): Promise<string | null> {
    try {
      if (!this.isNative) {
        
        return null
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      })

      return image.webPath || null
    } catch (error) {
      console.error('Failed to pick image:', error)
      throw error
    }
  }

  // ==================== DEVICE INFO METHODS ====================

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<any> {
    try {
      const info = await Device.getInfo()
      return {
        platform: info.platform,
        model: info.model,
        operatingSystem: info.operatingSystem,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        isVirtual: info.isVirtual,
        webViewVersion: info.webViewVersion
      }
    } catch (error) {
      console.error('Failed to get device info:', error)
      return null
    }
  }

  /**
   * Get device ID
   */
  async getDeviceId(): Promise<string | null> {
    try {
      const info = await Device.getId()
      return info.identifier
    } catch (error) {
      console.error('Failed to get device ID:', error)
      return null
    }
  }

  // ==================== FILESYSTEM METHODS ====================

  /**
   * Save data to file
   */
  async saveFile(fileName: string, data: string, directory: Directory = Directory.Documents): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback - save to localStorage
        localStorage.setItem(`file_${fileName}`, data)
        return true
      }

      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        encoding: Encoding.UTF8
      })

      return true
    } catch (error) {
      console.error('Failed to save file:', error)
      return false
    }
  }

  /**
   * Read file content
   */
  async readFile(fileName: string, directory: Directory = Directory.Documents): Promise<string | null> {
    try {
      if (!this.isNative) {
        // Web fallback - read from localStorage
        return localStorage.getItem(`file_${fileName}`)
      }

      const result = await Filesystem.readFile({
        path: fileName,
        directory: directory,
        encoding: Encoding.UTF8
      })

      return result.data as string
    } catch (error) {
      console.error('Failed to read file:', error)
      return null
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileName: string, directory: Directory = Directory.Documents): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback - remove from localStorage
        localStorage.removeItem(`file_${fileName}`)
        return true
      }

      await Filesystem.deleteFile({
        path: fileName,
        directory: directory
      })

      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }

  // ==================== SHARING METHODS ====================

  /**
   * Share content
   */
  async share(title: string, text: string, url?: string): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback - use Web Share API if available
        if (navigator.share) {
          await navigator.share({ title, text, url })
          return true
        } else {
          // Fallback to clipboard
          await this.copyToClipboard(text)
          return true
        }
      }

      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share via'
      })

      return true
    } catch (error) {
      console.error('Failed to share:', error)
      return false
    }
  }

  // ==================== TOAST METHODS ====================

  /**
   * Show toast message
   */
  async showToast(message: string, duration: 'short' | 'long' = 'short'): Promise<void> {
    try {
      if (!this.isNative) {
        // Web fallback - could integrate with notification store
        
        return
      }

      await Toast.show({
        text: message,
        duration: duration,
        position: 'bottom'
      })
    } catch (error) {
      console.error('Failed to show toast:', error)
    }
  }

  // ==================== LOCAL NOTIFICATIONS METHODS ====================

  /**
   * Schedule local notification
   */
  async scheduleNotification(title: string, body: string, id: number = Date.now()): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback - use browser notifications if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body })
          return true
        }
        
        return false
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      })

      return true
    } catch (error) {
      console.error('Failed to schedule notification:', error)
      return false
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermissions(): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback
        if ('Notification' in window) {
          const permission = await Notification.requestPermission()
          return permission === 'granted'
        }
        return false
      }

      const permissions = await LocalNotifications.requestPermissions()
      return permissions.display === 'granted'
    } catch (error) {
      console.error('Failed to request notification permissions:', error)
      return false
    }
  }

  // ==================== CLIPBOARD METHODS ====================

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text)
          return true
        }
        return false
      }

      await Clipboard.write({
        string: text
      })

      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Read text from clipboard
   */
  async readFromClipboard(): Promise<string | null> {
    try {
      if (!this.isNative) {
        // Web fallback
        if (navigator.clipboard) {
          return await navigator.clipboard.readText()
        }
        return null
      }

      const result = await Clipboard.read()
      return result.value
    } catch (error) {
      console.error('Failed to read from clipboard:', error)
      return null
    }
  }

  // ==================== BROWSER METHODS ====================

  /**
   * Open URL in browser
   */
  async openUrl(url: string): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback
        window.open(url, '_blank')
        return true
      }

      await Browser.open({ url })
      return true
    } catch (error) {
      console.error('Failed to open URL:', error)
      return false
    }
  }

  // ==================== KEYBOARD METHODS ====================

  /**
   * Hide keyboard
   */
  async hideKeyboard(): Promise<void> {
    try {
      if (!this.isNative) {
        // Web fallback - blur active element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
        return
      }

      await Keyboard.hide()
    } catch (error) {
      console.error('Failed to hide keyboard:', error)
    }
  }

  /**
   * Show keyboard
   */
  async showKeyboard(): Promise<void> {
    try {
      if (!this.isNative) {
        
        return
      }

      await Keyboard.show()
    } catch (error) {
      console.error('Failed to show keyboard:', error)
    }
  }

  // ==================== SCREEN ORIENTATION METHODS ====================

  /**
   * Lock screen orientation
   */
  async lockOrientation(orientation: 'portrait' | 'landscape'): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback - use Screen Orientation API if available
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock(orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary')
          return true
        }
        return false
      }

      await ScreenOrientation.lock({ orientation })
      return true
    } catch (error) {
      console.error('Failed to lock orientation:', error)
      return false
    }
  }

  /**
   * Unlock screen orientation
   */
  async unlockOrientation(): Promise<boolean> {
    try {
      if (!this.isNative) {
        // Web fallback
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock()
          return true
        }
        return false
      }

      await ScreenOrientation.unlock()
      return true
    } catch (error) {
      console.error('Failed to unlock orientation:', error)
      return false
    }
  }

  /**
   * Get current orientation
   */
  async getCurrentOrientation(): Promise<string | null> {
    try {
      if (!this.isNative) {
        // Web fallback
        return screen.orientation ? screen.orientation.type : null
      }

      const result = await ScreenOrientation.orientation()
      return result.type
    } catch (error) {
      console.error('Failed to get orientation:', error)
      return null
    }
  }

  // ==================== ENHANCED HAPTICS METHODS ====================

  /**
   * Trigger notification haptic
   */
  async hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    try {
      if (!this.isNative) {
        // Web fallback - vibration API
        if ('vibrate' in navigator) {
          const pattern = type === 'success' ? [100] : type === 'warning' ? [100, 50, 100] : [200, 100, 200]
          navigator.vibrate(pattern)
        }
        return
      }

      const notificationType = type === 'success'
        ? NotificationType.Success
        : type === 'warning'
        ? NotificationType.Warning
        : NotificationType.Error

      await Haptics.notification({ type: notificationType })
    } catch (error) {
      console.error('Haptic notification failed:', error)
    }
  }

  /**
   * Trigger selection haptic
   */
  async hapticSelection(): Promise<void> {
    try {
      if (!this.isNative) {
        // Web fallback
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
        return
      }

      await Haptics.selectionStart()
      setTimeout(async () => {
        await Haptics.selectionChanged()
        setTimeout(async () => {
          await Haptics.selectionEnd()
        }, 50)
      }, 50)
    } catch (error) {
      console.error('Haptic selection failed:', error)
    }
  }
}

// Export singleton instance
export const capacitorService = new CapacitorService()
export default capacitorService
