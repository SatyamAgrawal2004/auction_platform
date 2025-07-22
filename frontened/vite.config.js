import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true, // ✅ Allow Vite to bind to 0.0.0.0 (required on Render)
    port: process.env.PORT || 5173, // ✅ Use Render's assigned port
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
