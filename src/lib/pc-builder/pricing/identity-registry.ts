/*
 * Optional verified product identity registry for commercial matching (M10.9).
 *
 * The catalogue remains the authority for specifications. This module only
 * adds explicit, provenance-backed MPN/GTIN evidence keyed by stable component
 * id. Components without a verified record preserve their existing model-only
 * behaviour.
 *
 * Only `verified` records project into `CatalogueProductIdentity`. Provisional
 * records are retained for audit but can never promote a match.
 */

import {
  componentCategories,
  type Component,
  type ComponentCategory,
} from "../types";
import {
  auditCatalogueIdentities,
  type CatalogueIdentityAudit,
} from "./identity-audit";
import {
  catalogueIdentity,
  matchProduct,
  normalizeGtin,
  normalizePartNumber,
} from "./product-matching";
import { normalizeCountryCode } from "./regions";
import {
  failure,
  isComponentId,
  isJsonSafeByteLength,
  issue,
  normalizeKey,
  success,
  validateHttpsUrl,
  validateOptionalText,
  validateText,
  validateTimestamp,
} from "./validation";
import type {
  CatalogueProductIdentity,
  PricingIssue,
  PricingResult,
  ProductMatch,
} from "./types";

export const IDENTITY_REGISTRY_SCHEMA_VERSION = 1;
export const DEFAULT_IDENTITY_EVIDENCE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const MAX_IDENTIFIER_RECORDS = 500;
const MAX_REGISTRY_BYTES = 512 * 1024;

export type IdentitySourceType =
  | "manufacturer-page"
  | "manufacturer-document"
  | "manufacturer-packaging"
  | "gs1"
  | "authorized-distributor"
  | "manual-review";

export interface IdentitySource {
  readonly type: IdentitySourceType;
  readonly name: string;
  readonly url: string;
  readonly accessedAt: string;
}

export type SourceVerificationStatus = "source-verified" | "provisional";

export type SourceVerificationMethod =
  | "automated-manufacturer-evidence-check"
  | "manual-manufacturer-evidence-check";

export interface SourceVerification {
  readonly status: SourceVerificationStatus;
  readonly method: SourceVerificationMethod;
  /** Process or person that performed source verification. Never human approval. */
  readonly verifiedBy: string;
  readonly verifiedAt: string;
  readonly notes: string | null;
}

export type HumanReviewStatus =
  | "not-reviewed"
  | "reviewed"
  | "needs-correction"
  | "rejected"
  | "needs-revalidation";

export interface HumanReview {
  readonly status: HumanReviewStatus;
  /** Named human reviewer only for non-"not-reviewed" states. */
  readonly reviewer: string | null;
  readonly reviewedAt: string | null;
  readonly notes: string | null;
  /** Manufacturer source URL re-opened for this review. */
  readonly sourceUrl?: string | null;
  /**
   * Integrity fingerprint of the identity evidence approved by the reviewer.
   * Optional for compatibility with records created before M10.11.
   */
  readonly evidenceFingerprint?: string | null;
  /** Declared state before this decision, for auditability. */
  readonly previousStatus?: HumanReviewStatus | null;
}

export interface CatalogueIdentifierRecord {
  readonly componentId: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly manufacturerPartNumber: string | null;
  readonly gtin: string | null;
  readonly region: string | null;
  readonly source: IdentitySource;
  readonly sourceVerification: SourceVerification;
  readonly humanReview: HumanReview;
}

export interface CatalogueIdentifierRegistry {
  readonly schemaVersion: 1;
  readonly records: readonly CatalogueIdentifierRecord[];
}

export interface IdentifierRegistryValidationOptions {
  /** Reject source/source-verification/human-review timestamps later than this instant. */
  readonly now?: Date | string;
}

export interface IdentifierRegistryAuditOptions extends IdentifierRegistryValidationOptions {
  /** Source verifications or human reviews older than this are stale. Default: 365 days. */
  readonly maxEvidenceAgeMs?: number;
}

export interface RegistryCategoryCoverage {
  readonly category: ComponentCategory;
  readonly total: number;
  readonly sourceVerifiedComponents: number;
  readonly sourceVerifiedMpn: number;
  readonly sourceVerifiedGtin: number;
  readonly both: number;
  readonly withoutSourceVerified: number;
  readonly humanReviewedComponents: number;
}

export interface IdentifierRegistryAudit {
  readonly totalComponents: number;
  readonly totalRecords: number;
  readonly sourceVerifiedRecords: number;
  readonly provisionalRecords: number;
  readonly humanReviewedRecords: number;
  readonly awaitingHumanReviewRecords: number;
  readonly needsCorrectionRecords: number;
  readonly rejectedRecords: number;
  readonly needsRevalidationRecords: number;
  readonly invalidatedReviewRecords: number;
  readonly staleSourceVerificationRecords: number;
  readonly staleHumanReviewRecords: number;
  readonly duplicateMpnRecords: number;
  readonly duplicateGtinRecords: number;
  readonly conflictingComponentRecords: number;
  readonly mpnRecords: number;
  readonly gtinRecords: number;
  readonly bothRecords: number;
  readonly sourceVerifiedComponents: number;
  readonly sourceVerifiedMpn: number;
  readonly sourceVerifiedGtin: number;
  readonly both: number;
  readonly withoutSourceVerified: number;
  readonly provisionalComponentIds: readonly string[];
  readonly humanReviewedComponentIds: readonly string[];
  readonly awaitingHumanReviewComponentIds: readonly string[];
  readonly needsCorrectionComponentIds: readonly string[];
  readonly rejectedComponentIds: readonly string[];
  readonly needsRevalidationComponentIds: readonly string[];
  readonly invalidatedReviewComponentIds: readonly string[];
  readonly staleSourceVerificationComponentIds: readonly string[];
  readonly staleHumanReviewComponentIds: readonly string[];
  readonly byCategory: readonly RegistryCategoryCoverage[];
  readonly catalogue: CatalogueIdentityAudit;
}

