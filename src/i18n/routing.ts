import { defaultLocale, locales, type LocaleCode } from "./config";

/*
 * Build-configuration derivations (audit M3). The locale registry in
 * src/i18n/config.ts is the single source of truth; Astro's i18n routing and
 * the @astrojs/sitemap i18n option both consume these helpers so the build
 * configuration can never drift from the registry.
 *
 * With English as the only supported locale, Astro generates no prefixed
 * routes and the sitemap plugin emits no hreflang alternates (it only emits
 * them when a path has more than one locale URL). Both behaviors are locked
 * by tests/routing.test.ts and e2e/routing.spec.ts.
 */

/** Astro `i18n.locales` entry: URL prefix plus BCP-47 codes. */
export interface AstroLocaleRoute {
  path: string;
  codes: [string, ...string[]];
}

export function astroI18nLocales(): AstroLocaleRoute[] {
  return Object.values(locales).map(({ code, hreflang }): AstroLocaleRoute => ({
    path: code,
    codes: [hreflang],
  }));
}

/** @astrojs/sitemap `i18n` option: default locale plus prefix-to-hreflang map. */
export interface SitemapI18n {
  defaultLocale: LocaleCode;
  locales: Record<string, string>;
}

export function sitemapI18n(): SitemapI18n {
  return {
    defaultLocale,
    locales: Object.fromEntries(
      Object.values(locales).map(({ code, hreflang }) => [code, hreflang]),
    ),
  };
}
