import { describe, expect, it } from "vitest";
import {
  calculateImperialBmi,
  calculateMetricBmi,
  classifyBmi,
  cmToInches,
  combineHeightInches,
  formatBmi,
  formatMeasurement,
  inchesToCm,
  kgToLb,
  lbToKg,
  roundBmi,
  splitHeightInches,
  BMI_LIMITS,
} from "../src/lib/bmi";

/*
 * BMI contract: independent metric/imperial reference values, category
 * boundaries from unrounded BMI, adult screening ranges, imperial feet and
 * inches validation, full-precision calculation with one-decimal display,
 * and unit conversions that preserve the physical measurement.
 */

describe("calculateMetricBmi", () => {
  it("matches independently calculated reference values", () => {
    const cases = [
      {
        kg: 70,
        cm: 175,
        bmi: 22.857142857,
        display: 22.9,
        category: "healthy",
      },
      { kg: 60, cm: 160, bmi: 23.4375, display: 23.4, category: "healthy" },
      {
        kg: 50,
        cm: 170,
        bmi: 17.301038062,
        display: 17.3,
        category: "underweight",
      },
      {
        kg: 80,
        cm: 170,
        bmi: 27.6816609,
        display: 27.7,
        category: "overweight",
      },
      {
        kg: 90,
        cm: 170,
        bmi: 31.141868512,
        display: 31.1,
        category: "obesity",
      },
    ] as const;

    for (const item of cases) {
      const result = calculateMetricBmi(item.kg, item.cm);
      expect(result.ok, `${item.kg} kg / ${item.cm} cm`).toBe(true);
      if (!result.ok) continue;
      expect(result.bmi).toBeCloseTo(item.bmi, 8);
      expect(roundBmi(result.bmi)).toBe(item.display);
      expect(result.category).toBe(item.category);
    }
  });

  it("handles decimal weights and heights without display rounding in the calculation", () => {
    const result = calculateMetricBmi(72.5, 173.5);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bmi).toBeCloseTo(24.084578, 6);
    expect(roundBmi(result.bmi)).toBe(24.1);
    expect(result.category).toBe("healthy");
  });

  it("accepts the adult range boundaries", () => {
    expect(calculateMetricBmi(20, 100).ok).toBe(true);
    expect(calculateMetricBmi(400, 250).ok).toBe(true);
  });

  it("rejects zero, negative, non-finite and out-of-range values", () => {
    for (const [kg, cm] of [
      [0, 175],
      [-1, 175],
      [Number.NaN, 175],
      [70, 0],
      [70, -1],
      [70, Number.NaN],
      [70, Number.POSITIVE_INFINITY],
      [BMI_LIMITS.weightKgMin - 0.1, 175],
      [BMI_LIMITS.weightKgMax + 0.1, 175],
      [70, BMI_LIMITS.heightCmMin - 0.1],
      [70, BMI_LIMITS.heightCmMax + 0.1],
    ] as const) {
      expect(calculateMetricBmi(kg, cm).ok, `${kg}/${cm}`).toBe(false);
    }
  });
});

describe("calculateImperialBmi", () => {
  it("matches an independently calculated reference value", () => {
    const result = calculateImperialBmi(154, 5, 9);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bmi).toBeCloseTo(22.73934, 6);
    expect(roundBmi(result.bmi)).toBe(22.7);
    expect(result.category).toBe("healthy");
  });

  it("accepts the weight and height range boundaries", () => {
    expect(calculateImperialBmi(44, 3, 4).ok).toBe(true);
    expect(calculateImperialBmi(882, 8, 2).ok).toBe(true);
  });

  it("requires whole feet and inches below twelve", () => {
    for (const [lb, feet, inches] of [
      [154, 5.5, 9],
      [154, 5, 12],
      [154, 5, 12.1],
      [154, 5, -0.1],
      [154, -1, 9],
      [154, Number.NaN, 9],
      [154, 5, Number.NaN],
    ] as const) {
      expect(calculateImperialBmi(lb, feet, inches).ok).toBe(false);
    }
  });

  it("rejects heights outside the adult range", () => {
    expect(calculateImperialBmi(154, 3, 0).ok).toBe(false);
    expect(calculateImperialBmi(154, 8, 3).ok).toBe(false);
  });

  it("rejects zero, negative, non-finite and out-of-range weights", () => {
    for (const lb of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      BMI_LIMITS.weightLbMin - 0.1,
      BMI_LIMITS.weightLbMax + 0.1,
    ]) {
      expect(calculateImperialBmi(lb, 5, 9).ok, String(lb)).toBe(false);
    }
  });
});

