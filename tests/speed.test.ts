import { describe, expect, it } from "vitest";
import {
  DEFAULT_SPEED_UNITS,
  SPEED_UNIT_ORDER,
  convertSpeed,
  speedSymbol,
} from "../src/lib/speed";
import { formatUnitValue } from "../src/lib/unit-convert";

const convert = (value: number, from: string, to: string): number => {
  const result = convertSpeed(value, from, to);
  expect(result.ok).toBe(true);
  return result.ok ? result.value : Number.NaN;
};

describe("speed conversion", () => {
  it("converts between metric units", () => {
    expect(convert(1, "ms", "kmh")).toBeCloseTo(3.6, 12);
    expect(convert(36, "kmh", "ms")).toBeCloseTo(10, 12);
    expect(convert(1000, "ms", "kmh")).toBeCloseTo(3600, 9);
  });

  it("uses exact international definitions", () => {
    expect(convert(1, "mph", "kmh")).toBeCloseTo(1.609344, 12);
    expect(convert(1, "fts", "ms")).toBeCloseTo(0.3048, 12);
    expect(convert(1, "kn", "kmh")).toBeCloseTo(1.852, 12);
    expect(convert(1, "kn", "mph")).toBeCloseTo(1.150779448, 9);
  });

  it("converts common road speeds in both directions", () => {
    expect(convert(100, "kmh", "mph")).toBeCloseTo(62.1371192237, 9);
    expect(convert(60, "mph", "kmh")).toBeCloseTo(96.56064, 10);
    expect(convert(10, "fts", "ms")).toBeCloseTo(3.048, 12);
  });

  it("round-trips without drift", () => {
    const there = convert(123.456, "mph", "kmh");
    expect(there).not.toBeNull();
    expect(convert(there, "kmh", "mph")).toBeCloseTo(123.456, 10);
  });

  it("keeps negative values as entered (signed velocities)", () => {
    expect(convert(-1, "ms", "kmh")).toBeCloseTo(-3.6, 12);
    expect(convert(-60, "mph", "kmh")).toBeCloseTo(-96.56064, 10);
  });

  it("converts zero without producing negative zero", () => {
    const converted = convert(0, "kmh", "mph");
    expect(converted).toBe(0);
    expect(Object.is(converted, -0)).toBe(false);
  });

  it("converts every supported unit pair", () => {
    for (const from of SPEED_UNIT_ORDER) {
      for (const to of SPEED_UNIT_ORDER) {
        const converted = convert(12.5, from, to);
        expect(Number.isFinite(converted), `${from} -> ${to}`).toBe(true);
        if (from === to) expect(converted).toBe(12.5);
        expect(
          convert(converted, to, from),
          `${from} -> ${to} round trip`,
        ).toBeCloseTo(12.5, 9);
      }
    }
  });

  it("rejects unknown units and non-finite values", () => {
    expect(convertSpeed(1, "ms", "warp")).toEqual({
      ok: false,
      issue: "invalid",
    });
    expect(convertSpeed(1, "warp", "kmh")).toEqual({
      ok: false,
      issue: "invalid",
    });
    expect(convertSpeed(Number.NaN, "ms", "kmh")).toEqual({
      ok: false,
      issue: "invalid",
    });
    expect(convertSpeed(Number.POSITIVE_INFINITY, "ms", "kmh")).toEqual({
      ok: false,
      issue: "invalid",
    });
    expect(convertSpeed(Number.NEGATIVE_INFINITY, "ms", "kmh")).toEqual({
      ok: false,
      issue: "invalid",
    });
  });
});

describe("speed conversion boundaries", () => {
  it("keeps a large finite input finite across the widest ratio", () => {
    expect(convert(1e307, "ms", "kmh")).toBe(3.6e307);
  });

  it("reports positive overflow instead of returning Infinity", () => {
    const pairs = [
      ["ms", "kmh"],
      ["ms", "fts"],
      ["kn", "kmh"],
      ["mph", "kmh"],
    ] as const;

    for (const [from, to] of pairs) {
      expect(
        convertSpeed(Number.MAX_VALUE, from, to),
        `${from} -> ${to}`,
      ).toEqual({ ok: false, issue: "overflow" });
    }
  });

  it("reports negative overflow for signed extreme values", () => {
    expect(convertSpeed(-Number.MAX_VALUE, "ms", "kmh")).toEqual({
      ok: false,
      issue: "overflow",
    });
    expect(convertSpeed(-Number.MAX_VALUE, "kn", "fts")).toEqual({
      ok: false,
      issue: "overflow",
    });
  });

  it("stays finite at the widest ratio boundary and overflows just past it", () => {
    /*
     * m/s to km/h divides by (1000 / 3600), so the largest finite input is
     * Number.MAX_VALUE / 3.6. One representable step past it overflows.
     */
    const boundary = Number.MAX_VALUE / 3.6;
    const atBoundary = convertSpeed(boundary, "ms", "kmh");
    expect(atBoundary.ok).toBe(true);
    if (atBoundary.ok) {
      expect(atBoundary.value).toBe(1.7976931348623155e308);
      expect(Number.isFinite(atBoundary.value)).toBe(true);
    }

    expect(convertSpeed(boundary + 1e292, "ms", "kmh")).toEqual({
      ok: false,
      issue: "overflow",
    });
  });

  it("never reports a successful non-finite result", () => {
    const inputs = [
      0,
      1,
      -1,
      1e307,
      -1e307,
      Number.MAX_VALUE,
      -Number.MAX_VALUE,
      Number.MAX_VALUE / 3.6,
    ];

    for (const value of inputs) {
      for (const from of SPEED_UNIT_ORDER) {
        for (const to of SPEED_UNIT_ORDER) {
          const result = convertSpeed(value, from, to);
          if (result.ok) {
            expect(
              Number.isFinite(result.value),
              `${value} ${from} -> ${to} returned ${result.value}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe("speed unit registry", () => {
  it("presents every unit once in the expected order", () => {
    expect(SPEED_UNIT_ORDER).toEqual(["kmh", "mph", "ms", "fts", "kn"]);
    expect(new Set(SPEED_UNIT_ORDER).size).toBe(SPEED_UNIT_ORDER.length);
  });

  it("uses km/h to mph as the default pair", () => {
    expect(DEFAULT_SPEED_UNITS).toEqual({ from: "kmh", to: "mph" });
  });

  it("exposes locale-independent symbols", () => {
    expect(speedSymbol("kmh")).toBe("km/h");
    expect(speedSymbol("mph")).toBe("mph");
    expect(speedSymbol("ms")).toBe("m/s");
    expect(speedSymbol("fts")).toBe("ft/s");
    expect(speedSymbol("kn")).toBe("kn");
    expect(speedSymbol("warp")).toBe("");
  });
});

describe("speed result formatting", () => {
  it("keeps up to ten significant digits and follows the locale", () => {
    const converted = convert(100, "kmh", "mph");
    expect(formatUnitValue(converted)).toBe("62.13711922");
    expect(formatUnitValue(96.56064, "es-ES")).toBe("96,56064");
    expect(formatUnitValue(3.6, "es-ES")).toBe("3,6");
  });
});
