import type { ToolCategory } from "../lib/tools";
import type { Mode } from "../lib/percentage";

/*
 * Shared dictionary contract for every registered locale (audit M1, extended
 * by the M4 Spanish pilot).
 *
 * - Leaf values are plain strings. Containers are objects or readonly arrays
 *   of strings (search keywords, prose paragraphs and list items), so every
 *   dictionary stays JSON-serializable and client scripts can receive their
 *   strings through data attributes.
 * - Composed strings use {token} placeholders filled by
 *   src/i18n/interpolate.ts.
 * - Prose strings may mark inline code with backticks; ProseText splits them
 *   into text and <code> nodes (src/i18n/prose.ts).
 * - A locale's dictionary is typed as Dictionary, so the compiler rejects a
 *   missing or unknown key instead of silently falling back to English.
 */

/** BaseLayout defaults and page chrome shared by every page. */
export interface LayoutStrings {
  defaultTitle: string;
  defaultDescription: string;
  skipToContent: string;
}

/** Global navigation (GlobalNav). */
export interface NavStrings {
  ariaLabel: string;
  tools: string;
  categories: string;
  about: string;
  searchLabel: string;
  searchShortcut: string;
  menuAriaLabel: string;
}

/** Language switcher (LanguageSwitcher). */
export interface LanguageStrings {
  /** Visible summary label, e.g. "Language". */
  label: string;
  /** Panel landmark label. */
  ariaLabel: string;
}

/** Footer columns and legal row. */
export interface FooterStrings {
  columns: {
    tools: {
      heading: string;
      percentageCalculator: string;
      discountCalculator: string;
      unitConverter: string;
      loanCalculator: string;
      dateCalculator: string;
    };
    categories: {
      heading: string;
      calculators: string;
      converters: string;
      developerTools: string;
    };
    company: {
      heading: string;
      about: string;
      contact: string;
    };
    legal: {
      heading: string;
      privacy: string;
      terms: string;
    };
  };
  copyright: string;
}

/** Search palette (SearchPalette) and page search forms. */
export interface SearchStrings {
  /** "Search tools" — dialog aria-label, nav trigger, and field labels. */
  label: string;
  /** Palette input placeholder. */
  placeholder: string;
  /** Full-width page search placeholder (homepage, 404). */
  pagePlaceholder: string;
  escapeKey: string;
  /** Results listbox aria-label. */
  resultsLabel: string;
  /** Empty-state message template; token: {query}. */
  noResults: string;
  /** Screen-reader status with no matches; token: {query}. */
  noResultsStatus: string;
  /** Empty-state suggestion before the link. */
  suggestion: string;
  /** Empty-state link text after the suggestion. */
  browseAll: string;
  /** Screen-reader result count, singular; token: {count}. */
  countOne: string;
  /** Screen-reader result count, plural; token: {count}. */
  countMany: string;
}

/** 404 page. */
export interface NotFoundStrings {
  title: string;
  metaDescription: string;
  heading: string;
  body: string;
  goHome: string;
}

/** Homepage hero, category rail, and preview cards (HomeView). */
export interface HomeStrings {
  heroTitle: string;
  heroSubline: string;
  /** Overline label above the category chip rail. */
  browseByCategory: string;
  /** Heading above the tool grid. */
  exploreHeading: string;
  /** Category chip labels keyed by the registry's internal category name. */
  categories: Record<ToolCategory, string>;
  /**
   * Visible but nonfunctional homepage preview cards. They are never added
   * to the tools registry and never appear in search results.
   */
  placeholderTools: {
    unitConverter: { title: string; description: string };
    loanCalculator: { title: string; description: string };
    dateCalculator: { title: string; description: string };
    base64Encoder: { title: string; description: string };
    jsonFormatter: { title: string; description: string };
  };
}

/** Tool page chrome (ToolLayout). */
export interface ToolLayoutStrings {
  breadcrumbLabel: string;
  breadcrumbHome: string;
  relatedTools: string;
}

/** Tool card (ToolCard). */
export interface ToolCardStrings {
  openTool: string;
}

/** Interface strings shared by calculator tools. */
export interface CalculatorStrings {
  calculate: string;
  reset: string;
  resultLabel: string;
  resultsPlaceholder: string;
  formulaLabel: string;
  invalidNumber: string;
  copyResult: string;
  copied: string;
  copyFailed: string;
}

