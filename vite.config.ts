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
        // Never precache the audio bed — the temple-ambience file is ~5 MB and
        // should stream on demand only when the user enables sound, not download
        // on first visit. (The globPatterns extension list already excludes
        // .mp3; this makes the intent explicit and guards against it being
        // broadened later.) node_modules kept to preserve Workbox's default.
        globIgnores: ['**/node_modules/**/*', '**/audio/**'],
        navigateFallback: '/index.html',
        // Never resolve a request for a static asset to the SPA shell. A
        // navigation-mode request for a *missing* hashed chunk (e.g. a stale
        // /assets/GraphCanvas-*.js after a redeploy) must fall through to a
        // real 404 rather than get index.html served from the precache — the
        // latter is the "Expected a JS module but got text/html" MIME error
        // that blanks a lazy route. This mirrors the vercel.json rewrite
        // exclusion for /assets/ so both the edge and the SW behave the same.
        navigateFallbackDenylist: [/^\/api\//, /^\/assets\//, /^\/icons\//, /^\/audio\//],
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
          // Vite's __vitePreload helper is statically imported by the entry
          // (for its own lazy route imports). Pin it to the always-eager react
          // chunk so Rollup can't park it inside a lazy chunk like `three` —
          // which would otherwise drag that whole chunk into first paint.
          if (id.includes('vite/preload-helper')) return 'react'
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
          // The three.js / @react-three stack is only imported by the lazy 3D
          // components (DeityModel3D, GaneshaModel3D, and the landing-hero
          // Hero3DScene). Pin it to its own chunk so it never gets folded into
          // `vendor` (which loads on first paint) and is fetched only when a 3D
          // surface mounts. `postprocessing` / `n8ao` back the hero's bloom +
          // vignette + chromatic-aberration pass; `buffer` is pulled in only by
          // the @react-three stack — all three are routed here so the entire
          // postprocessing dependency tree stays out of first paint too.
          if (
            id.includes('/three/') ||
            id.includes('three-stdlib') ||
            id.includes('three-mesh-bvh') ||
            id.includes('@react-three') ||
            id.includes('/postprocessing/') ||
            id.includes('/n8ao/') ||
            id.includes('/buffer/') ||
            id.includes('@use-gesture') ||
            id.includes('/zustand/') ||
            id.includes('suspend-react') ||
            id.includes('/maath/') ||
            id.includes('troika') ||
            id.includes('its-fine') ||
            id.includes('react-reconciler')
          )
            return 'three'
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
