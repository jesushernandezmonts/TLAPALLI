import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      html2canvas: 'html2canvas-pro',
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
  build: {
    commonjsOptions: {
      include: [/socket.io-client/, /node_modules/],
    },
  },
})
