import type { Dictionary } from "./dictionary";
import { en } from "./dictionaries/en";

/** Text direction for a locale. */
export type TextDirection = "ltr" | "rtl";

/**
 * Lifecycle state of a locale. Only "supported" locales may be advertised —
 * registered here, listed in the language switcher, and emitted in sitemap
 * and hreflang alternates (see the i18n architecture audit).
 */
export type LocaleStatus = "supported";

export interface LocaleMeta {
  /** BCP-47 language code: registry key and future URL prefix. */
  code: string;
  /** Language name written in the language itself. */
  nativeName: string;
  /** Language name written in English. */
  englishName: string;
  /** BCP-47 value emitted in hreflang alternates and JSON-LD inLanguage. */
  hreflang: string;
  /**
   * Open Graph locale in language_TERRITORY form (e.g. "en_US"). Explicitly
   * mapped per locale — distinct from the BCP-47 hreflang code, never derived
   * at render time.
   */
  ogLocale: string;
  dir: TextDirection;
  /** Locale passed to Intl number and date formatting. */
  intlLocale: string;
  status: LocaleStatus;
}

/*
 * Single source of truth for shipped locales, following the tools registry
 * pattern (src/lib/tools.ts): only a language with a complete, reviewed
 * dictionary may be registered here. Unsupported languages are not listed.
 */
export const locales = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    hreflang: "en",
    ogLocale: "en_US",
    dir: "ltr",
    intlLocale: "en-US",
    status: "supported",
  },
} as const satisfies Record<string, LocaleMeta>;

export type LocaleCode = keyof typeof locales;

export const defaultLocale = "en" satisfies LocaleCode;

/*
 * Dictionaries for every registered locale. Typing the map as
 * Record<LocaleCode, Dictionary> makes a missing or incomplete dictionary a
 * compile-time error: a locale can never be registered without one, and a
 * dictionary can never be partially typed with fallback entries.
 */
export const dictionaries: Record<LocaleCode, Dictionary> = { en };

export function getLocale(locale: LocaleCode = defaultLocale): LocaleMeta {
  return locales[locale];
}

export function getDictionary(locale: LocaleCode = defaultLocale): Dictionary {
  return dictionaries[locale];
}
