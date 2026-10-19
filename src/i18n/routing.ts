import { defaultLocale, locales, type LocaleCode } from "./config";
import { publishedCategoryPaths } from "../lib/categories";
import { tools } from "../lib/tools";

/*
 * Build-configuration and URL derivations (audit M3, extended by the M4
 * Spanish pilot). The locale registry in src/i18n/config.ts is the single
 * source of truth; Astro's i18n routing, the @astrojs/sitemap i18n option,
 * the hreflang alternates, and the language switcher all consume these
 * helpers so nothing can drift from the registry.
 *
 * English stays the default, unprefixed locale. Every non-default locale is
 * prefixed (/es/...) and must exist as a static route for every translated
 * page (see translatedPagePaths and the [locale] pages).
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

/** Every registered locale except the unprefixed default. */
export function nonDefaultLocales(): LocaleCode[] {
  return (Object.keys(locales) as LocaleCode[]).filter(
    (code) => code !== defaultLocale,
  );
}

/** Site-relative href for a locale-less path, e.g. "/" or "/percentage-calculator". */
export function localizedPath(path: string, locale: LocaleCode): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  if (normalized === "/") return `/${locale}/`;
  return `/${locale}${normalized}`;
}

/** Site-relative canonical href for an indexable page, with a trailing slash. */
export function localizedHref(path: string, locale: LocaleCode): string {
  const localized = localizedPath(path, locale);
  return localized.endsWith("/") ? localized : `${localized}/`;
}

function trimTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** Split a pathname into its locale (when prefixed) and the locale-less path. */
export function stripLocalePrefix(pathname: string): {
  locale: LocaleCode;
  path: string;
} {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalized.split("/").filter(Boolean);
  const first = segments[0];
  if (first !== undefined && first !== defaultLocale && first in locales) {
    const rest = segments.slice(1).join("/");
    return {
      locale: first as LocaleCode,
      path: rest === "" ? "/" : `/${rest}`,
    };
  }
  return { locale: defaultLocale, path: trimTrailingSlash(normalized) };
}

/** Rewrite a pathname to the same page in another locale. */
export function swapLocalePath(pathname: string, locale: LocaleCode): string {
  return localizedPath(stripLocalePrefix(pathname).path, locale);
}

/*
 * Every page that exists in every supported locale. Registry-derived: the
 * homepage, the tools registry, and the published category pages. The
 * [locale] route generation, the preference script guard, and the
 * language-switcher fallback all consume this list, so a page can never be
 * advertised for a locale that lacks it.
 */
export function translatedPagePaths(): string[] {
  return ["/", ...tools.map((tool) => tool.href), ...publishedCategoryPaths()];
}

/**
 * True when a pathname exists in every supported locale. Alternates are
 * emitted only for these pages, so an English-only page added later can never
 * advertise a locale URL that was not built.
 */
export function isTranslatedPage(pathname: string): boolean {
  return translatedPagePaths().includes(stripLocalePrefix(pathname).path);
}

/** One hreflang alternate: BCP-47 code (or "x-default") plus locale-less path. */
export interface AlternateLink {
  hreflang: string;
  path: string;
}

/*
 * Reciprocal hreflang alternates for a pathname: one per registered locale
 * plus x-default pointing at the unprefixed English page. Emitted into the
 * page head only; the sitemap keeps the plugin's native en/es pairs.
 */
export function alternateLinks(pathname: string): AlternateLink[] {
  if (!isTranslatedPage(pathname)) return [];
  return [
    ...Object.values(locales).map((meta) => ({
      hreflang: meta.hreflang,
      path: swapLocalePath(pathname, meta.code),
    })),
    { hreflang: "x-default", path: swapLocalePath(pathname, defaultLocale) },
  ];
}
