import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import Critters from 'critters'

const inlineCriticalCss = () => ({
  name: 'inline-critical-css',
  apply: 'build',
  enforce: 'post',
  async closeBundle() {
    try {
      const distDir = path.resolve(process.cwd(), 'dist')
      const indexPath = path.join(distDir, 'index.html')

      if (!fs.existsSync(indexPath)) {
        return
      }

      const html = await fs.promises.readFile(indexPath, 'utf8')
      const critters = new Critters({
        path: distDir,
        preload: 'swap',
        reduceInlineStyles: false,
        pruneSource: false,
        inlineFonts: true,
        logLevel: 'warn'
      })
      const inlinedHtml = await critters.process(html)
      await fs.promises.writeFile(indexPath, inlinedHtml, 'utf8')
      console.log('✅ Critical CSS inlined into dist/index.html')
    } catch (error) {
      console.warn('⚠️ Critical CSS inlining skipped:', error)
    }
  }
})

export default defineConfig({
  plugins: [
    vue(),
    inlineCriticalCss(),
    compression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10KB
      algorithm: 'brotli',
      ext: '.br'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // Disable service worker registration
      disable: true, // Disable PWA
      minify: false,
      devOptions: {
        enabled: false // Disable in dev mode too
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'opillia-192x192.png', 'opillia-512x512.png'],
      manifest: {
        name: 'Опілля - Магазин напоїв та делікатесів',
        short_name: 'Опілля',
        description: 'Найкращі напої та делікатеси з доставкою по Києву. Замовляйте свіжі продукти онлайн.',
        theme_color: '#B91C1C',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?utm_source=pwa',
        lang: 'uk',
        categories: ['shopping', 'food'],
        screenshots: [
          {
            src: 'opillia-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'opillia-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: 'opillia-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'opillia-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'opillia-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/poster': {
        target: 'https://joinposter.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/poster/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Local API proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Local API proxying request:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Local API proxy response:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/images': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Enable CSS code splitting to defer non-critical styles
    cssCodeSplit: true,
    // Optimize chunk sizes and reduce bundle size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // Manual chunk splitting for better code splitting
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('pinia')) {
              return 'pinia'
            }
            if (id.includes('vue-router')) {
              return 'vue-router'
            }
            if (id.includes('axios') || id.includes('fetch')) {
              return 'http'
            }
            if (id.includes('leaflet') || id.includes('openstreetmap')) {
              return 'maps'
            }
            if (id.includes('chart') || id.includes('echarts')) {
              return 'charts'
            }
            // Group other vendors
            return 'vendor'
          }

          // Keep everything else in shared chunks to avoid circular dependencies
          // Views, stores, services, and components stay together
        }
      }
    }
  }
})
