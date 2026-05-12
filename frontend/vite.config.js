import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE || '/',

  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src')
    }
  },

  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },

  preview: {
    port: 3000
  }
})
