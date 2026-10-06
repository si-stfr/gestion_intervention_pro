import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Par défaut Vite vise Chrome 111+ / Safari 16.4+, ce qui laisse une page blanche
    // sur les tablettes dont le navigateur ou la WebView ne sont plus à jour.
    target: 'es2019',
  },
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
})
