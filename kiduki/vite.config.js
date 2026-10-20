import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const devHost = process.env.LANDING_DEV_HOST;
const devAllowedHosts = process.env.LANDING_DEV_ALLOWED_HOSTS?.split(",")
  .map((host) => host.trim())
  .filter((host) => host.length > 0);

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 4173,
    strictPort: true,
    ...(devHost ? { host: devHost } : {}),
    ...(devAllowedHosts && devAllowedHosts.length > 0 ? { allowedHosts: devAllowedHosts } : {}),
  },
});