export interface IdentityUniquenessAudit {
  readonly duplicateMpnRecords: number;
  readonly duplicateGtinRecords: number;
  readonly conflictingComponentRecords: number;
  readonly duplicateMpnComponentIds: readonly string[];
  readonly duplicateGtinComponentIds: readonly string[];
  readonly conflictingComponentIds: readonly string[];
}

export interface IdentityReviewQueueEntry {
  readonly componentId: string;
  readonly category: ComponentCategory;
  readonly manufacturer: string;
  readonly model: string;
  readonly manufacturerPartNumber: string | null;
  readonly gtin: string | null;
  readonly region: string | null;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly sourceAccessedAt: string;
  readonly sourceVerifiedAt: string;
  readonly declaredHumanReviewStatus: HumanReviewStatus;
  /** Review state after fingerprint invalidation is applied. */
  readonly humanReviewStatus: HumanReviewStatus;
  readonly reviewCurrent: boolean;
  readonly concerns: readonly string[];
}

export interface IdentityReviewQueueCategory {
  readonly category: ComponentCategory;
  readonly total: number;
}

export interface IdentityReviewQueueStatus {
  readonly status: HumanReviewStatus;
  readonly total: number;
}

export interface IdentityReviewQueue {
  readonly total: number;
  readonly byStatus: readonly IdentityReviewQueueStatus[];
  readonly byCategory: readonly IdentityReviewQueueCategory[];
  readonly entries: readonly IdentityReviewQueueEntry[];
}

const SOURCE_TYPES: readonly IdentitySourceType[] = [
  "manufacturer-page",
  "manufacturer-document",
  "manufacturer-packaging",
  "gs1",
  "authorized-distributor",
  "manual-review",
];

const SOURCE_VERIFICATION_STATUSES: readonly SourceVerificationStatus[] = [
  "source-verified",
  "provisional",
];

const SOURCE_VERIFICATION_METHODS: readonly SourceVerificationMethod[] = [
  "automated-manufacturer-evidence-check",
  "manual-manufacturer-evidence-check",
];

const HUMAN_REVIEW_STATUSES: readonly HumanReviewStatus[] = [
  "not-reviewed",
  "reviewed",
  "needs-correction",
  "rejected",
  "needs-revalidation",
];

/**
 * Policy hook only. Human review does not gate matching in M10.11 and this
 * value is deliberately not read by the matching or projection paths.
 */
export const HUMAN_REVIEW_REQUIRED_FOR_PRODUCTION = false;

const HUMAN_REVIEW_FINGERPRINT = /^[0-9a-f]{16}$/;

const REVIEW_QUEUE_PRIORITY: Readonly<Record<ComponentCategory, number>> = {
  cpu: 0,
  psu: 1,
  case: 2,
  ram: 3,
  cooler: 4,
  storage: 5,
  "case-fan": 6,
  gpu: 7,
  motherboard: 8,
};

export type IdentityFingerprintInput = Pick<
  CatalogueIdentifierRecord,
  | "componentId"
  | "manufacturer"
  | "model"
  | "manufacturerPartNumber"
  | "gtin"
  | "region"
  | "source"
>;

/**
 * Deterministic 64-bit FNV-1a fingerprint over the identity-bearing evidence.
 * This is an integrity check, not a cryptographic signature. Formatting-only
 * fields such as source name and review notes are deliberately excluded.
 */
export function computeIdentityFingerprint(
  record: IdentityFingerprintInput,
): string {
  const canonical = JSON.stringify([
    record.componentId,
    record.manufacturer,
    record.model,
    record.manufacturerPartNumber,
    record.gtin,
    record.region,
    record.source.url,
    record.source.accessedAt,
  ]);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= BigInt(canonical.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).padStart(16, "0");
}

/**
 * A review is current only when its fingerprint matches the current evidence.
 * "not-reviewed" is always current because there is no approval to invalidate.
 */
export function isHumanReviewCurrent(
  record: CatalogueIdentifierRecord,
): boolean {
  const review = record.humanReview;
  if (review.status === "not-reviewed") return true;
  if (
    typeof review.evidenceFingerprint !== "string" ||
    !HUMAN_REVIEW_FINGERPRINT.test(review.evidenceFingerprint)
  ) {
    return false;
  }
  return review.evidenceFingerprint === computeIdentityFingerprint(record);
}

/**
 * Review state after invalidation. A stale decision becomes needs-revalidation
 * rather than reviewed, rejected or corrected, because the evidence it was
 * based on no longer exists.
 */
export function effectiveHumanReviewStatus(
  record: CatalogueIdentifierRecord,
): HumanReviewStatus {
  if (record.humanReview.status === "not-reviewed") return "not-reviewed";
  return isHumanReviewCurrent(record)
    ? record.humanReview.status
    : "needs-revalidation";
}

