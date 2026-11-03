import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [react(), glsl({ include: "**/*.glsl" })],
  server: { host: "0.0.0.0", port: 5173, strictPort: true, allowedHosts: true },
  preview: { host: "0.0.0.0", port: 4173, strictPort: true, allowedHosts: true },
  build: { chunkSizeWarningLimit: 640, target: "es2022" },
});
