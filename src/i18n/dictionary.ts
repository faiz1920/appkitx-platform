import type { ToolCategory } from "../lib/tools";
import type { Mode } from "../lib/percentage";
import type {
  AreaUnit,
  LengthUnit,
  TemperatureUnit,
  UnitCategory,
  VolumeUnit,
  WeightUnit,
} from "../lib/unit-convert";
import type { TermUnit } from "../lib/loan";
import type { TenureUnit } from "../lib/emi";
import type {
  CompoundingFrequency,
  ContributionTiming,
  DurationUnit,
} from "../lib/compound-interest";
import type { SpeedUnit } from "../lib/speed";
import type { RetirementMode } from "../lib/retirement";
import type { CuratedTimeZone } from "../lib/time-zone";
import type {
  QrContentType,
  QrIssueCode,
  QrWifiSecurity,
} from "../lib/qr-payload";
import type { QrEccLevel, QrSizePreset } from "../lib/qr-options";
import type { HashAlgorithm } from "../lib/hash";
import type { CaseMode } from "../lib/case-convert";
import type {
  AngleMode,
  ScientificControlKey,
  ScientificFunctionKey,
  ScientificIssue,
} from "../lib/scientific";

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
  guides: string;
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
      affiliateDisclosure: string;
    };
  };
  /** Link from the Tools column to the English-only hardware guides. */
  guides: string;
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