function parseInstant(value: Date | string | undefined): number | null {
  if (value === undefined) return Date.now();
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function validateSource(
  value: unknown,
  path: string,
  nowMs: number,
): PricingResult<IdentitySource> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Source evidence must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (
    typeof record.type !== "string" ||
    !(SOURCE_TYPES as readonly string[]).includes(record.type)
  ) {
    issues.push(
      issue(
        `${path}.type`,
        "invalid-value",
        "Unsupported source evidence type.",
      ),
    );
  }
  const name = validateText(record.name, `${path}.name`, 160);
  if (!name.ok) issues.push(...name.issues);

  const url = validateHttpsUrl(record.url, `${path}.url`);
  if (!url.ok) issues.push(...url.issues);

  const accessed = validateTimestamp(record.accessedAt, `${path}.accessedAt`);
  if (!accessed.ok) issues.push(...accessed.issues);
  else if (accessed.value !== null && Date.parse(accessed.value) > nowMs) {
    issues.push(
      issue(
        `${path}.accessedAt`,
        "invalid-timestamp",
        "Source access time cannot be in the future.",
      ),
    );
  }

  if (issues.length > 0) return failure(issues);
  if (
    !name.ok ||
    !url.ok ||
    !accessed.ok ||
    accessed.value === null ||
    typeof record.type !== "string"
  ) {
    return failure([
      issue(path, "invalid-value", "Source evidence is invalid."),
    ]);
  }
  return success({
    type: record.type as IdentitySourceType,
    name: name.value,
    url: url.value,
    accessedAt: accessed.value,
  });
}

function validateSourceVerification(
  value: unknown,
  path: string,
  sourceAccessedAt: string,
  nowMs: number,
): PricingResult<SourceVerification> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        path,
        "invalid-type",
        "Source verification metadata must be an object.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (
    typeof record.status !== "string" ||
    !(SOURCE_VERIFICATION_STATUSES as readonly string[]).includes(record.status)
  ) {
    issues.push(
      issue(
        `${path}.status`,
        "invalid-value",
        "Source verification status must be source-verified or provisional.",
      ),
    );
  }
  if (
    typeof record.method !== "string" ||
    !(SOURCE_VERIFICATION_METHODS as readonly string[]).includes(record.method)
  ) {
    issues.push(
      issue(
        `${path}.method`,
        "invalid-value",
        "Unsupported source verification method.",
      ),
    );
  }

  const verifiedBy = validateText(record.verifiedBy, `${path}.verifiedBy`, 80);
  if (!verifiedBy.ok) issues.push(...verifiedBy.issues);

  const verifiedAt = validateTimestamp(record.verifiedAt, `${path}.verifiedAt`);
  if (!verifiedAt.ok) issues.push(...verifiedAt.issues);
  else if (verifiedAt.value !== null) {
    const verifiedMs = Date.parse(verifiedAt.value);
    if (verifiedMs > nowMs) {
      issues.push(
        issue(
          `${path}.verifiedAt`,
          "invalid-timestamp",
          "Source verification time cannot be in the future.",
        ),
      );
    }
    if (verifiedMs < Date.parse(sourceAccessedAt)) {
      issues.push(
        issue(
          `${path}.verifiedAt`,
          "identity-conflict",
          "Source verification time cannot precede source access.",
        ),
      );
    }
  }

  const notes = validateOptionalText(record.notes, `${path}.notes`, 300);
  if (!notes.ok) issues.push(...notes.issues);

  if (issues.length > 0) return failure(issues);
  if (
    !verifiedBy.ok ||
    !verifiedAt.ok ||
    verifiedAt.value === null ||
    !notes.ok ||
    typeof record.status !== "string" ||
    typeof record.method !== "string"
  ) {
    return failure([
      issue(path, "invalid-value", "Source verification metadata is invalid."),
    ]);
  }
  return success({
    status: record.status as SourceVerificationStatus,
    method: record.method as SourceVerificationMethod,
    verifiedBy: verifiedBy.value,
    verifiedAt: verifiedAt.value,
    notes: notes.value,
  });
}

