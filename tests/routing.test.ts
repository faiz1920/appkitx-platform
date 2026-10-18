import type { AstroIntegration } from "astro";
import { describe, expect, it } from "vitest";
import { defaultLocale, locales } from "../src/i18n/config";
import {
  alternateLinks,
  astroI18nLocales,
  isTranslatedPage,
  localizedPath,
  nonDefaultLocales,
  sitemapI18n,
  stripLocalePrefix,
  swapLocalePath,
  translatedPagePaths,
} from "../src/i18n/routing";
import { publishedCategoryPaths } from "../src/lib/categories";
import { tools } from "../src/lib/tools";

/*
 * M3/M4 wiring guarantees: the locale registry is the single source of
 * truth for Astro's i18n routing, the @astrojs/sitemap i18n option, the
 * hreflang alternates, and the URL helpers. These tests fail when the
 * registry and the derivations drift apart.
 */

describe("Astro i18n locales", () => {
  it("derives exactly the registry locales", () => {
    const expected = Object.values(locales).map(({ code, hreflang }) => ({
      path: code,
      codes: [hreflang],
    }));
    expect(astroI18nLocales()).toEqual(expected);
    expect(astroI18nLocales()).toContainEqual({ path: "en", codes: ["en"] });
    expect(astroI18nLocales()).toContainEqual({ path: "es", codes: ["es"] });
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
    const localesMap = Object.fromEntries(
      Object.values(locales).map(({ code, hreflang }) => [code, hreflang]),
    );
    expect(sitemapI18n()).toEqual({ defaultLocale, locales: localesMap });
    expect(sitemapI18n().locales).toMatchObject({ en: "en", es: "es" });
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

describe("locale path helpers", () => {
  it("returns non-default locales from the registry", () => {
    const expected = (
      Object.keys(locales) as Array<keyof typeof locales>
    ).filter((code) => code !== defaultLocale);
    expect(nonDefaultLocales()).toEqual(expected);
    expect(nonDefaultLocales()).toContain("es");
  });

  it("localizes paths without touching English", () => {
    expect(localizedPath("/", "en")).toBe("/");
    expect(localizedPath("/percentage-calculator", "en")).toBe(
      "/percentage-calculator",
    );
    expect(localizedPath("/", "es")).toBe("/es/");
    expect(localizedPath("/percentage-calculator", "es")).toBe(
      "/es/percentage-calculator",
    );
  });

  it("strips locale prefixes with and without trailing slashes", () => {
    expect(stripLocalePrefix("/")).toEqual({ locale: "en", path: "/" });
    expect(stripLocalePrefix("/percentage-calculator/")).toEqual({
      locale: "en",
      path: "/percentage-calculator",
    });
    expect(stripLocalePrefix("/es")).toEqual({ locale: "es", path: "/" });
    expect(stripLocalePrefix("/es/")).toEqual({ locale: "es", path: "/" });
    expect(stripLocalePrefix("/es/percentage-calculator/")).toEqual({
      locale: "es",
      path: "/percentage-calculator",
    });
  });

  it("swaps the locale of a pathname in both directions", () => {
    expect(swapLocalePath("/percentage-calculator", "es")).toBe(
      "/es/percentage-calculator",
    );
    expect(swapLocalePath("/es/percentage-calculator", "en")).toBe(
      "/percentage-calculator",
    );
    expect(swapLocalePath("/es/", "en")).toBe("/");
    expect(swapLocalePath("/", "es")).toBe("/es/");
  });

  it("keeps the translated page set registry-derived", () => {
    const expected = [
      "/",
      ...tools.map((tool) => tool.href),
      ...publishedCategoryPaths(),
    ];
    expect(translatedPagePaths()).toEqual(expected);
    expect(translatedPagePaths()).toEqual(
      expect.arrayContaining([
        "/",
        "/percentage-calculator",
        "/discount-calculator",
        "/calculators",
      ]),
    );
  });

  it("recognizes translated pages with or without a locale prefix", () => {
    expect(isTranslatedPage("/")).toBe(true);
    expect(isTranslatedPage("/percentage-calculator/")).toBe(true);
    expect(isTranslatedPage("/es/calculators/")).toBe(true);
    expect(isTranslatedPage("/privacy")).toBe(false);
    expect(isTranslatedPage("/es/privacy/")).toBe(false);
  });

  it("includes every published category path in the translated set", () => {
    for (const path of publishedCategoryPaths()) {
      expect(translatedPagePaths()).toContain(path);
    }
  });
});

describe("alternateLinks", () => {
  it("lists every locale plus x-default for the English homepage", () => {
    expect(alternateLinks("/")).toEqual([
      { hreflang: "en", path: "/" },
      { hreflang: "es", path: "/es/" },
      { hreflang: "x-default", path: "/" },
    ]);
  });

  it("is reciprocal from a localized page", () => {
    expect(alternateLinks("/es/percentage-calculator/")).toEqual([
      { hreflang: "en", path: "/percentage-calculator" },
      { hreflang: "es", path: "/es/percentage-calculator" },
      { hreflang: "x-default", path: "/percentage-calculator" },
    ]);
  });

  it("pairs category landing pages across locales", () => {
    expect(alternateLinks("/calculators/")).toEqual([
      { hreflang: "en", path: "/calculators" },
      { hreflang: "es", path: "/es/calculators" },
      { hreflang: "x-default", path: "/calculators" },
    ]);
    expect(alternateLinks("/es/calculators/")).toEqual([
      { hreflang: "en", path: "/calculators" },
      { hreflang: "es", path: "/es/calculators" },
      { hreflang: "x-default", path: "/calculators" },
    ]);
  });

  it("points x-default at the unprefixed English URL from every page", () => {
    for (const pathname of [
      "/",
      "/es/",
      "/percentage-calculator/",
      "/es/discount-calculator/",
      "/calculators/",
      "/es/calculators/",
    ]) {
      const xDefault = alternateLinks(pathname).find(
        (link) => link.hreflang === "x-default",
      );
      expect(xDefault?.path.startsWith("/es")).toBe(false);
    }
  });

  it("emits no alternates for pages outside the translated set", () => {
    expect(alternateLinks("/privacy")).toEqual([]);
    expect(alternateLinks("/privacy/")).toEqual([]);
    expect(alternateLinks("/es/privacy/")).toEqual([]);
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
