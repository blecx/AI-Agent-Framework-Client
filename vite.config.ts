import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: Core React libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Vendor chunk: Data fetching
          'vendor-fetch': ['axios'],
          // Vendor chunk: Utilities
          'vendor-utils': ['zod'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Adjust warning threshold
    minify: 'esbuild', // Use esbuild for fast minification
  },
});
