/*
 * Explicit product matching between commercial listings and catalogue
 * components (M10.7).
 *
 * Verified matches require exact, manufacturer-scoped evidence:
 *   - exact manufacturer part number; or
 *   - exact GTIN with a category and manufacturer match.
 *
 * Exact model number plus manufacturer is only Probable until a separate
 * verification source exists. Title similarity never establishes or promotes
 * a match; it is retained only as diagnostic evidence.
 *
 * Regional identities are never merged when both sides declare different
 * regions. GPU board-partner, RAM kit and storage capacity differences stay
 * separate because matching never falls back to product-name equality.
 */

import {
  componentCategories,
  type Component,
  type ComponentCategory,
} from "../types";
import {
  failure,
  isStableId,
  issue,
  normalizeKey,
  success,
  validateHttpsUrl,
  validateOptionalText,
  validateText,
} from "./validation";
import { normalizeCountryCode } from "./regions";
import type {
  CatalogueProductIdentity,
  PricingIssue,
  PricingResult,
  ProductMatch,
  ProductMatchEvidence,
} from "./types";

const GTIN_LENGTHS = new Set([8, 12, 13, 14]);

/**
 * Canonical confidence values for commercial product matching. These are
 * exported so later mapping layers can preserve the exact M10.7 semantics
 * instead of re-declaring the numbers.
 */
export const PRODUCT_MATCH_CONFIDENCE = {
  exactManufacturerPartNumber: 100,
  exactGtin: 97,
  gtinManufacturerMismatch: 55,
  exactModelNumber: 85,
  unverified: 0,
} as const;

export function normalizePartNumber(value: string): string {
  return value.normalize("NFKC").trim().toUpperCase().replace(/\s+/g, " ");
}

export function normalizeModelNumber(value: string): string {
  return value.normalize("NFKC").trim().toUpperCase().replace(/\s+/g, " ");
}

export function normalizeGtin(value: unknown): PricingResult<string | null> {
  if (value === null || value === undefined || value === "") {
    return success(null);
  }
  if (typeof value !== "string") {
    return failure([issue("gtin", "invalid-type", "GTIN must be a string.")]);
  }
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(digits) || !GTIN_LENGTHS.has(digits.length)) {
    return failure([
      issue(
        "gtin",
        "invalid-value",
        "Expected a GTIN-8, GTIN-12, GTIN-13 or GTIN-14.",
      ),
    ]);
  }

  const values = [...digits].map(Number);
  const check = values.pop();
  let sum = 0;
  let weight = 3;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    sum += values[index] * weight;
    weight = weight === 3 ? 1 : 3;
  }
  const expected = (10 - (sum % 10)) % 10;
  if (check !== expected) {
    return failure([
      issue("gtin", "invalid-value", "GTIN check digit is invalid."),
    ]);
  }
  return success(digits);
}

/** Diagnostic title similarity only; never used to confirm a match. */
export function titleSimilarity(left: string, right: string): number {
  const tokenize = (value: string) =>
    new Set(
      normalizeKey(value)
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1),
    );
  const a = tokenize(left);
  const b = tokenize(right);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100) / 100;
}

export function catalogueIdentity(
  component: Component,
): CatalogueProductIdentity {
  return {
    componentId: component.id,
    category: component.category,
    manufacturer: component.manufacturer,
    name: component.name,
    model: component.model,
    // The existing catalogue model is not asserted to be an MPN or GTIN.
    manufacturerPartNumber: null,
    gtin: null,
    region: null,
  };
}

export function createCatalogueIdentities(
  components: readonly Component[],
): CatalogueProductIdentity[] {
  return components.map(catalogueIdentity);
}

function emptyEvidence(title: number): ProductMatchEvidence {
  return {
    manufacturer: false,
    manufacturerPartNumber: false,
    gtin: false,
    modelNumber: false,
    titleSimilarity: title,
  };
}

function rejected(title: number, reasons: readonly string[]): ProductMatch {
  return {
    status: "rejected",
    componentId: null,
    confidence: 0,
    reasons,
    evidence: emptyEvidence(title),
  };
}

function regionConflict(
  identity: CatalogueProductIdentity,
  providerRegion: string | null,
): boolean {
  return (
    identity.region !== null &&
    providerRegion !== null &&
    identity.region !== providerRegion
  );
}

function chooseSingle(
  matches: readonly CatalogueProductIdentity[],
): CatalogueProductIdentity | null {
  return matches.length === 1 ? (matches[0] ?? null) : null;
}

