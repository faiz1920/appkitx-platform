/*
 * Browser-local saved-build repository (M10.5).
 *
 * Operations are transactional at the storage level: the current store is
 * read, a new array is built, validated and size-checked, then written once.
 * A failed validation or write therefore leaves the previously stored builds
 * untouched.
 *
 * The repository never returns raw storage objects. Every build is validated
 * and canonicalised before it is exposed or persisted.
 */

import { isBuildId, normalizeBuildName, validateBuildName } from "./schema";
import {
  byteLength,
  deserializeSavedBuildStore,
  savedBuildBytes,
  serializeSavedBuildStore,
} from "./serialize";
import {
  MAX_BUILD_NAME_LENGTH,
  MAX_SAVED_BUILDS,
  MAX_SAVED_BUILD_BYTES,
  MAX_SAVED_STORE_BYTES,
  SAVED_BUILD_SCHEMA_VERSION,
  SAVED_BUILDS_STORAGE_KEY,
  type CreateSavedBuildInput,
  type RepositoryResult,
  type SavedBuild,
  type SavedBuildError,
  type SavedBuildListResult,
  type UpdateSavedBuildInput,
} from "./types";
import { migrateSavedBuild } from "./migration";
import type { KeyValueStorage } from "./storage";

export interface SavedBuildRepositoryOptions {
  /** Injectable clock for deterministic tests. */
  now?: () => Date;
  /** Injectable id generator for deterministic tests. */
  createId?: () => string;
}

export interface SavedBuildRepository {
  list(): SavedBuildListResult;
  get(id: string): SavedBuild | null;
  create(input: CreateSavedBuildInput): RepositoryResult<SavedBuild>;
  update(
    id: string,
    input: UpdateSavedBuildInput,
  ): RepositoryResult<SavedBuild>;
  rename(id: string, name: string): RepositoryResult<SavedBuild>;
  duplicate(id: string): RepositoryResult<SavedBuild>;
  remove(id: string): RepositoryResult<{ id: string }>;
  reset(): RepositoryResult<true>;
}

type StoreRead =
  | { ok: true; builds: SavedBuild[]; corrupt: false }
  | {
      ok: true;
      builds: [];
      corrupt: true;
      corruptReason: "invalid" | "unsupported-version";
    }
  | { ok: false; error: SavedBuildError };

function error(
  code: SavedBuildError["code"],
  message: string,
): { ok: false; error: SavedBuildError } {
  return { ok: false, error: { code, message } };
}

