// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  srcDir: 'app/',

  alias: {
    '~modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
    '~shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
  },

  // SSR configuration
  ssr: true,

  // Nitro configuration for Netlify
  nitro: {
    preset: 'netlify',
    serveStatic: true,
    output: {
      dir: '.netlify',
      serverDir: '.netlify/functions-internal',
      publicDir: 'dist'
    }
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt'
  ],

  // TailwindCSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts'
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
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
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    },
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
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
              maxAgeSeconds: 60 * 60 * 24
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
      allowedHosts: ['dompetkuassistant.netlify.app']
    }
  }
})