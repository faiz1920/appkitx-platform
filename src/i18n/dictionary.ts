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
  /** Alt text for the shared social preview image. */
  socialImageAlt: string;
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
  /**
   * Caption shown for a locale whose translation has not been reviewed.
   * Written in that locale and rendered only while its provenance is
   * "provisional".
   */
  provisional: string;
}

/**
 * Footer columns and legal row. Tool and category labels are derived from
 * their canonical sources (the tool dictionaries and the category map);
 * only column headings and the placeholder tools that live on the homepage
 * remain here.
 */
export interface FooterStrings {
  columns: {
    tools: {
      heading: string;
    };
    categories: {
      heading: string;
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
  /**
   * Visible but nonfunctional homepage preview cards. They are never added
   * to the tools registry and never appear in search results.
   */
  placeholderTools: {
    unitConverter: { title: string; description: string };
    loanCalculator: { title: string; description: string };
  };
}

/** Landing-page copy for one published category (CategoryView). */
export interface CategoryPageStrings {
  /** Browser and Open Graph title, including the brand. */
  title: string;
  metaDescription: string;
  /** Section heading above the category's tool grid. */
  toolsHeading: string;
  /** Short, category-specific intro paragraphs (never template boilerplate). */
  intro: readonly string[];
}

/** One taxonomy category: its visible name plus optional landing-page copy. */
export interface CategoryStrings {
  name: string;
  /**
   * Landing-page copy. Required for every published category (at least
   * CATEGORY_PAGE_MIN_TOOLS registered tools) in every locale — enforced by
   * the category tests and by CategoryView's build-time guard. Categories
   * without a published page omit it.
   */
  page?: CategoryPageStrings;
}

/** Category landing page chrome (CategoryView). */
export interface CategoryLayoutStrings {
  breadcrumbLabel: string;
}

/** Tool page chrome (ToolLayout). */
export interface ToolLayoutStrings {
  breadcrumbLabel: string;
  breadcrumbHome: string;
  relatedTools: string;
  /** Link from Related tools to the tool's category landing page. */
  seeAll: string;
}

/** Tool card (ToolCard). */
export interface ToolCardStrings {
  openTool: string;
  comingSoon: string;
}

/** Interface strings shared by calculator tools. */
export interface CalculatorStrings {
  calculate: string;
  reset: string;
  resultLabel: string;
  resultsPlaceholder: string;
  formulaLabel: string;
  invalidNumber: string;
  /** Shown when separators cannot be interpreted without guessing. */
  ambiguousNumber: string;
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

/** One Base64 Encoder mode: pane labels, hint, and the action button label. */
export interface Base64ModeStrings {
  optionLabel: string;
  inputLabel: string;
  inputHint: string;
  outputLabel: string;
  action: string;
}

/** Base64 Encoder page labels and interface strings. */
export interface Base64ToolStrings {
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
  modes: {
    encode: Base64ModeStrings;
    decode: Base64ModeStrings;
  };
  clear: string;
  errors: {
    emptyEncode: string;
    emptyDecode: string;
    invalid: string;
  };
  /** Status line templates; token: {count}. */
  statusIn: string;
  statusOut: string;
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** One JSON Formatter mode: option label and the action button label. */
export interface JsonModeStrings {
  optionLabel: string;
  action: string;
}

/** JSON Formatter page labels and interface strings. */
export interface JsonFormatterToolStrings {
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
  modes: {
    format: JsonModeStrings;
    minify: JsonModeStrings;
  };
  inputLabel: string;
  inputHint: string;
  outputLabel: string;
  clear: string;
  errors: {
    empty: string;
    invalid: string;
    /** Positioned parse error; tokens: {line}, {column}. */
    invalidAt: string;
  };
  /** Status line templates and validity labels; tokens: {count}. */
  statusIn: string;
  statusOut: string;
  statusValid: string;
  statusInvalid: string;
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** One Date Calculator mode: option label only (fields are shared). */
export interface DateCalculatorModeStrings {
  optionLabel: string;
}

/** Date Calculator page labels and interface strings. */
export interface DateCalculatorToolStrings {
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
  modes: {
    difference: DateCalculatorModeStrings;
    shift: DateCalculatorModeStrings;
  };
  startLabel: string;
  endLabel: string;
  dateLabel: string;
  amountLabel: string;
  amountHint: string;
  unitLabel: string;
  /** Option labels for the amount unit select. */
  units: {
    days: string;
    weeks: string;
    months: string;
    years: string;
  };
  daysLabel: string;
  breakdownLabel: string;
  resultDateLabel: string;
  weekdayLabel: string;
  errors: {
    emptyStart: string;
    emptyEnd: string;
    emptyDate: string;
    amountRange: string;
  };
  /** Difference caption template; tokens: {from}, {to}. */
  differenceCaption: string;
  /** Shift caption template for positive amounts; tokens: {amount}, {date}. */
  shiftAddCaption: string;
  /** Shift caption template for negative amounts; tokens: {amount}, {date}. */
  shiftSubtractCaption: string;
  /** Clipboard text template; tokens: {days}, {from}, {to}, {breakdown}. */
  differenceCopy: string;
  /** Clipboard text template; tokens: {date}, {weekday}. */
  shiftCopy: string;
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Age Calculator page labels and interface strings. */
export interface AgeCalculatorToolStrings {
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
  birthLabel: string;
  birthHint: string;
  ageLabel: string;
  totalDaysLabel: string;
  /** Result caption template; tokens: {date}. */
  caption: string;
  /** Clipboard text template; tokens: {age}, {days}. */
  copyText: string;
  errors: {
    empty: string;
    future: string;
  };
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Per-tool dictionaries, keyed by tool. */
export interface ToolsStrings {
  percentage: PercentageToolStrings;
  discount: DiscountToolStrings;
  base64: Base64ToolStrings;
  json: JsonFormatterToolStrings;
  dateCalculator: DateCalculatorToolStrings;
  ageCalculator: AgeCalculatorToolStrings;
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
  categories: Record<ToolCategory, CategoryStrings>;
  toolLayout: ToolLayoutStrings;
  categoryLayout: CategoryLayoutStrings;
  toolCard: ToolCardStrings;
  calculator: CalculatorStrings;
  tools: ToolsStrings;
}
