import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', '.nuxt', 'dist']
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
