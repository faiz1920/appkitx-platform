/*
 * Explicitly synthetic provider-product fixtures for M10.12.
 *
 * Nothing here is a real retailer, real provider response, real review or real
 * approval. Provider and product URLs use reserved example domains, every
 * record is marked `dataOrigin: "synthetic"` and every source name starts with
 * "Synthetic". The verified fixture is a test-only review created to exercise
 * the review policy; it is not evidence of a real human approval.
 *
 * These fixtures exist for tests and the read-only audit script. They are not
 * imported by any production route.
 */

import { catalogue, componentById } from "../../lib/pc-builder/catalogue";
import type { Component } from "../../lib/pc-builder/types";
import { identifierRegistry } from "../../lib/pc-builder/catalogue/identifiers";
import {
  computeProviderMappingFingerprint,
  computeProviderProductFingerprint,
  matchProviderProduct,
  validateProviderProduct,
  type ProviderMappingDataset,
  type ProviderProduct,
  type ProviderProductMapping,
  type ProviderProductVariant,
} from "../../lib/pc-builder/provider-mapping";

export const SYNTHETIC_PROVIDER_ID = "fixture-provider-m10-12";
export const SYNTHETIC_AUDIT_NOW = "2026-10-31T18:00:00.000Z";
export const SYNTHETIC_OBSERVED_AT = "2026-10-31T17:20:00.000Z";
export const SYNTHETIC_RETRIEVED_AT = "2026-10-31T17:25:00.000Z";
export const SYNTHETIC_PROVIDER_UPDATED_AT = "2026-10-31T17:15:00.000Z";
export const SYNTHETIC_MATCHED_AT = "2026-10-31T17:30:00.000Z";
export const SYNTHETIC_REVIEWED_AT = "2026-10-31T17:35:00.000Z";
export const SYNTHETIC_REVIEWER = "synthetic-m10-12-reviewer";

export const SYNTHETIC_MPN_COOLER = "ACFRE00123A";
export const SYNTHETIC_MPN_CPU = "100-100000910WOF";
export const SYNTHETIC_MPN_DISCONTINUED_CPU = "BX8071513700K";
export const SYNTHETIC_MPN_REGIONAL_PSU = "CP-9020211-NA";
export const SYNTHETIC_GTIN_CASE = "5056547205502";
export const SYNTHETIC_INVALID_GTIN = "1234";

interface SyntheticProductInput {
  readonly externalProductId: string;
  readonly title: string;
  readonly manufacturer: string | null;
  readonly manufacturerPartNumber: string | null;
  readonly modelNumber: string | null;
  readonly gtin: string | null;
  readonly providerSku?: string | null;
  readonly category: ProviderProduct["category"];
  readonly marketId?: string | null;
  readonly region?: string | null;
  readonly sellerId?: string | null;
  readonly variant?: ProviderProductVariant | null;
  readonly lifecycle?: ProviderProduct["lifecycle"];
  readonly supersedesExternalProductId?: string | null;
  readonly productUrl?: string | null;
}

function syntheticRawProduct(input: SyntheticProductInput): unknown {
  const productUrl =
    input.productUrl === undefined
      ? `https://retailer.example/products/${input.externalProductId}`
      : input.productUrl;
  return {
    providerId: SYNTHETIC_PROVIDER_ID,
    externalProductId: input.externalProductId,
    productUrl,
    title: input.title,
    manufacturer: input.manufacturer,
    identifiers: {
      manufacturerPartNumber: input.manufacturerPartNumber,
      modelNumber: input.modelNumber,
      gtin: input.gtin,
      providerSku: input.providerSku ?? null,
    },
    // Normalization is computed by the validator; this field is deliberately
    // omitted from the raw fixture input.
    normalizedIdentifiers: {
      manufacturerPartNumber: null,
      modelNumber: null,
      gtin: null,
    },
    category: input.category,
    marketId: input.marketId ?? "us",
    region: input.region ?? null,
    sellerId: input.sellerId ?? "synthetic-seller-us",
    variant: input.variant ?? null,
    lifecycle: input.lifecycle ?? "active",
    supersedesExternalProductId: input.supersedesExternalProductId ?? null,
    provenance: {
      collectionMethod: "fixture",
      dataOrigin: "synthetic",
      sourceName: "Synthetic provider feed (M10.12 fixture)",
      sourceUrl: "https://provider.example/feed/m10-12",
      observedAt: SYNTHETIC_OBSERVED_AT,
      retrievedAt: SYNTHETIC_RETRIEVED_AT,
      providerUpdatedAt: SYNTHETIC_PROVIDER_UPDATED_AT,
      sourceRevision: "synthetic-revision-1",
    },
    createdAt: SYNTHETIC_RETRIEVED_AT,
    updatedAt: SYNTHETIC_RETRIEVED_AT,
  };
}

