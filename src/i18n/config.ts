import type { Dictionary } from "./dictionary";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";

/** Text direction for a locale. */
export type TextDirection = "ltr" | "rtl";

/**
 * Lifecycle state of a locale. Only "supported" locales may be advertised —
 * registered here, listed in the language switcher, and emitted in sitemap
 * and hreflang alternates (see the i18n architecture audit).
 */
export type LocaleStatus = "supported";

/*
 * Translation provenance. This is deliberately separate from LocaleStatus:
 * a locale can be served and listed while its translation is still
 * provisional. "source" is the language the product copy is written in,
 * "provisional" has no recorded human review, and "reviewed" requires a
 * complete TranslationReview record. Automated tests prove structural
 * completeness, never linguistic quality.
 */
export type TranslationStatus = "source" | "provisional" | "reviewed";

export type ReviewerType =
  "native-speaker" | "professional-translator" | "fluent-reviewer";

export type TranslationVerdict = "approved" | "approved-with-fixes";

export interface TranslationReview {
  /** Reviewer name or verified handle. Never inferred from a locale. */
  reviewer: string;
  reviewerType: ReviewerType;
  /** ISO 8601 calendar date, e.g. "2026-10-18". */
  reviewedAt: string;
  /** What was reviewed, including the dictionary file and commit/PR. */
  scope: string;
  verdict: TranslationVerdict;
  notes?: string;
}

export interface TranslationMeta {
  status: TranslationStatus;
  /** Required for "reviewed"; forbidden for "source" and "provisional". */
  review?: TranslationReview;
}

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
  /** Machine-readable translation provenance; see TranslationMeta. */
  translation: TranslationMeta;
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
    translation: { status: "source" },
  },
  es: {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    hreflang: "es",
    ogLocale: "es_ES",
    dir: "ltr",
    intlLocale: "es-ES",
    status: "supported",
    translation: { status: "provisional" },
  },
} as const satisfies Record<string, LocaleMeta>;

export type LocaleCode = keyof typeof locales;

export const defaultLocale = "en" satisfies LocaleCode;

/*
 * The only locales allowed to remain "provisional" while they are served.
 * Every entry must explain how the copy was checked and what review is still
 * outstanding. Adding an entry is a deliberate, reviewable exception — new
 * locales must ship with a complete TranslationReview instead.
 */
export const PROVISIONAL_LOCALES = {
  es: {
    reason:
      "Spanish copy was compared against the English source with an online translation service; native-speaker review has not been recorded.",
  },
} as const satisfies Partial<Record<LocaleCode, { reason: string }>>;

/*
 * Dictionaries for every registered locale. Typing the map as
 * Record<LocaleCode, Dictionary> makes a missing or incomplete dictionary a
 * compile-time error: a locale can never be registered without one, and a
 * dictionary can never be partially typed with fallback entries.
 */
export const dictionaries: Record<LocaleCode, Dictionary> = { en, es };

export function getLocale(locale: LocaleCode = defaultLocale): LocaleMeta {
  return locales[locale];
}

export function getDictionary(locale: LocaleCode = defaultLocale): Dictionary {
  return dictionaries[locale];
}

/** Runtime guard for route params and client-side locale values. */
export function isLocaleCode(value: string): value is LocaleCode {
  return Object.hasOwn(locales, value);
}
