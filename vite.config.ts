import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pdfWorker: resolve(__dirname, 'public/pdf.worker.min.js'),
      },
    },
  },
  server: {
    fs: {
      strict: false
    }
  }
})