describe("category boundaries", () => {
  it("uses the exact adult category thresholds", () => {
    expect(classifyBmi(18.4999)).toBe("underweight");
    expect(classifyBmi(18.5)).toBe("healthy");
    expect(classifyBmi(24.9999)).toBe("healthy");
    expect(classifyBmi(25)).toBe("overweight");
    expect(classifyBmi(29.9999)).toBe("overweight");
    expect(classifyBmi(30)).toBe("obesity");
  });

  it("classifies from the unrounded BMI, not the displayed value", () => {
    const healthy = calculateMetricBmi(72.14, 170);
    expect(healthy.ok).toBe(true);
    if (healthy.ok) {
      expect(healthy.category).toBe("healthy");
      expect(roundBmi(healthy.bmi)).toBe(25);
    }

    const overweight = calculateMetricBmi(86.6, 170);
    expect(overweight.ok).toBe(true);
    if (overweight.ok) {
      expect(overweight.category).toBe("overweight");
      expect(roundBmi(overweight.bmi)).toBe(30);
    }
  });

  it("rejects non-positive or non-finite classification input", () => {
    for (const bmi of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => classifyBmi(bmi)).toThrow(RangeError);
    }
  });
});

describe("unit conversion", () => {
  it("converts kilograms and pounds both ways", () => {
    expect(kgToLb(70)).toBeCloseTo(154.323583529, 8);
    expect(lbToKg(kgToLb(70))).toBeCloseTo(70, 10);
    expect(lbToKg(154)).toBeCloseTo(69.85322498, 8);
  });

  it("converts centimetres and inches both ways", () => {
    expect(cmToInches(175)).toBeCloseTo(68.897637795, 8);
    expect(inchesToCm(cmToInches(175))).toBeCloseTo(175, 10);
    expect(inchesToCm(69)).toBeCloseTo(175.26, 10);
  });

  it("splits total inches into whole feet and inches", () => {
    expect(splitHeightInches(69)).toEqual({ feet: 5, inches: 9 });
    expect(splitHeightInches(68.897637795)).toEqual({
      feet: 5,
      inches: 8.9,
    });
    expect(splitHeightInches(71.999)).toEqual({ feet: 6, inches: 0 });
    expect(combineHeightInches(5, 9)).toBe(69);
  });

  it("preserves the BMI when switching metric to imperial", () => {
    const metric = calculateMetricBmi(70, 175);
    expect(metric.ok).toBe(true);
    if (!metric.ok) return;

    const pounds = Number(kgToLb(70).toFixed(2));
    const height = splitHeightInches(cmToInches(175));
    const imperial = calculateImperialBmi(pounds, height.feet, height.inches);

    expect(imperial.ok).toBe(true);
    if (!imperial.ok) return;
    expect(roundBmi(imperial.bmi)).toBe(roundBmi(metric.bmi));
  });
});

describe("formatting", () => {
  it("rounds BMI to one decimal place per locale", () => {
    expect(roundBmi(22.857142857)).toBe(22.9);
    expect(roundBmi(24.949)).toBe(24.9);
    expect(formatBmi(22.857142857, "en-US")).toBe("22.9");
    expect(formatBmi(22.857142857, "es-ES")).toBe("22,9");
  });

  it("formats converted inputs with their locale separator", () => {
    expect(formatMeasurement(154.323583, "en-US")).toBe("154.32");
    expect(formatMeasurement(154.323583, "es-ES")).toBe("154,32");
    expect(formatMeasurement(8.9, "en-US")).toBe("8.9");
    expect(formatMeasurement(8.9, "es-ES")).toBe("8,9");
  });

  it("never emits NaN or Infinity for accepted inputs", () => {
    for (const item of [
      calculateMetricBmi(70, 175),
      calculateImperialBmi(154, 5, 9),
    ]) {
      expect(item.ok).toBe(true);
      if (!item.ok) continue;
      expect(Number.isFinite(item.bmi)).toBe(true);
      expect(Number.isFinite(roundBmi(item.bmi))).toBe(true);
    }
  });
});
