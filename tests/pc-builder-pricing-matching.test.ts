import { describe, expect, it } from "vitest";
import {
  matchProduct,
  normalizeGtin,
  titleSimilarity,
} from "../src/lib/pc-builder/pricing";
import {
  SYNTHETIC_CPU_ID,
  SYNTHETIC_GTIN,
  identity,
} from "./pc-builder-pricing-fixtures";

function providerProduct(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    providerProductId: "product-1",
    title: "AMD Ryzen 7 7800X3D",
    manufacturer: "AMD",
    manufacturerPartNumber: null,
    modelNumber: null,
    gtin: null,
    category: "cpu",
    productUrl: "https://retailer.example/products/1",
    region: null,
    ...overrides,
  };
}

describe("GTIN and title evidence", () => {
  it("validates GTIN check digits", () => {
    const valid = normalizeGtin(SYNTHETIC_GTIN);
    expect(valid).toEqual({ ok: true, value: SYNTHETIC_GTIN });
    expect(normalizeGtin("4006381333932").ok).toBe(false);
    expect(normalizeGtin("1234").ok).toBe(false);
    expect(normalizeGtin("not-digits").ok).toBe(false);
    expect(normalizeGtin(null)).toEqual({ ok: true, value: null });
  });

  it("computes title similarity as diagnostic evidence only", () => {
    expect(titleSimilarity("AMD Ryzen 7 7800X3D", "AMD Ryzen 7 7800X3D")).toBe(
      1,
    );
    expect(
      titleSimilarity("AMD Ryzen 7 7800X3D", "AMD Ryzen 7 7800X3D Processor"),
    ).toBeGreaterThan(0.5);
    expect(titleSimilarity("AMD Ryzen 7", "Intel Core i5")).toBe(0);
  });
});

