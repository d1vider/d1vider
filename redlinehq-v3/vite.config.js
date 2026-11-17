import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Built into ../redlinehq/v3 so it is served at redlinehq.work/v3/
export default defineConfig({
  base: "/v3/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "../redlinehq/v3", emptyOutDir: true },
});