function validateHumanReview(
  value: unknown,
  path: string,
  sourceUrl: string,
  sourceAccessedAt: string,
  sourceVerifiedAt: string,
  sourceVerifiedBy: string,
  nowMs: number,
): PricingResult<HumanReview> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Human review metadata must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];
  const status = record.status;

  if (
    typeof status !== "string" ||
    !(HUMAN_REVIEW_STATUSES as readonly string[]).includes(status)
  ) {
    issues.push(
      issue(
        `${path}.status`,
        "invalid-value",
        "Human review status must be one of not-reviewed, reviewed, needs-correction, rejected or needs-revalidation.",
      ),
    );
  }

  const notes = validateOptionalText(record.notes, `${path}.notes`, 300);
  if (!notes.ok) issues.push(...notes.issues);

  if (status === "not-reviewed") {
    for (const field of [
      "reviewer",
      "reviewedAt",
      "sourceUrl",
      "evidenceFingerprint",
      "previousStatus",
    ] as const) {
      if (record[field] !== null && record[field] !== undefined) {
        issues.push(
          issue(
            `${path}.${field}`,
            "identity-conflict",
            `A not-reviewed record cannot set ${field}.`,
          ),
        );
      }
    }
    if (issues.length > 0) return failure(issues);
    return success({
      status: "not-reviewed",
      reviewer: null,
      reviewedAt: null,
      notes: notes.ok ? notes.value : null,
      sourceUrl: null,
      evidenceFingerprint: null,
      previousStatus: null,
    });
  }

  if (
    status !== "reviewed" &&
    status !== "needs-correction" &&
    status !== "rejected" &&
    status !== "needs-revalidation"
  ) {
    return failure(
      issues.length > 0
        ? issues
        : [issue(path, "invalid-value", "Human review metadata is invalid.")],
    );
  }

  const reviewer = validateText(record.reviewer, `${path}.reviewer`, 80);
  if (!reviewer.ok) issues.push(...reviewer.issues);
  else if (
    normalizeKey(reviewer.value) === normalizeKey(sourceVerifiedBy) ||
    /^opencode-/i.test(reviewer.value)
  ) {
    issues.push(
      issue(
        `${path}.reviewer`,
        "identity-conflict",
        "Human reviewer must be a named person, not the source-verification process identity.",
      ),
    );
  }

  const reviewedAt = validateTimestamp(record.reviewedAt, `${path}.reviewedAt`);
  if (!reviewedAt.ok) issues.push(...reviewedAt.issues);
  else if (reviewedAt.value !== null) {
    const reviewedMs = Date.parse(reviewedAt.value);
    if (reviewedMs > nowMs) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "invalid-timestamp",
          "Human review time cannot be in the future.",
        ),
      );
    }
    if (reviewedMs < Date.parse(sourceAccessedAt)) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "identity-conflict",
          "Human review time cannot precede source access.",
        ),
      );
    }
    if (reviewedMs < Date.parse(sourceVerifiedAt)) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "identity-conflict",
          "Human review time cannot precede source verification.",
        ),
      );
    }
  }

  const reviewNotes = validateText(record.notes, `${path}.notes`, 300);
  if (!reviewNotes.ok) issues.push(...reviewNotes.issues);

  const reviewSource = validateHttpsUrl(record.sourceUrl, `${path}.sourceUrl`);
  if (!reviewSource.ok) issues.push(...reviewSource.issues);
  else if (
    (status === "reviewed" || status === "needs-revalidation") &&
    reviewSource.value !== sourceUrl
  ) {
    issues.push(
      issue(
        `${path}.sourceUrl`,
        "identity-conflict",
        "Reviewed evidence must recheck the manufacturer source URL on the record.",
      ),
    );
  }

  const fingerprint = validateText(
    record.evidenceFingerprint,
    `${path}.evidenceFingerprint`,
    32,
  );
  if (!fingerprint.ok) issues.push(...fingerprint.issues);
  else if (!HUMAN_REVIEW_FINGERPRINT.test(fingerprint.value)) {
    issues.push(
      issue(
        `${path}.evidenceFingerprint`,
        "invalid-value",
        "Evidence fingerprint must be 16 lowercase hexadecimal characters.",
      ),
    );
  }

  let previousStatus: HumanReviewStatus | null = null;
  if (record.previousStatus !== null && record.previousStatus !== undefined) {
    if (
      typeof record.previousStatus !== "string" ||
      !(HUMAN_REVIEW_STATUSES as readonly string[]).includes(
        record.previousStatus,
      )
    ) {
      issues.push(
        issue(
          `${path}.previousStatus`,
          "invalid-value",
          "Previous review status is not supported.",
        ),
      );
    } else if (record.previousStatus === status) {
      issues.push(
        issue(
          `${path}.previousStatus`,
          "identity-conflict",
          "Previous review status must differ from the current status.",
        ),
      );
    } else {
      previousStatus = record.previousStatus as HumanReviewStatus;
    }
  }

  if (issues.length > 0) return failure(issues);
  if (
    !reviewer.ok ||
    !reviewedAt.ok ||
    reviewedAt.value === null ||
    !reviewNotes.ok ||
    !reviewSource.ok ||
    !fingerprint.ok ||
    typeof status !== "string"
  ) {
    return failure([
      issue(path, "invalid-value", "Human review metadata is invalid."),
    ]);
  }

  return success({
    status: status as HumanReviewStatus,
    reviewer: reviewer.value,
    reviewedAt: reviewedAt.value,
    notes: reviewNotes.value,
    sourceUrl: reviewSource.value,
    evidenceFingerprint: fingerprint.value,
    previousStatus,
  });
}