describe("product matching", () => {
  it("verifies an exact manufacturer part number and manufacturer", () => {
    const cpu = identity(SYNTHETIC_CPU_ID);
    const result = matchProduct(
      providerProduct({
        manufacturerPartNumber: cpu.manufacturerPartNumber,
      }),
      [cpu],
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("verified");
    expect(result.value.componentId).toBe(SYNTHETIC_CPU_ID);
    expect(result.value.confidence).toBe(100);
    expect(result.value.evidence.manufacturerPartNumber).toBe(true);
  });

  it("verifies an exact GTIN with category and manufacturer evidence", () => {
    const cpu = identity(SYNTHETIC_CPU_ID, {
      manufacturerPartNumber: null,
      gtin: SYNTHETIC_GTIN,
    });
    const result = matchProduct(providerProduct({ gtin: SYNTHETIC_GTIN }), [
      cpu,
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("verified");
    expect(result.value.componentId).toBe(SYNTHETIC_CPU_ID);
    expect(result.value.confidence).toBe(97);
  });

  it("keeps a GTIN match probable when the manufacturer differs", () => {
    const cpu = identity(SYNTHETIC_CPU_ID, {
      manufacturerPartNumber: null,
      gtin: SYNTHETIC_GTIN,
    });
    const result = matchProduct(
      providerProduct({ gtin: SYNTHETIC_GTIN, manufacturer: "Intel" }),
      [cpu],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("probable");
    expect(result.value.componentId).toBe(SYNTHETIC_CPU_ID);
    expect(result.value.evidence.manufacturer).toBe(false);
  });

  it("treats exact model plus manufacturer as probable, not verified", () => {
    const cpu = identity(SYNTHETIC_CPU_ID, {
      manufacturerPartNumber: null,
    });
    const result = matchProduct(providerProduct({ modelNumber: cpu.model }), [
      cpu,
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("probable");
    expect(result.value.componentId).toBe(SYNTHETIC_CPU_ID);
    expect(result.value.confidence).toBe(85);
  });

  it("rejects a manufacturer mismatch instead of merging similar names", () => {
    const cpu = identity(SYNTHETIC_CPU_ID);
    const result = matchProduct(
      providerProduct({
        manufacturer: "Intel",
        manufacturerPartNumber: cpu.manufacturerPartNumber,
        modelNumber: cpu.model,
      }),
      [cpu],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("rejected");
    expect(result.value.componentId).toBeNull();
  });

  it("never verifies on title similarity alone", () => {
    const cpu = identity(SYNTHETIC_CPU_ID);
    const result = matchProduct(
      providerProduct({ title: "AMD Ryzen 7 7800X3D Processor" }),
      [cpu],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("unverified");
    expect(result.value.componentId).toBeNull();
    expect(result.value.evidence.titleSimilarity).toBeGreaterThan(0.5);
  });

  it("keeps GPU board-partner models distinct", () => {
    const rtx4070 = identity("gpu-nvidia-geforce-rtx-4070-fe", {
      manufacturerPartNumber: null,
    });
    const rtx4070Super = identity("gpu-nvidia-geforce-rtx-4070-super-fe", {
      manufacturerPartNumber: null,
    });

    const titleOnly = matchProduct(
      providerProduct({
        title: "NVIDIA GeForce RTX 4070 SUPER Founders Edition",
        manufacturer: "NVIDIA",
        category: "gpu",
      }),
      [rtx4070, rtx4070Super],
    );
    expect(titleOnly.ok).toBe(true);
    if (titleOnly.ok) {
      expect(titleOnly.value.status).toBe("unverified");
      expect(titleOnly.value.componentId).toBeNull();
    }

    const exactModel = matchProduct(
      providerProduct({
        title: "NVIDIA GeForce RTX 4070 SUPER Founders Edition",
        manufacturer: "NVIDIA",
        category: "gpu",
        modelNumber: rtx4070Super.model,
      }),
      [rtx4070, rtx4070Super],
    );
    expect(exactModel.ok).toBe(true);
    if (exactModel.ok) {
      expect(exactModel.value.status).toBe("probable");
      expect(exactModel.value.componentId).toBe(rtx4070Super.componentId);
      expect(exactModel.value.componentId).not.toBe(rtx4070.componentId);
    }
  });

  it("keeps RAM kits with different capacities/speeds distinct", () => {
    const kit32 = identity("ram-corsair-vengeance-32gb-ddr5-6000", {
      manufacturerPartNumber: null,
    });
    const kit64 = identity("ram-corsair-vengeance-64gb-ddr5-5600", {
      manufacturerPartNumber: null,
    });

    const titleOnly = matchProduct(
      providerProduct({
        title: "Corsair Vengeance 32GB (2 x 16GB) DDR5-6000 CL30",
        category: "ram",
        manufacturer: "Corsair",
      }),
      [kit32, kit64],
    );
    expect(titleOnly.ok).toBe(true);
    if (titleOnly.ok) {
      expect(titleOnly.value.status).toBe("unverified");
      expect(titleOnly.value.componentId).toBeNull();
    }

    const exactModel = matchProduct(
      providerProduct({
        title: "Corsair Vengeance 64GB (2 x 32GB) DDR5-5600 CL40",
        category: "ram",
        manufacturer: "Corsair",
        modelNumber: kit64.model,
      }),
      [kit32, kit64],
    );
    expect(exactModel.ok).toBe(true);
    if (exactModel.ok) {
      expect(exactModel.value.status).toBe("probable");
      expect(exactModel.value.componentId).toBe(kit64.componentId);
    }
  });

  it("keeps storage capacity variants distinct", () => {
    const oneTb = identity("storage-samsung-990-pro-1tb", {
      manufacturerPartNumber: null,
    });
    const result = matchProduct(
      providerProduct({
        title: "Samsung 990 PRO 2TB",
        category: "storage",
        manufacturer: "Samsung",
      }),
      [oneTb],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("unverified");
      expect(result.value.componentId).toBeNull();
    }
  });

  it("rejects a regional SKU mismatch even with an exact identifier", () => {
    const cpu = identity(SYNTHETIC_CPU_ID, { region: "IN" });
    const result = matchProduct(
      providerProduct({
        manufacturerPartNumber: cpu.manufacturerPartNumber,
        region: "US",
      }),
      [cpu],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("rejected");
      expect(result.value.componentId).toBeNull();
    }
  });

  it("rejects a category mismatch", () => {
    const cpu = identity(SYNTHETIC_CPU_ID);
    const result = matchProduct(
      providerProduct({
        category: "gpu",
        manufacturerPartNumber: cpu.manufacturerPartNumber,
        modelNumber: cpu.model,
      }),
      [cpu],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("rejected");
      expect(result.value.componentId).toBeNull();
    }
  });

  it("fails on ambiguous exact evidence", () => {
    const first = identity(SYNTHETIC_CPU_ID, { region: null });
    const second = identity(SYNTHETIC_CPU_ID, {
      componentId: "cpu-amd-ryzen-7-7700",
      region: null,
    });
    const result = matchProduct(
      providerProduct({
        manufacturerPartNumber: first.manufacturerPartNumber,
      }),
      [first, second],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues[0]?.code).toBe("invalid-match");
  });

  it("rejects malformed provider product input", () => {
    const cases: Array<Record<string, unknown>> = [
      providerProduct({ title: "" }),
      providerProduct({ manufacturer: "" }),
      providerProduct({ productUrl: "javascript:alert(1)" }),
      providerProduct({ productUrl: "http://retailer.example/product" }),
      providerProduct({ gtin: "4006381333932" }),
      providerProduct({ region: "EU" }),
      providerProduct({ category: "not-a-category" }),
      providerProduct({ providerProductId: "" }),
    ];
    for (const value of cases) {
      const result = matchProduct(value, [identity()]);
      expect(result.ok).toBe(false);
    }
  });
});
