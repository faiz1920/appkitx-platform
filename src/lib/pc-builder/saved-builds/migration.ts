/*
 * Schema migration framework for saved builds and the storage envelope
 * (M10.5).
 *
 * Only schema version 1 exists today, so there are no historical migrations
 * to invent. The entry points below still centralise version handling:
 * future versions must add an explicit, tested migration step rather than
 * guessing at old data. Anything newer than the current version is rejected
 * instead of being partially interpreted.
 */

import {
  isRecord,
  issue,
  validateSavedBuild,
  validateSavedBuildStore,
  validationFailure,
} from "./schema";
import {
  SAVED_BUILD_SCHEMA_VERSION,
  type SavedBuild,
  type ValidationResult,
} from "./types";

/**
 * Future migrations keyed by the version being migrated *from*. Each step
 * receives the raw record and returns the raw record for the next version.
 * Version 1 is current, so the table is intentionally empty.
 */
const BUILD_MIGRATIONS: Readonly<
  Record<number, (input: Record<string, unknown>) => Record<string, unknown>>
> = {};

function versionOf(value: Record<string, unknown>): number | null {
  return typeof value.schemaVersion === "number" ? value.schemaVersion : null;
}

export function migrateSavedBuild(raw: unknown): ValidationResult<SavedBuild> {
  if (!isRecord(raw)) {
    return validationFailure([
      issue("build", "invalid-type", "Saved build must be an object."),
    ]);
  }
  const version = versionOf(raw);
  if (version === null) {
    return validationFailure([
      issue("schemaVersion", "invalid-type", "Schema version is required."),
    ]);
  }
  if (version > SAVED_BUILD_SCHEMA_VERSION) {
    return validationFailure([
      issue(
        "schemaVersion",
        "unsupported-version",
        `This saved build uses schema version ${version}, which is newer than the supported version ${SAVED_BUILD_SCHEMA_VERSION}.`,
      ),
    ]);
  }
  if (version < 1) {
    return validationFailure([
      issue(
        "schemaVersion",
        "unsupported-version",
        `Schema version ${version} has no supported migration.`,
      ),
    ]);
  }

  let candidate = raw;
  for (let from = version; from < SAVED_BUILD_SCHEMA_VERSION; from += 1) {
    const migration = BUILD_MIGRATIONS[from];
    if (!migration) {
      return validationFailure([
        issue(
          "schemaVersion",
          "unsupported-version",
          `No migration is registered from schema version ${from}.`,
        ),
      ]);
    }
    candidate = migration(candidate);
  }

  return validateSavedBuild(candidate);
}

export function migrateSavedBuildStore(
  raw: unknown,
): ValidationResult<{ builds: SavedBuild[] }> {
  if (!isRecord(raw)) {
    return validationFailure([
      issue("store", "invalid-type", "Saved-build storage must be an object."),
    ]);
  }
  const version = versionOf(raw);
  if (version === null) {
    return validationFailure([
      issue(
        "schemaVersion",
        "invalid-type",
        "Storage schema version is required.",
      ),
    ]);
  }
  if (version > SAVED_BUILD_SCHEMA_VERSION) {
    return validationFailure([
      issue(
        "schemaVersion",
        "unsupported-version",
        `Saved-build storage uses schema version ${version}, which is newer than the supported version ${SAVED_BUILD_SCHEMA_VERSION}.`,
      ),
    ]);
  }
  if (version < 1) {
    return validationFailure([
      issue(
        "schemaVersion",
        "unsupported-version",
        `Storage schema version ${version} has no supported migration.`,
      ),
    ]);
  }

  if (!Array.isArray(raw.builds)) {
    return validationFailure([
      issue("builds", "invalid-type", "Saved builds must be an array."),
    ]);
  }

  const migrated: unknown[] = [];
  for (const [index, entry] of raw.builds.entries()) {
    const result = migrateSavedBuild(entry);
    if (!result.ok) {
      return validationFailure(
        result.issues.map((entryIssue) => ({
          ...entryIssue,
          path: `builds[${index}].${entryIssue.path}`,
        })),
      );
    }
    migrated.push(result.value);
  }

  return validateSavedBuildStore({
    schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
    builds: migrated,
  });
}
