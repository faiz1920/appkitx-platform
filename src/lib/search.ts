import { tools } from "./tools";

/*
 * Pure client-side search over the tool catalog. Contract:
 * - Case-insensitive substring match on title, keywords, category, description.
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

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function scoreTool(tool: SearchableTool, query: string): number | null {
  const title = tool.title.toLowerCase();
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  if (tool.keywords.some((keyword) => keyword.toLowerCase().includes(query)))
    return 2;
  if (tool.category.toLowerCase().includes(query)) return 3;
  if (tool.description.toLowerCase().includes(query)) return 4;
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