/** Homepage hero, category rail, and tool grid (HomeView). */
export interface HomeStrings {
  heroTitle: string;
  heroSubline: string;
  /** Overline label above the category chip rail. */
  browseByCategory: string;
  /** Heading above the tool grid. */
  exploreHeading: string;
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

/** Loan Calculator page labels and interface strings. */
export interface LoanCalculatorToolStrings {
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
  amountLabel: string;
  amountHint: string;
  rateLabel: string;
  rateHint: string;
  termLabel: string;
  termHint: string;
  /** Label for the years/months select beside the term field. */
  termUnitLabel: string;
  /** Option labels for the term unit select. */
  termUnits: Record<TermUnit, string>;
  monthlyLabel: string;
  interestLabel: string;
  totalLabel: string;
  errors: {
    amount: string;
    rate: string;
    term: string;
  };
  /** Result caption template; tokens: {amount}, {rate}, {months}. */
  caption: string;
  /** Clipboard text template; tokens: {monthly}, {interest}, {total}. */
  copyText: string;
  /** Unsubstituted template and derived monthly-rate line. */
  formulas: {
    template: string;
    /** Tokens: {rate}, {monthlyRate}. */
    describe: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Unit Converter page labels and interface strings. */
export interface UnitConverterToolStrings {
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
  categoryLegend: string;
  /** Option labels for the conversion category control. */
  categories: Record<UnitCategory, string>;
  /**
   * Localized unit names, keyed by the registry ids in
   * src/lib/unit-convert.ts. Symbols are appended by the component.
   */
  units: {
    length: Record<LengthUnit, string>;
    weight: Record<WeightUnit, string>;
    temperature: Record<TemperatureUnit, string>;
    area: Record<AreaUnit, string>;
    volume: Record<VolumeUnit, string>;
  };
  valueLabel: string;
  valueHint: string;
  fromLabel: string;
  toLabel: string;
  errors: {
    belowAbsoluteZero: string;
  };
  /** Conversion line template; tokens: {value}, {from}, {result}, {to}. */
  caption: string;
  /** Clipboard text template; tokens: {value}, {from}, {result}, {to}. */
  copyText: string;
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Speed Converter page labels and interface strings. */
export interface SpeedConverterToolStrings {
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
  /**
   * Localized unit names, keyed by the registry ids in
   * src/lib/speed.ts. Symbols are appended by the component.
   */
  units: Record<SpeedUnit, string>;
  valueLabel: string;
  valueHint: string;
  fromLabel: string;
  toLabel: string;
  /** Conversion line template; tokens: {value}, {from}, {result}, {to}. */
  caption: string;
  /** Clipboard text template; tokens: {value}, {from}, {result}, {to}. */
  copyText: string;
  /** Shown when a finite input converts outside the finite numeric range. */
  resultOverflow: string;
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

/** Shared labels for one QR input field. */
export interface QrFieldStrings {
  label: string;
  hint: string;
  placeholder: string;
}

/** QR Code Generator page labels and interface strings. */
export interface QrCodeGeneratorToolStrings {
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
  contentTypeLabel: string;
  contentTypes: Record<QrContentType, string>;
  fields: {
    url: QrFieldStrings;
    text: QrFieldStrings;
    email: QrFieldStrings;
    phone: QrFieldStrings;
    sms: {
      phone: QrFieldStrings;
      message: QrFieldStrings;
    };
    wifi: {
      ssid: QrFieldStrings;
      password: QrFieldStrings;
      passwordShow: string;
      passwordHide: string;
      securityLabel: string;
      securityHint: string;
      securityOptions: Record<QrWifiSecurity, string>;
      hiddenLabel: string;
      hiddenHint: string;
    };
    vcard: {
      name: QrFieldStrings;
      phone: QrFieldStrings;
      email: QrFieldStrings;
      organization: QrFieldStrings;
      website: QrFieldStrings;
    };
  };
  customization: {
    heading: string;
    foregroundLabel: string;
    backgroundLabel: string;
    sizeLabel: string;
    sizeHint: string;
    sizeOptions: Record<QrSizePreset, string>;
    eccLabel: string;
    eccHint: string;
    eccOptions: Record<QrEccLevel, string>;
    quietZoneLabel: string;
    quietZoneHint: string;
  };
  preview: {
    heading: string;
    placeholder: string;
    alt: string;
    downloadPng: string;
    downloadSvg: string;
    copyImage: string;
    copied: string;
    copyFailed: string;
    copyUnsupported: string;
    capacityError: string;
    privacyTitle: string;
    privacyBody: string;
    warnings: {
      inverted: string;
      lowContrast: string;
    };
  };
  validation: Record<QrIssueCode, string>;
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** UUID Generator page labels and interface strings. */
export interface UuidGeneratorToolStrings {
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
  quantityLabel: string;
  quantityHint: string;
  optionsHeading: string;
  uppercaseLabel: string;
  uppercaseHint: string;
  compactLabel: string;
  compactHint: string;
  generate: string;
  copyAll: string;
  clear: string;
  resultsHeading: string;
  /** Live result count, singular; token: {count}. */
  countOne: string;
  /** Live result count, plural; token: {count}. */
  countMany: string;
  /** Per-row copy button label; token: {index}. */
  copyUuid: string;
  copied: string;
  copyFailed: string;
  emptyTitle: string;
  emptyBody: string;
  privacyTitle: string;
  privacyBody: string;
  errors: {
    quantity: string;
    unsupportedTitle: string;
    unsupportedBody: string;
  };
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Hash Generator page labels and interface strings. */
export interface HashGeneratorToolStrings {
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
  algorithmLegend: string;
  algorithmHint: string;
  algorithms: Record<HashAlgorithm, string>;
  inputLabel: string;
  inputHint: string;
  inputPlaceholder: string;
  generate: string;
  clear: string;
  outputLabel: string;
  outputPlaceholder: string;
  outputHint: string;
  copyHash: string;
  copied: string;
  copyFailed: string;
  /** Result summary; tokens: {algorithm}, {count}. */
  digestSummary: string;
  /** Loading status; token: {algorithm}. */
  statusGenerating: string;
  errors: {
    empty: string;
    unsupportedTitle: string;
    unsupportedBody: string;
    digestTitle: string;
    digestBody: string;
  };
  securityTitle: string;
  securityBody: string;
  privacyTitle: string;
  privacyBody: string;
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Word Counter page labels and interface strings. */
export interface WordCounterToolStrings {
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
  inputLabel: string;
  inputHint: string;
  inputPlaceholder: string;
  copyText: string;
  copySuccess: string;
  copyFailure: string;
  statsHeading: string;
  statsHint: string;
  emptyHint: string;
  stats: {
    characters: string;
    charactersNoSpaces: string;
    words: string;
    sentences: string;
    paragraphs: string;
    lines: string;
    readingTime: string;
    speakingTime: string;
  };
  /** Duration templates; tokens: {seconds}, {minutes}, {minutes}, {seconds}. */
  duration: {
    seconds: string;
    minutes: string;
    minutesSeconds: string;
  };
  privacyTitle: string;
  privacyBody: string;
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Case Converter page labels and interface strings. */
export interface CaseConverterToolStrings {
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
  inputLabel: string;
  inputHint: string;
  inputPlaceholder: string;
  modeLabel: string;
  modeHint: string;
  modes: Record<CaseMode, string>;
  outputLabel: string;
  outputHint: string;
  outputPlaceholder: string;
  copyOutput: string;
  copySuccess: string;
  copyFailure: string;
  privacyTitle: string;
  privacyBody: string;
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
    invalidStart: string;
    invalidEnd: string;
    invalidDate: string;
    amountRange: string;
    resultRange: string;
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
    invalid: string;
    future: string;
  };
  /** Explanation sections rendered by ProseText below the tool. */
  sections: readonly ProseSectionStrings[];
}

/** Visible and accessible labels for one scientific calculator key. */
export interface ScientificKeyLabel {
  label: string;
  ariaLabel: string;
}

/** Scientific Calculator page labels and interface strings. */
export interface ScientificCalculatorToolStrings {
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
  angleModeLegend: string;
  angleModes: Record<AngleMode, string>;
  angleModeHint: string;
  expressionLabel: string;
  expressionHint: string;
  expressionPlaceholder: string;
  keypadLabel: string;
  functionKeys: Record<ScientificFunctionKey, ScientificKeyLabel>;
  controlKeys: Record<ScientificControlKey, ScientificKeyLabel>;
  /** Result line template; tokens: {expression}, {result}. */
  resultCaption: string;
  historyHeading: string;
  historyHint: string;
  historyEmpty: string;
  historyResultLabel: string;
  useExpression: string;
  useResult: string;
  keyboardHelp: string;
  errors: Record<ScientificIssue, string>;
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** EMI Calculator page labels and interface strings. */
export interface EmiCalculatorToolStrings {
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
  amountLabel: string;
  amountHint: string;
  rateLabel: string;
  rateHint: string;
  tenureLabel: string;
  tenureHint: string;
  tenureUnitLabel: string;
  tenureUnits: Record<TenureUnit, string>;
  emiLabel: string;
  principalLabel: string;
  interestLabel: string;
  totalLabel: string;
  breakdownHeading: string;
  /** Share line template; tokens: {amount}, {percent}. */
  principalShare: string;
  /** Share line template; tokens: {amount}, {percent}. */
  interestShare: string;
  scheduleHeading: string;
  scheduleHint: string;
  scheduleEmpty: string;
  /** Annual group heading template; token: {year}. */
  yearLabel: string;
  openingBalanceLabel: string;
  principalPaidLabel: string;
  interestPaidLabel: string;
  totalPaidLabel: string;
  closingBalanceLabel: string;
  /** Table caption template; token: {year}. */
  monthlyTableCaption: string;
  /** Scroll-region label template; token: {year}. */
  scheduleScrollLabel: string;
  tableHeaders: {
    paymentNumber: string;
    openingBalance: string;
    payment: string;
    interest: string;
    principal: string;
    closingBalance: string;
  };
  copySummary: string;
  /** Clipboard text template; tokens: {amount}, {emi}, {principal}, {interest}, {total}, {months}. */
  copyText: string;
  /** Result caption template; tokens: {amount}, {rate}, {months}. */
  caption: string;
  formulas: {
    template: string;
    /** Tokens: {rate}, {monthlyRate}. */
    describe: string;
  };
  errors: {
    amount: string;
    rate: string;
    tenure: string;
    fractionalTenure: string;
    overflow: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Compound Interest Calculator page labels and interface strings. */
export interface CompoundInterestToolStrings {
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
  principalLabel: string;
  principalHint: string;
  rateLabel: string;
  rateHint: string;
  durationLabel: string;
  durationHint: string;
  durationUnitLabel: string;
  durationUnits: Record<DurationUnit, string>;
  frequencyLabel: string;
  frequencyHint: string;
  frequencies: Record<CompoundingFrequency, string>;
  contributionLabel: string;
  contributionHint: string;
  timingLabel: string;
  timingHint: string;
  finalValueLabel: string;
  initialLabel: string;
  contributionsLabel: string;
  investedLabel: string;
  interestLabel: string;
  breakdownHeading: string;
  /** Share line template; tokens: {amount}, {percent}. */
  investedShare: string;
  /** Share line template; tokens: {amount}, {percent}. */
  interestShare: string;
  growthHeading: string;
  growthHint: string;
  growthEmpty: string;
  growthScrollLabel: string;
  tableCaption: string;
  tableHeaders: {
    year: string;
    openingBalance: string;
    contributions: string;
    interest: string;
    closingBalance: string;
  };
  /** Annual row heading template; token: {year}. */
  yearLabel: string;
  /** Partial final-year heading template; tokens: {year}, {duration}. */
  partialYearLabel: string;
  /** Singular month word used to build localized durations. */
  monthSingular: string;
  /** Plural month word used to build localized durations. */
  monthPlural: string;
  copySummary: string;
  /** Clipboard text template; tokens: {initial}, {rate}, {frequency}, {duration}, {final}, {invested}, {interest}. */
  copyText: string;
  /** Clipboard text template with contribution fields. */
  copyTextWithContributions: string;
  /** Result caption template; tokens: {amount}, {rate}, {duration}. */
  caption: string;
  /** Result caption template with contribution fields. */
  captionWithContributions: string;
  formulas: {
    template: string;
    /** Tokens: {rate}, {monthlyRate}. */
    describe: string;
  };
  /** Contribution timing words used in captions and copy text. */
  timingValues: Record<ContributionTiming, string>;
  errors: {
    principal: string;
    noInvestment: string;
    rate: string;
    duration: string;
    fractionalDuration: string;
    contribution: string;
    frequency: string;
    timing: string;
    overflow: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Savings Goal Calculator page labels and interface strings. */
export interface SavingsGoalToolStrings {
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
  targetLabel: string;
  targetHint: string;
  currentLabel: string;
  currentHint: string;
  rateLabel: string;
  rateHint: string;
  durationLabel: string;
  durationHint: string;
  durationUnitLabel: string;
  durationUnits: Record<DurationUnit, string>;
  frequencyLabel: string;
  frequencyHint: string;
  frequencies: Record<CompoundingFrequency, string>;
  timingLabel: string;
  timingHint: string;
  requiredMonthlyLabel: string;
  targetResultLabel: string;
  currentResultLabel: string;
  contributionsLabel: string;
  interestLabel: string;
  finalLabel: string;
  remainingLabel: string;
  progressLabel: string;
  successAlreadyReached: string;
  successInterestOnly: string;
  growthHeading: string;
  growthHint: string;
  growthEmpty: string;
  growthScrollLabel: string;
  tableCaption: string;
  tableHeaders: {
    year: string;
    openingBalance: string;
    contributions: string;
    interest: string;
    closingBalance: string;
    progress: string;
  };
  /** Annual row heading template; token: {year}. */
  yearLabel: string;
  /** Partial final-year heading template; tokens: {year}, {duration}. */
  partialYearLabel: string;
  /** Singular month word used to build localized durations. */
  monthSingular: string;
  /** Plural month word used to build localized durations. */
  monthPlural: string;
  copySummary: string;
  /** Clipboard text template; tokens: {target}, {current}, {rate}, {frequency}, {duration}, {timing}, {required}, {contributions}, {interest}, {final}. */
  copyText: string;
  /** Result caption template; tokens: {amount}, {duration}. */
  caption: string;
  formulas: {
    template: string;
    /** Tokens: {rate}, {monthlyRate}. */
    describe: string;
  };
  /** Contribution timing words used in captions and copy text. */
  timingValues: Record<ContributionTiming, string>;
  errors: {
    target: string;
    current: string;
    rate: string;
    duration: string;
    fractionalDuration: string;
    frequency: string;
    timing: string;
    overflow: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Retirement Calculator page labels and interface strings. */
export interface RetirementToolStrings {
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
  modes: Record<RetirementMode, { optionLabel: string; hint: string }>;
  currentAgeLabel: string;
  currentAgeHint: string;
  retirementAgeLabel: string;
  retirementAgeHint: string;
  currentSavingsLabel: string;
  currentSavingsHint: string;
  contributionLabel: string;
  contributionHint: string;
  targetLabel: string;
  targetHint: string;
  rateLabel: string;
  rateHint: string;
  inflationLabel: string;
  inflationHint: string;
  assumptionsHeading: string;
  frequencyLabel: string;
  frequencyHint: string;
  frequencies: Record<CompoundingFrequency, string>;
  timingLabel: string;
  timingHint: string;
  projectedCorpusLabel: string;
  requiredMonthlyLabel: string;
  targetResultLabel: string;
  currentResultLabel: string;
  contributionsLabel: string;
  investedLabel: string;
  interestLabel: string;
  projectedResultLabel: string;
  realValueLabel: string;
  realTargetLabel: string;
  yearsLabel: string;
  /** Result value template; tokens: {count}. */
  yearsValue: string;
  /** Singular result value template; token: {count}. */
  yearValue: string;
  successAlreadyCovered: string;
  successInterestOnly: string;
  growthHeading: string;
  growthHint: string;
  growthEmpty: string;
  growthScrollLabel: string;
  tableCaption: string;
  tableHeaders: {
    age: string;
    year: string;
    openingBalance: string;
    contributions: string;
    interest: string;
    closingBalance: string;
  };
  /** Annual row heading template; token: {age}. */
  ageLabel: string;
  copySummary: string;
  /** Clipboard text template; tokens: {currentAge}, {retirementAge}, {current}, {contribution}, {rate}, {frequency}, {duration}, {timing}, {corpus}, {invested}, {growth}. */
  copyTextProjection: string;
  /** Clipboard text template; tokens: {currentAge}, {retirementAge}, {current}, {target}, {rate}, {frequency}, {duration}, {timing}, {required}, {contributions}, {invested}, {growth}, {corpus}. */
  copyTextRequired: string;
  /** Optional clipboard line; token: {value}. */
  copyRealLine: string;
  /** Optional clipboard line for the nominal target; token: {value}. */
  copyRealTargetLine: string;
  /** Result caption template; tokens: {corpus}, {age}. */
  captionProjection: string;
  /** Result caption template; tokens: {required}, {target}, {age}. */
  captionRequired: string;
  formulas: Record<RetirementMode, FormulaStrings>;
  /** Contribution timing words used in captions and copy text. */
  timingValues: Record<ContributionTiming, string>;
  errors: {
    currentAge: string;
    retirementAge: string;
    retirementOrder: string;
    savings: string;
    contribution: string;
    target: string;
    rate: string;
    inflation: string;
    frequency: string;
    timing: string;
    noInvestment: string;
    overflow: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Time Zone Converter page labels and interface strings. */
export interface TimeZoneConverterToolStrings {
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
  dateLabel: string;
  dateHint: string;
  timeLabel: string;
  timeHint: string;
  sourceZoneLabel: string;
  sourceZoneHint: string;
  targetZoneLabel: string;
  targetZoneHint: string;
  useCurrentTime: string;
  convertedTimeLabel: string;
  convertedDateLabel: string;
  weekdayLabel: string;
  sourceOffsetLabel: string;
  targetOffsetLabel: string;
  differenceLabel: string;
  dayChangeLabel: string;
  sourceSummaryLabel: string;
  targetSummaryLabel: string;
  /** One-line summary template; tokens: {time}, {date}, {label}, {zone}. */
  summaryLine: string;
  /** Suffix for the device zone when it is not in the curated list. */
  deviceZoneSuffix: string;
  /** Localized labels for every curated IANA zone. */
  zoneLabels: Record<CuratedTimeZone, string>;
  sameDay: string;
  nextDay: string;
  previousDay: string;
  /** Plural template for two or more days later; token: {count}. */
  daysAhead: string;
  /** Plural template for two or more days earlier; token: {count}. */
  daysBehind: string;
  sameTime: string;
  /** Template for a positive offset difference; token: {duration}. */
  differenceAhead: string;
  /** Template for a negative offset difference; token: {duration}. */
  differenceBehind: string;
  /** Duration template; token: {hours}. */
  durationHours: string;
  /** Duration template; token: {minutes}. */
  durationMinutes: string;
  /** Duration template; tokens: {hours}, {minutes}. */
  durationHoursMinutes: string;
  /** DST gap explanation; tokens: {zone}, {duration}. */
  dstGap: string;
  /** DST overlap disclosure; tokens: {zone}, {offset}. */
  dstAmbiguous: string;
  /** Runtime time-zone data and supported date range note. */
  dataNote: string;
  comparisonHeading: string;
  comparisonHint: string;
  comparisonEmpty: string;
  comparisonScrollLabel: string;
  comparisonCaption: string;
  comparisonHeaders: {
    zone: string;
    date: string;
    time: string;
    offset: string;
    day: string;
  };
  copySummary: string;
  /** Clipboard summary template; tokens: {sourceTime}, {sourceDate}, {sourceLabel}, {sourceZone}, {targetTime}, {targetDate}, {targetLabel}, {targetZone}, {sourceOffset}, {targetOffset}, {difference}. */
  copyText: string;
  /** Optional clipboard line for an ambiguous local time; token: {offset}. */
  copyAmbiguousLine: string;
  /** Result caption template; tokens: {sourceTime}, {sourceDate}, {sourceLabel}. */
  caption: string;
  errors: {
    date: string;
    dateRange: string;
    time: string;
    sourceZone: string;
    targetZone: string;
    unexpected: string;
  };
  /** Explanation sections rendered by ProseText below the calculator. */
  sections: readonly ProseSectionStrings[];
}

/** Per-tool dictionaries, keyed by tool. */
export interface ToolsStrings {
  percentage: PercentageToolStrings;
  discount: DiscountToolStrings;
  loanCalculator: LoanCalculatorToolStrings;
  emiCalculator: EmiCalculatorToolStrings;
  compoundInterest: CompoundInterestToolStrings;
  savingsGoal: SavingsGoalToolStrings;
  retirementCalculator: RetirementToolStrings;
  unitConverter: UnitConverterToolStrings;
  speedConverter: SpeedConverterToolStrings;
  scientificCalculator: ScientificCalculatorToolStrings;
  base64: Base64ToolStrings;
  json: JsonFormatterToolStrings;
  qrCodeGenerator: QrCodeGeneratorToolStrings;
  uuidGenerator: UuidGeneratorToolStrings;
  hashGenerator: HashGeneratorToolStrings;
  wordCounter: WordCounterToolStrings;
  caseConverter: CaseConverterToolStrings;
  dateCalculator: DateCalculatorToolStrings;
  timeZoneConverter: TimeZoneConverterToolStrings;
  ageCalculator: AgeCalculatorToolStrings;
}

/** Registry tool keys that have dictionary strings (src/lib/tools.ts). */
export type ToolStringsKey = keyof ToolsStrings;

/** The complete dictionary contract every registered locale must satisfy. */
/** Analytics consent banner and footer settings control. */
export interface ConsentStrings {
  title: string;
  description: string;
  /** Grants analytics storage. */
  accept: string;
  /** Keeps analytics storage denied. */
  reject: string;
  /** Visible text of the privacy-policy link inside the banner. */
  privacyLink: string;
  /** Footer button that reopens the banner. */
  settings: string;
}

export interface Dictionary {
  layout: LayoutStrings;
  nav: NavStrings;
  language: LanguageStrings;
  consent: ConsentStrings;
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
