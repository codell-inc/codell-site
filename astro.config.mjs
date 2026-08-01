import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://codell.jp",
  output: "static",
  outDir: "./docs",
  vite: {
    build: {
      emptyOutDir: false,
    },
  },
});
