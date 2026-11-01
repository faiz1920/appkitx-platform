/*
 * Provider-independent product mapping contracts (M10.12).
 *
 * This module connects an external provider/retailer product identity to an
 * exact AppKitX catalogue component. It deliberately contains no price, stock,
 * offer, affiliate or network fields: mapping is an identity concern, not a
 * commercial one.
 *
 * Unknown information is always `null` and is never inferred. A provider SKU
 * is kept separate from a manufacturer part number because they are different
 * identifiers with different semantics.
 */

import type { ComponentCategory } from "../types";
import type { CatalogueIdentifierRegistry } from "../pricing/identity-registry";
import type {
  CatalogueProductIdentity,
  CollectionMethod,
  DataOrigin,
  PricingResult,
  ProductMatchStatus,
  ProviderError,
  ProviderPage,
  ProviderRequest,
  ProviderResult,
} from "../pricing/types";

/* ------------------------------------------------------------------ */
/* Provider product contract                                          */
/* ------------------------------------------------------------------ */

/** Lifecycle of the provider's own product record, not a stock state. */
export type ProviderProductLifecycle =
  "active" | "discontinued" | "superseded" | "unknown";

/**
 * Original provider-supplied identifier strings. These are preserved exactly
 * as received (after trimming surrounding whitespace) so audits can compare
 * the normalized value with the source value.
 */
export interface ProviderProductIdentifiers {
  /** Manufacturer part number, as supplied by the provider. */
  readonly manufacturerPartNumber: string | null;
  /** Manufacturer model name/number, as supplied by the provider. */
  readonly modelNumber: string | null;
  /** GTIN/EAN/UPC digits, as supplied by the provider. */
  readonly gtin: string | null;
  /**
   * Retailer/marketplace SKU. This is never treated as an MPN and is never
   * used by matching.
   */
  readonly providerSku: string | null;
}

/**
 * Canonical identifier values used by deterministic matching. They are derived
 * from `ProviderProductIdentifiers`; the originals remain available above.
 */
export interface NormalizedProviderProductIdentifiers {
  readonly manufacturerPartNumber: string | null;
  readonly modelNumber: string | null;
  readonly gtin: string | null;
}

export interface ProviderProductVariantAttribute {
  readonly name: string;
  readonly value: string;
}

/**
 * Provider-specific variant identity. Variants are preserved separately from
 * the base product and region; a mapping must carry the variant it was built
 * from so regional and variant distinctions cannot silently collapse.
 */
export interface ProviderProductVariant {
  readonly variantId: string;
  readonly variantLabel: string | null;
  readonly attributes: readonly ProviderProductVariantAttribute[];
}

/** Retrieval/source provenance for an external product record. */
export interface ProviderProductProvenance {
  readonly collectionMethod: CollectionMethod;
  readonly dataOrigin: DataOrigin;
  readonly sourceName: string;
  /** Human-facing provider/source page; never fetched by this module. */
  readonly sourceUrl: string | null;
  /** When the provider data was observed. */
  readonly observedAt: string;
  /** When AppKitX retrieved or normalized the record. */
  readonly retrievedAt: string;
  /** Provider's own last-updated time, when supplied. */
  readonly providerUpdatedAt: string | null;
  /** Provider feed/revision identifier, when supplied. */
  readonly sourceRevision: string | null;
}

/**
 * External provider product identity. This is the M10.12 mapping input and is
 * intentionally distinct from the lean M10.7 `ProviderProductRecord` used for
 * offer discovery.
 */
