import type { Mode } from "../lib/percentage";

/*
 * Shared dictionary contract for every registered locale (audit M1).
 *
 * - Every entry is a plain string. Composed strings use {token} placeholders
 *   filled by src/i18n/interpolate.ts, so dictionaries stay JSON-serializable
 *   and client scripts can receive their strings through data attributes.
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

/** Percentage Calculator page labels and interface strings. */
export interface PercentageToolStrings {
  title: string;
  metaDescription: string;
  /** H1, breadcrumb, and related-tools label. */
  name: string;
  description: string;
  modeLegend: string;
  modes: Record<Mode, PercentageModeStrings>;
  /** Result value when the operation is undefined. */
  undefinedResult: string;
  captions: PercentageCaptionsStrings;
}

/** Discount Calculator page labels and interface strings. */
export interface DiscountToolStrings {
  title: string;
  metaDescription: string;
  /** H1, breadcrumb, and related-tools label. */
  name: string;
  description: string;
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
}

/** Per-tool dictionaries, keyed by tool. */
export interface ToolsStrings {
  percentage: PercentageToolStrings;
  discount: DiscountToolStrings;
}

/** The complete dictionary contract every registered locale must satisfy. */
export interface Dictionary {
  layout: LayoutStrings;
  nav: NavStrings;
  footer: FooterStrings;
  search: SearchStrings;
  notFound: NotFoundStrings;
  toolLayout: ToolLayoutStrings;
  toolCard: ToolCardStrings;
  calculator: CalculatorStrings;
  tools: ToolsStrings;
}
