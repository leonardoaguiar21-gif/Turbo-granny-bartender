import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 43171,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:43172',
        changeOrigin: true,
      },
    },
  },
})