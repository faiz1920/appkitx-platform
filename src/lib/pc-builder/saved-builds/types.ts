/*
 * Saved and shareable build domain model (M10.5).
 *
 * The saved-build schema stores stable component ids only. It never stores
 * catalogue records, derived compatibility verdicts or power calculations;
 * those are recalculated from the current catalogue whenever a build is
 * restored or a share link is opened.
 *
 * Browser storage and URL operations live behind adapters. This module is
 * pure TypeScript with no DOM dependency.
 */

import type { BuildState } from "../build-state";
import type { CompatibilityReport } from "../engine";
import type { PowerEstimate } from "../power";
import type {
  PerformancePriority,
  TargetResolution,
  UseCase,
} from "../recommendations/types";
import type { Component, ComponentCategory } from "../types";

export const SAVED_BUILD_SCHEMA_VERSION = 1 as const;
export const SAVED_BUILDS_STORAGE_KEY = "appkitx.pc-builder.saved-builds.v1";

/** Storage safeguards. Limits are deliberately small and explicit. */
export const MAX_SAVED_BUILDS = 30;
export const MAX_BUILD_NAME_LENGTH = 80;
/** Maximum serialized bytes for one saved build (UTF-8 JSON). */
export const MAX_SAVED_BUILD_BYTES = 16 * 1024;
/** Maximum serialized bytes for the whole saved-build store. */
export const MAX_SAVED_STORE_BYTES = 256 * 1024;
/** Maximum decoded JSON bytes for a share payload. */
export const MAX_SHARE_JSON_BYTES = 6 * 1024;
/** Maximum URL-safe encoded share payload length. */
export const MAX_SHARE_ENCODED_LENGTH = 8 * 1024;

/**
 * Per-category component limits. These mirror the builder's single- and
 * multi-slot rules; validation never trusts the payload to enforce them.
 */
export const MAX_COMPONENT_IDS: Record<ComponentCategory, number> = {
  cpu: 1,
  gpu: 1,
  motherboard: 1,
  ram: 8,
  cooler: 1,
  storage: 12,
  psu: 1,
  case: 1,
  "case-fan": 16,
};

export type BuildSource = "manual" | "guided";

/**
 * Compact questionnaire provenance for guided builds. The full transient
 * recommendation result is intentionally not persisted.
 */
export interface SavedBuildQuestionnaire {
  useCase: UseCase;
  resolution: TargetResolution;
  performancePriority: PerformancePriority;
  budget: number;
  currency: string;
}

export interface SavedBuildSelection {
  category: ComponentCategory;
  componentIds: string[];
}

export interface SavedBuild {
  schemaVersion: typeof SAVED_BUILD_SCHEMA_VERSION;
  /** Stable local identifier. Never derived from the display name. */
  id: string;
  name: string;
  source: BuildSource;
  /** ISO 8601 timestamps, canonical UTC form. */
  createdAt: string;
  updatedAt: string;
  /** Non-empty categories in canonical category order. */
  selections: SavedBuildSelection[];
  /** Present only for guided-origin builds. */
  questionnaire?: SavedBuildQuestionnaire;
}

export interface SavedBuildStore {
  schemaVersion: typeof SAVED_BUILD_SCHEMA_VERSION;
  builds: SavedBuild[];
}

/** Portable share payload. Derived results are never included. */
export interface ShareBuildPayload {
  schemaVersion: typeof SAVED_BUILD_SCHEMA_VERSION;
  name: string;
  source: BuildSource;
  selections: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire;
  createdAt?: string;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type ValidationCode =
  | "missing"
  | "invalid-type"
  | "invalid-value"
  | "too-long"
  | "too-many"
  | "duplicate"
  | "unsupported-version";

export interface ValidationIssue {
  path: string;
  code: ValidationCode;
  message: string;
}

export type ValidationResult<T> =
  { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

/* ------------------------------------------------------------------ */
/* Repository results                                                  */
/* ------------------------------------------------------------------ */

export type SavedBuildErrorCode =
  | "storage-unavailable"
  | "read-failed"
  | "write-failed"
  | "quota-exceeded"
  | "corrupt-store"
  | "unsupported-version"
  | "limit-reached"
  | "not-found"
  | "invalid-build"
  | "invalid-name"
  | "payload-too-large"
  | "duplicate-id";

export interface SavedBuildError {
  code: SavedBuildErrorCode;
  message: string;
}

export type RepositoryResult<T> =
  { ok: true; value: T } | { ok: false; error: SavedBuildError };

export type SavedBuildCorruptionReason = "invalid" | "unsupported-version";

export type SavedBuildListResult =
  | {
      ok: true;
      builds: SavedBuild[];
      corrupt: false;
    }
  | {
      ok: true;
      builds: SavedBuild[];
      corrupt: true;
      corruptReason: SavedBuildCorruptionReason;
    }
  | { ok: false; error: SavedBuildError };

export interface CreateSavedBuildInput {
  name: string;
  source: BuildSource;
  selections: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire | null;
}

export interface UpdateSavedBuildInput {
  name?: string;
  source?: BuildSource;
  selections?: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire | null;
}

/* ------------------------------------------------------------------ */
/* Share codec results                                                 */
/* ------------------------------------------------------------------ */

export type ShareErrorCode =
  | "empty"
  | "oversized"
  | "malformed-encoding"
  | "invalid-json"
  | "unsupported-version"
  | "invalid-payload";

export interface ShareError {
  code: ShareErrorCode;
  message: string;
}

export type ShareResult<T> =
  { ok: true; value: T } | { ok: false; error: ShareError };

/* ------------------------------------------------------------------ */
/* Catalogue resolution                                                */
/* ------------------------------------------------------------------ */

export interface MissingComponentReference {
  category: ComponentCategory;
  componentId: string;
  reason: "missing" | "category-mismatch";
}

export interface SavedBuildResolution {
  /** Only resolved ids are reconstructed into builder state. */
  state: BuildState;
  components: Component[];
  missingReferences: MissingComponentReference[];
  nonProductionComponents: Component[];
  warnings: string[];
  /** Recomputed from the current catalogue; never read from the payload. */
  compatibility: CompatibilityReport;
  power: PowerEstimate;
  importable: boolean;
}
