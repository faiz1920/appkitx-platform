import { tools, type Tool, type ToolCategory } from "./tools";

export type { ToolCategory } from "./tools";

/*
 * Category taxonomy (audit M5).
 *
 * Category membership is the `category` field on each tool in the tools
 * registry (src/lib/tools.ts) — there is no second list of tools per
 * category, so a category page can only ever render registered, shipped
 * tools, and placeholders can never leak into it.
 *
 * A category page publishes when the category has at least
 * CATEGORY_PAGE_MIN_TOOLS registered tools. One-tool categories stay
 * unpublished: a single-card page adds crawl surface without discovery
 * value, while the tool page itself already serves that query. The explicit
 * route wrappers and CategoryView's build guard use isCategoryPublished, and
 * unit tests assert the published set matches this derivation.
 */

export const CATEGORY_PAGE_MIN_TOOLS = 2;

/**
 * Stable English URL slug per taxonomy category, shared by every locale
 * (like tool paths — slugs are never translated). The Record type makes a
 * missing category a compile error, and slugs never change with copy edits.
 */
export const CATEGORY_SLUGS: Record<ToolCategory, string> = {
  Calculators: "calculators",
  Converters: "converters",
  "Developer tools": "developer-tools",
  "Date & time": "date-time",
  "Text tools": "text-tools",
};

/**
 * Canonical taxonomy order: the homepage chip rail, the slug record, and the
 * published-category derivation all follow it.
 */
export const CATEGORY_IDS = Object.keys(CATEGORY_SLUGS) as ToolCategory[];

export function toolsInCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** A category page may ship only when at least CATEGORY_PAGE_MIN_TOOLS tools exist. */
export function isCategoryPublished(category: ToolCategory): boolean {
  return toolsInCategory(category).length >= CATEGORY_PAGE_MIN_TOOLS;
}

/** Categories that currently qualify for a landing page, in taxonomy order. */
export function publishedCategories(): ToolCategory[] {
  return CATEGORY_IDS.filter((category) => isCategoryPublished(category));
}

/** Locale-less path for a category page, e.g. "/calculators". */
export function categoryPath(category: ToolCategory): string {
  return `/${CATEGORY_SLUGS[category]}`;
}

/** Locale-less paths of every published category page, in taxonomy order. */
export function publishedCategoryPaths(): string[] {
  return publishedCategories().map((category) => categoryPath(category));
}

/** The category a registered tool belongs to; fails fast for unknown hrefs. */
export function toolCategory(href: string): ToolCategory {
  const tool = tools.find((candidate) => candidate.href === href);
  if (tool === undefined) {
    throw new Error(`Unregistered tool: ${href}`);
  }
  return tool.category;
}
