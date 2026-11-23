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
    expect(UNITS_BY_CATEGORY.area).toEqual([
      "cm2",
      "m2",
      "km2",
      "ft2",
      "yd2",
      "ac",
      "ha",
    ]);
    expect(UNITS_BY_CATEGORY.volume).toEqual([
      "ml",
      "l",
      "m3",
      "tsp",
      "tbsp",
      "floz",
      "cup",
      "pt",
      "qt",
      "gal",
    ]);
  });

  it("ships a sensible default pair per category", () => {
    expect(DEFAULT_UNITS.length).toEqual({ from: "m", to: "ft" });
    expect(DEFAULT_UNITS.weight).toEqual({ from: "kg", to: "lb" });
    expect(DEFAULT_UNITS.temperature).toEqual({ from: "c", to: "f" });
    expect(DEFAULT_UNITS.area).toEqual({ from: "m2", to: "ft2" });
    expect(DEFAULT_UNITS.volume).toEqual({ from: "l", to: "gal" });
  });

  it("returns the symbol for a known unit and nothing otherwise", () => {
    expect(unitSymbol("length", "km")).toBe("km");
    expect(unitSymbol("weight", "lb")).toBe("lb");
    expect(unitSymbol("temperature", "f")).toBe("°F");
    expect(unitSymbol("area", "m2")).toBe("m²");
    expect(unitSymbol("area", "ft2")).toBe("ft²");
    expect(unitSymbol("volume", "ml")).toBe("mL");
    expect(unitSymbol("volume", "gal")).toBe("US gal");
    expect(unitSymbol("volume", "tsp")).toBe("US tsp");
    expect(unitSymbol("length", "kg")).toBe("");
    expect(unitSymbol("area", "gal")).toBe("");
    expect(unitSymbol("volume", "m2")).toBe("");
  });
});

describe("area conversion", () => {
  it("converts between metric square units", () => {
    expect(convertUnit(1, "area", "cm2", "m2")).toBe(0.0001);
    expect(convertUnit(1, "area", "m2", "km2")).toBe(0.000001);
    expect(convertUnit(1, "area", "km2", "ha")).toBe(100);
    expect(convertUnit(2.5, "area", "ha", "m2")).toBe(25000);
  });

  it("uses the international square definitions", () => {
    expect(convertUnit(1, "area", "ft2", "m2")).toBe(0.09290304);
    expect(convertUnit(1, "area", "yd2", "m2")).toBe(0.83612736);
    expect(convertUnit(1, "area", "yd2", "ft2")).toBe(9);
    expect(convertUnit(1, "area", "m2", "ft2")).toBeCloseTo(
      10.763910416709722,
      12,
    );
  });

  it("converts land measures", () => {
    expect(convertUnit(1, "area", "ac", "m2")).toBe(4046.8564224);
    expect(convertUnit(1, "area", "ac", "ft2")).toBe(43560);
    expect(convertUnit(1, "area", "ha", "km2")).toBe(0.01);
    expect(convertUnit(1, "area", "ha", "ac")).toBeCloseTo(
      2.471053814671653,
      12,
    );
    expect(convertUnit(5, "area", "ac", "ha")).toBeCloseTo(2.0234282112, 12);
  });

  it("round-trips without drift", () => {
    const there = convertUnit(123.456, "area", "ac", "m2");
    expect(there).not.toBeNull();
    expect(convertUnit(there as number, "area", "m2", "ac")).toBeCloseTo(
      123.456,
      10,
    );
  });

  it("keeps negative values as deltas and converts zero", () => {
    expect(convertUnit(-5, "area", "m2", "ft2")).toBeCloseTo(
      -53.81955208354861,
      10,
    );
    expect(convertUnit(0, "area", "ha", "ac")).toBe(0);
  });
});

