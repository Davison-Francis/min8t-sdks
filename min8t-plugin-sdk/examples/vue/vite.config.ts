import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Vite Configuration for min8t Vue 3 Example
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [
    vue({
      script: {
        // Enable TypeScript in <script setup>
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@min8t.com/plugin-sdk': fileURLToPath(new URL('../../dist/index.d.ts', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020'
  }
})
