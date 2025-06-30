const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔐 Building Protected Application...')

// Step 1: Install obfuscation dependencies
console.log('📦 Installing obfuscation tools...')
try {
  execSync('npm install --save-dev javascript-obfuscator webpack-obfuscator', { stdio: 'inherit' })
} catch (error) {
  console.log('⚠️  Obfuscation tools already installed or failed to install')
}

// Step 2: Create obfuscated build configuration
const obfuscatorConfig = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: true,
  debugProtectionInterval: 2000,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
}

// Step 3: Create Vite config for obfuscation
const viteConfigContent = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import JavaScriptObfuscator from 'webpack-obfuscator'

export default defineConfig({
  plugins: [
    vue(),
    // Add obfuscation in production
    process.env.NODE_ENV === 'production' && {
      ...JavaScriptObfuscator(${JSON.stringify(obfuscatorConfig, null, 2)}, [])
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        properties: {
          regex: /^_/
        }
      }
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          crypto: ['crypto-js'],
          ui: ['@headlessui/vue']
        }
      }
    }
  },
  define: {
    // Remove development flags
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
})
`

// Write the protected vite config
fs.writeFileSync('vite.config.protected.ts', viteConfigContent)

// Step 4: Create protected package.json scripts
const packageJsonPath = 'package.json'
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

packageJson.scripts = {
  ...packageJson.scripts,
  'build:protected': 'NODE_ENV=production vite build --config vite.config.protected.ts',
  'preview:protected': 'vite preview --config vite.config.protected.ts'
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

// Step 5: Create license validation wrapper
const licenseWrapperContent = `
// License validation wrapper - DO NOT MODIFY
(function() {
  'use strict';
  
  const originalFetch = window.fetch;
  const originalXMLHttpRequest = window.XMLHttpRequest;
  
  // Anti-debugging measures
  setInterval(function() {
    if (window.console && window.console.clear) {
      window.console.clear();
    }
  }, 1000);
  
  // Detect developer tools
  let devtools = {
    open: false,
    orientation: null
  };
  
  setInterval(function() {
    if (window.outerHeight - window.innerHeight > 200 || 
        window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Arial,sans-serif;"><h1>Developer Tools Detected</h1><p>Please close developer tools to continue.</p></div>';
      }
    } else {
      if (devtools.open) {
        devtools.open = false;
        window.location.reload();
      }
    }
  }, 500);
  
  // License check on page load
  window.addEventListener('load', function() {
    if (typeof window.licenseService === 'undefined') {
      document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Arial,sans-serif;"><h1>License Error</h1><p>Application license could not be verified.</p></div>';
      return;
    }
    
    if (!window.licenseService.isLicenseValid()) {
      document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;z-index:999999;font-family:Arial,sans-serif;"><h1>Invalid License</h1><p>Please activate a valid license to use this application.</p></div>';
    }
  });
})();
`

fs.writeFileSync('public/license-wrapper.js', licenseWrapperContent)

// Step 6: Update index.html to include license wrapper
const indexHtmlPath = 'index.html'
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8')

if (!indexHtml.includes('license-wrapper.js')) {
  indexHtml = indexHtml.replace(
    '</head>',
    '  <script src="/license-wrapper.js"></script>\n  </head>'
  )
  fs.writeFileSync(indexHtmlPath, indexHtml)
}

// Step 7: Build the protected version
console.log('🏗️  Building protected application...')
try {
  execSync('npm run build:protected', { stdio: 'inherit' })
  console.log('✅ Protected build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Step 8: Create deployment package
console.log('📦 Creating deployment package...')
const deploymentFiles = [
  'dist/',
  'license-server/',
  'LICENSE_SYSTEM_README.md'
]

try {
  execSync('mkdir -p deployment-package', { stdio: 'inherit' })
  
  deploymentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      execSync(`cp -r ${file} deployment-package/`, { stdio: 'inherit' })
    }
  })
  
  // Create deployment instructions
  const deploymentInstructions = `
# 🚀 Deployment Instructions

## 1. Upload Files
- Upload the 'dist' folder to your web server
- Upload the 'license-server' folder to your server

## 2. Setup License Server
\`\`\`bash
cd license-server
npm install
npm start
\`\`\`

## 3. Configure Domain
- Update license server URL in the application
- Create your first license:
\`\`\`bash
node scripts/create-license.js yourdomain.com monthly
\`\`\`

## 4. Test Application
- Visit your domain
- Enter the license key when prompted
- Verify all features work correctly

## 🔐 Security Notes
- Keep your license server secure
- Use HTTPS for production
- Monitor license usage regularly
- Backup your license database

Your application is now protected and ready for sale! 🎉
`
  
  fs.writeFileSync('deployment-package/DEPLOYMENT.md', deploymentInstructions)
  
  console.log('✅ Deployment package created in ./deployment-package/')
  console.log('📋 Next steps:')
  console.log('   1. Deploy the license server')
  console.log('   2. Upload the dist folder to your web server')
  console.log('   3. Create your first license')
  console.log('   4. Test the application')
  console.log('')
  console.log('🎉 Your application is now protected and ready for sale!')
  
} catch (error) {
  console.error('❌ Failed to create deployment package:', error.message)
}