function validateRecord(
  value: unknown,
  index: number,
  componentsById: ReadonlyMap<string, Component>,
  nowMs: number,
): PricingResult<CatalogueIdentifierRecord> {
  const path = `records[${index}]`;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Identifier record must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const componentId = record.componentId;
  if (!isComponentId(componentId)) {
    issues.push(
      issue(
        `${path}.componentId`,
        "invalid-id",
        "Expected a stable catalogue component id.",
      ),
    );
  }
  const component = isComponentId(componentId)
    ? componentsById.get(componentId)
    : undefined;
  if (componentId !== undefined && component === undefined) {
    issues.push(
      issue(
        `${path}.componentId`,
        "invalid-value",
        "Component does not exist in the catalogue.",
      ),
    );
  }

  const manufacturer = validateText(
    record.manufacturer,
    `${path}.manufacturer`,
    120,
  );
  if (!manufacturer.ok) issues.push(...manufacturer.issues);
  const model = validateText(record.model, `${path}.model`, 120);
  if (!model.ok) issues.push(...model.issues);

  if (
    component !== undefined &&
    manufacturer.ok &&
    normalizeKey(manufacturer.value) !== normalizeKey(component.manufacturer)
  ) {
    issues.push(
      issue(
        `${path}.manufacturer`,
        "identity-conflict",
        "Manufacturer does not match the catalogue component.",
      ),
    );
  }
  if (
    component !== undefined &&
    model.ok &&
    normalizeKey(model.value) !== normalizeKey(component.model)
  ) {
    issues.push(
      issue(
        `${path}.model`,
        "identity-conflict",
        "Model does not match the catalogue component.",
      ),
    );
  }

  const mpn = validateOptionalText(
    record.manufacturerPartNumber,
    `${path}.manufacturerPartNumber`,
    120,
  );
  if (!mpn.ok) issues.push(...mpn.issues);
  const normalizedMpn =
    mpn.ok && mpn.value !== null ? normalizePartNumber(mpn.value) : null;
  if (mpn.ok && mpn.value !== null && normalizedMpn === "") {
    issues.push(
      issue(
        `${path}.manufacturerPartNumber`,
        "invalid-value",
        "Manufacturer part number cannot be empty.",
      ),
    );
  }

  const gtin = normalizeGtin(record.gtin);
  if (!gtin.ok) {
    issues.push(
      ...gtin.issues.map((entry) => ({
        ...entry,
        path: `${path}.gtin`,
      })),
    );
  }

  if (normalizedMpn === null && (gtin.ok ? gtin.value : null) === null) {
    issues.push(
      issue(
        path,
        "missing",
        "At least one of manufacturerPartNumber or gtin is required.",
      ),
    );
  }

  let region: string | null = null;
  if (record.region !== null && record.region !== undefined) {
    region = normalizeCountryCode(record.region);
    if (region === null) {
      issues.push(
        issue(
          `${path}.region`,
          "invalid-country",
          "Expected an ISO 3166-1 alpha-2 country code or null.",
        ),
      );
    }
  }

  const source = validateSource(record.source, `${path}.source`, nowMs);
  if (!source.ok) issues.push(...source.issues);

  const sourceVerification: PricingResult<SourceVerification> = source.ok
    ? validateSourceVerification(
        record.sourceVerification,
        `${path}.sourceVerification`,
        source.value.accessedAt,
        nowMs,
      )
    : failure([
        issue(
          `${path}.sourceVerification`,
          "missing",
          "Source verification requires valid source evidence.",
        ),
      ]);
  if (!sourceVerification.ok) issues.push(...sourceVerification.issues);

  const humanReview: PricingResult<HumanReview> =
    source.ok && sourceVerification.ok
      ? validateHumanReview(
          record.humanReview,
          `${path}.humanReview`,
          source.value.url,
          source.value.accessedAt,
          sourceVerification.value.verifiedAt,
          sourceVerification.value.verifiedBy,
          nowMs,
        )
      : failure([
          issue(
            `${path}.humanReview`,
            "missing",
            "Human review metadata requires valid source verification.",
          ),
        ]);
  if (!humanReview.ok) issues.push(...humanReview.issues);

  if (issues.length > 0) return failure(issues);
  if (
    component === undefined ||
    !manufacturer.ok ||
    !model.ok ||
    !mpn.ok ||
    !gtin.ok ||
    !source.ok ||
    !sourceVerification.ok ||
    !humanReview.ok
  ) {
    return failure([
      issue(path, "invalid-value", "Identifier record is invalid."),
    ]);
  }

  return success({
    componentId: component.id,
    manufacturer: component.manufacturer,
    model: component.model,
    manufacturerPartNumber: normalizedMpn,
    gtin: gtin.value,
    region,
    source: source.value,
    sourceVerification: sourceVerification.value,
    humanReview: humanReview.value,
  });
}

