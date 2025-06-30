import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.pwapos.app',
  appName: 'PWA POS System',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: ['location']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Haptics: {},
    StatusBar: {
      style: 'default',
      backgroundColor: '#2563eb'
    },
    Network: {}
  }
}

export default config
