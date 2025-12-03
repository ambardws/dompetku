import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'path'

export default defineConfig({
  server: {
    allowedHosts: ['dompetkuassistant.netlify.app']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', '.nuxt', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '.nuxt/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types/',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
