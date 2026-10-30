import { describe, expect, it } from "vitest";
import { catalogue } from "../src/lib/pc-builder/catalogue";
import {
  buildCatalogueReport,
  formatCatalogueReport,
} from "../src/lib/pc-builder/catalogue-report";
import { makeCpu, makeGpu, makeMotherboard } from "./pc-builder-fixtures";

describe("buildCatalogueReport", () => {
  const report = buildCatalogueReport(catalogue);

  it("reports a valid, fully attributed catalogue", () => {
    expect(report.ok).toBe(true);
    expect(report.invalid).toEqual([]);
    expect(report.duplicateIds).toEqual([]);
    expect(report.missingProvenance).toEqual([]);
    expect(report.unverified).toEqual([]);
  });

  it("counts every record and category", () => {
    expect(report.total).toBe(catalogue.length);
    const sums = report.byCategory.reduce((sum, entry) => sum + entry.total, 0);
    expect(sums).toBe(report.total);
    for (const entry of report.byCategory) {
      expect(entry.total).toBeGreaterThan(0);
    }
    const lifecycleSum = Object.values(report.lifecycle).reduce(
      (sum, count) => sum + count,
      0,
    );
    expect(lifecycleSum).toBe(report.total);
  });

  it("orders categories and critical-unknown ids deterministically", () => {
    expect(report.byCategory.map((entry) => entry.category)).toEqual([
      "cpu",
      "gpu",
      "motherboard",
      "ram",
      "cooler",
      "storage",
      "psu",
      "case",
      "case-fan",
    ]);
    const ids = report.criticalUnknown.map((entry) => entry.id);
    expect([...ids].sort((a, b) => a.localeCompare(b, "en"))).toEqual(ids);
  });

  it("reports critical unknown specifications without failing", () => {
    const ultra = report.criticalUnknown.find(
      (entry) => entry.id === "cpu-intel-core-ultra-7-265k",
    );
    expect(ultra?.fields).toContain("maxMemoryGB");
    expect(report.ok).toBe(true);
  });

  it("is deterministic across runs", () => {
    const again = buildCatalogueReport(catalogue);
    expect(formatCatalogueReport(again)).toBe(formatCatalogueReport(report));
    expect(again).toEqual(report);
  });

  it("detects duplicate ids and missing provenance", () => {
    const first = makeCpu({}, "cpu-dup");
    const second = { ...makeCpu({}, "cpu-dup") } as unknown as Record<
      string,
      unknown
    >;
    delete second.provenance;
    const bad = buildCatalogueReport([first, second]);
    expect(bad.ok).toBe(false);
    expect(bad.duplicateIds).toContain("cpu-dup");
    expect(bad.missingProvenance).toContain("cpu-dup");
    expect(bad.invalid.length).toBeGreaterThan(0);
  });

  it("flags invalid records and keeps totals honest", () => {
    const valid = makeGpu();
    const invalid = {
      ...makeMotherboard(),
      category: "motherboard",
    } as unknown as Record<string, unknown>;
    delete (invalid as { specs?: unknown }).specs;
    const bad = buildCatalogueReport([valid, invalid]);
    expect(bad.ok).toBe(false);
    expect(bad.invalid.length).toBeGreaterThan(0);
    expect(bad.total).toBe(2);
  });

  it("reports lifecycle distribution and unverified records", () => {
    const unverified = { ...makeCpu(), availability: "unverified" as const };
    const unknownAvailability = {
      ...makeGpu(),
      availability: "unknown" as const,
    };
    const sample = buildCatalogueReport([unverified, unknownAvailability]);
    expect(sample.lifecycle.unverified).toBe(1);
    expect(sample.lifecycle.unknown).toBe(1);
    expect(sample.unverified).toContain(unverified.id);
  });
});

describe("formatCatalogueReport", () => {
  it("prints totals, category rows, unknowns and a status line", () => {
    const text = formatCatalogueReport(buildCatalogueReport(catalogue));
    expect(text).toContain("PC Builder catalogue report");
    expect(text).toContain(`Total: ${catalogue.length} components`);
    expect(text).toContain("cpu:");
    expect(text).toContain("Critical unknown specifications:");
    expect(text).toContain("Duplicate ids: 0");
    expect(text).toContain("Status: OK");
  });

  it("prints FAILED and errors when the catalogue is broken", () => {
    const broken = { ...makeCpu(), category: "gpu" } as unknown as Record<
      string,
      unknown
    >;
    const text = formatCatalogueReport(buildCatalogueReport([broken]));
    expect(text).toContain("Status: FAILED");
    expect(text).toContain("Invalid records:");
  });
});
