import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'TalkTiles',
        short_name: 'TalkTiles',
        description: 'Tap-to-speak communication board',
        start_url: '/',
        display: 'standalone',
        background_color: '#f4f4f6',
        theme_color: '#5b9bd5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Edit Mode',
            url: '/edit',
            description: 'Add or edit buttons and boards',
          },
        ],
      },
      workbox: {
        // App shell (HTML/JS/CSS) is precached automatically; these are the
        // dynamic, backend-served resources that also need to work offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/boards'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-boards',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 200 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/icons/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'arasaac-icons',
              expiration: { maxEntries: 2000 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'custom-photos',
              expiration: { maxEntries: 500 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    // Without this, Vite only binds to localhost, which is unreachable from
    // an iPad or other device on the same LAN.
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
      '/icons': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001',
      '/icons': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
