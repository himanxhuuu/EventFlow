import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Run the React dev server on a different port than the backend
    // so they don't conflict when the API uses port 3000.
    port: 3001,
    proxy: {
      '/api': {
        // Proxy all API requests to the backend on port 3000
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