export interface ProviderProduct {
  /** Stable lowercase provider/adapter identifier. */
  readonly providerId: string;
  /** Provider's external product identifier, preserved exactly. */
  readonly externalProductId: string;
  /** Provider product page, when one exists. */
  readonly productUrl: string | null;
  readonly title: string;
  /** Manufacturer/brand. `null` means unknown, never inferred from title. */
  readonly manufacturer: string | null;
  readonly identifiers: ProviderProductIdentifiers;
  readonly normalizedIdentifiers: NormalizedProviderProductIdentifiers;
  readonly category: ComponentCategory | null;
  /** Provider market identifier, when supplied. */
  readonly marketId: string | null;
  /** ISO 3166-1 alpha-2 region of the exact provider SKU, when supplied. */
  readonly region: string | null;
  /** Provider-scoped seller identity, when supplied. */
  readonly sellerId: string | null;
  readonly variant: ProviderProductVariant | null;
  readonly lifecycle: ProviderProductLifecycle;
  /**
   * Previous external product ID when the provider changed its identifier.
   * The previous record, if present, must be marked `superseded`.
   */
  readonly supersedesExternalProductId: string | null;
  readonly provenance: ProviderProductProvenance;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProviderProductRegistry {
  readonly schemaVersion: 1;
  readonly products: readonly ProviderProduct[];
}

/* ------------------------------------------------------------------ */
/* Mapping registry                                                   */
/* ------------------------------------------------------------------ */

export type ProviderMappingStatus =
  "candidate" | "verified" | "rejected" | "needs-review";

export type ProviderMappingMethod =
  "exact-mpn" | "exact-gtin" | "exact-model" | "manual-review";

export type ProviderEvidenceRelationship = "match" | "mismatch" | "unknown";

/**
 * Auditable snapshot of the identity evidence used for a mapping. Provider
 * identifiers are normalized copies; `providerSku` is deliberately absent
 * because a retailer SKU is not manufacturer identity.
 */
export interface ProviderMappingEvidence {
  readonly providerProductUrl: string | null;
  readonly providerManufacturer: string | null;
  readonly providerManufacturerPartNumber: string | null;
  readonly providerModelNumber: string | null;
  readonly providerGtin: string | null;
  readonly providerCategory: ComponentCategory | null;
  readonly providerRegion: string | null;
  readonly providerMarketId: string | null;
  readonly providerSellerId: string | null;
  readonly providerVariantId: string | null;
  readonly catalogueManufacturer: string;
  readonly catalogueModel: string;
  readonly catalogueCategory: ComponentCategory;
  readonly catalogueManufacturerPartNumber: string | null;
  readonly catalogueGtin: string | null;
  readonly catalogueRegion: string | null;
  readonly manufacturer: ProviderEvidenceRelationship;
  readonly manufacturerPartNumber: ProviderEvidenceRelationship;
  readonly gtin: ProviderEvidenceRelationship;
  readonly modelNumber: ProviderEvidenceRelationship;
  readonly category: ProviderEvidenceRelationship;
  readonly region: ProviderEvidenceRelationship;
  /** Diagnostic only; title similarity never establishes a mapping. */
  readonly titleSimilarity: number;
}

export type ProviderMappingReviewStatus =
  "not-reviewed" | "approved" | "rejected" | "needs-revalidation";

/**
 * Human review of a provider-product mapping. This is deliberately separate
 * from the M10.11 catalogue identity review: approving a provider mapping does
 * not approve catalogue identity evidence, and vice versa.
 */
export interface ProviderMappingReview {
  readonly status: ProviderMappingReviewStatus;
  /** Named human reviewer only for non-"not-reviewed" states. */
  readonly reviewer: string | null;
  readonly reviewedAt: string | null;
  readonly notes: string | null;
  /** Provider product page re-opened by the reviewer. */
  readonly sourceUrl: string | null;
  /** Fingerprint of the exact mapping evidence the reviewer approved. */
  readonly evidenceFingerprint: string | null;
  /** Mapping status before the decision, for auditability. */
  readonly previousStatus: ProviderMappingStatus | null;
}

export interface ProviderMappingProvenance {
  readonly origin: "automatic-matching" | "manual-review";
  readonly matcherVersion: string;
  readonly generatedAt: string;
  readonly providerProductObservedAt: string;
  readonly providerProductUpdatedAt: string;
  /** Fingerprint of the provider product identity used for this mapping. */
  readonly providerProductFingerprint: string;
}

export interface ProviderProductMapping {
  readonly mappingId: string;
  readonly providerId: string;
  readonly externalProductId: string;
  readonly catalogueComponentId: string;
  readonly method: ProviderMappingMethod;
  readonly confidence: number;
  readonly status: ProviderMappingStatus;
  readonly evidence: ProviderMappingEvidence;
  readonly reasons: readonly string[];
  readonly region: string | null;
  readonly marketId: string | null;
  readonly sellerId: string | null;
  readonly variantId: string | null;
  readonly provenance: ProviderMappingProvenance;
  readonly review: ProviderMappingReview;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProviderMappingRegistry {
  readonly schemaVersion: 1;
  readonly mappings: readonly ProviderProductMapping[];
}

export interface ProviderMappingDataset {
  readonly schemaVersion: 1;
  readonly products: readonly ProviderProduct[];
  readonly mappings: readonly ProviderProductMapping[];
}

/* ------------------------------------------------------------------ */
/* Matching results                                                   */
/* ------------------------------------------------------------------ */

export type ProviderProductMatchOutcome =
  "candidate" | "needs-review" | "unverified" | "rejected";

/**
 * Result of deterministic provider-product matching. `matchStatus` preserves
 * the M10.7 vocabulary; the mapping status applies the stricter M10.12 review
 * policy. An automatically generated mapping is never `verified`.
 */
export interface ProviderProductMatch {
  readonly providerId: string;
  readonly externalProductId: string;
  readonly outcome: ProviderProductMatchOutcome;
  readonly matchStatus: ProductMatchStatus;
  readonly method: ProviderMappingMethod | null;
  readonly confidence: number;
  readonly componentId: string | null;
  readonly candidateComponentIds: readonly string[];
  readonly reasons: readonly string[];
  readonly titleSimilarity: number;
  readonly mapping: ProviderProductMapping | null;
}

/* ------------------------------------------------------------------ */
/* Provider adapter foundation                                       */
/* ------------------------------------------------------------------ */

export type ProviderPaginationStrategy = "cursor" | "offset" | "page" | "none";

export interface ProviderAdapterIdentity {
  readonly providerId: string;
  readonly displayName: string;
  readonly supportedMarketIds: readonly string[];
  /** ISO 3166-1 alpha-2 country codes explicitly supported by the adapter. */
  readonly supportedCountryCodes: readonly string[];
  readonly dataOrigin: DataOrigin;
  readonly adapterVersion: string;
}

export interface ProviderPaginationContract {
  readonly strategy: ProviderPaginationStrategy;
  readonly pageSizeLimit: number | null;
  /** Provider field carrying the continuation token, when documented. */
  readonly cursorField: string | null;
  readonly supportsTotalCount: boolean;
}

/** Raw identifier candidates extracted from a provider record. */
export interface ProviderIdentifierExtraction {
  readonly manufacturer: string | null;
  readonly manufacturerPartNumber: string | null;
  readonly modelNumber: string | null;
  readonly gtin: string | null;
  readonly providerSku: string | null;
  readonly notes: readonly string[];
}

export interface ProviderProductNormalizationContext {
  readonly providerId: string;
  readonly marketId: string | null;
  readonly sellerId: string | null;
  readonly observedAt: string;
  readonly retrievedAt: string;
  readonly dataOrigin: DataOrigin;
  readonly collectionMethod: CollectionMethod;
  readonly sourceName: string;
  readonly sourceUrl: string | null;
  readonly now?: Date | string;
}

/**
 * Contract for future provider adapters. No adapter implementation, client,
 * credential, network request or scraping belongs in this repository yet.
 * Adapters must return validated, provider-independent records and must not
 * place price, stock or offer fields into the identity contract.
 */
export interface ProviderProductAdapter {
  readonly identity: ProviderAdapterIdentity;
  readonly pagination: ProviderPaginationContract;
  /**
   * Contract only. Concrete adapters are future work; this method must not be
   * implemented in M10.12 and must never carry credentials into this module.
   */
  lookupProducts(
    request: ProviderProductPageRequest,
  ): Promise<ProviderResult<ProviderProductPage>>;
  extractIdentifiers(raw: unknown): PricingResult<ProviderIdentifierExtraction>;
  normalizeProduct(
    raw: unknown,
    context: ProviderProductNormalizationContext,
  ): PricingResult<ProviderProduct>;
  mapError(error: unknown): ProviderError;
}

export type ProviderProductPage = ProviderPage<ProviderProduct>;

/** Re-exported request contract for future cursor/page implementations. */
export type ProviderProductPageRequest = ProviderRequest;

/* ------------------------------------------------------------------ */
/* Options and audit                                                  */
/* ------------------------------------------------------------------ */

export interface ProviderProductValidationOptions {
  readonly now?: Date | string;
}

export interface ProviderMappingValidationOptions extends ProviderProductValidationOptions {
  readonly identifierRegistry?: CatalogueIdentifierRegistry | null;
}

export interface ProviderProductMatchOptions extends ProviderMappingValidationOptions {
  readonly matcherVersion?: string;
}

export interface ProviderMappingAuditOptions extends ProviderProductMatchOptions {
  readonly allowSyntheticData?: boolean;
}

export interface ProviderMappingEligibilityOptions {
  /**
   * Synthetic fixtures are never production pricing inputs by default. Tests
   * may set this explicitly; production callers must leave it `false`.
   */
  readonly allowSyntheticData?: boolean;
  readonly catalogueIdentity?: CatalogueProductIdentity;
}

export interface ProviderMappingEligibility {
  readonly eligible: boolean;
  readonly reasons: readonly string[];
}

export interface ProviderProductUniquenessAudit {
  readonly duplicateExternalProductIds: number;
  readonly duplicateExternalProductIdKeys: readonly string[];
  readonly productIdentifierChanges: number;
  readonly supersededProducts: number;
  readonly discontinuedProducts: number;
}

export interface ProviderMappingConflictAudit {
  readonly duplicateMappingIds: number;
  readonly duplicateMappingIdList: readonly string[];
  readonly sameExternalIdToDifferentComponents: number;
  readonly sameExternalIdConflictKeys: readonly string[];
  readonly duplicateMappings: number;
  readonly duplicateMappingKeys: readonly string[];
  readonly componentVariantConflicts: number;
  readonly componentVariantConflictKeys: readonly string[];
}

export interface ProviderMappingAuditIssue {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly message: string;
  readonly providerId: string | null;
  readonly externalProductId: string | null;
  readonly mappingId: string | null;
}

export interface ProviderMappingAudit {
  readonly totalProviderProducts: number;
  readonly totalMappings: number;
  readonly verifiedMappings: number;
  readonly candidateMappings: number;
  readonly needsReviewMappings: number;
  readonly rejectedMappings: number;
  readonly effectiveVerifiedMappings: number;
  readonly effectiveNeedsReviewMappings: number;
  readonly invalidatedReviewMappings: number;
  readonly duplicateExternalProductIds: number;
  readonly duplicateExternalProductIdKeys: readonly string[];
  readonly conflictingCatalogueAssociations: number;
  readonly conflictingCatalogueAssociationKeys: readonly string[];
  readonly componentVariantConflicts: number;
  readonly componentVariantConflictKeys: readonly string[];
  readonly regionalMismatches: number;
  readonly regionalMismatchMappingIds: readonly string[];
  readonly invalidIdentifiers: number;
  readonly missingIdentifierProducts: number;
  readonly missingIdentifierProductKeys: readonly string[];
  readonly unmappedProviderProducts: number;
  readonly unmappedProviderProductKeys: readonly string[];
  readonly ambiguousMatches: number;
  readonly ambiguousProviderProductKeys: readonly string[];
  readonly productIdentifierChanges: number;
  readonly discontinuedProviderProducts: number;
  readonly supersededProviderProducts: number;
  readonly discontinuedCatalogueTargets: number;
  readonly discontinuedCatalogueTargetMappingIds: readonly string[];
  readonly staleProviderProductMappings: number;
  readonly staleCatalogueMappings: number;
  readonly pricingEligibleMappings: number;
  readonly pricingEligibleMappingIds: readonly string[];
  readonly issues: readonly ProviderMappingAuditIssue[];
}

/** Aggregated identifier coverage for provider product records. */
export interface ProviderProductIdentifierCoverage {
  readonly totalProducts: number;
  readonly withManufacturer: number;
  readonly withManufacturerPartNumber: number;
  readonly withModelNumber: number;
  readonly withGtin: number;
  readonly withAnyExactIdentifier: number;
  readonly withoutExactIdentifier: number;
  readonly providerSkuOnly: number;
}
