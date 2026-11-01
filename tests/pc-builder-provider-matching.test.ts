import { describe, expect, it } from "vitest";
import { catalogue, componentById } from "../src/lib/pc-builder/catalogue";
import { identifierRegistry } from "../src/lib/pc-builder/catalogue/identifiers";
import {
  matchProviderProduct,
  type ProviderProduct,
} from "../src/lib/pc-builder/provider-mapping";
import {
  SYNTHETIC_AUDIT_NOW,
  SYNTHETIC_GTIN_CASE,
  SYNTHETIC_MATCHED_AT,
  SYNTHETIC_MPN_COOLER,
  syntheticProviderProducts,
} from "../src/dev/pc-builder/provider-mapping-fixtures";

function clone(
  product: ProviderProduct,
  overrides: Partial<ProviderProduct> = {},
): ProviderProduct {
  return { ...product, ...overrides };
}

function match(product: ProviderProduct) {
  const result = matchProviderProduct(product, catalogue, {
    now: SYNTHETIC_MATCHED_AT,
    identifierRegistry,
  });
  if (!result.ok) {
    throw new Error(
      `Fixture match failed: ${result.issues
        .map((entry) => entry.message)
        .join("; ")}`,
    );
  }
  return result.value;
}

describe("deterministic provider product matching", () => {
  it("creates a candidate, not a verified mapping, for exact MPN evidence", () => {
    const result = match(syntheticProviderProducts[0]!);
    expect(result.outcome).toBe("candidate");
    expect(result.matchStatus).toBe("verified");
    expect(result.method).toBe("exact-mpn");
    expect(result.confidence).toBe(100);
    expect(result.componentId).toBe("cooler-arctic-freezer-36");
    expect(result.mapping).not.toBeNull();
    expect(result.mapping?.status).toBe("candidate");
    expect(result.mapping?.review.status).toBe("not-reviewed");
    expect(result.mapping?.evidence.manufacturerPartNumber).toBe("match");
    expect(result.mapping?.evidence.manufacturer).toBe("match");
  });

  it("creates a candidate for exact GTIN with manufacturer and category", () => {
    const result = match(syntheticProviderProducts[1]!);
    expect(result.outcome).toBe("candidate");
    expect(result.method).toBe("exact-gtin");
    expect(result.confidence).toBe(97);
    expect(result.componentId).toBe("case-nzxt-h7-flow");
    expect(result.mapping?.status).toBe("candidate");
    expect(result.mapping?.evidence.gtin).toBe("match");
  });

  it("keeps exact model plus manufacturer as needs-review / probable", () => {
    const result = match(syntheticProviderProducts[2]!);
    expect(result.outcome).toBe("needs-review");
    expect(result.matchStatus).toBe("probable");
    expect(result.method).toBe("exact-model");
    expect(result.confidence).toBe(85);
    expect(result.componentId).toBe("cpu-amd-ryzen-7-7800x3d");
    expect(result.mapping?.status).toBe("needs-review");
    expect(result.mapping?.evidence.modelNumber).toBe("match");
  });

  it("treats title-only evidence as unverified and never maps it", () => {
    const result = match(syntheticProviderProducts[3]!);
    expect(result.outcome).toBe("unverified");
    expect(result.matchStatus).toBe("unverified");
    expect(result.componentId).toBeNull();
    expect(result.mapping).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.titleSimilarity).toBeGreaterThan(0);
    expect(result.reasons.join(" ")).toContain("never establishes a mapping");
  });

  it("rejects a wrong manufacturer instead of falling through", () => {
    const result = match(syntheticProviderProducts[4]!);
    expect(result.outcome).toBe("rejected");
    expect(result.matchStatus).toBe("rejected");
    expect(result.componentId).toBe("cpu-amd-ryzen-7-7800x3d");
    expect(result.mapping?.status).toBe("rejected");
    expect(result.mapping?.confidence).toBe(0);
    expect(result.mapping?.evidence.manufacturer).toBe("mismatch");
    expect(result.mapping?.evidence.manufacturerPartNumber).toBe("match");
  });

  it("rejects a regional mismatch", () => {
    const result = match(syntheticProviderProducts[5]!);
    expect(result.outcome).toBe("rejected");
    expect(result.componentId).toBe("psu-corsair-cv650");
    expect(result.mapping?.status).toBe("rejected");
    expect(result.mapping?.evidence.region).toBe("mismatch");
    expect(result.reasons.join(" ")).toContain("regional SKU");
  });

  it("never selects the first of multiple candidate components", () => {
    const base = componentById("cpu-amd-ryzen-7-7800x3d");
    if (!base) throw new Error("Missing base component");
    const componentA = {
      ...base,
      id: "cpu-synthetic-duplicate-model-a",
      model: "SYNTH-DUP-MODEL",
    };
    const componentB = {
      ...base,
      id: "cpu-synthetic-duplicate-model-b",
      model: "SYNTH-DUP-MODEL",
    };
    const product = syntheticProviderProducts[2]!;
    const ambiguousProduct = clone(product, {
      identifiers: {
        ...product.identifiers,
        modelNumber: "SYNTH-DUP-MODEL",
      },
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        modelNumber: "SYNTH-DUP-MODEL",
      },
    });

    const result = matchProviderProduct(
      ambiguousProduct,
      [componentA, componentB],
      { now: SYNTHETIC_MATCHED_AT },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.outcome).toBe("needs-review");
    expect(result.value.componentId).toBeNull();
    expect(result.value.mapping).toBeNull();
    expect(result.value.candidateComponentIds).toEqual([
      "cpu-synthetic-duplicate-model-a",
      "cpu-synthetic-duplicate-model-b",
    ]);
    expect(result.value.reasons.join(" ")).toContain(
      "never resolved by selecting the first candidate",
    );
  });

  it("rejects conflicting MPN and GTIN evidence", () => {
    const product = syntheticProviderProducts[0]!;
    const conflictingProduct = clone(product, {
      identifiers: {
        ...product.identifiers,
        gtin: "4895213701389",
      },
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        gtin: "4895213701389",
      },
      category: null,
    });

    const result = match(conflictingProduct);
    expect(result.outcome).toBe("rejected");
    expect(result.componentId).toBeNull();
    expect(result.mapping).toBeNull();
    expect(result.candidateComponentIds).toEqual([
      "case-fan-arctic-p12-pwm",
      "cooler-arctic-freezer-36",
    ]);
    expect(result.reasons.join(" ")).toContain(
      "different catalogue components",
    );
  });

  it("rejects a selected component whose GTIN disagrees with a valid provider GTIN", () => {
    const product = syntheticProviderProducts[0]!;
    const disagreeingProduct = clone(product, {
      identifiers: {
        ...product.identifiers,
        gtin: "4006381333931",
      },
      normalizedIdentifiers: {
        ...product.normalizedIdentifiers,
        gtin: "4006381333931",
      },
    });

    const result = match(disagreeingProduct);
    expect(result.outcome).toBe("rejected");
    expect(result.componentId).toBe("cooler-arctic-freezer-36");
    expect(result.mapping?.status).toBe("rejected");
    expect(result.reasons.join(" ")).toContain("GTIN disagrees");
  });

  it("withholds confidence when the manufacturer is unknown", () => {
    const product = syntheticProviderProducts[0]!;
    const unknownManufacturer = clone(product, { manufacturer: null });
    const result = match(unknownManufacturer);
    expect(result.outcome).toBe("needs-review");
    expect(result.matchStatus).toBe("unverified");
    expect(result.confidence).toBe(0);
    expect(result.componentId).toBe("cooler-arctic-freezer-36");
    expect(result.mapping?.status).toBe("needs-review");
    expect(result.mapping?.evidence.manufacturer).toBe("unknown");
  });

  it("allows exact MPN evidence when the provider category is unknown", () => {
    const product = syntheticProviderProducts[0]!;
    const result = match(clone(product, { category: null }));
    expect(result.outcome).toBe("candidate");
    expect(result.componentId).toBe("cooler-arctic-freezer-36");
    expect(result.confidence).toBe(100);
  });

  it("treats missing identifiers as unverified and unmapped", () => {
    const result = match(syntheticProviderProducts[6]!);
    expect(result.outcome).toBe("unverified");
    expect(result.mapping).toBeNull();
    expect(result.reasons.join(" ")).toContain("No manufacturer part number");
  });

  it("preserves the provider variant in the mapping", () => {
    const result = match(syntheticProviderProducts[10]!);
    expect(result.outcome).toBe("candidate");
    expect(result.mapping?.variantId).toBe("us-standard");
    expect(result.mapping?.evidence.providerVariantId).toBe("us-standard");
    expect(result.mapping?.region).toBe("US");
    expect(result.mapping?.reasons.join(" ")).toContain("variant us-standard");
  });

  it("keeps a discontinued catalogue target as a non-eligible candidate", () => {
    const result = match(syntheticProviderProducts[9]!);
    expect(result.outcome).toBe("candidate");
    expect(result.componentId).toBe("cpu-intel-core-i7-13700k");
    expect(result.mapping?.status).toBe("candidate");
    expect(result.mapping?.reasons.join(" ")).toContain(
      "not eligible for pricing ingestion",
    );
  });

  it("does not create a new mapping for a superseded provider record", () => {
    const result = match(syntheticProviderProducts[7]!);
    expect(result.outcome).toBe("needs-review");
    expect(result.componentId).toBeNull();
    expect(result.mapping).toBeNull();
    expect(result.candidateComponentIds).toEqual(["cpu-amd-ryzen-7-7800x3d"]);
    expect(result.reasons.join(" ")).toContain("superseded");
  });

  it("retains identity evidence for a discontinued provider record but marks it", () => {
    const result = match(syntheticProviderProducts[11]!);
    expect(result.outcome).toBe("candidate");
    expect(result.mapping?.status).toBe("candidate");
    expect(result.mapping?.reasons.join(" ")).toContain(
      "Provider product record is discontinued",
    );
  });

  it("uses the exact GTIN fixture constant for the case component", () => {
    expect(SYNTHETIC_GTIN_CASE).toBe("5056547205502");
    expect(SYNTHETIC_MPN_COOLER).toBe("ACFRE00123A");
    const result = matchProviderProduct(
      syntheticProviderProducts[1]!,
      catalogue,
      {
        now: SYNTHETIC_AUDIT_NOW,
        identifierRegistry,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mapping?.evidence.catalogueGtin).toBe(
        SYNTHETIC_GTIN_CASE,
      );
    }
  });
});