export function validateIdentifierRegistry(
  value: unknown,
  components: readonly Component[],
  options: IdentifierRegistryValidationOptions = {},
): PricingResult<CatalogueIdentifierRegistry> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Validation time is invalid."),
    ]);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue("registry", "invalid-type", "Registry must be an object."),
    ]);
  }
  if (!isJsonSafeByteLength(value, MAX_REGISTRY_BYTES)) {
    return failure([
      issue("registry", "too-large", "Registry payload is too large."),
    ]);
  }

  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];
  if (record.schemaVersion !== IDENTITY_REGISTRY_SCHEMA_VERSION) {
    issues.push(
      issue(
        "schemaVersion",
        "invalid-value",
        `Expected schema version ${IDENTITY_REGISTRY_SCHEMA_VERSION}.`,
      ),
    );
  }
  if (!Array.isArray(record.records)) {
    issues.push(issue("records", "invalid-type", "Records must be an array."));
    return failure(issues);
  }
  if (record.records.length > MAX_IDENTIFIER_RECORDS) {
    issues.push(
      issue(
        "records",
        "too-many",
        `Registry may contain at most ${MAX_IDENTIFIER_RECORDS} records.`,
      ),
    );
  }

  const componentsById = new Map(
    components.map((component) => [component.id, component]),
  );
  const records: CatalogueIdentifierRecord[] = [];
  const seenComponents = new Map<string, number>();
  const seenMpn = new Map<string, number>();
  const seenGtin = new Map<string, number>();

  for (const [index, entry] of record.records.entries()) {
    const validated = validateRecord(entry, index, componentsById, nowMs);
    if (!validated.ok) {
      issues.push(...validated.issues);
      continue;
    }
    const result = validated.value;

    const priorComponent = seenComponents.get(result.componentId);
    if (priorComponent !== undefined) {
      issues.push(
        issue(
          `records[${index}].componentId`,
          "duplicate-identifier",
          `Component already has a registry record at records[${priorComponent}].`,
        ),
      );
    } else {
      seenComponents.set(result.componentId, index);
    }

    if (result.manufacturerPartNumber !== null) {
      const key = `${normalizeKey(result.manufacturer)}|${result.manufacturerPartNumber}`;
      const prior = seenMpn.get(key);
      if (prior !== undefined) {
        issues.push(
          issue(
            `records[${index}].manufacturerPartNumber`,
            "duplicate-identifier",
            `Manufacturer part number already appears at records[${prior}].`,
          ),
        );
      } else {
        seenMpn.set(key, index);
      }
    }

    if (result.gtin !== null) {
      const prior = seenGtin.get(result.gtin);
      if (prior !== undefined) {
        issues.push(
          issue(
            `records[${index}].gtin`,
            "duplicate-identifier",
            `GTIN already appears at records[${prior}].`,
          ),
        );
      } else {
        seenGtin.set(result.gtin, index);
      }
    }

    records.push(result);
  }

  if (issues.length > 0) return failure(issues);
  return success({
    schemaVersion: IDENTITY_REGISTRY_SCHEMA_VERSION,
    records,
  });
}

/**
 * Project verified records into the existing matching contract. Provisional
 * and missing records deliberately leave the component model-only.
 */
export function buildCatalogueIdentities(
  components: readonly Component[],
  registry?: CatalogueIdentifierRegistry | null,
): PricingResult<CatalogueProductIdentity[]> {
  if (registry === undefined || registry === null) {
    return success(components.map(catalogueIdentity));
  }
  const validated = validateIdentifierRegistry(registry, components);
  if (!validated.ok) return validated;

  const verified = new Map(
    validated.value.records
      .filter(
        (record) => record.sourceVerification.status === "source-verified",
      )
      .map((record) => [record.componentId, record]),
  );

  return success(
    components.map((component) => {
      const base = catalogueIdentity(component);
      const record = verified.get(component.id);
      if (record === undefined) return base;
      return {
        ...base,
        manufacturerPartNumber: record.manufacturerPartNumber,
        gtin: record.gtin,
        region: record.region,
      };
    }),
  );
}

/** Convenience wrapper that applies the registry before existing matching. */
export function matchProductWithRegistry(
  raw: unknown,
  components: readonly Component[],
  registry?: CatalogueIdentifierRegistry | null,
): PricingResult<ProductMatch> {
  const identities = buildCatalogueIdentities(components, registry);
  if (!identities.ok) return identities;
  return matchProduct(raw, identities.value);
}

/**
 * Explicit duplicate/conflict counts. Registry validation already fails closed
 * on these conditions; this helper keeps the audit numbers testable without
 * weakening that validation.
 */
export function auditIdentifierUniqueness(
  records: readonly CatalogueIdentifierRecord[],
): IdentityUniquenessAudit {
  const seenMpn = new Set<string>();
  const seenGtin = new Set<string>();
  const seenComponent = new Set<string>();
  const duplicateMpnComponentIds: string[] = [];
  const duplicateGtinComponentIds: string[] = [];
  const conflictingComponentIds: string[] = [];

  for (const record of records) {
    if (record.manufacturerPartNumber !== null) {
      const key = `${normalizeKey(record.manufacturer)}|${record.manufacturerPartNumber}`;
      if (seenMpn.has(key)) duplicateMpnComponentIds.push(record.componentId);
      else seenMpn.add(key);
    }
    if (record.gtin !== null) {
      if (seenGtin.has(record.gtin)) {
        duplicateGtinComponentIds.push(record.componentId);
      } else {
        seenGtin.add(record.gtin);
      }
    }
    if (seenComponent.has(record.componentId)) {
      conflictingComponentIds.push(record.componentId);
    } else {
      seenComponent.add(record.componentId);
    }
  }

  return {
    duplicateMpnRecords: duplicateMpnComponentIds.length,
    duplicateGtinRecords: duplicateGtinComponentIds.length,
    conflictingComponentRecords: conflictingComponentIds.length,
    duplicateMpnComponentIds: [...new Set(duplicateMpnComponentIds)].sort(),
    duplicateGtinComponentIds: [...new Set(duplicateGtinComponentIds)].sort(),
    conflictingComponentIds: [...new Set(conflictingComponentIds)].sort(),
  };
}

/**
 * Deterministic review queue for source-verified identities. Ordering follows
 * the M10.11 priority: CPU, PSU, case, RAM, cooler, storage, case fan, then
 * any other category.
 */
