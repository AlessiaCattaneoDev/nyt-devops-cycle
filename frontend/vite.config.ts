import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In produzione (Vercel) l'app e' servita alla root. In locale il dev server
// inoltra /api al BFF Express (`backend` in docker-compose, localhost fuori da Docker).
const backendOrigin = process.env.VITE_BACKEND_ORIGIN ?? 'http://localhost:3001'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: backendOrigin,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
})
