import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If you deploy to GitHub Pages under https://<you>.github.io/passion-dsa/
  base: '/passion-dsa/',
  server: {
    proxy: { '/api': { target: 'http://localhost:8787', changeOrigin: true } }
  }
})
