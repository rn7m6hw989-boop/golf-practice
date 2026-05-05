import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Base path matches the GitHub Pages subpath. Both dev and production use
// this so behavior is consistent.
const BASE = "/golf-practice/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // The plugin generates a service worker that caches the app shell and
      // serves it offline. `scope` and `start_url` use the same base path.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
      manifest: {
        name: "Golf Practice",
        short_name: "Golf",
        description:
          "Putting drills with benchmark grading from Every Shot Counts.",
        theme_color: "#4ADE80",
        background_color: "#0F1410",
        display: "standalone",
        orientation: "portrait",
        scope: BASE,
        start_url: BASE,
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
