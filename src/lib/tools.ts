import type { ToolStringsKey } from "../i18n/dictionary";

export type ToolCategory =
  | "Calculators"
  | "Converters"
  | "Developer tools"
  | "Date & time"
  | "Text tools";

export interface Tool {
  title: string;
  href: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  /** Lucide icon name, resolved to an SVG by the rendering component. */
  icon: string;
  /** Dictionary key holding this tool's translated strings. */
  dictionaryKey: ToolStringsKey;
}

/*
 * Single source of truth for shipped tools. Only register a tool once its
 * route is implemented and reachable — planned tools must not appear here
 * (they would leak into search results).
 */
export const tools: readonly Tool[] = [
  {
    title: "Percentage Calculator",
    href: "/percentage-calculator",
    description: "Percentages, tips, discounts, and percent change.",
    category: "Calculators",
    keywords: [
      "percentage",
      "percent",
      "tip",
      "increase",
      "decrease",
      "change",
      "share",
      "of",
    ],
    icon: "calculator",
    dictionaryKey: "percentage",
  },
  {
    title: "Discount Calculator",
    href: "/discount-calculator",
    description: "Savings and final price after a discount.",
    category: "Calculators",
    keywords: [
      "discount",
      "sale",
      "savings",
      "price",
      "off",
      "markdown",
      "reduction",
      "final",
    ],
    icon: "tag",
    dictionaryKey: "discount",
  },
  {
    title: "Loan Calculator",
    href: "/loan-calculator",
    description: "Monthly payments, interest, and total cost.",
    category: "Calculators",
    keywords: [
      "loan",
      "mortgage",
      "repayment",
      "interest",
      "monthly payment",
      "principal",
      "home loan",
      "car loan",
      "personal loan",
    ],
    icon: "landmark",
    dictionaryKey: "loanCalculator",
  },
  {
    title: "EMI Calculator",
    href: "/emi-calculator",
    description:
      "Monthly EMI, principal/interest split, and amortization schedule.",
    category: "Calculators",
    keywords: [
      "emi",
      "emi calculator",
      "loan emi",
      "amortization schedule",
      "repayment schedule",
      "principal and interest",
      "outstanding balance",
      "monthly installment",
      "loan repayment",
      "home loan",
      "car loan",
    ],
    icon: "table-2",
    dictionaryKey: "emiCalculator",
  },
  {
    title: "Scientific Calculator",
    href: "/scientific-calculator",
    description: "Expressions, trigonometry, logarithms, and constants.",
    category: "Calculators",
    keywords: [
      "scientific calculator",
      "scientific",
      "trigonometry",
      "sine",
      "cosine",
      "tangent",
      "logarithm",
      "factorial",
      "power",
      "root",
      "parentheses",
      "degrees",
      "radians",
      "math calculator",
    ],
    icon: "sigma",
    dictionaryKey: "scientificCalculator",
  },
  {
    title: "Unit Converter",
    href: "/unit-converter",
    description: "Length, weight, and temperature conversions.",
    category: "Converters",
    keywords: [
      "unit converter",
      "length",
      "weight",
      "temperature",
      "metric",
      "imperial",
      "meters",
      "feet",
      "kilograms",
      "pounds",
      "celsius",
      "fahrenheit",
    ],
    icon: "ruler",
    dictionaryKey: "unitConverter",
  },
  {
    title: "Speed Converter",
    href: "/speed-converter",
    description: "Convert between km/h, mph, m/s, ft/s, and knots.",
    category: "Converters",
    keywords: [
      "speed",
      "velocity",
      "km/h",
      "kph",
      "mph",
      "m/s",
      "ft/s",
      "knots",
      "kilometers per hour",
      "miles per hour",
    ],
    icon: "gauge",
    dictionaryKey: "speedConverter",
  },
  {
    title: "Base64 Encoder",
    href: "/base64-encoder",
    description: "Encode text to Base64 and decode Base64 back to text.",
    category: "Developer tools",
    keywords: [
      "base64",
      "encode",
      "decode",
      "encoder",
      "decoder",
      "convert",
      "text",
    ],
    icon: "binary",
    dictionaryKey: "base64",
  },
  {
    title: "JSON Formatter",
    href: "/json-formatter",
    description: "Format, minify, and validate JSON in your browser.",
    category: "Developer tools",
    keywords: [
      "json",
      "format",
      "formatter",
      "minify",
      "validate",
      "pretty print",
      "beautify",
    ],
    icon: "braces",
    dictionaryKey: "json",
  },
  {
    title: "QR Code Generator",
    href: "/qr-code-generator",
    description:
      "Generate customizable QR codes for links, text, contacts, and Wi-Fi.",
    category: "Developer tools",
    keywords: [
      "qr",
      "qr code",
      "qr code generator",
      "wifi qr",
      "vcard",
      "contact qr",
      "sms qr",
      "url qr",
      "download qr",
    ],
    icon: "qr-code",
    dictionaryKey: "qrCodeGenerator",
  },
  {
    title: "Date Calculator",
    href: "/date-calculator",
    description: "Days between dates, and add or subtract time.",
    category: "Date & time",
    keywords: [
      "date",
      "days between",
      "difference",
      "add",
      "subtract",
      "weeks",
      "months",
      "years",
      "duration",
    ],
    icon: "calendar-days",
    dictionaryKey: "dateCalculator",
  },
  {
    title: "Age Calculator",
    href: "/age-calculator",
    description: "Age in years, months, and days from a birth date.",
    category: "Date & time",
    keywords: [
      "age",
      "birthday",
      "date of birth",
      "how old",
      "years",
      "months",
      "days",
    ],
    icon: "cake",
    dictionaryKey: "ageCalculator",
  },
  {
    title: "Word Counter",
    href: "/word-counter",
    description:
      "Count words, characters, sentences, and reading time as you type.",
    category: "Text tools",
    keywords: [
      "word counter",
      "word count",
      "character count",
      "characters",
      "words",
      "sentences",
      "paragraphs",
      "reading time",
      "speaking time",
      "text statistics",
    ],
    icon: "whole-word",
    dictionaryKey: "wordCounter",
  },
  {
    title: "Case Converter",
    href: "/case-converter",
    description:
      "Convert text to uppercase, lowercase, title case, camelCase, and more.",
    category: "Text tools",
    keywords: [
      "case converter",
      "uppercase",
      "lowercase",
      "title case",
      "sentence case",
      "camelcase",
      "pascalcase",
      "snake case",
      "kebab case",
      "constant case",
      "alternating case",
    ],
    icon: "case-sensitive",
    dictionaryKey: "caseConverter",
  },
];

/*
 * Resolve a list of registered tool hrefs, in the requested order.
 * Unknown references are dropped so pages can never render a broken link.
 */
export function resolveTools(hrefs: readonly string[]): Tool[] {
  return hrefs
    .map((href) => tools.find((tool) => tool.href === href))
    .filter((tool): tool is Tool => tool !== undefined);
}
