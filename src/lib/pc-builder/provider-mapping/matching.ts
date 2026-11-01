/*
 * Deterministic provider product → catalogue component matching (M10.12).
 *
 * Matching reuses the existing catalogue identity contract and the M10.7
 * confidence values. It is intentionally stricter about conflicts: an
 * automatically generated mapping is at most a `candidate`, model-only
 * evidence becomes `needs-review`, and conflicting manufacturer, identifier or
 * regional evidence is rejected rather than falling through to a weaker
 * identifier.
 */

import type { Component } from "../types";
import { buildCatalogueIdentities } from "../pricing/identity-registry";
import {
  PRODUCT_MATCH_CONFIDENCE,
  normalizeGtin,
  normalizeModelNumber,
  normalizePartNumber,
  titleSimilarity,
} from "../pricing/product-matching";
import { failure, issue, normalizeKey, success } from "../pricing/validation";
import type {
  CatalogueProductIdentity,
  PricingResult,
  ProductMatchStatus,
} from "../pricing/types";
import { fnv1a64Hex } from "./fingerprint";
import { computeProviderProductFingerprint } from "./provider-product";
import type {
  ProviderEvidenceRelationship,
  ProviderMappingEvidence,
  ProviderMappingMethod,
  ProviderMappingStatus,
  ProviderProduct,
  ProviderProductMapping,
  ProviderProductMatch,
  ProviderProductMatchOptions,
  ProviderProductMatchOutcome,
} from "./types";

export const PROVIDER_MAPPING_MATCHER_VERSION = "m10.12.0";

type ExactMatchType = "exact-mpn" | "exact-gtin" | "exact-model";

interface IdentifierEvidenceSet {
  readonly type: ExactMatchType;
  readonly identities: readonly CatalogueProductIdentity[];
}

type FilterConflict = "category" | "manufacturer" | "region";

const FILTER_CONFLICT_REASONS: Readonly<Record<FilterConflict, string>> = {
  category:
    "The exact identifier belongs to a different catalogue component category.",
  manufacturer: "The exact identifier belongs to a different manufacturer.",
  region: "The exact identifier belongs to a different regional SKU.",
};

const FILTER_CONFLICT_CODES: Readonly<Record<FilterConflict, string>> = {
  category: "category",
  manufacturer: "manufacturer",
  region: "region",
};

