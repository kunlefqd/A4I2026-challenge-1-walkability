import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Tract heat-risk API (../api) during local development.
    proxy: { '/api': 'http://localhost:8080' },
  },
})
