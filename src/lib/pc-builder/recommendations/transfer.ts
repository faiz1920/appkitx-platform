/*
 * Transfer a guided recommendation into the existing manual build state
 * (M10.4). This is the only integration point with the manual builder: it
 * reuses createEmptyBuild/selectComponent so single- and multi-slot rules stay
 * exactly the same as the manual UI.
 */

import {
  createEmptyBuild,
  selectComponent,
  selectedCount,
  type BuildState,
} from "../build-state";
import type { ComponentCategory } from "../types";
import type { RecommendationResult } from "./types";

export function recommendationToBuildState(
  result: RecommendationResult,
): BuildState {
  let state = createEmptyBuild();
  for (const selection of result.selections) {
    state = selectComponent(
      state,
      selection.category as ComponentCategory,
      selection.componentId,
    );
  }
  return state;
}

/** True when the manual builder already contains a selection. */
export function manualBuildHasSelection(state: BuildState): boolean {
  return selectedCount(state) > 0;
}

/** True when there is a recommendation worth transferring. */
export function canTransferRecommendation(
  result: RecommendationResult,
): boolean {
  return result.selections.length > 0;
}
