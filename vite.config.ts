import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/maskable.svg'],
      manifest: {
        name: 'KaalVeda — Explore Everything. Learn Everything.',
        short_name: 'KaalVeda',
        description:
          'A premium interactive knowledge-universe. Travel a connected path through the cosmos, history, religions, science, and civilizations.',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/maskable.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,json,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // Keep the force-graph + d3 stack in its own chunk so it only loads
          // with the lazy /graph route, never on first paint.
          if (
            id.includes('force-graph') ||
            id.includes('react-kapsule') ||
            id.includes('kapsule') ||
            id.includes('d3-') ||
            id.includes('accessor-fn') ||
            id.includes('bezier-js') ||
            id.includes('canvas-color-tracker') ||
            id.includes('float-tooltip') ||
            id.includes('index-array-by') ||
            id.includes('@tweenjs') ||
            id.includes('lodash-es')
          )
            return 'graph'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react'
          return 'vendor'
        },
      },
    },
  },
})
