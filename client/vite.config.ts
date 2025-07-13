import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],

  server: {
    proxy: {
      "/api": {
        target:
          "https://lifecontrol-wyndham-lifecontrolscript-dkstnwre.mwyndham-business.workers.dev",
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
