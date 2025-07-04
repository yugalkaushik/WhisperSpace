import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          'socket-vendor': ['socket.io-client'],
          'axios-vendor': ['axios'],
          'emoji-vendor': ['emoji-picker-react'],
          'toast-vendor': ['react-hot-toast'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Optimize asset handling
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
