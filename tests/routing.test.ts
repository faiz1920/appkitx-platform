import type { AstroIntegration } from "astro";
import { describe, expect, it } from "vitest";
import { defaultLocale, locales } from "../src/i18n/config";
import { astroI18nLocales, sitemapI18n } from "../src/i18n/routing";
import { tools } from "../src/lib/tools";

/*
 * M3 wiring guarantees: the locale registry is the single source of truth
 * for both Astro's i18n routing and the @astrojs/sitemap i18n option. These
 * tests fail when the registry and the build configuration drift apart.
 */

describe("Astro i18n locales", () => {
  it("derives exactly the registry locales", () => {
    expect(astroI18nLocales()).toEqual([{ path: "en", codes: ["en"] }]);
  });

  it("includes the default locale as its own path", () => {
    const paths = astroI18nLocales().map((locale) => locale.path);
    expect(paths).toContain(defaultLocale);
  });

  it("uses the registry code as path and the hreflang code as code", () => {
    for (const route of astroI18nLocales()) {
      const meta = locales[route.path as keyof typeof locales];
      expect(meta).toBeDefined();
      expect(meta.code).toBe(route.path);
      expect(route.codes).toEqual([meta.hreflang]);
    }
  });
});

describe("sitemap i18n", () => {
  it("maps URL prefixes to hreflang codes with the registry default", () => {
    expect(sitemapI18n()).toEqual({
      defaultLocale: "en",
      locales: { en: "en" },
    });
  });

  it("covers every registered locale in both derivations", () => {
    const codes = Object.keys(locales).sort();
    expect(
      astroI18nLocales()
        .map((route) => route.path)
        .sort(),
    ).toEqual(codes);
    expect(Object.keys(sitemapI18n().locales).sort()).toEqual(codes);
  });
});

describe("locale prefix invariants", () => {
  it("registers every locale code in normalized URL-prefix form", () => {
    for (const meta of Object.values(locales)) {
      expect(meta.code).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("never collides with a tool route's first path segment", () => {
    const prefixes = new Set(astroI18nLocales().map((route) => route.path));
    for (const tool of tools) {
      const firstSegment = tool.href.split("/").filter(Boolean)[0];
      expect(
        prefixes.has(firstSegment),
        `${tool.href} must not start with a locale prefix`,
      ).toBe(false);
    }
  });
});

describe("astro.config.ts wiring", () => {
  it("keeps English default, unprefixed, and redirect-free", async () => {
    const { default: config } = await import("../astro.config");

    expect(config.i18n?.defaultLocale).toBe(defaultLocale);
    expect(config.i18n?.locales).toEqual(astroI18nLocales());
    expect(config.i18n?.routing).toEqual({ prefixDefaultLocale: false });

    const integrations = (
      Array.isArray(config.integrations) ? config.integrations : []
    )
      .flat(2)
      .filter(
        (integration): integration is AstroIntegration =>
          typeof integration === "object" && integration !== null,
      );
    expect(integrations.map((integration) => integration.name)).toContain(
      "@astrojs/sitemap",
    );
  });
});
