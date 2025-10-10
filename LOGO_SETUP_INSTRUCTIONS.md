# Opillia Logo Setup Instructions

## 📱 PWA Install Prompt & Logo Setup

I've implemented a Ukrainian "Add to Home Screen" notification and updated the PWA configuration for Opillia branding.

### 🎯 What's Been Added

1. **Ukrainian Install Prompt** (`src/components/ui/InstallPrompt.vue`)
   - Beautiful notification in Ukrainian
   - Shows "Додайте Опілля на головний екран!"
   - Works on both Android and iOS
   - Smart timing (shows after 3-5 seconds)
   - Respects user preferences (won't show if dismissed recently)

2. **Updated PWA Manifest** (`vite.config.ts`)
   - Ukrainian app name: "Опілля - Магазин напоїв та делікатесів"
   - Opillia red theme color: `#B91C1C`
   - Updated icons to use Opillia logo

3. **Updated HTML Meta Tags** (`index.html`)
   - New favicon using Opillia logo
   - Updated theme color to Opillia red
   - Apple touch icon updated

### 🖼️ Logo Files to Replace

You need to replace these placeholder files with the actual Opillia logo:

1. **`public/opillia-192x192.png`** - 192x192 pixels (for PWA icon)
2. **`public/opillia-512x512.png`** - 512x512 pixels (for PWA icon)

### 📐 How to Create the Logo Files

#### Option 1: Using Online Tools
1. Go to https://www.iloveimg.com/resize-image
2. Upload your Opillia logo image
3. Resize to 192x192 pixels, save as `opillia-192x192.png`
4. Resize to 512x512 pixels, save as `opillia-512x512.png`
5. Place both files in the `public/` folder

#### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first if not installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

# Convert your logo to required sizes
convert your-opillia-logo.jpg -resize 192x192 public/opillia-192x192.png
convert your-opillia-logo.jpg -resize 512x512 public/opillia-512x512.png
```

#### Option 3: Using Photoshop/GIMP
1. Open your Opillia logo
2. Resize canvas to 192x192 pixels
3. Export as PNG: `opillia-192x192.png`
4. Resize canvas to 512x512 pixels  
5. Export as PNG: `opillia-512x512.png`

### 🎨 Logo Requirements

- **Format**: PNG with transparent background preferred
- **Quality**: High resolution, crisp edges
- **Colors**: Should match the Opillia brand colors (red/gold)
- **Content**: Should be recognizable at small sizes

### 🚀 Features of the Install Prompt

#### Android Users:
- Native "Add to Home Screen" dialog
- One-tap installation
- Automatic detection of install capability

#### iOS Users:
- Custom instructions showing how to add to home screen
- Visual guide with Safari share button
- Respects iOS limitations

#### Smart Behavior:
- Won't show if app is already installed
- Won't show if user dismissed recently (7 days)
- Won't show if user already installed (30 days)
- Automatic detection of standalone mode

### 🎯 User Experience

The prompt will appear:
- **Android**: After 3 seconds on first visit
- **iOS**: After 5 seconds on first visit
- **Text**: "Додайте Опілля на головний екран!"
- **Description**: "Швидкий доступ до найкращих напоїв та делікатесів прямо з вашого телефону"

### 🔧 Testing

1. **Deploy the changes**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

2. **Test on mobile**:
   - Open https://opillia.com.ua on mobile
   - Wait 3-5 seconds
   - Install prompt should appear
   - Try installing the app

3. **Verify icons**:
   - Check that Opillia logo appears in browser tab
   - Check that install prompt shows Opillia logo
   - After installation, check home screen icon

### 📱 After Installation

Users will have:
- Opillia app icon on their home screen
- Full-screen app experience (no browser UI)
- Fast loading with offline capabilities
- Native app-like experience

### 🎨 Customization

You can customize the install prompt by editing:
- **Colors**: Update the gradient in `InstallPrompt.vue`
- **Text**: Modify the Ukrainian text in the template
- **Timing**: Adjust the `setTimeout` delays
- **Behavior**: Modify the `shouldShowPrompt()` logic

The prompt uses Opillia's brand colors (red gradient) and includes the logo for brand consistency.
