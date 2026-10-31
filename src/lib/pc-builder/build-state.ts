/*
 * Immutable build-selection state for the PC Builder UI (M10.2).
 *
 * The domain model (M10.1) allows exactly one component for CPU, GPU,
 * motherboard, cooler, PSU and case, and multiple components for RAM,
 * storage and case fans. This module encodes those rules in one place:
 * - single-slot categories replace on select,
 * - multi-slot categories append without duplicates,
 * - every operation returns a new state object and never mutates input.
 *
 * The module is pure: no DOM, no catalogue lookup, no compatibility logic.
 * The UI resolves ids against the catalogue and derives compatibility with
 * the M10.1 engine on every render.
 */

import {
  componentCategories,
  maxComponentSelections,
  multiSlotCategories,
  singleSlotCategories,
  type Component,
  type ComponentCategory,
} from "./types";

export interface BuildState {
  readonly selected: Readonly<Record<ComponentCategory, readonly string[]>>;
}

export function createEmptyBuild(): BuildState {
  return {
    selected: Object.fromEntries(
      componentCategories.map((category) => [category, []]),
    ) as unknown as Record<ComponentCategory, readonly string[]>,
  };
}

export function isSingleSlot(category: ComponentCategory): boolean {
  return singleSlotCategories.includes(category);
}

export function isMultiSlot(category: ComponentCategory): boolean {
  return multiSlotCategories.includes(category);
}

/** Select a component. Single-slot categories replace; multi-slot append. */
export function selectComponent(
  state: BuildState,
  category: ComponentCategory,
  componentId: string,
): BuildState {
  if (componentId === "") return state;

  const current = state.selected[category] ?? [];

  if (isSingleSlot(category)) {
    if (current.length === 1 && current[0] === componentId) return state;
    return {
      selected: { ...state.selected, [category]: [componentId] },
    };
  }

  if (current.includes(componentId)) return state;
  if (current.length >= maxComponentSelections[category]) return state;

  return {
    selected: { ...state.selected, [category]: [...current, componentId] },
  };
}

/** True when a multi-slot category has reached its supported maximum. */
export function isAtCategoryLimit(
  state: BuildState,
  category: ComponentCategory,
): boolean {
  return (
    (state.selected[category]?.length ?? 0) >= maxComponentSelections[category]
  );
}

export function removeComponent(
  state: BuildState,
  category: ComponentCategory,
  componentId: string,
): BuildState {
  const current = state.selected[category] ?? [];
  if (!current.includes(componentId)) return state;

  return {
    selected: {
      ...state.selected,
      [category]: current.filter((id) => id !== componentId),
    },
  };
}

export function clearBuild(): BuildState {
  return createEmptyBuild();
}

export function isSelected(
  state: BuildState,
  category: ComponentCategory,
  componentId: string,
): boolean {
  return (state.selected[category] ?? []).includes(componentId);
}

export function selectedIds(state: BuildState): string[] {
  return componentCategories.flatMap((category) =>
    (state.selected[category] ?? []).slice(),
  );
}

export function selectedCount(state: BuildState): number {
  return componentCategories.reduce(
    (sum, category) => sum + (state.selected[category]?.length ?? 0),
    0,
  );
}

export function selectedCountForCategory(
  state: BuildState,
  category: ComponentCategory,
): number {
  return state.selected[category]?.length ?? 0;
}

export interface ResolvedBuild {
  /** Known components in canonical category order. */
  components: Component[];
  /** Selected ids that do not exist in the supplied catalogue. */
  missingIds: string[];
}

/**
 * Resolve ids to records. Unknown ids are reported rather than silently
 * dropped so the UI can surface a consistent state after catalogue changes.
 */
export function resolveBuild(
  state: BuildState,
  lookup: (id: string) => Component | undefined,
): ResolvedBuild {
  const components: Component[] = [];
  const missingIds: string[] = [];

  for (const category of componentCategories) {
    for (const id of state.selected[category] ?? []) {
      const component = lookup(id);
      if (component && component.category === category) {
        components.push(component);
      } else {
        missingIds.push(id);
      }
    }
  }

  return { components, missingIds };
}