export function buildIdentityReviewQueue(
  components: readonly Component[],
  registry: CatalogueIdentifierRegistry,
  options: IdentifierRegistryValidationOptions = {},
): PricingResult<IdentityReviewQueue> {
  const validated = validateIdentifierRegistry(registry, components, options);
  if (!validated.ok) return validated;

  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );
  const entries: IdentityReviewQueueEntry[] = [];

  for (const record of validated.value.records) {
    if (record.sourceVerification.status !== "source-verified") continue;
    const component = componentById.get(record.componentId);
    if (component === undefined) continue;

    const reviewCurrent = isHumanReviewCurrent(record);
    const humanReviewStatus = effectiveHumanReviewStatus(record);
    const concerns: string[] = [];
    if (record.humanReview.status !== "not-reviewed" && !reviewCurrent) {
      concerns.push(
        "Review fingerprint no longer matches the current evidence.",
      );
    }
    if (record.region !== null) {
      concerns.push(`Regional identity limited to ${record.region}.`);
    }
    if (record.manufacturerPartNumber === null) {
      concerns.push("No MPN evidence.");
    }
    if (record.gtin === null) {
      concerns.push("No GTIN evidence.");
    }
    if (humanReviewStatus === "needs-correction") {
      concerns.push("Reviewer flagged an identity correction.");
    }
    if (humanReviewStatus === "rejected") {
      concerns.push("Reviewer rejected this identity.");
    }
    if (humanReviewStatus === "needs-revalidation" && reviewCurrent) {
      concerns.push(
        "Reviewer reported that evidence could not be revalidated.",
      );
    }

    entries.push({
      componentId: record.componentId,
      category: component.category,
      manufacturer: record.manufacturer,
      model: record.model,
      manufacturerPartNumber: record.manufacturerPartNumber,
      gtin: record.gtin,
      region: record.region,
      sourceName: record.source.name,
      sourceUrl: record.source.url,
      sourceAccessedAt: record.source.accessedAt,
      sourceVerifiedAt: record.sourceVerification.verifiedAt,
      declaredHumanReviewStatus: record.humanReview.status,
      humanReviewStatus,
      reviewCurrent,
      concerns,
    });
  }

  entries.sort((left, right) => {
    const priority =
      REVIEW_QUEUE_PRIORITY[left.category] -
      REVIEW_QUEUE_PRIORITY[right.category];
    return priority !== 0
      ? priority
      : left.componentId.localeCompare(right.componentId);
  });

  return success({
    total: entries.length,
    byStatus: HUMAN_REVIEW_STATUSES.map((status) => ({
      status,
      total: entries.filter((entry) => entry.humanReviewStatus === status)
        .length,
    })).filter((entry) => entry.total > 0),
    byCategory: componentCategories
      .slice()
      .sort(
        (left, right) =>
          REVIEW_QUEUE_PRIORITY[left] - REVIEW_QUEUE_PRIORITY[right],
      )
      .map((category) => ({
        category,
        total: entries.filter((entry) => entry.category === category).length,
      }))
      .filter((entry) => entry.total > 0),
    entries,
  });
}

