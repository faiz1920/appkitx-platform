/* Build-level rules: duplicate selections in single-slot categories. */

import { singleSlotCategories } from "../types";
import type { CompatibilityRule } from "./types";
import { makeResult } from "./types";

export const RULE_DUPLICATE_CATEGORY = "build-duplicate-category";

/** Flags categories that allow only one component but received several.
 *  Pairwise rules keep evaluating against the first selected component. */
export function duplicateCategoryRule(
  componentsByCategory: Map<string, readonly { id: string }[]>,
): ReturnType<CompatibilityRule> {
  const results = [];
  for (const category of singleSlotCategories) {
    const entries = componentsByCategory.get(category) ?? [];
    if (entries.length > 1) {
      results.push(
        makeResult(
          RULE_DUPLICATE_CATEGORY,
          "incompatible",
          entries.map((c) => c.id),
          `${entries.length} components are selected for the "${category}" category, which allows only one per build.`,
          {
            observed: { category, selected: entries.length },
            recommendation: `Keep a single ${category} and remove the other selection(s).`,
          },
        ),
      );
    }
  }
  return results;
}
