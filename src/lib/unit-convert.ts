/*
 * Pure unit conversion (Unit Converter). Contract:
 * - Inputs must be finite; non-finite values and unknown units return null.
 * - Length and weight are linear: each unit stores its factor to the base
 *   unit (metre, gram). Conversion multiplies by the source factor and
 *   divides by the target factor, so no precision is lost between steps.
 * - Temperature is affine, not a simple ratio: values pass through kelvin,
 *   and anything below absolute zero returns null instead of an impossible
 *   value.
 * - Full precision is kept here; rounding happens only in formatting.
 */

export const UNIT_CATEGORIES = ["length", "weight", "temperature"] as const;

export type UnitCategory = (typeof UNIT_CATEGORIES)[number];

interface LinearUnit {
  /** Locale-independent symbol shown in results and prose. */
  symbol: string;
  /** Size of one unit in the category's base unit. */
  factor: number;
}

export const LENGTH_UNITS = {
  mm: { symbol: "mm", factor: 0.001 },
  cm: { symbol: "cm", factor: 0.01 },
  m: { symbol: "m", factor: 1 },
  km: { symbol: "km", factor: 1000 },
  in: { symbol: "in", factor: 0.0254 },
  ft: { symbol: "ft", factor: 0.3048 },
  yd: { symbol: "yd", factor: 0.9144 },
  mi: { symbol: "mi", factor: 1609.344 },
} as const satisfies Record<string, LinearUnit>;

export const WEIGHT_UNITS = {
  mg: { symbol: "mg", factor: 0.001 },
  g: { symbol: "g", factor: 1 },
  kg: { symbol: "kg", factor: 1000 },
  t: { symbol: "t", factor: 1000000 },
  oz: { symbol: "oz", factor: 28.349523125 },
  lb: { symbol: "lb", factor: 453.59237 },
  st: { symbol: "st", factor: 6350.29318 },
} as const satisfies Record<string, LinearUnit>;

export const TEMPERATURE_UNITS = {
  c: { symbol: "°C" },
  f: { symbol: "°F" },
  k: { symbol: "K" },
} as const;

export type LengthUnit = keyof typeof LENGTH_UNITS;
export type WeightUnit = keyof typeof WEIGHT_UNITS;
export type TemperatureUnit = keyof typeof TEMPERATURE_UNITS;
export type UnitId = LengthUnit | WeightUnit | TemperatureUnit;

/** Units in the order the selects present them, per category. */
export const UNITS_BY_CATEGORY: {
  readonly length: readonly LengthUnit[];
  readonly weight: readonly WeightUnit[];
  readonly temperature: readonly TemperatureUnit[];
} = {
  length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  weight: ["mg", "g", "kg", "t", "oz", "lb", "st"],
  temperature: ["c", "f", "k"],
};

/** Default pair for a category — common units on both sides of the conversion. */
export const DEFAULT_UNITS: {
  readonly length: { readonly from: LengthUnit; readonly to: LengthUnit };
  readonly weight: { readonly from: WeightUnit; readonly to: WeightUnit };
  readonly temperature: {
    readonly from: TemperatureUnit;
    readonly to: TemperatureUnit;
  };
} = {
  length: { from: "m", to: "ft" },
  weight: { from: "kg", to: "lb" },
  temperature: { from: "c", to: "f" },
};

const ABSOLUTE_ZERO_TOLERANCE = 1e-9;

function isLengthUnit(unit: string): unit is LengthUnit {
  return Object.hasOwn(LENGTH_UNITS, unit);
}

function isWeightUnit(unit: string): unit is WeightUnit {
  return Object.hasOwn(WEIGHT_UNITS, unit);
}

function isTemperatureUnit(unit: string): unit is TemperatureUnit {
  return Object.hasOwn(TEMPERATURE_UNITS, unit);
}

export function unitSymbol(category: UnitCategory, unit: string): string {
  if (category === "length" && isLengthUnit(unit)) {
    return LENGTH_UNITS[unit].symbol;
  }
  if (category === "weight" && isWeightUnit(unit)) {
    return WEIGHT_UNITS[unit].symbol;
  }
  if (category === "temperature" && isTemperatureUnit(unit)) {
    return TEMPERATURE_UNITS[unit].symbol;
  }
  return "";
}

function toKelvin(value: number, unit: TemperatureUnit): number {
  if (unit === "c") return value + 273.15;
  if (unit === "f") return ((value - 32) * 5) / 9 + 273.15;
  return value;
}

function fromKelvin(kelvin: number, unit: TemperatureUnit): number {
  if (unit === "c") return kelvin - 273.15;
  if (unit === "f") return ((kelvin - 273.15) * 9) / 5 + 32;
  return kelvin;
}

/**
 * Convert a value between two units of the same category.
 * Returns null for non-finite values, unknown units, mismatched categories,
 * or temperatures below absolute zero.
 */
export function convertUnit(
  value: number,
  category: UnitCategory,
  from: string,
  to: string,
): number | null {
  if (!Number.isFinite(value)) return null;

  if (category === "length") {
    if (!isLengthUnit(from) || !isLengthUnit(to)) return null;
    return (value * LENGTH_UNITS[from].factor) / LENGTH_UNITS[to].factor;
  }

  if (category === "weight") {
    if (!isWeightUnit(from) || !isWeightUnit(to)) return null;
    return (value * WEIGHT_UNITS[from].factor) / WEIGHT_UNITS[to].factor;
  }

  if (!isTemperatureUnit(from) || !isTemperatureUnit(to)) return null;
  const kelvin = toKelvin(value, from);
  if (kelvin < -ABSOLUTE_ZERO_TOLERANCE) return null;
  return fromKelvin(Math.max(0, kelvin), to);
}

/** True when the value is below absolute zero for a temperature unit. */
export function isBelowAbsoluteZero(
  value: number,
  unit: TemperatureUnit,
): boolean {
  if (!Number.isFinite(value)) return false;
  return toKelvin(value, unit) < -ABSOLUTE_ZERO_TOLERANCE;
}

/*
 * Converted values span many magnitudes (1 mi ≈ 1.609 km, 1 mm ≈ 0.039 in),
 * so fixed decimals would either hide small results or add noise to large
 * ones. Ten significant digits keeps every exact definition intact and trims
 * binary floating-point tails; grouping follows the locale.
 */
export function formatUnitValue(value: number, intlLocale = "en-US"): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return new Intl.NumberFormat(intlLocale, {
    maximumSignificantDigits: 10,
  }).format(normalized);
}
