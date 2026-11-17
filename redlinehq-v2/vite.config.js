import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Built into ../redlinehq/v2 so it is served at redlinehq.work/v2/
export default defineConfig({
  base: "/v2/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "../redlinehq/v2", emptyOutDir: true },
});