export function auditIdentifierRegistry(
  components: readonly Component[],
  registry: CatalogueIdentifierRegistry,
  options: IdentifierRegistryAuditOptions = {},
): PricingResult<IdentifierRegistryAudit> {
  const nowMs = parseInstant(options.now);
  if (nowMs === null) {
    return failure([
      issue("now", "invalid-timestamp", "Audit time is invalid."),
    ]);
  }
  const maxEvidenceAgeMs =
    options.maxEvidenceAgeMs ?? DEFAULT_IDENTITY_EVIDENCE_MAX_AGE_MS;
  if (
    typeof maxEvidenceAgeMs !== "number" ||
    !Number.isSafeInteger(maxEvidenceAgeMs) ||
    maxEvidenceAgeMs <= 0
  ) {
    return failure([
      issue(
        "maxEvidenceAgeMs",
        "invalid-value",
        "Evidence age must be a positive integer duration.",
      ),
    ]);
  }

  const validated = validateIdentifierRegistry(registry, components, {
    now: options.now,
  });
  if (!validated.ok) return validated;
  const identities = buildCatalogueIdentities(components, validated.value);
  if (!identities.ok) return identities;
  const catalogue = auditCatalogueIdentities(identities.value);

  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );
  const records = validated.value.records;
  const componentIdsOf = (
    entries: readonly CatalogueIdentifierRecord[],
  ): string[] => [...new Set(entries.map((entry) => entry.componentId))].sort();

  const sourceVerifiedRecords = records.filter(
    (record) => record.sourceVerification.status === "source-verified",
  );
  const provisionalRecords = records.filter(
    (record) => record.sourceVerification.status === "provisional",
  );
  const invalidatedReviewRecords = records.filter(
    (record) =>
      record.humanReview.status !== "not-reviewed" &&
      !isHumanReviewCurrent(record),
  );
  const humanReviewedRecords = records.filter(
    (record) => effectiveHumanReviewStatus(record) === "reviewed",
  );
  const awaitingHumanReviewRecords = records.filter(
    (record) => effectiveHumanReviewStatus(record) === "not-reviewed",
  );
  const needsCorrectionRecords = records.filter(
    (record) => effectiveHumanReviewStatus(record) === "needs-correction",
  );
  const rejectedRecords = records.filter(
    (record) => effectiveHumanReviewStatus(record) === "rejected",
  );
  const needsRevalidationRecords = records.filter(
    (record) => effectiveHumanReviewStatus(record) === "needs-revalidation",
  );
  const uniqueness = auditIdentifierUniqueness(records);

  const staleSourceVerificationRecords = records.filter(
    (record) =>
      nowMs - Date.parse(record.sourceVerification.verifiedAt) >
      maxEvidenceAgeMs,
  );
  const staleHumanReviewRecords = humanReviewedRecords.filter(
    (record) =>
      record.humanReview.reviewedAt !== null &&
      nowMs - Date.parse(record.humanReview.reviewedAt) > maxEvidenceAgeMs,
  );

  const sourceVerifiedMpn = sourceVerifiedRecords.filter(
    (record) => record.manufacturerPartNumber !== null,
  );
  const sourceVerifiedGtin = sourceVerifiedRecords.filter(
    (record) => record.gtin !== null,
  );
  const both = sourceVerifiedRecords.filter(
    (record) => record.manufacturerPartNumber !== null && record.gtin !== null,
  );
  const sourceVerifiedComponentIds = new Set(
    sourceVerifiedRecords.map((record) => record.componentId),
  );
  const provisionalComponentIds = componentIdsOf(provisionalRecords);
  const humanReviewedComponentIds = componentIdsOf(humanReviewedRecords);
  const awaitingHumanReviewComponentIds = componentIdsOf(
    awaitingHumanReviewRecords,
  );
  const needsCorrectionComponentIds = componentIdsOf(needsCorrectionRecords);
  const rejectedComponentIds = componentIdsOf(rejectedRecords);
  const needsRevalidationComponentIds = componentIdsOf(
    needsRevalidationRecords,
  );
  const invalidatedReviewComponentIds = componentIdsOf(
    invalidatedReviewRecords,
  );
  const staleSourceVerificationComponentIds = componentIdsOf(
    staleSourceVerificationRecords,
  );
  const staleHumanReviewComponentIds = componentIdsOf(staleHumanReviewRecords);

  const byCategory: RegistryCategoryCoverage[] = [];
  for (const category of componentCategories) {
    const total = catalogue.byCategory.find(
      (entry) => entry.category === category,
    )?.total;
    if (total === undefined || total === 0) continue;

    const categoryRecords = records.filter(
      (record) => componentById.get(record.componentId)?.category === category,
    );
    const categorySourceVerified = sourceVerifiedRecords.filter(
      (record) => componentById.get(record.componentId)?.category === category,
    );
    const categorySourceVerifiedIds = new Set(
      categorySourceVerified.map((record) => record.componentId),
    );
    const categoryHumanReviewed = categoryRecords.filter(
      (record) => effectiveHumanReviewStatus(record) === "reviewed",
    );

    byCategory.push({
      category,
      total,
      sourceVerifiedComponents: categorySourceVerifiedIds.size,
      sourceVerifiedMpn: categorySourceVerified.filter(
        (record) => record.manufacturerPartNumber !== null,
      ).length,
      sourceVerifiedGtin: categorySourceVerified.filter(
        (record) => record.gtin !== null,
      ).length,
      both: categorySourceVerified.filter(
        (record) =>
          record.manufacturerPartNumber !== null && record.gtin !== null,
      ).length,
      withoutSourceVerified: total - categorySourceVerifiedIds.size,
      humanReviewedComponents: new Set(
        categoryHumanReviewed.map((record) => record.componentId),
      ).size,
    });
  }

  return success({
    totalComponents: components.length,
    totalRecords: records.length,
    sourceVerifiedRecords: sourceVerifiedRecords.length,
    provisionalRecords: provisionalRecords.length,
    humanReviewedRecords: humanReviewedRecords.length,
    awaitingHumanReviewRecords: awaitingHumanReviewRecords.length,
    needsCorrectionRecords: needsCorrectionRecords.length,
    rejectedRecords: rejectedRecords.length,
    needsRevalidationRecords: needsRevalidationRecords.length,
    invalidatedReviewRecords: invalidatedReviewRecords.length,
    staleSourceVerificationRecords: staleSourceVerificationRecords.length,
    staleHumanReviewRecords: staleHumanReviewRecords.length,
    duplicateMpnRecords: uniqueness.duplicateMpnRecords,
    duplicateGtinRecords: uniqueness.duplicateGtinRecords,
    conflictingComponentRecords: uniqueness.conflictingComponentRecords,
    mpnRecords: records.filter(
      (record) => record.manufacturerPartNumber !== null,
    ).length,
    gtinRecords: records.filter((record) => record.gtin !== null).length,
    bothRecords: records.filter(
      (record) =>
        record.manufacturerPartNumber !== null && record.gtin !== null,
    ).length,
    sourceVerifiedComponents: sourceVerifiedComponentIds.size,
    sourceVerifiedMpn: sourceVerifiedMpn.length,
    sourceVerifiedGtin: sourceVerifiedGtin.length,
    both: both.length,
    withoutSourceVerified: components.length - sourceVerifiedComponentIds.size,
    provisionalComponentIds,
    humanReviewedComponentIds,
    awaitingHumanReviewComponentIds,
    needsCorrectionComponentIds,
    rejectedComponentIds,
    needsRevalidationComponentIds,
    invalidatedReviewComponentIds,
    staleSourceVerificationComponentIds,
    staleHumanReviewComponentIds,
    byCategory,
    catalogue,
  });
}
