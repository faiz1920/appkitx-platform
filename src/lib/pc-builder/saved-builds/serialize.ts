/*
 * Deterministic serialization for saved builds (M10.5).
 *
 * Serializers reconstruct objects with a fixed field order and canonical
 * category order. Nothing is copied through from an untrusted object, and
 * derived compatibility or power values are intentionally absent.
 */

import { componentCategories } from "../types";
import { migrateSavedBuild, migrateSavedBuildStore } from "./migration";
import { issue, validationFailure } from "./schema";
import {
  SAVED_BUILD_SCHEMA_VERSION,
  type SavedBuild,
  type SavedBuildQuestionnaire,
  type SavedBuildSelection,
  type ValidationResult,
} from "./types";

const textEncoder = new TextEncoder();

export function byteLength(value: string): number {
  return textEncoder.encode(value).byteLength;
}

function canonicalSelections(
  selections: readonly SavedBuildSelection[],
): SavedBuildSelection[] {
  const byCategory = new Map(
    selections.map((selection) => [selection.category, selection.componentIds]),
  );
  return componentCategories
    .filter((category) => byCategory.has(category))
    .map((category) => ({
      category,
      componentIds: [...(byCategory.get(category) ?? [])],
    }));
}

function canonicalQuestionnaire(
  questionnaire: SavedBuildQuestionnaire,
): SavedBuildQuestionnaire {
  return {
    useCase: questionnaire.useCase,
    resolution: questionnaire.resolution,
    performancePriority: questionnaire.performancePriority,
    budget: questionnaire.budget,
    currency: questionnaire.currency,
  };
}

function canonicalBuild(build: SavedBuild): Record<string, unknown> {
  return {
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    id: build.id,
    name: build.name,
    source: build.source,
    createdAt: build.createdAt,
    updatedAt: build.updatedAt,
    selections: canonicalSelections(build.selections),
    ...(build.questionnaire === undefined
      ? {}
      : { questionnaire: canonicalQuestionnaire(build.questionnaire) }),
  };
}

export function serializeSavedBuild(build: SavedBuild): string {
  return JSON.stringify(canonicalBuild(build));
}

export function serializeSavedBuildStore(
  builds: readonly SavedBuild[],
): string {
  return JSON.stringify({
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    builds: builds.map(canonicalBuild),
  });
}

export function deserializeSavedBuild(
  serialized: string,
): ValidationResult<SavedBuild> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return validationFailure([
      issue("build", "invalid-type", "Saved build is not valid JSON."),
    ]);
  }
  return migrateSavedBuild(parsed);
}

export function deserializeSavedBuildStore(
  serialized: string,
): ValidationResult<{ builds: SavedBuild[] }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return validationFailure([
      issue("store", "invalid-type", "Saved-build storage is not valid JSON."),
    ]);
  }
  return migrateSavedBuildStore(parsed);
}

/** True when the serialized build stays inside the per-build size limit. */
export function savedBuildBytes(build: SavedBuild): number {
  return byteLength(serializeSavedBuild(build));
}

export { canonicalSelections };
