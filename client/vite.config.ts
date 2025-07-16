import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from 'path';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@server': path.resolve(__dirname, '../server/src'),
    }
  },

  server: {
    proxy: {
      "/api": {
        target:
          "https://lifecontrol-wyndham-lifecontrolscript-kzzhbuwd.mwyndham-business.workers.dev",
        changeOrigin: true,
        secure: true, // use `true` if your backend has a valid SSL cert
        cookieDomainRewrite: "localhost", // rewrite cookie domain to local
      },
    },
  },

  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
