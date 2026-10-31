/*
 * Runtime validation for saved builds, the storage envelope and share
 * payloads (M10.5).
 *
 * Serializable input is treated as untrusted: every field is checked,
 * unknown fields are dropped, and canonical objects are returned so callers
 * never spread raw payload data into application state.
 */

import {
  MAX_BUDGET,
  PERFORMANCE_PRIORITY_OPTIONS,
  RESOLUTION_OPTIONS,
  USE_CASE_OPTIONS,
} from "../recommendations/questionnaire";
import { componentCategories, type ComponentCategory } from "../types";
import type { RecommendationQuestionnaire } from "../recommendations/types";
import {
  MAX_BUILD_NAME_LENGTH,
  MAX_COMPONENT_IDS,
  MAX_SAVED_BUILDS,
  SAVED_BUILD_SCHEMA_VERSION,
  type BuildSource,
  type SavedBuild,
  type SavedBuildQuestionnaire,
  type SavedBuildSelection,
  type ShareBuildPayload,
  type ValidationCode,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

const BUILD_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{5,63}$/;
const COMPONENT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,79}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

const USE_CASES = new Set<string>(
  USE_CASE_OPTIONS.map((option) => option.value),
);
const RESOLUTIONS = new Set<string>(
  RESOLUTION_OPTIONS.map((option) => option.value),
);
const PERFORMANCE_PRIORITIES = new Set<string>(
  PERFORMANCE_PRIORITY_OPTIONS.map((option) => option.value),
);
const CATEGORY_SET = new Set<string>(componentCategories);

type RecordValue = Record<string, unknown>;

export function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function issue(
  path: string,
  code: ValidationCode,
  message: string,
): ValidationIssue {
  return { path, code, message };
}

export function validationFailure<T>(
  issues: readonly ValidationIssue[],
): ValidationResult<T> {
  return { ok: false, issues: [...issues] };
}

function isCanonicalTimestamp(value: string): boolean {
  if (!ISO_TIMESTAMP_PATTERN.test(value)) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (date.toISOString() !== value) return false;
  const year = date.getUTCFullYear();
  return year >= 2000 && year <= 2100;
}

export function isBuildId(value: unknown): value is string {
  return typeof value === "string" && BUILD_ID_PATTERN.test(value);
}

export function isComponentId(value: unknown): value is string {
  return typeof value === "string" && COMPONENT_ID_PATTERN.test(value);
}

/** Trim user input once at the boundary; stored names are already trimmed. */
export function normalizeBuildName(name: string): string {
  return name.trim();
}

/** Reduce a full questionnaire to the compact provenance saved with a build. */
export function questionnaireMetadataFromQuestionnaire(
  questionnaire: RecommendationQuestionnaire,
): SavedBuildQuestionnaire {
  return {
    useCase: questionnaire.useCase,
    resolution: questionnaire.resolution,
    performancePriority: questionnaire.performancePriority,
    budget: questionnaire.budget,
    currency: questionnaire.currency,
  };
}

export function validateBuildName(
  value: unknown,
  path = "name",
): ValidationResult<string> {
  if (typeof value !== "string") {
    return validationFailure([
      issue(path, "invalid-type", "Name is required."),
    ]);
  }
  if (value.trim() === "") {
    return validationFailure([issue(path, "missing", "Enter a build name.")]);
  }
  if (value !== value.trim()) {
    return validationFailure([
      issue(
        path,
        "invalid-value",
        "Build names cannot start or end with whitespace.",
      ),
    ]);
  }
  if (value.length > MAX_BUILD_NAME_LENGTH) {
    return validationFailure([
      issue(
        path,
        "too-long",
        `Build names are limited to ${MAX_BUILD_NAME_LENGTH} characters.`,
      ),
    ]);
  }
  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    return validationFailure([
      issue(
        path,
        "invalid-value",
        "Build names cannot contain control characters.",
      ),
    ]);
  }
  return { ok: true, value };
}

