import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The RedlineHQ hub. Builds straight into the live site folder:
//   ../redlinehq/index.html  (the page)
//   ../redlinehq/app/        (its script and styles; cleared before each build)
// Everything else in ../redlinehq (interiors/, tech/, portfolio/, assets/) is left alone.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: { outDir: "../redlinehq", emptyOutDir: false, assetsDir: "app" },
});