function syntheticProduct(input: SyntheticProductInput): ProviderProduct {
  const result = validateProviderProduct(syntheticRawProduct(input), {
    now: SYNTHETIC_AUDIT_NOW,
  });
  if (!result.ok) {
    throw new Error(
      `Synthetic provider product ${input.externalProductId} is invalid: ${result.issues
        .map((entry) => `${entry.path}: ${entry.message}`)
        .join("; ")}`,
    );
  }
  return result.value;
}

function matchSyntheticProduct(
  product: ProviderProduct,
): ProviderProductMapping | null {
  const result = matchProviderProduct(product, catalogue, {
    now: SYNTHETIC_MATCHED_AT,
    identifierRegistry,
  });
  if (!result.ok) {
    throw new Error(
      `Synthetic provider product ${product.externalProductId} could not be matched: ${result.issues
        .map((entry) => entry.message)
        .join("; ")}`,
    );
  }
  return result.value.mapping;
}

function requireMapping(product: ProviderProduct): ProviderProductMapping {
  const mapping = matchSyntheticProduct(product);
  if (mapping === null) {
    throw new Error(
      `Synthetic fixture expected a mapping for ${product.externalProductId}.`,
    );
  }
  return mapping;
}

function approveSyntheticMapping(
  mapping: ProviderProductMapping,
): ProviderProductMapping {
  const reviewFingerprint = computeProviderMappingFingerprint(mapping);
  return {
    ...mapping,
    status: "verified",
    review: {
      status: "approved",
      reviewer: SYNTHETIC_REVIEWER,
      reviewedAt: SYNTHETIC_REVIEWED_AT,
      notes:
        "Synthetic test-only approval. This is not a real reviewer or production approval.",
      sourceUrl: mapping.evidence.providerProductUrl,
      evidenceFingerprint: reviewFingerprint,
      previousStatus: "candidate",
    },
    updatedAt: SYNTHETIC_REVIEWED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Main deterministic fixture dataset                                  */
/* ------------------------------------------------------------------ */

export const syntheticProviderProducts: readonly ProviderProduct[] = [
  syntheticProduct({
    externalProductId: "synthetic-acf-freezer-36-mpn",
    title: "Synthetic ARCTIC Freezer 36 listing",
    manufacturer: "ARCTIC",
    manufacturerPartNumber: "acfre00123a",
    modelNumber: null,
    gtin: null,
    category: "cooler",
  }),
  syntheticProduct({
    externalProductId: "synthetic-nzxt-h7-flow-gtin",
    title: "Synthetic NZXT H7 Flow listing",
    manufacturer: "NZXT",
    manufacturerPartNumber: null,
    modelNumber: null,
    gtin: SYNTHETIC_GTIN_CASE,
    category: "case",
  }),
  syntheticProduct({
    externalProductId: "synthetic-amd-7800x3d-model",
    title: "Synthetic AMD Ryzen 7 7800X3D model-only listing",
    manufacturer: "AMD",
    manufacturerPartNumber: null,
    modelNumber: "100-100000910wof",
    gtin: null,
    category: "cpu",
  }),
  syntheticProduct({
    externalProductId: "synthetic-amd-7800x3d-title",
    title: "Synthetic AMD Ryzen 7 7800X3D title-only listing",
    manufacturer: "AMD",
    manufacturerPartNumber: null,
    modelNumber: null,
    gtin: null,
    providerSku: "SYNTHETIC-RETAILER-SKU-ONLY",
    category: "cpu",
  }),
  syntheticProduct({
    externalProductId: "synthetic-wrong-manufacturer",
    title: "Synthetic wrong-manufacturer listing",
    manufacturer: "Intel",
    manufacturerPartNumber: SYNTHETIC_MPN_CPU,
    modelNumber: null,
    gtin: null,
    category: "cpu",
  }),
  syntheticProduct({
    externalProductId: "synthetic-region-mismatch",
    title: "Synthetic Corsair CV650 GB listing",
    manufacturer: "Corsair",
    manufacturerPartNumber: SYNTHETIC_MPN_REGIONAL_PSU,
    modelNumber: null,
    gtin: null,
    category: "psu",
    region: "GB",
  }),
  syntheticProduct({
    externalProductId: "synthetic-missing-identifiers",
    title: "Synthetic unknown component with no identifiers",
    manufacturer: null,
    manufacturerPartNumber: null,
    modelNumber: null,
    gtin: null,
    category: null,
  }),
  syntheticProduct({
    externalProductId: "synthetic-amd-successor-v1",
    title: "Synthetic AMD successor fixture v1",
    manufacturer: "AMD",
    manufacturerPartNumber: SYNTHETIC_MPN_CPU,
    modelNumber: null,
    gtin: null,
    category: "cpu",
    lifecycle: "superseded",
  }),
  syntheticProduct({
    externalProductId: "synthetic-amd-successor-v2",
    title: "Synthetic AMD successor fixture v2",
    manufacturer: "AMD",
    manufacturerPartNumber: SYNTHETIC_MPN_CPU,
    modelNumber: null,
    gtin: null,
    category: "cpu",
    supersedesExternalProductId: "synthetic-amd-successor-v1",
  }),
  syntheticProduct({
    externalProductId: "synthetic-discontinued-catalogue-target",
    title: "Synthetic Intel Core i7-13700K discontinued catalogue listing",
    manufacturer: "Intel",
    manufacturerPartNumber: SYNTHETIC_MPN_DISCONTINUED_CPU,
    modelNumber: null,
    gtin: null,
    category: "cpu",
  }),
  syntheticProduct({
    externalProductId: "synthetic-psu-cv650-us-standard",
    title: "Synthetic Corsair CV650 US standard variant",
    manufacturer: "Corsair",
    manufacturerPartNumber: SYNTHETIC_MPN_REGIONAL_PSU,
    modelNumber: null,
    gtin: null,
    category: "psu",
    region: "US",
    variant: {
      variantId: "us-standard",
      variantLabel: "Synthetic US standard variant",
      attributes: [{ name: "region-packaging", value: "US" }],
    },
  }),
  syntheticProduct({
    externalProductId: "synthetic-amd-7800x3d-discontinued-provider",
    title: "Synthetic discontinued provider record",
    manufacturer: "AMD",
    manufacturerPartNumber: SYNTHETIC_MPN_CPU,
    modelNumber: null,
    gtin: null,
    category: "cpu",
    lifecycle: "discontinued",
  }),
];

const acfMapping = requireMapping(syntheticProviderProducts[0]!);
const nzxtMapping = requireMapping(syntheticProviderProducts[1]!);
const amdModelMapping = requireMapping(syntheticProviderProducts[2]!);
const wrongManufacturerMapping = requireMapping(syntheticProviderProducts[4]!);
const regionalMismatchMapping = requireMapping(syntheticProviderProducts[5]!);
const successorMapping = requireMapping(syntheticProviderProducts[8]!);
const discontinuedTargetMapping = requireMapping(syntheticProviderProducts[9]!);
const usVariantMapping = requireMapping(syntheticProviderProducts[10]!);
const discontinuedProviderMapping = requireMapping(
  syntheticProviderProducts[11]!,
);

export const syntheticProviderMappings: readonly ProviderProductMapping[] = [
  approveSyntheticMapping(acfMapping),
  nzxtMapping,
  amdModelMapping,
  wrongManufacturerMapping,
  regionalMismatchMapping,
  successorMapping,
  discontinuedTargetMapping,
  usVariantMapping,
  discontinuedProviderMapping,
];

export const syntheticProviderMappingDataset: ProviderMappingDataset = {
  schemaVersion: 1,
  products: syntheticProviderProducts,
  mappings: syntheticProviderMappings,
};

/* ------------------------------------------------------------------ */
/* Invalid and conflicting fixtures                                    */
/* ------------------------------------------------------------------ */

/** Two records share the same provider + external product id. */
export const syntheticDuplicateProviderProductRegistry = {
  schemaVersion: 1,
  products: [
    syntheticProviderProducts[0]!,
    syntheticProduct({
      externalProductId: "synthetic-acf-freezer-36-mpn",
      title: "Synthetic duplicate provider product id",
      manufacturer: "ARCTIC",
      manufacturerPartNumber: SYNTHETIC_MPN_COOLER,
      modelNumber: null,
      gtin: null,
      category: "cooler",
    }),
  ],
};

/** A raw record with a failing GTIN check digit, for validation tests. */
export const syntheticInvalidGtinProduct = syntheticRawProduct({
  externalProductId: "synthetic-invalid-gtin",
  title: "Synthetic invalid GTIN listing",
  manufacturer: "NZXT",
  manufacturerPartNumber: null,
  modelNumber: null,
  gtin: SYNTHETIC_INVALID_GTIN,
  category: "case",
});

/** Same component, same provider, same region, two different variants. */
export const syntheticVariantConflictProduct = syntheticProduct({
  externalProductId: "synthetic-psu-cv650-us-alternate",
  title: "Synthetic Corsair CV650 US alternate variant",
  manufacturer: "Corsair",
  manufacturerPartNumber: SYNTHETIC_MPN_REGIONAL_PSU,
  modelNumber: null,
  gtin: null,
  category: "psu",
  region: "US",
  variant: {
    variantId: "us-alternate",
    variantLabel: "Synthetic US alternate variant",
    attributes: [{ name: "region-packaging", value: "US alternate" }],
  },
});

export const syntheticVariantConflictDataset = {
  schemaVersion: 1,
  products: [syntheticProviderProducts[10]!, syntheticVariantConflictProduct],
  mappings: [usVariantMapping, requireMapping(syntheticVariantConflictProduct)],
};

/**
 * The same external product id points at a different catalogue component.
 * The extra mapping is deliberately hand-built and test-only; it is not a
 * real mapping and would never be produced by deterministic matching.
 */
function syntheticConflictingMapping(
  product: ProviderProduct,
  component: Component,
): ProviderProductMapping {
  const target = requireMapping(product);
  return {
    ...target,
    mappingId: `mapping-conflict-${component.id}`,
    catalogueComponentId: component.id,
    method: "manual-review",
    confidence: 0,
    status: "needs-review",
    evidence: {
      providerProductUrl: product.productUrl,
      providerManufacturer: product.manufacturer,
      providerManufacturerPartNumber:
        product.normalizedIdentifiers.manufacturerPartNumber,
      providerModelNumber: product.normalizedIdentifiers.modelNumber,
      providerGtin: product.normalizedIdentifiers.gtin,
      providerCategory: product.category,
      providerRegion: product.region,
      providerMarketId: product.marketId,
      providerSellerId: product.sellerId,
      providerVariantId: product.variant?.variantId ?? null,
      catalogueManufacturer: component.manufacturer,
      catalogueModel: component.model,
      catalogueCategory: component.category,
      catalogueManufacturerPartNumber: null,
      catalogueGtin: null,
      catalogueRegion: null,
      manufacturer: "unknown",
      manufacturerPartNumber: "unknown",
      gtin: "unknown",
      modelNumber: "unknown",
      category: "unknown",
      region: "unknown",
      titleSimilarity: 0,
    },
    reasons: [
      "Synthetic conflicting mapping fixture; never a real mapping.",
      "The same external product id cannot map to two components.",
    ],
    provenance: {
      ...target.provenance,
      origin: "manual-review",
      providerProductFingerprint: computeProviderProductFingerprint(product),
    },
  };
}

export const syntheticConflictingMappingDataset = {
  schemaVersion: 1,
  products: [syntheticProviderProducts[0]!],
  mappings: [
    acfMapping,
    syntheticConflictingMapping(
      syntheticProviderProducts[0]!,
      componentById("cooler-arctic-liquid-freezer-iii-280")!,
    ),
  ],
};
