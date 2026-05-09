// Vite config (UTF-8) for admin panel build.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE || '/admin/',
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
        // Removido el rewrite para que el prefijo /api se envie al backend
      }
    }
  },
  preview: {
    port: 3001
  }
})
