import { defineConfig } from "vite";
export default defineConfig({
  server: {
    open: "/index.html",
  },
  base: "/new-gallery/",
  // Asegúrate de que los archivos estáticos se sirvan correctamente
  publicDir: "public",
  // Configuración para resolver módulos
  resolve: {
    alias: {
      // Si necesitas alguna alias específico
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    // Maneja mejor los archivos grandes
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          photoswipe: ["photoswipe", "photoswipe/lightbox"],
        },
      },
    },
  },
  root: "src",
});