export function matchProduct(
  value: unknown,
  catalogue: readonly CatalogueProductIdentity[],
): PricingResult<ProductMatch> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return failure([
      issue(
        "providerProduct",
        "invalid-type",
        "Provider product must be an object.",
      ),
    ]);
  }
  const record = value as Record<string, unknown>;
  const issues: PricingIssue[] = [];

  const providerProductId = record.providerProductId;
  if (!isStableId(providerProductId)) {
    issues.push(
      issue(
        "providerProduct.providerProductId",
        "invalid-id",
        "Expected a stable provider product id.",
      ),
    );
  }

  const title = validateText(record.title, "providerProduct.title", 200);
  if (!title.ok) issues.push(...title.issues);

  const manufacturer = validateText(
    record.manufacturer,
    "providerProduct.manufacturer",
    120,
  );
  if (!manufacturer.ok) issues.push(...manufacturer.issues);

  const mpn = validateOptionalText(
    record.manufacturerPartNumber,
    "providerProduct.manufacturerPartNumber",
    120,
  );
  if (!mpn.ok) issues.push(...mpn.issues);

  const model = validateOptionalText(
    record.modelNumber,
    "providerProduct.modelNumber",
    120,
  );
  if (!model.ok) issues.push(...model.issues);

  const gtin = normalizeGtin(record.gtin);
  if (!gtin.ok) issues.push(...gtin.issues);

  let category: ComponentCategory | null = null;
  if (record.category !== null && record.category !== undefined) {
    if (
      typeof record.category !== "string" ||
      !(componentCategories as readonly string[]).includes(record.category)
    ) {
      issues.push(
        issue(
          "providerProduct.category",
          "invalid-value",
          "Unknown component category.",
        ),
      );
    } else {
      category = record.category as ComponentCategory;
    }
  }

  const url = validateHttpsUrl(record.productUrl, "providerProduct.productUrl");
  if (!url.ok) issues.push(...url.issues);

  let region: string | null = null;
  if (record.region !== null && record.region !== undefined) {
    region = normalizeCountryCode(record.region);
    if (region === null) {
      issues.push(
        issue(
          "providerProduct.region",
          "invalid-country",
          "Expected an ISO 3166-1 alpha-2 country code or null.",
        ),
      );
    }
  }

  if (issues.length > 0) return failure(issues);
  if (!title.ok || !manufacturer.ok || !mpn.ok || !model.ok || !gtin.ok) {
    return failure([
      issue("providerProduct", "invalid-value", "Product identity is invalid."),
    ]);
  }

  const candidatePool =
    category === null
      ? catalogue
      : catalogue.filter((identity) => identity.category === category);
  const bestTitle = candidatePool.reduce(
    (best, identity) =>
      Math.max(
        best,
        titleSimilarity(title.value, identity.name),
        titleSimilarity(
          title.value,
          `${identity.manufacturer} ${identity.name}`,
        ),
      ),
    0,
  );

  const normalizedManufacturer = normalizeKey(manufacturer.value);

  if (mpn.value !== null) {
    const normalizedMpn = normalizePartNumber(mpn.value);
    const matches = candidatePool.filter(
      (identity) =>
        identity.manufacturerPartNumber !== null &&
        normalizePartNumber(identity.manufacturerPartNumber) ===
          normalizedMpn &&
        normalizeKey(identity.manufacturer) === normalizedManufacturer,
    );
    if (matches.length > 0) {
      const single = chooseSingle(matches);
      if (single === null) {
        return failure([
          issue(
            "manufacturerPartNumber",
            "invalid-match",
            "Multiple catalogue identities share this manufacturer part number.",
          ),
        ]);
      }
      if (regionConflict(single, region)) {
        return success(
          rejected(bestTitle, [
            "The exact part number belongs to a different regional SKU.",
          ]),
        );
      }
      return success({
        status: "verified",
        componentId: single.componentId,
        confidence: PRODUCT_MATCH_CONFIDENCE.exactManufacturerPartNumber,
        reasons: ["Exact manufacturer part number and manufacturer match."],
        evidence: {
          ...emptyEvidence(bestTitle),
          manufacturer: true,
          manufacturerPartNumber: true,
        },
      });
    }
  }

  if (gtin.value !== null) {
    const matches = candidatePool.filter(
      (identity) => identity.gtin !== null && identity.gtin === gtin.value,
    );
    const single = chooseSingle(matches);
    if (single !== null) {
      if (regionConflict(single, region)) {
        return success(
          rejected(bestTitle, [
            "The exact GTIN belongs to a different regional SKU.",
          ]),
        );
      }
      const manufacturerMatch =
        normalizeKey(single.manufacturer) === normalizedManufacturer;
      return success({
        status: manufacturerMatch ? "verified" : "probable",
        componentId: single.componentId,
        confidence: manufacturerMatch
          ? PRODUCT_MATCH_CONFIDENCE.exactGtin
          : PRODUCT_MATCH_CONFIDENCE.gtinManufacturerMismatch,
        reasons: manufacturerMatch
          ? ["Exact GTIN, category and manufacturer match."]
          : ["Exact GTIN and category match, but the manufacturer differs."],
        evidence: {
          ...emptyEvidence(bestTitle),
          manufacturer: manufacturerMatch,
          gtin: true,
        },
      });
    }
  }

  if (mpn.value !== null || model.value !== null) {
    const identifier =
      model.value !== null
        ? normalizeModelNumber(model.value)
        : normalizePartNumber(mpn.value ?? "");
    const matches = candidatePool.filter(
      (identity) =>
        normalizeModelNumber(identity.model) === identifier &&
        normalizeKey(identity.manufacturer) === normalizedManufacturer,
    );
    const single = chooseSingle(matches);
    if (single !== null) {
      if (regionConflict(single, region)) {
        return success(
          rejected(bestTitle, [
            "The exact model belongs to a different regional SKU.",
          ]),
        );
      }
      return success({
        status: "probable",
        componentId: single.componentId,
        confidence: PRODUCT_MATCH_CONFIDENCE.exactModelNumber,
        reasons: [
          "Exact model number and manufacturer match; separate verification is still required.",
        ],
        evidence: {
          ...emptyEvidence(bestTitle),
          manufacturer: true,
          modelNumber: true,
        },
      });
    }
  }

  const sameManufacturerCandidate = candidatePool.some(
    (identity) =>
      normalizeKey(identity.manufacturer) === normalizedManufacturer,
  );
  if (!sameManufacturerCandidate) {
    return success(
      rejected(bestTitle, [
        "No catalogue candidate has the same manufacturer and category.",
      ]),
    );
  }

  return success({
    status: "unverified",
    componentId: null,
    confidence: PRODUCT_MATCH_CONFIDENCE.unverified,
    reasons: [
      "No exact manufacturer part number, GTIN or model evidence.",
      "Title similarity is diagnostic only and never establishes a match.",
    ],
    evidence: emptyEvidence(bestTitle),
  });
}
