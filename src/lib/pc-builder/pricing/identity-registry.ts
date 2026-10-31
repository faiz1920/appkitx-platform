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

export type HumanReviewStatus = "not-reviewed" | "reviewed";

export interface HumanReview {
  readonly status: HumanReviewStatus;
  /** Named human reviewer only when status is "reviewed". */
  readonly reviewer: string | null;
  readonly reviewedAt: string | null;
  readonly notes: string | null;
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
  readonly staleSourceVerificationRecords: number;
  readonly staleHumanReviewRecords: number;
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
  readonly staleSourceVerificationComponentIds: readonly string[];
  readonly staleHumanReviewComponentIds: readonly string[];
  readonly byCategory: readonly RegistryCategoryCoverage[];
  readonly catalogue: CatalogueIdentityAudit;
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
];

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
  sourceAccessedAt: string,
  sourceVerifiedAt: string,
  nowMs: number,
): PricingResult<HumanReview> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(path, "invalid-type", "Human review metadata must be an object."),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  if (
    typeof record.status !== "string" ||
    !(HUMAN_REVIEW_STATUSES as readonly string[]).includes(record.status)
  ) {
    issues.push(
      issue(
        `${path}.status`,
        "invalid-value",
        "Human review status must be not-reviewed or reviewed.",
      ),
    );
  }

  const notes = validateOptionalText(record.notes, `${path}.notes`, 300);
  if (!notes.ok) issues.push(...notes.issues);

  if (record.status === "reviewed") {
    const reviewer = validateText(record.reviewer, `${path}.reviewer`, 80);
    if (!reviewer.ok) issues.push(...reviewer.issues);

    const reviewedAt = validateTimestamp(
      record.reviewedAt,
      `${path}.reviewedAt`,
    );
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

    if (issues.length > 0) return failure(issues);
    if (!reviewer.ok || !reviewedAt.ok || reviewedAt.value === null) {
      return failure([
        issue(path, "invalid-value", "Human review metadata is invalid."),
      ]);
    }
    return success({
      status: "reviewed",
      reviewer: reviewer.value,
      reviewedAt: reviewedAt.value,
      notes: notes.ok ? notes.value : null,
    });
  }

  if (record.status === "not-reviewed") {
    if (record.reviewer !== null && record.reviewer !== undefined) {
      issues.push(
        issue(
          `${path}.reviewer`,
          "identity-conflict",
          "A not-reviewed record cannot name a human reviewer.",
        ),
      );
    }
    if (record.reviewedAt !== null && record.reviewedAt !== undefined) {
      issues.push(
        issue(
          `${path}.reviewedAt`,
          "identity-conflict",
          "A not-reviewed record cannot have a human review time.",
        ),
      );
    }
    if (issues.length > 0) return failure(issues);
    return success({
      status: "not-reviewed",
      reviewer: null,
      reviewedAt: null,
      notes: notes.ok ? notes.value : null,
    });
  }

  return failure(
    issues.length > 0
      ? issues
      : [issue(path, "invalid-value", "Human review metadata is invalid.")],
  );
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
          source.value.accessedAt,
          sourceVerification.value.verifiedAt,
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
  const sourceVerifiedRecords = records.filter(
    (record) => record.sourceVerification.status === "source-verified",
  );
  const provisionalRecords = records.filter(
    (record) => record.sourceVerification.status === "provisional",
  );
  const humanReviewedRecords = records.filter(
    (record) => record.humanReview.status === "reviewed",
  );
  const awaitingHumanReviewRecords = records.filter(
    (record) => record.humanReview.status === "not-reviewed",
  );
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
  const provisionalComponentIds = [
    ...new Set(provisionalRecords.map((record) => record.componentId)),
  ].sort();
  const humanReviewedComponentIds = [
    ...new Set(humanReviewedRecords.map((record) => record.componentId)),
  ].sort();
  const awaitingHumanReviewComponentIds = [
    ...new Set(awaitingHumanReviewRecords.map((record) => record.componentId)),
  ].sort();
  const staleSourceVerificationComponentIds = [
    ...new Set(
      staleSourceVerificationRecords.map((record) => record.componentId),
    ),
  ].sort();
  const staleHumanReviewComponentIds = [
    ...new Set(staleHumanReviewRecords.map((record) => record.componentId)),
  ].sort();

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
      (record) => record.humanReview.status === "reviewed",
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
    staleSourceVerificationRecords: staleSourceVerificationRecords.length,
    staleHumanReviewRecords: staleHumanReviewRecords.length,
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
    staleSourceVerificationComponentIds,
    staleHumanReviewComponentIds,
    byCategory,
    catalogue,
  });
}