function validateTimestamp(
  value: unknown,
  path: string,
): ValidationResult<string> {
  if (typeof value !== "string" || !isCanonicalTimestamp(value)) {
    return validationFailure([
      issue(
        path,
        "invalid-value",
        "Expected a canonical ISO 8601 UTC timestamp.",
      ),
    ]);
  }
  return { ok: true, value };
}

export function validateSelections(
  value: unknown,
  path = "selections",
): ValidationResult<SavedBuildSelection[]> {
  if (!Array.isArray(value)) {
    return validationFailure([
      issue(path, "invalid-type", "Selections must be an array."),
    ]);
  }
  if (value.length === 0) {
    return validationFailure([
      issue(path, "missing", "A build must contain at least one component."),
    ]);
  }

  const issues: ValidationIssue[] = [];
  const seenCategories = new Set<string>();
  const seenComponentIds = new Set<string>();
  const byCategory = new Map<ComponentCategory, string[]>();

  value.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`;
    if (!isRecord(entry)) {
      issues.push(
        issue(entryPath, "invalid-type", "Each selection must be an object."),
      );
      return;
    }

    const category = entry.category;
    if (typeof category !== "string" || !CATEGORY_SET.has(category)) {
      issues.push(
        issue(
          `${entryPath}.category`,
          "invalid-value",
          "Unknown component category.",
        ),
      );
      return;
    }
    if (seenCategories.has(category)) {
      issues.push(
        issue(
          `${entryPath}.category`,
          "duplicate",
          "A category may appear only once in a saved build.",
        ),
      );
      return;
    }
    seenCategories.add(category);

    const componentIds = entry.componentIds;
    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      issues.push(
        issue(
          `${entryPath}.componentIds`,
          "missing",
          "Each selection needs at least one component id.",
        ),
      );
      return;
    }

    const componentCategory = category as ComponentCategory;
    const maximum = MAX_COMPONENT_IDS[componentCategory];
    if (componentIds.length > maximum) {
      issues.push(
        issue(
          `${entryPath}.componentIds`,
          "too-many",
          `At most ${maximum} component id(s) are allowed for ${componentCategory}.`,
        ),
      );
      return;
    }

    const ids: string[] = [];
    componentIds.forEach((id, idIndex) => {
      const idPath = `${entryPath}.componentIds[${idIndex}]`;
      if (!isComponentId(id)) {
        issues.push(issue(idPath, "invalid-value", "Invalid component id."));
        return;
      }
      if (ids.includes(id)) {
        issues.push(
          issue(
            idPath,
            "duplicate",
            "Duplicate component id in this category.",
          ),
        );
        return;
      }
      if (seenComponentIds.has(id)) {
        issues.push(
          issue(
            idPath,
            "duplicate",
            "A component may appear only once in a build.",
          ),
        );
        return;
      }
      ids.push(id);
      seenComponentIds.add(id);
    });
    byCategory.set(componentCategory, ids);
  });

  if (issues.length > 0) return validationFailure(issues);

  return {
    ok: true,
    value: componentCategories
      .filter((category) => byCategory.has(category))
      .map((category) => ({
        category,
        componentIds: [...(byCategory.get(category) ?? [])],
      })),
  };
}

export function validateQuestionnaireMetadata(
  value: unknown,
  path = "questionnaire",
): ValidationResult<SavedBuildQuestionnaire> {
  if (!isRecord(value)) {
    return validationFailure([
      issue(path, "invalid-type", "Questionnaire metadata must be an object."),
    ]);
  }

  const issues: ValidationIssue[] = [];

  const useCase = value.useCase;
  if (typeof useCase !== "string" || !USE_CASES.has(useCase)) {
    issues.push(issue(`${path}.useCase`, "invalid-value", "Unknown use case."));
  }

  const resolution = value.resolution;
  if (typeof resolution !== "string" || !RESOLUTIONS.has(resolution)) {
    issues.push(
      issue(`${path}.resolution`, "invalid-value", "Unknown resolution."),
    );
  }

  const performancePriority = value.performancePriority;
  if (
    typeof performancePriority !== "string" ||
    !PERFORMANCE_PRIORITIES.has(performancePriority)
  ) {
    issues.push(
      issue(
        `${path}.performancePriority`,
        "invalid-value",
        "Unknown performance priority.",
      ),
    );
  }

  const budget = value.budget;
  if (
    typeof budget !== "number" ||
    !Number.isFinite(budget) ||
    budget <= 0 ||
    budget > MAX_BUDGET
  ) {
    issues.push(
      issue(
        `${path}.budget`,
        "invalid-value",
        "Budget must be a positive number.",
      ),
    );
  }

  const currency = value.currency;
  if (
    typeof currency !== "string" ||
    currency.trim() === "" ||
    currency !== currency.trim() ||
    currency.length > 16 ||
    CONTROL_CHARACTER_PATTERN.test(currency)
  ) {
    issues.push(
      issue(`${path}.currency`, "invalid-value", "Invalid currency label."),
    );
  }

  if (issues.length > 0) return validationFailure(issues);

  return {
    ok: true,
    value: {
      useCase: useCase as SavedBuildQuestionnaire["useCase"],
      resolution: resolution as SavedBuildQuestionnaire["resolution"],
      performancePriority:
        performancePriority as SavedBuildQuestionnaire["performancePriority"],
      budget: budget as number,
      currency: currency as string,
    },
  };
}

function validateSource(
  value: unknown,
  path: string,
): ValidationResult<BuildSource> {
  if (value === "manual" || value === "guided") {
    return { ok: true, value };
  }
  return validationFailure([
    issue(path, "invalid-value", "Source must be manual or guided."),
  ]);
}

function validateSchemaVersion(
  value: unknown,
  path = "schemaVersion",
): ValidationResult<typeof SAVED_BUILD_SCHEMA_VERSION> {
  if (typeof value !== "number") {
    return validationFailure([
      issue(path, "invalid-type", "Schema version is required."),
    ]);
  }
  if (value !== SAVED_BUILD_SCHEMA_VERSION) {
    return validationFailure([
      issue(
        path,
        "unsupported-version",
        `Unsupported schema version ${value}. This build format supports version ${SAVED_BUILD_SCHEMA_VERSION}.`,
      ),
    ]);
  }
  return { ok: true, value: SAVED_BUILD_SCHEMA_VERSION };
}

export function validateSavedBuild(raw: unknown): ValidationResult<SavedBuild> {
  if (!isRecord(raw)) {
    return validationFailure([
      issue("build", "invalid-type", "Saved build must be an object."),
    ]);
  }

  const issues: ValidationIssue[] = [];
  const collect = <T>(result: ValidationResult<T>): T | undefined => {
    if (!result.ok) {
      issues.push(...result.issues);
      return undefined;
    }
    return result.value;
  };

  const schemaVersion = collect(validateSchemaVersion(raw.schemaVersion));
  const id = collect(
    isBuildId(raw.id)
      ? { ok: true, value: raw.id }
      : validationFailure<string>([
          issue("id", "invalid-value", "Invalid saved-build id."),
        ]),
  );
  const name = collect(validateBuildName(raw.name));
  const source = collect(validateSource(raw.source, "source"));
  const createdAt = collect(validateTimestamp(raw.createdAt, "createdAt"));
  const updatedAt = collect(validateTimestamp(raw.updatedAt, "updatedAt"));
  const selections = collect(validateSelections(raw.selections));

  let questionnaire: SavedBuildQuestionnaire | undefined;
  if (raw.questionnaire !== undefined && raw.questionnaire !== null) {
    questionnaire = collect(
      validateQuestionnaireMetadata(raw.questionnaire, "questionnaire"),
    );
  }
  if (source === "manual" && questionnaire !== undefined) {
    issues.push(
      issue(
        "questionnaire",
        "invalid-value",
        "Manual builds cannot carry guided questionnaire metadata.",
      ),
    );
  }

  if (createdAt !== undefined && updatedAt !== undefined) {
    if (updatedAt < createdAt) {
      issues.push(
        issue(
          "updatedAt",
          "invalid-value",
          "updatedAt cannot be earlier than createdAt.",
        ),
      );
    }
  }

  if (
    issues.length > 0 ||
    schemaVersion === undefined ||
    id === undefined ||
    name === undefined ||
    source === undefined ||
    createdAt === undefined ||
    updatedAt === undefined ||
    selections === undefined
  ) {
    return validationFailure(issues);
  }

  const build: SavedBuild = {
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    id,
    name,
    source,
    createdAt,
    updatedAt,
    selections,
    ...(questionnaire === undefined ? {} : { questionnaire }),
  };
  return { ok: true, value: build };
}

export function validateSavedBuildStore(
  raw: unknown,
): ValidationResult<{ builds: SavedBuild[] }> {
  if (!isRecord(raw)) {
    return validationFailure([
      issue("store", "invalid-type", "Saved-build storage must be an object."),
    ]);
  }

  const issues: ValidationIssue[] = [];
  const schemaVersion = validateSchemaVersion(raw.schemaVersion);
  if (!schemaVersion.ok) issues.push(...schemaVersion.issues);

  if (!Array.isArray(raw.builds)) {
    issues.push(
      issue("builds", "invalid-type", "Saved builds must be an array."),
    );
    return validationFailure(issues);
  }
  if (raw.builds.length > MAX_SAVED_BUILDS) {
    issues.push(
      issue(
        "builds",
        "too-many",
        `At most ${MAX_SAVED_BUILDS} saved builds are supported.`,
      ),
    );
  }

  const builds: SavedBuild[] = [];
  const seenIds = new Set<string>();
  raw.builds.forEach((entry, index) => {
    const result = validateSavedBuild(entry);
    if (!result.ok) {
      issues.push(
        ...result.issues.map((entryIssue) => ({
          ...entryIssue,
          path: `builds[${index}].${entryIssue.path}`,
        })),
      );
      return;
    }
    if (seenIds.has(result.value.id)) {
      issues.push(
        issue(
          `builds[${index}].id`,
          "duplicate",
          "Saved-build ids must be unique.",
        ),
      );
      return;
    }
    seenIds.add(result.value.id);
    builds.push(result.value);
  });

  if (issues.length > 0) return validationFailure(issues);
  return { ok: true, value: { builds } };
}

export function validateShareBuildPayload(
  raw: unknown,
): ValidationResult<ShareBuildPayload> {
  if (!isRecord(raw)) {
    return validationFailure([
      issue("payload", "invalid-type", "Share payload must be an object."),
    ]);
  }

  const issues: ValidationIssue[] = [];
  const collect = <T>(result: ValidationResult<T>): T | undefined => {
    if (!result.ok) {
      issues.push(...result.issues);
      return undefined;
    }
    return result.value;
  };

  const schemaVersion = collect(validateSchemaVersion(raw.schemaVersion));
  const name = collect(validateBuildName(raw.name));
  const source = collect(validateSource(raw.source, "source"));
  const selections = collect(validateSelections(raw.selections));

  let questionnaire: SavedBuildQuestionnaire | undefined;
  if (raw.questionnaire !== undefined && raw.questionnaire !== null) {
    questionnaire = collect(
      validateQuestionnaireMetadata(raw.questionnaire, "questionnaire"),
    );
  }
  if (source === "manual" && questionnaire !== undefined) {
    issues.push(
      issue(
        "questionnaire",
        "invalid-value",
        "Manual builds cannot carry guided questionnaire metadata.",
      ),
    );
  }

  let createdAt: string | undefined;
  if (raw.createdAt !== undefined) {
    createdAt = collect(validateTimestamp(raw.createdAt, "createdAt"));
  }

  if (
    issues.length > 0 ||
    schemaVersion === undefined ||
    name === undefined ||
    source === undefined ||
    selections === undefined
  ) {
    return validationFailure(issues);
  }

  return {
    ok: true,
    value: {
      schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
      name,
      source,
      selections,
      ...(questionnaire === undefined ? {} : { questionnaire }),
      ...(createdAt === undefined ? {} : { createdAt }),
    },
  };
}
