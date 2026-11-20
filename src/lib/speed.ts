/*
 * Pure speed conversion (Speed Converter). Contract:
 * - Inputs must be finite; non-finite values and unknown units return an
 *   "invalid" issue.
 * - Speed is linear: each unit stores its factor to metres per second.
 *   Conversion multiplies by the source factor and divides by the target
 *   factor, so no precision is lost between steps.
 * - A finite input can still leave the finite range when the target factor is
 *   smaller than the source factor (for example m/s to km/h near
 *   Number.MAX_VALUE). That returns an "overflow" issue, never Infinity.
 * - Negative values stay negative: they describe a signed velocity.
 * - Full precision is kept here; rounding happens only in formatting.
 */

interface SpeedUnitDefinition {
  /** Locale-independent symbol shown in results and prose. */
  symbol: string;
  /** Size of one unit in metres per second. */
  factor: number;
}

export const SPEED_UNITS = {
  kmh: { symbol: "km/h", factor: 1000 / 3600 },
  mph: { symbol: "mph", factor: 1609.344 / 3600 },
  ms: { symbol: "m/s", factor: 1 },
  fts: { symbol: "ft/s", factor: 0.3048 },
  kn: { symbol: "kn", factor: 1852 / 3600 },
} as const satisfies Record<string, SpeedUnitDefinition>;

export type SpeedUnit = keyof typeof SPEED_UNITS;

export type SpeedConversionIssue = "invalid" | "overflow";

export type SpeedConversionResult =
  { ok: true; value: number } | { ok: false; issue: SpeedConversionIssue };

/** Units in the order the selects present them. */
export const SPEED_UNIT_ORDER: readonly SpeedUnit[] = [
  "kmh",
  "mph",
  "ms",
  "fts",
  "kn",
];

/** Default pair — the most common road-speed comparison. */
export const DEFAULT_SPEED_UNITS: {
  readonly from: SpeedUnit;
  readonly to: SpeedUnit;
} = {
  from: "kmh",
  to: "mph",
};

function isSpeedUnit(unit: string): unit is SpeedUnit {
  return Object.hasOwn(SPEED_UNITS, unit);
}

export function speedSymbol(unit: string): string {
  return isSpeedUnit(unit) ? SPEED_UNITS[unit].symbol : "";
}

/**
 * Convert a value between two speed units.
 * Returns an "invalid" issue for non-finite values or unknown units, and an
 * "overflow" issue when the finite result leaves the representable range.
 */
export function convertSpeed(
  value: number,
  from: string,
  to: string,
): SpeedConversionResult {
  if (!Number.isFinite(value)) return { ok: false, issue: "invalid" };
  if (!isSpeedUnit(from) || !isSpeedUnit(to)) {
    return { ok: false, issue: "invalid" };
  }

  const converted = (value * SPEED_UNITS[from].factor) / SPEED_UNITS[to].factor;
  if (!Number.isFinite(converted)) return { ok: false, issue: "overflow" };

  return { ok: true, value: converted };
}
