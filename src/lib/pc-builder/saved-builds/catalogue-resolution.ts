/*
 * Catalogue resolution and revalidation for saved and shared builds (M10.5).
 *
 * Component ids are the only trusted reference. Display names and
 * specifications always come from the current catalogue. Resolution never
 * substitutes unrelated components and never reuses stored compatibility or
 * power results.
 */

import {
  createEmptyBuild,
  selectComponent,
  type BuildState,
} from "../build-state";
import { evaluateBuild } from "../engine";
import { availabilityLabel } from "../ui";
import {
  componentCategories,
  type Component,
  type ComponentCategory,
} from "../types";
import type {
  MissingComponentReference,
  SavedBuild,
  SavedBuildResolution,
  SavedBuildSelection,
  ShareBuildPayload,
} from "./types";

export type ComponentLookup = (id: string) => Component | undefined;

export interface ResolvedSelections {
  state: BuildState;
  components: Component[];
  missingReferences: MissingComponentReference[];
  nonProductionComponents: Component[];
  warnings: string[];
  importable: boolean;
}

export function selectionsFromBuildState(
  state: BuildState,
): SavedBuildSelection[] {
  return componentCategories
    .map((category) => ({
      category,
      componentIds: [...(state.selected[category] ?? [])],
    }))
    .filter((selection) => selection.componentIds.length > 0);
}

export function resolveSelections(
  selections: readonly SavedBuildSelection[],
  lookup: ComponentLookup,
): ResolvedSelections {
  let state = createEmptyBuild();
  const byCategory = new Map<ComponentCategory, Component[]>();
  const missingReferences: MissingComponentReference[] = [];
  const nonProductionComponents: Component[] = [];
  const seenIds = new Set<string>();

  const ordered = componentCategories.flatMap((category) =>
    selections.filter((selection) => selection.category === category),
  );

  for (const selection of ordered) {
    for (const componentId of selection.componentIds) {
      if (seenIds.has(componentId)) continue;
      const component = lookup(componentId);
      if (!component) {
        missingReferences.push({
          category: selection.category,
          componentId,
          reason: "missing",
        });
        continue;
      }
      if (component.category !== selection.category) {
        missingReferences.push({
          category: selection.category,
          componentId,
          reason: "category-mismatch",
        });
        continue;
      }

      seenIds.add(componentId);
      state = selectComponent(state, selection.category, component.id);
      const list = byCategory.get(selection.category) ?? [];
      list.push(component);
      byCategory.set(selection.category, list);
      if (component.availability !== "in-production") {
        nonProductionComponents.push(component);
      }
    }
  }

  const components = componentCategories.flatMap(
    (category) => byCategory.get(category) ?? [],
  );

  const warnings: string[] = [];
  if (missingReferences.length > 0) {
    const names = missingReferences
      .slice(0, 3)
      .map((reference) => reference.componentId)
      .join(", ");
    warnings.push(
      `${missingReferences.length} component reference${
        missingReferences.length === 1 ? "" : "s"
      } could not be resolved in the current catalogue: ${names}${
        missingReferences.length > 3 ? ", …" : ""
      }. They are not inserted into the build.`,
    );
  }
  if (nonProductionComponents.length > 0) {
    warnings.push(
      `${nonProductionComponents.length} component${
        nonProductionComponents.length === 1 ? " is" : "s are"
      } not recorded as in production (${nonProductionComponents
        .slice(0, 3)
        .map(
          (component) => `${component.name}: ${availabilityLabel(component)}`,
        )
        .join(
          ", ",
        )}${nonProductionComponents.length > 3 ? ", …" : ""}). Stock and regional availability are not verified.`,
    );
  }

  return {
    state,
    components,
    missingReferences,
    nonProductionComponents,
    warnings,
    importable: components.length > 0,
  };
}

function resolutionFor(resolved: ResolvedSelections): SavedBuildResolution {
  const compatibility = evaluateBuild(resolved.components);
  return {
    ...resolved,
    compatibility,
    power: compatibility.power,
  };
}

export function resolveSavedBuild(
  build: SavedBuild,
  lookup: ComponentLookup,
): SavedBuildResolution {
  return resolutionFor(resolveSelections(build.selections, lookup));
}

export function resolveSharePayload(
  payload: ShareBuildPayload,
  lookup: ComponentLookup,
): SavedBuildResolution {
  return resolutionFor(resolveSelections(payload.selections, lookup));
}
