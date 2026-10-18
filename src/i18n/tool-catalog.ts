import { getDictionary, type LocaleCode } from "./config";
import { tools } from "../lib/tools";

/*
 * Localized view of the tools registry (audit M4).
 *
 * The catalog is a map over src/lib/tools.ts, so it inherits the registry
 * invariant by construction: only implemented tools exist here, and the
 * search palette can never surface a tool without a page. Strings come from
 * the locale dictionary — including category labels, which stay keyed by
 * the registry's internal category name.
 */

export interface LocalizedTool {
  href: string;
  icon: string;
  title: string;
  description: string;
  /** Localized category label (searchable and displayed). */
  category: string;
  keywords: readonly string[];
}

export function localizedToolCatalog(locale: LocaleCode): LocalizedTool[] {
  const t = getDictionary(locale);
  return tools.map((tool) => {
    const strings = t.tools[tool.dictionaryKey];
    return {
      href: tool.href,
      icon: tool.icon,
      title: strings.name,
      description: strings.cardDescription,
      category: t.categories[tool.category].name,
      keywords: strings.keywords,
    };
  });
}

/*
 * Resolve a list of registry hrefs to localized tools, in the requested
 * order. Unknown references are dropped so pages can never render a broken
 * link (mirrors resolveTools in src/lib/tools.ts).
 */
export function resolveLocalizedTools(
  locale: LocaleCode,
  hrefs: readonly string[],
): LocalizedTool[] {
  const byHref = new Map(
    localizedToolCatalog(locale).map((tool) => [tool.href, tool]),
  );
  return hrefs
    .map((href) => byHref.get(href))
    .filter((tool): tool is LocalizedTool => tool !== undefined);
}
