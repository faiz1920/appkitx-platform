import { tools } from "./tools";

/*
 * Pure client-side search over the tool catalog. Contract:
 * - Case- and diacritic-insensitive substring match on title, keywords,
 *   category, description (Spanish users routinely type "variacion").
 * - Whitespace-only queries return the full catalog in registry order.
 * - Ranking: title prefix > title substring > keyword > category > description,
 *   with registry order as a stable tiebreak.
 *
 * The catalog parameter is the localized view built by
 * src/i18n/tool-catalog.ts, which maps over the tools registry — so search
 * can only ever surface implemented tools, in the current page's language.
 */

export interface SearchableTool {
  title: string;
  href: string;
  description: string;
  category: string;
  keywords: readonly string[];
  icon: string;
}

/** Fold case and combining diacritics for matching only; display is untouched. */
export function foldSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeQuery(query: string): string {
  return foldSearchText(query.trim());
}

function scoreTool(tool: SearchableTool, query: string): number | null {
  const title = foldSearchText(tool.title);
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  if (tool.keywords.some((keyword) => foldSearchText(keyword).includes(query)))
    return 2;
  if (foldSearchText(tool.category).includes(query)) return 3;
  if (foldSearchText(tool.description).includes(query)) return 4;
  return null;
}

export function searchTools(
  query: string,
  catalog: readonly SearchableTool[] = tools,
): SearchableTool[] {
  const normalized = normalizeQuery(query);
  if (normalized === "") return [...catalog];

  const scored: { tool: SearchableTool; index: number; score: number }[] = [];
  catalog.forEach((tool, index) => {
    const score = scoreTool(tool, normalized);
    if (score !== null) scored.push({ tool, index, score });
  });

  return scored
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.tool);
}
