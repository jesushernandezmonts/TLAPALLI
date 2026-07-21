import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'tlapalli-logo.png'],
      manifest: {
        name: 'TLAPALLI - Centro Cultural',
        short_name: 'Tlapalli',
        description: 'Sistema de Gestión Integral para el Centro Cultural Tlapalli',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'tlapalli-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  resolve: {
    alias: {
      html2canvas: 'html2canvas-pro',
    },
  },
})

