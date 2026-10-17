import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://appkitx.com",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
