# Location Services Implementation

This document describes the Capacitor.js geolocation functionality implemented in the PWA POS system for detecting client location, delivery address, and nearby branch selection.

## 🚀 Features

### ✅ Core Location Services
- **Current Location Detection** - Get user's GPS coordinates using Capacitor Geolocation
- **Location Watching** - Continuously track location changes
- **Address Geocoding** - Convert addresses to coordinates (enhanced mock implementation)
- **Reverse Geocoding** - Convert coordinates to addresses
- **Permission Handling** - Request and manage location permissions

### ✅ Delivery & Pickup Services
- **Delivery Method Selection** - Choose between delivery and pickup
- **Nearby Branch Detection** - Find branches within specified radius
- **Distance Calculation** - Haversine formula for accurate distance measurement
- **Delivery Fee Calculation** - Dynamic pricing based on distance (99 UAH base + 30 UAH/km)
- **Delivery Availability** - Check if delivery is available to location

### ✅ User Interface Components
- **LocationDetector** - Comprehensive location detection component
- **DeliveryMethodSelector** - Complete delivery/pickup selection interface
- **Location Demo Page** - Full-featured demo and testing interface
- **Checkout Integration** - Location services integrated into checkout flow

## 📁 File Structure

```
src/
├── components/
│   ├── location/
│   │   └── LocationDetector.vue          # Main location detection component
│   └── delivery/
│       └── DeliveryMethodSelector.vue    # Delivery method selection
├── services/
│   ├── capacitor.ts                      # Core Capacitor services (existing)
│   └── location.ts                       # Enhanced location service
├── stores/
│   ├── location.ts                       # Location state management (enhanced)
│   └── branch.ts                         # Branch store with location methods (enhanced)
├── views/
│   ├── LocationDemo.vue                  # Demo page for testing
│   └── CheckoutView.vue                  # Enhanced checkout with location
└── types/
    └── index.ts                          # Type definitions (existing)
```

## 🔧 Implementation Details

### 1. Location Detection

The `LocationDetector` component provides:

```vue
<LocationDetector
  :auto-detect="false"
  :show-nearby-branches="true"
  :max-distance="15"
  @location-detected="handleLocationDetected"
  @branch-selected="handleBranchSelected"
  @error="handleLocationError"
/>
```

**Features:**
- Manual location detection button
- Continuous location watching
- Manual address input with geocoding
- Nearby branches display with distances and delivery fees
- Error handling and user feedback

### 2. Delivery Method Selection

The `DeliveryMethodSelector` component provides:

```vue
<DeliveryMethodSelector
  :show-back-button="true"
  @method-selected="handleMethodSelected"
  @back="goBack"
/>
```

**Features:**
- Delivery vs Pickup selection
- Automatic nearest branch detection for delivery
- Branch selection for pickup
- Dynamic fee calculation
- Location-based branch filtering

### 3. Location Service

Enhanced location service with:

```typescript
import { locationService } from '@/services/location'

// Get current location with retry logic
const result = await locationService.getCurrentLocation({
  enableHighAccuracy: true,
  timeout: 15000,
  autoRetry: true,
  retryAttempts: 3
})

// Start watching location
await locationService.startWatching((result) => {
  if (result.success) {
    console.log('Location:', result.location)
    console.log('Delivery Info:', result.deliveryInfo)
  }
})

// Get nearby branches
const nearbyBranches = locationService.getNearbyBranches(location, 10)
```

### 4. Store Enhancements

**Location Store:**
- Enhanced geocoding with Ukrainian cities
- Location validation and persistence
- Stale data detection

**Branch Store:**
- Distance calculation methods
- Nearby branch filtering
- Delivery fee calculation
- Delivery availability checking

## 🎯 Usage Examples

### Basic Location Detection

```vue
<template>
  <LocationDetector @location-detected="onLocationDetected" />
</template>

<script setup>
const onLocationDetected = (location) => {
  console.log('User location:', location)
  // Use location for delivery calculations
}
</script>
```

### Checkout Integration

```vue
<template>
  <DeliveryMethodSelector @method-selected="onMethodSelected" />
</template>

<script setup>
const onMethodSelected = (data) => {
  console.log('Method:', data.method)        // 'delivery' | 'pickup'
  console.log('Branch:', data.branch)        // Selected branch
  console.log('Location:', data.location)    // User location (if delivery)
  console.log('Fee:', data.fee)             // Delivery fee
}
</script>
```

### Programmatic Usage

```typescript
import { locationService } from '@/services/location'
import { useBranchStore } from '@/stores/branch'

// Get location and delivery info
const result = await locationService.getCurrentLocation()
if (result.success) {
  const { location, deliveryInfo } = result
  
  // Find nearest branch
  const branchStore = useBranchStore()
  const nearest = branchStore.findNearestBranch(
    location.latitude, 
    location.longitude
  )
  
  // Calculate delivery fee
  const distance = branchStore.calculateDistance(
    location.latitude, location.longitude,
    nearest.latitude, nearest.longitude
  )
  const fee = branchStore.calculateDeliveryFee(distance)
}
```

## 📱 Capacitor.js Integration

### Required Permissions

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location" android:required="true" />
```

**iOS** (`ios/App/App/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to provide delivery services and find nearby stores.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to provide delivery services and find nearby stores.</string>
```

### Web Fallback

The implementation includes automatic fallback to the Web Geolocation API when running in a browser, ensuring functionality across all platforms.

## 🧪 Testing

### Demo Page

Visit `/location-demo` to test all location features:

1. **Location Detection** - Test GPS and manual address input
2. **Delivery Method Selection** - Test delivery vs pickup selection
3. **Nearby Branches** - View branches within radius
4. **Debug Information** - View store states and location data

### Checkout Flow

1. Add items to cart
2. Go to checkout (`/checkout`)
3. Select delivery method
4. Test location detection and branch selection
5. Complete order placement

## 🔄 Delivery Pricing Logic

```typescript
// Base delivery fee: 99 UAH for first 2km
// Additional: 30 UAH per km beyond 2km
const calculateDeliveryFee = (distance: number): number => {
  if (distance <= 2) return 99
  return 99 + Math.ceil(distance - 2) * 30
}

// Examples:
// 1.5 km = 99 UAH
// 2.0 km = 99 UAH  
// 3.0 km = 129 UAH (99 + 30)
// 5.0 km = 189 UAH (99 + 90)
```

## 🚀 Next Steps

1. **Real Geocoding API** - Integrate Google Maps or similar service
2. **Map Integration** - Add interactive maps for location selection
3. **Location History** - Save frequently used addresses
4. **Geofencing** - Delivery zone validation
5. **Real-time Tracking** - Order tracking with live location updates

## 📚 Dependencies

- `@capacitor/geolocation` - Core geolocation functionality
- `@capacitor/core` - Capacitor platform detection
- `@capacitor/toast` - User feedback
- Vue 3 + Composition API
- Pinia for state management
- TypeScript for type safety

## 🔗 Related Files

- [Capacitor Service](src/services/capacitor.ts) - Core Capacitor integrations
- [Location Store](src/stores/location.ts) - Location state management  
- [Branch Store](src/stores/branch.ts) - Branch and delivery logic
- [Type Definitions](src/types/index.ts) - TypeScript interfaces
