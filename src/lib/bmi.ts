/*
 * Adult BMI calculation and unit conversion.
 *
 * Contract:
 * - Metric: BMI = kg / m². Imperial: BMI = 703 × lb / in².
 * - Full precision is kept in the calculation; only display rounding uses
 *   one decimal place.
 * - Categories are always classified from the unrounded BMI value.
 * - Inputs must be finite and inside the documented adult screening ranges;
 *   invalid values return field issues instead of NaN or Infinity.
 * - Imperial height is feet plus inches, with inches below 12.
 *
 * This is an informational adult screening tool, not a diagnosis. The module
 * deliberately does not implement pediatric BMI percentiles.
 */

export type BmiUnitSystem = "metric" | "imperial";

export const BMI_CATEGORIES = [
  "underweight",
  "healthy",
  "overweight",
  "obesity",
] as const;

export type BmiCategory = (typeof BMI_CATEGORIES)[number];

export type BmiField = "weight" | "height" | "feet" | "inches";

export type BmiIssueCode =
  | "weightRequired"
  | "weightInvalid"
  | "weightRange"
  | "heightRequired"
  | "heightInvalid"
  | "heightRange"
  | "feetRequired"
  | "feetInvalid"
  | "inchesRequired"
  | "inchesInvalid"
  | "inchesRange"
  | "heightRangeImperial";

export interface BmiIssue {
  field: BmiField;
  code: BmiIssueCode;
}

export type BmiResult =
  | { ok: true; bmi: number; category: BmiCategory }
  | { ok: false; issues: BmiIssue[] };

export const BMI_CATEGORY_THRESHOLDS = {
  underweight: 18.5,
  healthy: 25,
  overweight: 30,
} as const;

/** Adult screening input ranges. */
export const BMI_LIMITS = {
  weightKgMin: 20,
  weightKgMax: 400,
  heightCmMin: 100,
  heightCmMax: 250,
  weightLbMin: 44,
  weightLbMax: 882,
  feetMin: 0,
  feetMax: 8,
  inchesMaxExclusive: 12,
  heightInMin: 100 / 2.54,
  heightInMax: 250 / 2.54,
} as const;

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

/** Classify an unrounded BMI using the standard adult categories. */
export function classifyBmi(bmi: number): BmiCategory {
  if (!Number.isFinite(bmi) || bmi <= 0) {
    throw new RangeError("BMI must be a positive finite number.");
  }
  if (bmi < BMI_CATEGORY_THRESHOLDS.underweight) return "underweight";
  if (bmi < BMI_CATEGORY_THRESHOLDS.healthy) return "healthy";
  if (bmi < BMI_CATEGORY_THRESHOLDS.overweight) return "overweight";
  return "obesity";
}

/** Round only for display; never use the rounded value for classification. */
export function roundBmi(bmi: number): number {
  if (!Number.isFinite(bmi)) {
    throw new RangeError("BMI must be a finite number.");
  }
  return Math.round((bmi + Number.EPSILON) * 10) / 10;
}

export function calculateMetricBmi(
  weightKg: number,
  heightCm: number,
): BmiResult {
  const issues: BmiIssue[] = [];

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    issues.push({ field: "weight", code: "weightInvalid" });
  } else if (
    weightKg < BMI_LIMITS.weightKgMin ||
    weightKg > BMI_LIMITS.weightKgMax
  ) {
    issues.push({ field: "weight", code: "weightRange" });
  }

  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    issues.push({ field: "height", code: "heightInvalid" });
  } else if (
    heightCm < BMI_LIMITS.heightCmMin ||
    heightCm > BMI_LIMITS.heightCmMax
  ) {
    issues.push({ field: "height", code: "heightRange" });
  }

  if (issues.length > 0) return { ok: false, issues };

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return {
      ok: false,
      issues: [{ field: "height", code: "heightInvalid" }],
    };
  }

  return { ok: true, bmi, category: classifyBmi(bmi) };
}

export function calculateImperialBmi(
  weightLb: number,
  feet: number,
  inches: number,
): BmiResult {
  const issues: BmiIssue[] = [];

  if (!Number.isFinite(weightLb) || weightLb <= 0) {
    issues.push({ field: "weight", code: "weightInvalid" });
  } else if (
    weightLb < BMI_LIMITS.weightLbMin ||
    weightLb > BMI_LIMITS.weightLbMax
  ) {
    issues.push({ field: "weight", code: "weightRange" });
  }

  const feetValid =
    Number.isFinite(feet) && Number.isInteger(feet) && feet >= 0;
  if (!feetValid) {
    issues.push({ field: "feet", code: "feetInvalid" });
  }

  const inchesValid = Number.isFinite(inches) && inches >= 0;
  if (!inchesValid) {
    issues.push({ field: "inches", code: "inchesInvalid" });
  } else if (inches >= BMI_LIMITS.inchesMaxExclusive) {
    issues.push({ field: "inches", code: "inchesRange" });
  }

  if (feetValid && inchesValid) {
    const totalIn = feet * 12 + inches;
    if (totalIn < BMI_LIMITS.heightInMin || totalIn > BMI_LIMITS.heightInMax) {
      issues.push({ field: "feet", code: "heightRangeImperial" });
    }
  }

  if (issues.length > 0) return { ok: false, issues };

  const totalIn = feet * 12 + inches;
  const bmi = (703 * weightLb) / (totalIn * totalIn);
  if (!Number.isFinite(bmi) || bmi <= 0) {
    return {
      ok: false,
      issues: [{ field: "feet", code: "heightRangeImperial" }],
    };
  }

  return { ok: true, bmi, category: classifyBmi(bmi) };
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function combineHeightInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

/** Split total inches into whole feet and inches rounded to two decimals. */
export function splitHeightInches(totalInches: number): {
  feet: number;
  inches: number;
} {
  if (!Number.isFinite(totalInches) || totalInches < 0) {
    throw new RangeError("Height must be a non-negative finite number.");
  }

  const feet = Math.floor(totalInches / 12);
  const rawInches = totalInches - feet * 12;
  const inches = Math.round((rawInches + Number.EPSILON) * 100) / 100;

  if (inches >= 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}

/** Display BMI with exactly one fraction digit in the page locale. */
export function formatBmi(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format a converted input value without grouping separators. */
export function formatMeasurement(
  value: number,
  intlLocale = "en-US",
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat(intlLocale, {
    useGrouping: false,
    maximumFractionDigits,
  }).format(value);
}