/** One percentage-calculator mode: option label plus input A/B strings. */
export interface PercentageModeStrings {
  optionLabel: string;
  labelA: string;
  hintA: string;
  labelB: string;
  hintB: string;
}

/** Result captions for the percentage calculator; token: {from}. */
export interface PercentageCaptionsStrings {
  /** Tokens: {percent}, {value}. */
  percentOf: string;
  /** Tokens: {part}, {whole}. */
  whatPercent: string;
  /** Tokens: {from}, {to}. */
  noChange: string;
  /** Tokens: {from}, {to}. */
  change: string;
  divideByZero: string;
  changeFromZero: string;
  changeFromNegative: string;
}

/** Formula display templates for a tool. */
export interface FormulaStrings {
  /** Unsubstituted template shown before any calculation. */
  template: string;
  /**
   * Result line template. Tokens: {a}, {b} (entered values, in order) and
   * {result} — formatted with the locale's number conventions.
   */
  describe: string;
}

/**
 * Display templates for a calculated result; token: {value} (formatted).
 * Separate templates per meaning so locales can reorder words and spacing
 * (for example "25% increase" vs "25 % de aumento"); never concatenated.
 */
export interface ResultStrings {
  /** Plain number, no unit. */
  plain: string;
  /** Bare percentage (the "what percent" mode). */
  percent: string;
  /** Positive percentage change. */
  increase: string;
  /** Negative percentage change; {value} is the absolute value. */
  decrease: string;
  /** Exactly zero percent change. */
  zero: string;
}

/** One prose section on a tool page (ToolLayout explanation area). */
export interface ProseSectionStrings {
  heading: string;
  /** Body paragraphs; inline code marked with backticks. */
  paragraphs?: readonly string[];
  /** List items rendered as a <ul>; inline code marked with backticks. */
  items?: readonly string[];
}

/** Percentage Calculator page labels and interface strings. */
export interface PercentageToolStrings {
  title: string;
  metaDescription: string;
  /** H1, breadcrumb, and related-tools label. */
  name: string;
  /** Tool page subline (long form). */
  description: string;
  /** Homepage, related-tools, and search card text (short form). */
  cardDescription: string;
  /** Localized search terms for the search palette. */
  keywords: readonly string[];
  modeLegend: string;
  modes: Record<Mode, PercentageModeStrings>;
  /** Result value when the operation is undefined. */
  undefinedResult: string;
  captions: PercentageCaptionsStrings;
  /** Unsubstituted template and result line per mode. */
  formulas: Record<Mode, FormulaStrings>;
  results: ResultStrings;
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Discount Calculator page labels and interface strings. */
export interface DiscountToolStrings {
  title: string;
  metaDescription: string;
  /** H1, breadcrumb, and related-tools label. */
  name: string;
  /** Tool page subline (long form). */
  description: string;
  /** Homepage, related-tools, and search card text (short form). */
  cardDescription: string;
  /** Localized search terms for the search palette. */
  keywords: readonly string[];
  priceLabel: string;
  priceHint: string;
  percentLabel: string;
  percentHint: string;
  finalPriceLabel: string;
  savingsLabel: string;
  errors: {
    negativePrice: string;
    percentRange: string;
  };
  /** Result caption template; tokens: {percent}, {price}. */
  caption: string;
  /** Clipboard text template; tokens: {price}, {savings}. */
  copyText: string;
  /** Unsubstituted template and result line. */
  formulas: FormulaStrings;
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Per-tool dictionaries, keyed by tool. */
export interface ToolsStrings {
  percentage: PercentageToolStrings;
  discount: DiscountToolStrings;
}

/** Registry tool keys that have dictionary strings (src/lib/tools.ts). */
export type ToolStringsKey = keyof ToolsStrings;

/** The complete dictionary contract every registered locale must satisfy. */
export interface Dictionary {
  layout: LayoutStrings;
  nav: NavStrings;
  language: LanguageStrings;
  footer: FooterStrings;
  search: SearchStrings;
  notFound: NotFoundStrings;
  home: HomeStrings;
  toolLayout: ToolLayoutStrings;
  toolCard: ToolCardStrings;
  calculator: CalculatorStrings;
  tools: ToolsStrings;
}
