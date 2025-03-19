import { defineConfig } from "vite";
export default defineConfig({
  server: {
    open: "/index.html",
  },
  base: "/new-gallery/",
  publicDir: "public",
  resolve: {
    alias: {
      // Añade este alias para ayudar con la resolución del CSS
      "photoswipe/style.css": "photoswipe/dist/photoswipe.css",
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: "src/index.html",
      },
      output: {
        manualChunks: {
          photoswipe: ["photoswipe", "photoswipe/lightbox"],
        },
      },
    },
  },
  root: "src",
});
