import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cspReportOnly from "./src/integrations/csp-report-only";
import { defaultLocale } from "./src/i18n/config";
import { astroI18nLocales, sitemapI18n } from "./src/i18n/routing";

export default defineConfig({
  site: "https://appkitx.com",
  output: "static",
  i18n: {
    defaultLocale,
    locales: astroI18nLocales(),
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404"),
      i18n: sitemapI18n(),
    }),
    cspReportOnly(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