function nowIso(value: Date | string | undefined): string | null {
  if (value === undefined) return new Date().toISOString();
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function relationship(
  left: string | null,
  right: string | null,
  normalize: (value: string) => string,
): ProviderEvidenceRelationship {
  if (left === null || right === null) return "unknown";
  return normalize(left) === normalize(right) ? "match" : "mismatch";
}

function manufacturerRelationship(
  providerManufacturer: string | null,
  catalogueManufacturer: string,
): ProviderEvidenceRelationship {
  return relationship(
    providerManufacturer,
    catalogueManufacturer,
    normalizeKey,
  );
}

function catalogueMpn(identity: CatalogueProductIdentity): string | null {
  return identity.manufacturerPartNumber === null
    ? null
    : normalizePartNumber(identity.manufacturerPartNumber);
}

function catalogueModel(identity: CatalogueProductIdentity): string {
  return normalizeModelNumber(identity.model);
}

function buildEvidence(
  product: ProviderProduct,
  identity: CatalogueProductIdentity,
  title: number,
): ProviderMappingEvidence {
  const providerMpn = product.normalizedIdentifiers.manufacturerPartNumber;
  const providerModel = product.normalizedIdentifiers.modelNumber;
  const providerGtin = product.normalizedIdentifiers.gtin;
  const registryMpn = catalogueMpn(identity);

  return {
    providerProductUrl: product.productUrl,
    providerManufacturer: product.manufacturer,
    providerManufacturerPartNumber: providerMpn,
    providerModelNumber: providerModel,
    providerGtin,
    providerCategory: product.category,
    providerRegion: product.region,
    providerMarketId: product.marketId,
    providerSellerId: product.sellerId,
    providerVariantId: product.variant?.variantId ?? null,
    catalogueManufacturer: identity.manufacturer,
    catalogueModel: identity.model,
    catalogueCategory: identity.category,
    catalogueManufacturerPartNumber: registryMpn,
    catalogueGtin: identity.gtin,
    catalogueRegion: identity.region,
    manufacturer: manufacturerRelationship(
      product.manufacturer,
      identity.manufacturer,
    ),
    manufacturerPartNumber: relationship(
      providerMpn,
      registryMpn,
      normalizePartNumber,
    ),
    gtin: relationship(providerGtin, identity.gtin, (value) => value),
    modelNumber: relationship(
      providerModel,
      catalogueModel(identity),
      normalizeModelNumber,
    ),
    category:
      product.category === null
        ? "unknown"
        : product.category === identity.category
          ? "match"
          : "mismatch",
    region:
      product.region === null || identity.region === null
        ? "unknown"
        : product.region === identity.region
          ? "match"
          : "mismatch",
    titleSimilarity: Math.round(title * 100) / 100,
  };
}

export function providerMappingId(
  providerId: string,
  externalProductId: string,
  catalogueComponentId: string,
): string {
  return `mapping-${fnv1a64Hex(
    JSON.stringify([providerId, externalProductId, catalogueComponentId]),
  )}`;
}

function buildMapping(
  product: ProviderProduct,
  identity: CatalogueProductIdentity,
  method: ProviderMappingMethod,
  confidence: number,
  status: ProviderMappingStatus,
  title: number,
  reasons: readonly string[],
  generatedAt: string,
  matcherVersion: string,
): ProviderProductMapping {
  return {
    mappingId: providerMappingId(
      product.providerId,
      product.externalProductId,
      identity.componentId,
    ),
    providerId: product.providerId,
    externalProductId: product.externalProductId,
    catalogueComponentId: identity.componentId,
    method,
    confidence,
    status,
    evidence: buildEvidence(product, identity, title),
    reasons,
    region: product.region,
    marketId: product.marketId,
    sellerId: product.sellerId,
    variantId: product.variant?.variantId ?? null,
    provenance: {
      origin: "automatic-matching",
      matcherVersion,
      generatedAt,
      providerProductObservedAt: product.provenance.observedAt,
      providerProductUpdatedAt: product.updatedAt,
      providerProductFingerprint: computeProviderProductFingerprint(product),
    },
    review: {
      status: "not-reviewed",
      reviewer: null,
      reviewedAt: null,
      notes: null,
      sourceUrl: null,
      evidenceFingerprint: null,
      previousStatus: null,
    },
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}

function matchResult(
  product: ProviderProduct,
  outcome: ProviderProductMatchOutcome,
  matchStatus: ProductMatchStatus,
  method: ProviderMappingMethod | null,
  confidence: number,
  componentId: string | null,
  candidateComponentIds: readonly string[],
  reasons: readonly string[],
  title: number,
  mapping: ProviderProductMapping | null,
): ProviderProductMatch {
  return {
    providerId: product.providerId,
    externalProductId: product.externalProductId,
    outcome,
    matchStatus,
    method,
    confidence,
    componentId,
    candidateComponentIds: [...new Set(candidateComponentIds)].sort(),
    reasons,
    titleSimilarity: Math.round(title * 100) / 100,
    mapping,
  };
}

function bestTitleSimilarity(
  product: ProviderProduct,
  identities: readonly CatalogueProductIdentity[],
): number {
  return identities.reduce(
    (best, identity) =>
      Math.max(
        best,
        titleSimilarity(product.title, identity.name),
        titleSimilarity(
          product.title,
          `${identity.manufacturer} ${identity.name}`,
        ),
      ),
    0,
  );
}

function applyFilters(
  candidates: readonly CatalogueProductIdentity[],
  product: ProviderProduct,
):
  | { ok: true; identities: CatalogueProductIdentity[] }
  | {
      ok: false;
      conflict: FilterConflict;
    } {
  let current = [...candidates];

  if (product.category !== null) {
    current = current.filter(
      (identity) => identity.category === product.category,
    );
    if (current.length === 0) return { ok: false, conflict: "category" };
  }

  if (product.manufacturer !== null) {
    const manufacturer = normalizeKey(product.manufacturer);
    current = current.filter(
      (identity) => normalizeKey(identity.manufacturer) === manufacturer,
    );
    if (current.length === 0) return { ok: false, conflict: "manufacturer" };
  }

  if (product.region !== null) {
    current = current.filter(
      (identity) =>
        identity.region === null || identity.region === product.region,
    );
    if (current.length === 0) return { ok: false, conflict: "region" };
  }

  return { ok: true, identities: current };
}

function strongestMethod(
  sets: readonly IdentifierEvidenceSet[],
): ExactMatchType {
  if (sets.some((set) => set.type === "exact-mpn")) return "exact-mpn";
  if (sets.some((set) => set.type === "exact-gtin")) return "exact-gtin";
  return "exact-model";
}

function methodConfidence(method: ExactMatchType): number {
  if (method === "exact-mpn") {
    return PRODUCT_MATCH_CONFIDENCE.exactManufacturerPartNumber;
  }
  if (method === "exact-gtin") return PRODUCT_MATCH_CONFIDENCE.exactGtin;
  return PRODUCT_MATCH_CONFIDENCE.exactModelNumber;
}

function intersectSets(
  sets: readonly IdentifierEvidenceSet[],
): CatalogueProductIdentity[] {
  if (sets.length === 0) return [];
  const first = sets[0];
  if (first === undefined) return [];
  let current = [...first.identities];
  for (const set of sets.slice(1)) {
    const ids = new Set(set.identities.map((identity) => identity.componentId));
    current = current.filter((identity) => ids.has(identity.componentId));
  }
  const seen = new Set<string>();
  return current.filter((identity) => {
    if (seen.has(identity.componentId)) return false;
    seen.add(identity.componentId);
    return true;
  });
}

function identifiersDisagree(
  product: ProviderProduct,
  identity: CatalogueProductIdentity,
): string | null {
  const providerMpn = product.normalizedIdentifiers.manufacturerPartNumber;
  const identityMpn = catalogueMpn(identity);
  if (
    providerMpn !== null &&
    identityMpn !== null &&
    providerMpn !== identityMpn
  ) {
    return "The provider manufacturer part number disagrees with the catalogue manufacturer part number.";
  }

  const providerGtin = product.normalizedIdentifiers.gtin;
  if (
    providerGtin !== null &&
    identity.gtin !== null &&
    providerGtin !== identity.gtin
  ) {
    return "The provider GTIN disagrees with the catalogue GTIN.";
  }

  return null;
}

function extraEvidenceReasons(
  product: ProviderProduct,
  identity: CatalogueProductIdentity,
  component: Component | undefined,
): string[] {
  const reasons: string[] = [];

  if (product.manufacturer === null) {
    reasons.push(
      "Manufacturer is unknown; exact identifier evidence cannot be verified.",
    );
  }
  if (product.category === null) {
    reasons.push(
      "Provider category is unknown; identifier evidence remains category-independent.",
    );
  }
  if (product.region !== null && identity.region === null) {
    reasons.push(
      `Catalogue identity has no region; ${product.region} regional compatibility is unconfirmed.`,
    );
  }
  if (product.variant !== null) {
    reasons.push(
      `Provider variant ${product.variant.variantId} is preserved and requires review before pricing use.`,
    );
  }
  if (product.lifecycle === "discontinued") {
    reasons.push(
      "Provider product record is discontinued; the mapping is retained for identity audit only.",
    );
  }
  if (product.lifecycle === "unknown") {
    reasons.push(
      "Provider product lifecycle is unknown; the mapping is not eligible for pricing ingestion.",
    );
  }
  if (component !== undefined && component.availability !== "in-production") {
    reasons.push(
      `Catalogue component availability is ${component.availability}; the mapping is not eligible for pricing ingestion.`,
    );
  }

  return reasons;
}

/**
 * Match one validated provider product against the catalogue. The result may
 * contain an automatically generated candidate/needs-review/rejected mapping,
 * or no mapping at all when the evidence is unverified or ambiguous.
 */
export function matchProviderProduct(
  product: ProviderProduct,
  components: readonly Component[],
  options: ProviderProductMatchOptions = {},
): PricingResult<ProviderProductMatch> {
  const generatedAt = nowIso(options.now);
  if (generatedAt === null) {
    return failure([
      issue("now", "invalid-timestamp", "Evaluation time is invalid."),
    ]);
  }
  const matcherVersion =
    options.matcherVersion ?? PROVIDER_MAPPING_MATCHER_VERSION;

  const identitiesResult = buildCatalogueIdentities(
    components,
    options.identifierRegistry,
  );
  if (!identitiesResult.ok) return identitiesResult;
  const identities = identitiesResult.value;
  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );

  const candidatePool =
    product.category === null
      ? identities
      : identities.filter((identity) => identity.category === product.category);
  const title = bestTitleSimilarity(product, candidatePool);

  const byMpn = new Map<string, CatalogueProductIdentity[]>();
  const byGtin = new Map<string, CatalogueProductIdentity[]>();
  const byModel = new Map<string, CatalogueProductIdentity[]>();
  for (const identity of identities) {
    if (identity.manufacturerPartNumber !== null) {
      const key = normalizePartNumber(identity.manufacturerPartNumber);
      const entries = byMpn.get(key) ?? [];
      entries.push(identity);
      byMpn.set(key, entries);
    }
    if (identity.gtin !== null) {
      const entries = byGtin.get(identity.gtin) ?? [];
      entries.push(identity);
      byGtin.set(identity.gtin, entries);
    }
    const model = catalogueModel(identity);
    const entries = byModel.get(model) ?? [];
    entries.push(identity);
    byModel.set(model, entries);
  }

  const sets: IdentifierEvidenceSet[] = [];
  const providerMpn = product.normalizedIdentifiers.manufacturerPartNumber;
  if (providerMpn !== null) {
    const matches = byMpn.get(providerMpn) ?? [];
    if (matches.length > 0)
      sets.push({ type: "exact-mpn", identities: matches });
  }
  const providerGtin = product.normalizedIdentifiers.gtin;
  if (providerGtin !== null) {
    const matches = byGtin.get(providerGtin) ?? [];
    if (matches.length > 0) {
      sets.push({ type: "exact-gtin", identities: matches });
    }
  }
  const providerModel = product.normalizedIdentifiers.modelNumber;
  if (providerModel !== null) {
    const matches = byModel.get(normalizeModelNumber(providerModel)) ?? [];
    if (matches.length > 0) {
      sets.push({ type: "exact-model", identities: matches });
    }
  }

  if (sets.length > 0) {
    const method = strongestMethod(sets);
    const intersection = intersectSets(sets);

    if (intersection.length === 0) {
      const candidates = sets.flatMap((set) =>
        set.identities.map((identity) => identity.componentId),
      );
      return success(
        matchResult(
          product,
          "rejected",
          "rejected",
          method,
          0,
          null,
          candidates,
          [
            "Manufacturer part number, GTIN or model evidence identifies different catalogue components.",
            "Conflicting identifiers are never resolved by selecting the first candidate.",
          ],
          title,
          null,
        ),
      );
    }

    const filtered = applyFilters(intersection, product);
    if (!filtered.ok) {
      const conflict = filtered.conflict;
      const componentIds = intersection.map((identity) => identity.componentId);
      const reasons = [
        FILTER_CONFLICT_REASONS[conflict],
        `Conflicting ${FILTER_CONFLICT_CODES[conflict]} evidence is rejected rather than merged.`,
      ];

      if (intersection.length === 1) {
        const identity = intersection[0];
        if (identity === undefined) {
          return success(
            matchResult(
              product,
              "rejected",
              "rejected",
              method,
              0,
              null,
              componentIds,
              reasons,
              title,
              null,
            ),
          );
        }
        return success(
          matchResult(
            product,
            "rejected",
            "rejected",
            method,
            0,
            identity.componentId,
            componentIds,
            reasons,
            title,
            buildMapping(
              product,
              identity,
              method,
              0,
              "rejected",
              title,
              reasons,
              generatedAt,
              matcherVersion,
            ),
          ),
        );
      }

      return success(
        matchResult(
          product,
          "rejected",
          "rejected",
          method,
          0,
          null,
          componentIds,
          reasons,
          title,
          null,
        ),
      );
    }

    if (filtered.identities.length > 1) {
      const componentIds = filtered.identities.map(
        (identity) => identity.componentId,
      );
      return success(
        matchResult(
          product,
          "needs-review",
          "unverified",
          method,
          0,
          null,
          componentIds,
          [
            "Multiple catalogue components share the available exact evidence.",
            "An ambiguous match is never resolved by selecting the first candidate.",
          ],
          title,
          null,
        ),
      );
    }

    const selected = filtered.identities[0];
    if (selected === undefined) {
      return failure([
        issue(
          "providerProduct",
          "invalid-match",
          "Matching produced no selected catalogue identity.",
        ),
      ]);
    }

    if (product.lifecycle === "superseded") {
      return success(
        matchResult(
          product,
          "needs-review",
          "unverified",
          method,
          0,
          null,
          [selected.componentId],
          [
            "Provider product record is superseded; map the successor external product id instead.",
            "A superseded record never creates a new automatic mapping.",
          ],
          title,
          null,
        ),
      );
    }

    const disagreement = identifiersDisagree(product, selected);
    if (disagreement !== null) {
      return success(
        matchResult(
          product,
          "rejected",
          "rejected",
          method,
          0,
          selected.componentId,
          [selected.componentId],
          [
            disagreement,
            "Conflicting identifier evidence is rejected rather than ignored.",
          ],
          title,
          buildMapping(
            product,
            selected,
            method,
            0,
            "rejected",
            title,
            [
              disagreement,
              "Conflicting identifier evidence is rejected rather than ignored.",
            ],
            generatedAt,
            matcherVersion,
          ),
        ),
      );
    }

    const component = componentById.get(selected.componentId);
    const manufacturerKnown = product.manufacturer !== null;
    const baseReason =
      method === "exact-mpn"
        ? manufacturerKnown
          ? "Exact manufacturer part number and manufacturer match."
          : "Exact manufacturer part number matched the catalogue, but manufacturer is unknown."
        : method === "exact-gtin"
          ? manufacturerKnown
            ? product.category === null
              ? "Exact GTIN and manufacturer match; provider category is unknown."
              : "Exact GTIN, category and manufacturer match."
            : "Exact GTIN matched the catalogue, but manufacturer is unknown."
          : manufacturerKnown
            ? "Exact model number and manufacturer match; separate verification is still required."
            : "Exact model number matched the catalogue, but manufacturer is unknown.";
    const reasons = [
      baseReason,
      ...extraEvidenceReasons(product, selected, component),
    ];

    const status: ProviderMappingStatus =
      method === "exact-model" || !manufacturerKnown
        ? "needs-review"
        : "candidate";
    const confidence = manufacturerKnown ? methodConfidence(method) : 0;
    const matchStatus: ProductMatchStatus =
      status === "candidate"
        ? "verified"
        : method === "exact-model" && manufacturerKnown
          ? "probable"
          : "unverified";

    const mapping = buildMapping(
      product,
      selected,
      method,
      confidence,
      status,
      title,
      reasons,
      generatedAt,
      matcherVersion,
    );

    return success(
      matchResult(
        product,
        status === "candidate" ? "candidate" : "needs-review",
        matchStatus,
        method,
        confidence,
        selected.componentId,
        [selected.componentId],
        reasons,
        title,
        mapping,
      ),
    );
  }

  const sameManufacturerCandidate =
    product.manufacturer !== null &&
    candidatePool.some(
      (identity) =>
        normalizeKey(identity.manufacturer) ===
        normalizeKey(product.manufacturer ?? ""),
    );

  if (product.manufacturer !== null && !sameManufacturerCandidate) {
    return success(
      matchResult(
        product,
        "rejected",
        "rejected",
        null,
        0,
        null,
        [],
        [
          product.category === null
            ? "No catalogue candidate has the same manufacturer."
            : "No catalogue candidate has the same manufacturer and category.",
        ],
        title,
        null,
      ),
    );
  }

  const reasons: string[] = [];
  if (providerMpn === null && providerGtin === null && providerModel === null) {
    reasons.push(
      "No manufacturer part number, GTIN or model number was supplied.",
    );
  } else {
    reasons.push(
      "No exact manufacturer part number, GTIN or model evidence matched the catalogue.",
    );
  }
  if (product.manufacturer === null) {
    reasons.push(
      "Manufacturer is unknown and was not inferred from the title.",
    );
  }
  reasons.push(
    "Title similarity is diagnostic only and never establishes a mapping.",
  );

  return success(
    matchResult(
      product,
      "unverified",
      "unverified",
      null,
      PRODUCT_MATCH_CONFIDENCE.unverified,
      null,
      [],
      reasons,
      title,
      null,
    ),
  );
}

/** Re-exported for callers that need the same GTIN normalization as matching. */
export { normalizeGtin };
