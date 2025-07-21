import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@server': path.resolve(__dirname, '../server/src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target:
          'https://lifecontrol-hackathon-lifecontrolscript-bcfukmeo.mwyndham-business.workers.dev',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: 'localhost', // rewrite cookie domain to local
      },
    },
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
