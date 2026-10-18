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
