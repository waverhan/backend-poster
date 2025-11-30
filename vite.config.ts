import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'defer-css',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml(html) {
        // Transform CSS links to defer loading
        return html.replace(
          /<link([^>]*?)rel="stylesheet"([^>]*?)>/g,
          (match, before, after) => {
            // Check if it's already deferred or preload
            if (match.includes('media=') || match.includes('onload=')) {
              return match
            }
            // Defer the CSS by using media="print" and onload to switch to "all"
            return `<link${before}rel="stylesheet"${after} media="print" onload="this.media='all'"><noscript><link${before}rel="stylesheet"${after}></noscript>`
          }
        )
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/joinposter\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'poster-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            // Cache backend images with CacheFirst strategy
            urlPattern: /^https:\/\/backend-api-production-b3a0\.up\.railway\.app\/images\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'backend-images-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            // Cache Poster images with aggressive caching (primary source)
            urlPattern: /^https:\/\/joinposter\.com\/upload\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'poster-images-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
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
    // Optimize chunk sizes
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
