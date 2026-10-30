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
