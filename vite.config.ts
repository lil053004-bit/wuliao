import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('docx') || id.includes('file-saver')) {
              return 'report';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
          if (id.includes('/src/pages/Admin')) {
            return 'admin';
          }
          if (id.includes('/src/components/') && (
            id.includes('SessionsTab') ||
            id.includes('RedirectLinksTab') ||
            id.includes('GoogleTrackingTab') ||
            id.includes('CacheManagementTab') ||
            id.includes('LineRedirectsTab')
          )) {
            return 'admin';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    target: 'es2015',
    cssCodeSplit: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
