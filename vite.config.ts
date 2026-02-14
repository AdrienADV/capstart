import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import viteCapacitor from "@capgo/vite-capacitor"

const urlOverride = process.env.CAP_SERVER_URL?.trim()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteCapacitor({
      platforms: ["ios", "android"],
      cleartext: true,
      urlOverride: urlOverride || undefined,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
