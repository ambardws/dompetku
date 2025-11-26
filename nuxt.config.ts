// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  alias: {
    '~modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    '~shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt'
  ],

  // TailwindCSS configuration
  tailwindcss: {
    cssPath: '~assets/css/tailwind.css',
    configPath: 'tailwind.config.ts'
  },

  // Supabase configuration
  supabase: {
    url: 'https://elytjqsaggnbiaobkyhl.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseXRqcXNhZ2duYmlhb2JreWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDQ0NTAsImV4cCI6MjA3NzIyMDQ1MH0.NeXd6Z3s8Rq_tZvFadAWczl0nRWsjJMiaiXAMBKKliE',
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/', '/auth/*']
    }
  },

  // Runtime config for server-side access
  runtimeConfig: {
    public: {
      supabaseUrl: 'https://elytjqsaggnbiaobkyhl.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseXRqcXNhZ2duYmlhb2JreWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDQ0NTAsImV4cCI6MjA3NzIyMDQ1MH0.NeXd6Z3s8Rq_tZvFadAWczl0nRWsjJMiaiXAMBKKliE'
    },
    telegramBotToken: '7755000663:AAFeBZuO2PId-w3U04G0PgaGwReV5eO2a3c'
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false
  },

  // App configuration
  app: {
    head: {
      title: 'Dompetku',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Personal finance tracker PWA' }
      ]
    }
  },

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Dompetku - Personal Finance Manager',
      short_name: 'Dompetku',
      description: 'Kelola keuangan pribadi dengan mudah',
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  // Build configuration
  build: {
    transpile: []
  },

  // Vite configuration
  vite: {
    server: {
      allowedHosts: ['d5e500964643.ngrok-free.app']
    }
  }
})
