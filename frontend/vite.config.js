import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',      // écoute sur toutes les interfaces réseau
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // backend sur la même machine
        changeOrigin: true,
        secure: false,
      }
    }
  }
})