function defaultCreateId(): string {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }
  return `build-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isQuotaError(cause: unknown): boolean {
  if (typeof cause !== "object" || cause === null) return false;
  const name = (cause as { name?: unknown }).name;
  const code = (cause as { code?: unknown }).code;
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    code === 22 ||
    code === 1014
  );
}

function sortBuilds(builds: readonly SavedBuild[]): SavedBuild[] {
  return [...builds].sort(
    (a, b) =>
      b.updatedAt.localeCompare(a.updatedAt) ||
      b.createdAt.localeCompare(a.createdAt) ||
      a.id.localeCompare(b.id, "en"),
  );
}

/** Preserve the invariant updatedAt >= createdAt across clock adjustments. */
function laterTimestamp(candidate: string, floor: string): string {
  return candidate < floor ? floor : candidate;
}

export function createSavedBuildRepository(
  storage: KeyValueStorage | null,
  options: SavedBuildRepositoryOptions = {},
): SavedBuildRepository {
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? defaultCreateId;

  function readStore(): StoreRead {
    if (!storage) {
      return error(
        "storage-unavailable",
        "Browser storage is unavailable, so saved builds cannot be read.",
      );
    }
    let serialized: string | null;
    try {
      serialized = storage.getItem(SAVED_BUILDS_STORAGE_KEY);
    } catch {
      return error(
        "read-failed",
        "Browser storage could not be read. No saved builds were changed.",
      );
    }
    if (serialized === null) {
      return { ok: true, builds: [], corrupt: false };
    }
    if (byteLength(serialized) > MAX_SAVED_STORE_BYTES) {
      return {
        ok: true,
        builds: [],
        corrupt: true,
        corruptReason: "invalid",
      };
    }

    const parsed = deserializeSavedBuildStore(serialized);
    if (!parsed.ok) {
      const unsupported = parsed.issues.some(
        (issue) => issue.code === "unsupported-version",
      );
      return {
        ok: true,
        builds: [],
        corrupt: true,
        corruptReason: unsupported ? "unsupported-version" : "invalid",
      };
    }
    return {
      ok: true,
      builds: sortBuilds(parsed.value.builds),
      corrupt: false,
    };
  }

  function persist<T>(
    builds: readonly SavedBuild[],
    value: T,
  ): RepositoryResult<T> {
    if (!storage) {
      return error(
        "storage-unavailable",
        "Browser storage is unavailable, so this build could not be saved.",
      );
    }

    const serialized = serializeSavedBuildStore(builds);
    if (byteLength(serialized) > MAX_SAVED_STORE_BYTES) {
      return error(
        "payload-too-large",
        `Saved builds exceed the ${Math.round(
          MAX_SAVED_STORE_BYTES / 1024,
        )} KB storage limit. Delete a saved build before adding another.`,
      );
    }

    try {
      storage.setItem(SAVED_BUILDS_STORAGE_KEY, serialized);
    } catch (cause) {
      if (isQuotaError(cause)) {
        return error(
          "quota-exceeded",
          "Browser storage is full, so this build could not be saved. Delete a saved build or free site data, then try again.",
        );
      }
      return error(
        "write-failed",
        "The saved-build store could not be written. The previous saved builds are unchanged.",
      );
    }

    return { ok: true, value };
  }

  function nextId(builds: readonly SavedBuild[]): string | null {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const id = createId();
      if (isBuildId(id) && !builds.some((build) => build.id === id)) {
        return id;
      }
    }
    return null;
  }

  function validateCandidate(
    candidate: SavedBuild,
  ): RepositoryResult<SavedBuild> {
    const validated = migrateSavedBuild(candidate);
    if (!validated.ok) {
      return error(
        "invalid-build",
        validated.issues[0]?.message ?? "The saved build is invalid.",
      );
    }
    const bytes = savedBuildBytes(validated.value);
    if (bytes > MAX_SAVED_BUILD_BYTES) {
      return error(
        "payload-too-large",
        `This build is too large to save (${bytes} bytes; limit ${MAX_SAVED_BUILD_BYTES}).`,
      );
    }
    return { ok: true, value: validated.value };
  }

  function nextTimestamp(): string {
    return now().toISOString();
  }

  function list(): SavedBuildListResult {
    const read = readStore();
    if (!read.ok) return read;
    if (read.corrupt) {
      return {
        ok: true,
        builds: [],
        corrupt: true,
        corruptReason: read.corruptReason,
      };
    }
    return { ok: true, builds: read.builds, corrupt: false };
  }

  function get(id: string): SavedBuild | null {
    if (!isBuildId(id)) return null;
    const read = readStore();
    if (!read.ok || read.corrupt) return null;
    return read.builds.find((build) => build.id === id) ?? null;
  }

  function create(input: CreateSavedBuildInput): RepositoryResult<SavedBuild> {
    const nameResult = validateBuildName(normalizeBuildName(input.name));
    if (!nameResult.ok) {
      return error(
        "invalid-name",
        nameResult.issues[0]?.message ?? "Enter a valid build name.",
      );
    }

    const read = readStore();
    if (!read.ok) return read;
    if (read.corrupt) {
      return error(
        "corrupt-store",
        "Saved builds could not be read because the stored data is invalid. Reset saved builds before adding a new one.",
      );
    }
    if (read.builds.length >= MAX_SAVED_BUILDS) {
      return error(
        "limit-reached",
        `The saved-build limit of ${MAX_SAVED_BUILDS} has been reached. Delete a saved build before adding another.`,
      );
    }

    const id = nextId(read.builds);
    if (id === null) {
      return error(
        "duplicate-id",
        "Could not allocate a unique saved-build id. Try again.",
      );
    }

    const timestamp = nextTimestamp();
    const candidate: SavedBuild = {
      schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
      id,
      name: nameResult.value,
      source: input.source,
      createdAt: timestamp,
      updatedAt: timestamp,
      selections: input.selections,
      ...(input.source === "guided" && input.questionnaire
        ? { questionnaire: input.questionnaire }
        : {}),
    };

    const validated = validateCandidate(candidate);
    if (!validated.ok) return validated;

    const next = sortBuilds([...read.builds, validated.value]);
    const persisted = persist(next, validated.value);
    return persisted;
  }

  function update(
    id: string,
    input: UpdateSavedBuildInput,
  ): RepositoryResult<SavedBuild> {
    if (!isBuildId(id)) {
      return error("not-found", "That saved build could not be found.");
    }

    const read = readStore();
    if (!read.ok) return read;
    if (read.corrupt) {
      return error(
        "corrupt-store",
        "Saved builds could not be read because the stored data is invalid. Reset saved builds before updating one.",
      );
    }

    const existing = read.builds.find((build) => build.id === id);
    if (!existing) {
      return error("not-found", "That saved build could not be found.");
    }

    let name = existing.name;
    if (input.name !== undefined) {
      const nameResult = validateBuildName(normalizeBuildName(input.name));
      if (!nameResult.ok) {
        return error(
          "invalid-name",
          nameResult.issues[0]?.message ?? "Enter a valid build name.",
        );
      }
      name = nameResult.value;
    }

    const source = input.source ?? existing.source;
    const questionnaireInput =
      input.questionnaire !== undefined
        ? input.questionnaire
        : existing.questionnaire;
    const questionnaire =
      source === "guided" && questionnaireInput !== null
        ? questionnaireInput
        : undefined;

    const candidate: SavedBuild = {
      schemaVersion: SAVED_BUILD_SCHEMA_VERSION,
      id: existing.id,
      name,
      source,
      createdAt: existing.createdAt,
      updatedAt: laterTimestamp(nextTimestamp(), existing.createdAt),
      selections: input.selections ?? existing.selections,
      ...(questionnaire === undefined ? {} : { questionnaire }),
    };

    const validated = validateCandidate(candidate);
    if (!validated.ok) return validated;

    const next = read.builds.map((build) =>
      build.id === id ? validated.value : build,
    );
    return persist(sortBuilds(next), validated.value);
  }

  function rename(id: string, name: string): RepositoryResult<SavedBuild> {
    return update(id, { name });
  }

  function duplicate(id: string): RepositoryResult<SavedBuild> {
    if (!isBuildId(id)) {
      return error("not-found", "That saved build could not be found.");
    }

    const read = readStore();
    if (!read.ok) return read;
    if (read.corrupt) {
      return error(
        "corrupt-store",
        "Saved builds could not be read because the stored data is invalid. Reset saved builds before duplicating one.",
      );
    }
    if (read.builds.length >= MAX_SAVED_BUILDS) {
      return error(
        "limit-reached",
        `The saved-build limit of ${MAX_SAVED_BUILDS} has been reached. Delete a saved build before duplicating one.`,
      );
    }

    const existing = read.builds.find((build) => build.id === id);
    if (!existing) {
      return error("not-found", "That saved build could not be found.");
    }

    const newId = nextId(read.builds);
    if (newId === null) {
      return error(
        "duplicate-id",
        "Could not allocate a unique saved-build id. Try again.",
      );
    }

    const suffix = " (copy)";
    const base = existing.name
      .slice(0, Math.max(1, MAX_BUILD_NAME_LENGTH - suffix.length))
      .trimEnd();
    const timestamp = nextTimestamp();
    const candidate: SavedBuild = {
      ...existing,
      id: newId,
      name: `${base}${suffix}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const validated = validateCandidate(candidate);
    if (!validated.ok) return validated;

    const next = sortBuilds([...read.builds, validated.value]);
    return persist(next, validated.value);
  }

  function remove(id: string): RepositoryResult<{ id: string }> {
    if (!isBuildId(id)) {
      return error("not-found", "That saved build could not be found.");
    }

    const read = readStore();
    if (!read.ok) return read;
    if (read.corrupt) {
      return error(
        "corrupt-store",
        "Saved builds could not be read because the stored data is invalid. Reset saved builds before deleting one.",
      );
    }

    if (!read.builds.some((build) => build.id === id)) {
      return error("not-found", "That saved build could not be found.");
    }

    const next = read.builds.filter((build) => build.id !== id);
    return persist(next, { id });
  }

  function reset(): RepositoryResult<true> {
    if (!storage) {
      return error(
        "storage-unavailable",
        "Browser storage is unavailable, so there is nothing to reset.",
      );
    }
    try {
      storage.removeItem(SAVED_BUILDS_STORAGE_KEY);
    } catch {
      return error(
        "write-failed",
        "Saved-build data could not be removed from browser storage.",
      );
    }
    return { ok: true, value: true };
  }

  return { list, get, create, update, rename, duplicate, remove, reset };
}
