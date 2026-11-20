import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Aspire injects services__api__http__0; otherwise fall back to the Api launch profile.
const apiTarget =
  process.env.services__api__https__0 ??
  process.env.services__api__http__0 ??
  'http://localhost:5018'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
  },
  server: {
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true, secure: false },
      '/auth': { target: apiTarget, changeOrigin: true, secure: false },
    },
  },
})