describe("volume conversion", () => {
  it("converts between metric volume units", () => {
    expect(convertUnit(1, "volume", "m3", "l")).toBe(1000);
    expect(convertUnit(1, "volume", "l", "ml")).toBeCloseTo(1000, 10);
    expect(convertUnit(1, "volume", "ml", "m3")).toBe(0.000001);
    expect(convertUnit(2.5, "volume", "l", "ml")).toBe(2500);
  });

  it("uses the US gallon as the US customary reference", () => {
    expect(convertUnit(1, "volume", "gal", "l")).toBe(3.785411784);
    expect(convertUnit(1, "volume", "qt", "l")).toBe(0.946352946);
    expect(convertUnit(1, "volume", "pt", "ml")).toBeCloseTo(473.176473, 9);
    expect(convertUnit(1, "volume", "floz", "ml")).toBeCloseTo(
      29.5735295625,
      9,
    );
    expect(convertUnit(1, "volume", "cup", "ml")).toBeCloseTo(236.5882365, 9);
  });

  it("keeps the US customary ratios", () => {
    expect(convertUnit(1, "volume", "gal", "floz")).toBe(128);
    expect(convertUnit(1, "volume", "gal", "cup")).toBe(16);
    expect(convertUnit(1, "volume", "gal", "pt")).toBe(8);
    expect(convertUnit(1, "volume", "gal", "qt")).toBe(4);
    expect(convertUnit(1, "volume", "gal", "tbsp")).toBe(256);
    expect(convertUnit(1, "volume", "gal", "tsp")).toBeCloseTo(768, 9);
    expect(convertUnit(1, "volume", "cup", "floz")).toBe(8);
  });

  it("converts litres to US gallons", () => {
    expect(convertUnit(1, "volume", "l", "gal")).toBeCloseTo(
      0.2641720523581484,
      12,
    );
  });

  it("round-trips without drift", () => {
    const there = convertUnit(123.456, "volume", "gal", "l");
    expect(there).not.toBeNull();
    expect(convertUnit(there as number, "volume", "l", "gal")).toBeCloseTo(
      123.456,
      10,
    );
  });

  it("keeps negative values as deltas and converts zero", () => {
    expect(convertUnit(-1, "volume", "l", "gal")).toBeCloseTo(
      -0.2641720523581484,
      12,
    );
    expect(convertUnit(0, "volume", "m3", "gal")).toBe(0);
  });
});

describe("area and volume validation", () => {
  it("rejects unknown units", () => {
    expect(convertUnit(1, "area", "m2", "parsec")).toBeNull();
    expect(convertUnit(1, "area", "parsec", "m2")).toBeNull();
    expect(convertUnit(1, "volume", "gal", "bushel")).toBeNull();
    expect(convertUnit(1, "volume", "bushel", "gal")).toBeNull();
  });

  it("rejects units from another category", () => {
    expect(convertUnit(1, "area", "m2", "kg")).toBeNull();
    expect(convertUnit(1, "area", "gal", "m2")).toBeNull();
    expect(convertUnit(1, "volume", "gal", "c")).toBeNull();
    expect(convertUnit(1, "volume", "m2", "gal")).toBeNull();
    expect(convertUnit(1, "length", "m", "ac")).toBeNull();
    expect(convertUnit(1, "weight", "kg", "l")).toBeNull();
  });

  it("rejects non-finite values", () => {
    expect(convertUnit(Number.NaN, "area", "m2", "ft2")).toBeNull();
    expect(
      convertUnit(Number.POSITIVE_INFINITY, "volume", "l", "gal"),
    ).toBeNull();
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

  it("formats area and volume results", () => {
    expect(formatUnitValue(4046.8564224)).toBe("4,046.856422");
    expect(formatUnitValue(0.09290304)).toBe("0.09290304");
    expect(formatUnitValue(3.785411784)).toBe("3.785411784");
    expect(formatUnitValue(236.58823650000002)).toBe("236.5882365");
    expect(formatUnitValue(4046.8564224, "es-ES")).toBe("4046,856422");
    expect(formatUnitValue(3.785411784, "es-ES")).toBe("3,785411784");
  });

  it("normalizes negative zero", () => {
    expect(formatUnitValue(-0)).toBe("0");
  });
});
