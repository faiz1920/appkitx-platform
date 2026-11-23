/*
 * Pure unit conversion (Unit Converter). Contract:
 * - Inputs must be finite; non-finite values and unknown units return null.
 * - Length, weight, area, and volume are linear: each unit stores its factor
 *   to the category base unit (metre, gram, square metre, cubic metre).
 *   Conversion multiplies by the source factor and divides by the target
 *   factor, so no precision is lost between steps.
 * - Temperature is affine, not a simple ratio: values pass through kelvin,
 *   and anything below absolute zero returns null instead of an impossible
 *   value.
 * - Full precision is kept here; rounding happens only in formatting.
 *
 * Volume uses cubic metres as its base. The supported US units are US
 * customary, derived exactly from the 231-cubic-inch US gallon; they are not
 * UK imperial units. UK imperial volume units are deliberately not included.
 */

export const UNIT_CATEGORIES = [
  "length",
  "weight",
  "temperature",
  "area",
  "volume",
] as const;

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

/*
 * Area: square metre base. Factors are the square of the corresponding
 * international linear definition (1 ft = 0.3048 m, 1 yd = 0.9144 m), with
 * 1 acre = 4,840 yd² and 1 hectare = 10,000 m².
 */
export const AREA_UNITS = {
  cm2: { symbol: "cm²", factor: 0.0001 },
  m2: { symbol: "m²", factor: 1 },
  km2: { symbol: "km²", factor: 1000000 },
  ft2: { symbol: "ft²", factor: 0.09290304 },
  yd2: { symbol: "yd²", factor: 0.83612736 },
  ac: { symbol: "ac", factor: 4046.8564224 },
  ha: { symbol: "ha", factor: 10000 },
} as const satisfies Record<string, LinearUnit>;

/*
 * Volume: cubic metre base. US customary units are exact fractions of the US
 * gallon (231 in³ = 3.785411784 L), whose name and symbol carry the "US"
 * qualifier so they cannot be mistaken for UK imperial or metric definitions.
 */
export const VOLUME_UNITS = {
  ml: { symbol: "mL", factor: 0.000001 },
  l: { symbol: "L", factor: 0.001 },
  m3: { symbol: "m³", factor: 1 },
  tsp: { symbol: "US tsp", factor: 0.00000492892159375 },
  tbsp: { symbol: "US tbsp", factor: 0.00001478676478125 },
  floz: { symbol: "US fl oz", factor: 0.0000295735295625 },
  cup: { symbol: "US cup", factor: 0.0002365882365 },
  pt: { symbol: "US pt", factor: 0.000473176473 },
  qt: { symbol: "US qt", factor: 0.000946352946 },
  gal: { symbol: "US gal", factor: 0.003785411784 },
} as const satisfies Record<string, LinearUnit>;

export type LengthUnit = keyof typeof LENGTH_UNITS;
export type WeightUnit = keyof typeof WEIGHT_UNITS;
export type TemperatureUnit = keyof typeof TEMPERATURE_UNITS;
export type AreaUnit = keyof typeof AREA_UNITS;
export type VolumeUnit = keyof typeof VOLUME_UNITS;
export type UnitId =
  LengthUnit | WeightUnit | TemperatureUnit | AreaUnit | VolumeUnit;

/** Units in the order the selects present them, per category. */
export const UNITS_BY_CATEGORY: {
  readonly length: readonly LengthUnit[];
  readonly weight: readonly WeightUnit[];
  readonly temperature: readonly TemperatureUnit[];
  readonly area: readonly AreaUnit[];
  readonly volume: readonly VolumeUnit[];
} = {
  length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  weight: ["mg", "g", "kg", "t", "oz", "lb", "st"],
  temperature: ["c", "f", "k"],
  area: ["cm2", "m2", "km2", "ft2", "yd2", "ac", "ha"],
  volume: ["ml", "l", "m3", "tsp", "tbsp", "floz", "cup", "pt", "qt", "gal"],
};

/** Default pair for a category — common units on both sides of the conversion. */
export const DEFAULT_UNITS: {
  readonly length: { readonly from: LengthUnit; readonly to: LengthUnit };
  readonly weight: { readonly from: WeightUnit; readonly to: WeightUnit };
  readonly temperature: {
    readonly from: TemperatureUnit;
    readonly to: TemperatureUnit;
  };
  readonly area: { readonly from: AreaUnit; readonly to: AreaUnit };
  readonly volume: { readonly from: VolumeUnit; readonly to: VolumeUnit };
} = {
  length: { from: "m", to: "ft" },
  weight: { from: "kg", to: "lb" },
  temperature: { from: "c", to: "f" },
  area: { from: "m2", to: "ft2" },
  volume: { from: "l", to: "gal" },
};

/*
 * The four linear categories share one validated lookup. Keeping it keyed by
 * the category means a unit can never be read from another category's table,
 * and temperature stays on its separate affine path.
 */
const LINEAR_UNITS: Record<
  Exclude<UnitCategory, "temperature">,
  Record<string, LinearUnit>
> = {
  length: LENGTH_UNITS,
  weight: WEIGHT_UNITS,
  area: AREA_UNITS,
  volume: VOLUME_UNITS,
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

function isAreaUnit(unit: string): unit is AreaUnit {
  return Object.hasOwn(AREA_UNITS, unit);
}

function isVolumeUnit(unit: string): unit is VolumeUnit {
  return Object.hasOwn(VOLUME_UNITS, unit);
}

function linearFactor(category: UnitCategory, unit: string): number | null {
  if (category === "temperature") return null;
  if (!Object.hasOwn(LINEAR_UNITS, category)) return null;

  const registry = LINEAR_UNITS[category];
  if (!Object.hasOwn(registry, unit)) return null;

  return registry[unit].factor;
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
  if (category === "area" && isAreaUnit(unit)) {
    return AREA_UNITS[unit].symbol;
  }
  if (category === "volume" && isVolumeUnit(unit)) {
    return VOLUME_UNITS[unit].symbol;
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

  if (category === "temperature") {
    if (!isTemperatureUnit(from) || !isTemperatureUnit(to)) return null;
    const kelvin = toKelvin(value, from);
    if (kelvin < -ABSOLUTE_ZERO_TOLERANCE) return null;
    return fromKelvin(Math.max(0, kelvin), to);
  }

  const fromFactor = linearFactor(category, from);
  const toFactor = linearFactor(category, to);
  if (fromFactor === null || toFactor === null) return null;

  return (value * fromFactor) / toFactor;
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
