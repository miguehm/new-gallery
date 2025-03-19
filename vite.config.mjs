import { defineConfig } from "vite";
export default defineConfig({
  server: {
    open: "/index.html",
  },
  base: "/new-gallery/",
  publicDir: "public",
  resolve: {
    alias: {},
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      external: ["photoswipe/style.css"],
      output: {
        manualChunks: {
          photoswipe: ["photoswipe", "photoswipe/lightbox"],
        },
      },
    },
  },
  root: "src",
});
