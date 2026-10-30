/*
 * Compatibility evaluation engine (M10.1).
 *
 * Pure and deterministic: no browser APIs, no I/O, no mutation of inputs.
 * The same selection always produces the same report.
 */

import {
  estimateBuildPower,
  type PowerEstimate,
  type PowerOptions,
} from "./power";
import {
  compatibilityRules,
  type CompatibilityResult,
  type CompatibilityStatus,
  type BuildContext,
} from "./rules";
import { duplicateCategoryRule } from "./rules/build";
import {
  componentCategories,
  singleSlotCategories,
  type Component,
  type ComponentCategory,
} from "./types";

export interface CompatibilitySummary {
  /** Worst verdict across all results: incompatible > warning > unknown >
   *  compatible. An empty build reports "unknown". */
  status: CompatibilityStatus;
  counts: Record<CompatibilityStatus, number>;
  /** Categories with no component selected. */
  missingCategories: ComponentCategory[];
  /** Number of selected components per category. */
  selectionCounts: Record<ComponentCategory, number>;
}

export interface CompatibilityReport {
  results: CompatibilityResult[];
  summary: CompatibilitySummary;
  power: PowerEstimate;
}

export interface EvaluateOptions extends PowerOptions {}

function groupByCategory(
  components: readonly Component[],
): Map<ComponentCategory, Component[]> {
  const map = new Map<ComponentCategory, Component[]>();
  for (const component of components) {
    const list = map.get(component.category);
    if (list) {
      list.push(component);
    } else {
      map.set(component.category, [component]);
    }
  }
  return map;
}

function firstOf<C extends Component>(list: Component[] | undefined): C | null {
  return list && list.length > 0 ? (list[0] as C) : null;
}

export function evaluateBuild(
  components: readonly Component[],
  options: EvaluateOptions = {},
): CompatibilityReport {
  const byCategory = groupByCategory(components);
  const power = estimateBuildPower(components, options);

  const ctx: BuildContext = {
    cpu: firstOf(byCategory.get("cpu")),
    gpu: firstOf(byCategory.get("gpu")),
    motherboard: firstOf(byCategory.get("motherboard")),
    ram: (byCategory.get("ram") ?? []) as BuildContext["ram"],
    cooler: firstOf(byCategory.get("cooler")),
    storage: (byCategory.get("storage") ?? []) as BuildContext["storage"],
    psu: firstOf(byCategory.get("psu")),
    pcCase: firstOf(byCategory.get("case")),
    caseFans: (byCategory.get("case-fan") ?? []) as BuildContext["caseFans"],
    power,
  };

  const results: CompatibilityResult[] = [...duplicateCategoryRule(byCategory)];
  for (const rule of compatibilityRules) {
    results.push(...rule(ctx));
  }

  const counts: Record<CompatibilityStatus, number> = {
    compatible: 0,
    warning: 0,
    incompatible: 0,
    unknown: 0,
  };
  for (const result of results) {
    counts[result.status] += 1;
  }

  const status: CompatibilityStatus =
    counts.incompatible > 0
      ? "incompatible"
      : counts.warning > 0
        ? "warning"
        : counts.unknown > 0
          ? "unknown"
          : results.length > 0
            ? "compatible"
            : "unknown";

  const selectionCounts = Object.fromEntries(
    componentCategories.map((category) => [
      category,
      byCategory.get(category)?.length ?? 0,
    ]),
  ) as Record<ComponentCategory, number>;

  const missingCategories = componentCategories.filter(
    (category) => (byCategory.get(category)?.length ?? 0) === 0,
  );

  return {
    results,
    summary: { status, counts, missingCategories, selectionCounts },
    power,
  };
}

/** Lookup helper: results concerning a specific component. */
export function resultsForComponent(
  report: CompatibilityReport,
  componentId: string,
): CompatibilityResult[] {
  return report.results.filter((result) =>
    result.componentIds.includes(componentId),
  );
}

export { singleSlotCategories };
