import { describe, expect, it } from "vitest";
import {
  convertUnit,
  formatUnitValue,
  isBelowAbsoluteZero,
  unitSymbol,
  UNITS_BY_CATEGORY,
  DEFAULT_UNITS,
} from "../src/lib/unit-convert";

describe("length conversion", () => {
  it("converts between metric units", () => {
    expect(convertUnit(1, "length", "m", "cm")).toBe(100);
    expect(convertUnit(2.5, "length", "km", "m")).toBe(2500);
    expect(convertUnit(1500, "length", "mm", "m")).toBe(1.5);
  });

  it("uses exact international definitions", () => {
    expect(convertUnit(1, "length", "in", "cm")).toBe(2.54);
    expect(convertUnit(1, "length", "ft", "m")).toBeCloseTo(0.3048, 12);
    expect(convertUnit(1, "length", "mi", "m")).toBe(1609.344);
    expect(convertUnit(1, "length", "yd", "in")).toBe(36);
  });

  it("round-trips without drift", () => {
    const there = convertUnit(123.456, "length", "mi", "km");
    expect(there).not.toBeNull();
    expect(convertUnit(there as number, "length", "km", "mi")).toBeCloseTo(
      123.456,
      10,
    );
  });

  it("keeps negative values as entered (deltas)", () => {
    expect(convertUnit(-1, "length", "m", "cm")).toBe(-100);
  });

  it("rejects unknown units and non-finite values", () => {
    expect(convertUnit(1, "length", "m", "parsec")).toBeNull();
    expect(convertUnit(Number.NaN, "length", "m", "ft")).toBeNull();
    expect(
      convertUnit(Number.POSITIVE_INFINITY, "length", "m", "ft"),
    ).toBeNull();
  });

  it("rejects units from another category", () => {
    expect(convertUnit(1, "length", "m", "kg")).toBeNull();
    expect(convertUnit(1, "weight", "kg", "c")).toBeNull();
  });
});

describe("weight conversion", () => {
  it("converts between metric units", () => {
    expect(convertUnit(1, "weight", "kg", "g")).toBe(1000);
    expect(convertUnit(2500, "weight", "g", "kg")).toBe(2.5);
    expect(convertUnit(1, "weight", "t", "kg")).toBe(1000);
    expect(convertUnit(1, "weight", "g", "mg")).toBe(1000);
  });

  it("uses exact avoirdupois definitions", () => {
    expect(convertUnit(1, "weight", "lb", "kg")).toBe(0.45359237);
    expect(convertUnit(1, "weight", "oz", "g")).toBe(28.349523125);
    expect(convertUnit(1, "weight", "st", "lb")).toBeCloseTo(14, 12);
  });

  it("round-trips without drift", () => {
    const there = convertUnit(180, "weight", "lb", "kg");
    expect(there).not.toBeNull();
    expect(convertUnit(there as number, "weight", "kg", "lb")).toBeCloseTo(
      180,
      10,
    );
  });
});

describe("temperature conversion", () => {
  it("converts with the affine offset", () => {
    expect(convertUnit(0, "temperature", "c", "f")).toBe(32);
    expect(convertUnit(100, "temperature", "c", "f")).toBe(212);
    expect(convertUnit(-40, "temperature", "c", "f")).toBe(-40);
    expect(convertUnit(32, "temperature", "f", "c")).toBe(0);
    expect(convertUnit(212, "temperature", "f", "c")).toBe(100);
  });

  it("converts through kelvin", () => {
    expect(convertUnit(0, "temperature", "c", "k")).toBeCloseTo(273.15, 12);
    expect(convertUnit(273.15, "temperature", "k", "c")).toBeCloseTo(0, 12);
    expect(convertUnit(0, "temperature", "k", "f")).toBeCloseTo(-459.67, 12);
  });

  it("rejects values below absolute zero", () => {
    expect(convertUnit(-274, "temperature", "c", "f")).toBeNull();
    expect(convertUnit(-460, "temperature", "f", "c")).toBeNull();
    expect(convertUnit(-1, "temperature", "k", "c")).toBeNull();
  });

  it("accepts absolute zero exactly", () => {
    expect(convertUnit(-273.15, "temperature", "c", "k")).toBe(0);
    expect(convertUnit(0, "temperature", "k", "c")).toBeCloseTo(-273.15, 12);
    expect(convertUnit(-459.67, "temperature", "f", "k")).toBeCloseTo(0, 9);
  });

  it("flags below-zero input at the boundary", () => {
    expect(isBelowAbsoluteZero(-273.15, "c")).toBe(false);
    expect(isBelowAbsoluteZero(-273.16, "c")).toBe(true);
    expect(isBelowAbsoluteZero(0, "k")).toBe(false);
    expect(isBelowAbsoluteZero(Number.NaN, "c")).toBe(false);
  });
});

describe("unit metadata", () => {
  it("lists units in display order", () => {
    expect(UNITS_BY_CATEGORY.length).toEqual([
      "mm",
      "cm",
      "m",
      "km",
      "in",
      "ft",
      "yd",
      "mi",
    ]);
    expect(UNITS_BY_CATEGORY.weight).toContain("kg");
    expect(UNITS_BY_CATEGORY.temperature).toEqual(["c", "f", "k"]);
  });

  it("ships a sensible default pair per category", () => {
    expect(DEFAULT_UNITS.length).toEqual({ from: "m", to: "ft" });
    expect(DEFAULT_UNITS.weight).toEqual({ from: "kg", to: "lb" });
    expect(DEFAULT_UNITS.temperature).toEqual({ from: "c", to: "f" });
  });

  it("returns the symbol for a known unit and nothing otherwise", () => {
    expect(unitSymbol("length", "km")).toBe("km");
    expect(unitSymbol("weight", "lb")).toBe("lb");
    expect(unitSymbol("temperature", "f")).toBe("°F");
    expect(unitSymbol("length", "kg")).toBe("");
  });
});

describe("formatUnitValue", () => {
  it("keeps exact factors without floating-point tails", () => {
    expect(formatUnitValue(1.609344)).toBe("1.609344");
    expect(formatUnitValue(2.54)).toBe("2.54");
    expect(formatUnitValue(0.30480000000000007)).toBe("0.3048");
  });

  it("keeps small magnitudes readable", () => {
    expect(formatUnitValue(0.000001)).toBe("0.000001");
    expect(formatUnitValue(0.03937007874015748)).toBe("0.03937007874");
  });

  it("groups thousands", () => {
    expect(formatUnitValue(1609344)).toBe("1,609,344");
  });

  it("formats with the locale's number conventions", () => {
    expect(formatUnitValue(1.609344, "es-ES")).toBe("1,609344");
    expect(formatUnitValue(1609344, "es-ES")).toBe("1.609.344");
  });

  it("normalizes negative zero", () => {
    expect(formatUnitValue(-0)).toBe("0");
  });
});
