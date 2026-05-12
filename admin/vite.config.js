import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_BASE || '/admin/',
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3001
  }
})
