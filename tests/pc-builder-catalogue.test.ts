import { describe, expect, it } from "vitest";
import {
  catalogue,
  componentById,
  componentsByCategory,
} from "../src/lib/pc-builder/catalogue";
import { validateCatalogue } from "../src/lib/pc-builder/validate";
import {
  componentCategories,
  singleSlotCategories,
  multiSlotCategories,
} from "../src/lib/pc-builder/types";

describe("component catalogue", () => {
  it("passes catalogue-level runtime validation", () => {
    const result = validateCatalogue(catalogue);
    if (!result.ok) {
      // Surface all validation errors to make failures debuggable.
      expect.soft(result.errors).toEqual([]);
    }
    expect(result.ok).toBe(true);
  });

  it("has unique component ids", () => {
    const ids = catalogue.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every supported category with at least one record", () => {
    for (const category of componentCategories) {
      expect(
        componentsByCategory(category).length,
        `category "${category}" should have catalogue entries`,
      ).toBeGreaterThan(0);
    }
  });

  it("covers more than one manufacturer", () => {
    const manufacturers = new Set(catalogue.map((c) => c.manufacturer));
    expect(manufacturers.size).toBeGreaterThan(1);
  });

  it("includes cross-socket coverage (AMD and Intel)", () => {
    const sockets = new Set([
      ...componentsByCategory("cpu").map((c) =>
        c.category === "cpu" ? c.specs.socket : "",
      ),
    ]);
    expect(sockets.size).toBeGreaterThan(1);
  });

  it("gives every record source attribution and a verification timestamp", () => {
    for (const component of catalogue) {
      expect(component.source.name).not.toBe("");
      expect(component.source.url).toMatch(/^https:\/\//);
      expect(component.source.accessedAt).not.toBe("");
      expect(component.lastVerified).not.toBe("");
    }
  });

  it("contains no pricing or stock data", () => {
    const text = JSON.stringify(catalogue);
    expect(text).not.toMatch(/"price"/i);
    expect(text).not.toMatch(/"stock"/i);
    expect(text).not.toMatch(/"currency"/i);
  });

  it("uses stable slug-style ids prefixed by category", () => {
    for (const component of catalogue) {
      expect(component.id).toMatch(/^[a-z0-9-]+$/);
      expect(
        component.id.startsWith(
          `${component.category === "case-fan" ? "case-fan" : component.category}`,
        ),
      ).toBe(true);
    }
  });

  it("looks up components by id", () => {
    const first = catalogue[0];
    expect(componentById(first.id)).toEqual(first);
    expect(componentById("does-not-exist")).toBeUndefined();
  });

  it("meets the M10.3 expansion targets per category", () => {
    const minimums = {
      cpu: 15,
      gpu: 12,
      motherboard: 12,
      ram: 10,
      cooler: 8,
      storage: 8,
      psu: 8,
      case: 8,
      "case-fan": 5,
    } as const;
    for (const [category, minimum] of Object.entries(minimums)) {
      expect(
        componentsByCategory(category as keyof typeof minimums).length,
        `${category} should have at least ${minimum} records`,
      ).toBeGreaterThanOrEqual(minimum);
    }
    expect(catalogue.length).toBeGreaterThanOrEqual(90);
  });

  it("attributes every record to manufacturer-published evidence", () => {
    for (const component of catalogue) {
      expect(component.provenance).toBe("manufacturer-specification");
      expect(component.source.url).toMatch(/^https:\/\//);
      expect(component.source.url).not.toMatch(
        /amazon|newegg|ebay|aliexpress/i,
      );
    }
  });

  it("covers both AMD and Intel CPU platforms including LGA1851", () => {
    const sockets = new Set(
      componentsByCategory("cpu").map((component) =>
        component.category === "cpu" ? component.specs.socket : "",
      ),
    );
    for (const socket of ["AM4", "AM5", "LGA1700", "LGA1851"]) {
      expect(sockets).toContain(socket);
    }
  });

  it("covers NVIDIA and AMD GPUs with reference specification fields", () => {
    const gpus = componentsByCategory("gpu");
    const manufacturers = new Set(
      gpus.map((component) => component.manufacturer),
    );
    expect(manufacturers).toContain("NVIDIA");
    expect(manufacturers).toContain("AMD");
    expect(
      gpus.some(
        (component) =>
          component.category === "gpu" && component.specs.boardPartner === null,
      ),
    ).toBe(true);
    expect(
      gpus.every(
        (component) =>
          component.category !== "gpu" || component.specs.chipset !== "",
      ),
    ).toBe(true);
  });

  it("covers DDR4 and DDR5 memory kits", () => {
    const generations = new Set(
      componentsByCategory("ram").map((component) =>
        component.category === "ram" ? component.specs.generation : "",
      ),
    );
    expect(generations).toContain("DDR4");
    expect(generations).toContain("DDR5");
  });

  it("covers air and liquid coolers across 240/280/360 radiator sizes", () => {
    const coolers = componentsByCategory("cooler");
    const types = new Set(
      coolers.map((component) =>
        component.category === "cooler" ? component.specs.type : "",
      ),
    );
    expect(types).toContain("air");
    expect(types).toContain("aio-liquid");
    const radiators = new Set(
      coolers
        .map((component) =>
          component.category === "cooler"
            ? component.specs.radiatorSizeMm
            : null,
        )
        .filter((size): size is number => size !== null),
    );
    for (const size of [120, 240, 280, 360]) expect(radiators).toContain(size);
  });

  it("covers NVMe, SATA SSD and HDD storage", () => {
    const storage = componentsByCategory("storage");
    expect(
      new Set(
        storage.map((component) =>
          component.category === "storage" ? component.specs.interface : "",
        ),
      ),
    ).toEqual(new Set(["nvme", "sata"]));
    expect(
      storage.some(
        (component) =>
          component.category === "storage" &&
          component.specs.storageType === "hdd",
      ),
    ).toBe(true);
  });

  it("covers PSU tiers from 550 W to 1000 W", () => {
    const wattages = componentsByCategory("psu")
      .map((component) =>
        component.category === "psu" ? component.specs.wattage : 0,
      )
      .sort((a, b) => a - b);
    expect(wattages[0]).toBeLessThanOrEqual(550);
    expect(wattages[wattages.length - 1]).toBeGreaterThanOrEqual(1000);
    expect(wattages.length).toBeGreaterThanOrEqual(8);
  });

  it("covers ATX, Micro-ATX and Mini-ITX case support", () => {
    const supported = new Set(
      componentsByCategory("case").flatMap((component) =>
        component.category === "case"
          ? component.specs.supportedFormFactors
          : [],
      ),
    );
    for (const formFactor of ["ATX", "Micro-ATX", "Mini-ITX"]) {
      expect(supported).toContain(formFactor);
    }
  });

  it("covers full-tower, mid-tower, mini-tower and SFF case types", () => {
    const types = new Set(
      componentsByCategory("case").map((component) =>
        component.category === "case" ? component.specs.caseType : "",
      ),
    );
    for (const type of ["full-tower", "mid-tower", "mini-tower", "sff"]) {
      expect(types).toContain(type);
    }
  });

  it("uses valid lifecycle states and documents discontinued parts", () => {
    const allowed = new Set([
      "in-production",
      "discontinued",
      "end-of-life",
      "unverified",
      "unknown",
    ]);
    for (const component of catalogue) {
      expect(allowed.has(component.availability)).toBe(true);
    }
    expect(
      catalogue.some((component) => component.availability === "discontinued"),
    ).toBe(true);
  });

  it("partitions categories into single- and multi-slot without overlap", () => {
    expect([...singleSlotCategories, ...multiSlotCategories].sort()).toEqual(
      [...componentCategories].sort(),
    );
    const overlap = singleSlotCategories.filter((c) =>
      (multiSlotCategories as readonly string[]).includes(c),
    );
    expect(overlap).toEqual([]);
  });
});
