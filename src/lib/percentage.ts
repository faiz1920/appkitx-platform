import type { ResultStrings } from "../i18n/dictionary";
import { interpolate } from "../i18n/interpolate";

export type Mode = "percent-of" | "what-percent" | "percent-change";

/*
 * Pure percentage arithmetic. Contract:
 * - Inputs must be finite numbers; non-finite inputs return null.
 * - whatPercent requires a non-zero whole; percentChange requires a positive
 *   baseline. Undefined cases return null instead of Infinity, NaN, or a
 *   misleading result.
 * - Full precision is kept here; rounding happens only in formatNumber.
 * - Arithmetic never depends on the locale: only the display helpers
 *   (formatNumber, describeFormula, describeResult) take an Intl locale.
 */

export function percentOf(percent: number, value: number): number | null {
  if (!Number.isFinite(percent) || !Number.isFinite(value)) return null;
  return (percent / 100) * value;
}

export function whatPercent(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole)) return null;
  if (whole === 0) return null;
  return (part / whole) * 100;
}

export function percentChange(from: number, to: number): number | null {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  if (from <= 0) return null;
  return ((to - from) / from) * 100;
}

export function calculate(mode: Mode, a: number, b: number): number | null {
  switch (mode) {
    case "percent-of":
      return percentOf(a, b);
    case "what-percent":
      return whatPercent(a, b);
    case "percent-change":
      return percentChange(a, b);
  }
}

export function formatNumber(value: number, intlLocale = "en-US"): string {
  const safe = value === 0 ? 0 : value;
  return safe.toLocaleString(intlLocale, { maximumFractionDigits: 6 });
}

/*
 * Substitute the entered and computed values into a localized formula line.
 * The template comes from the dictionary (FormulaStrings.describe) so word
 * order and symbols are translatable; only the numbers are localized here.
 */
export function describeFormula(
  a: number,
  b: number,
  value: number,
  describe: string,
  intlLocale = "en-US",
): string {
  return interpolate(describe, {
    a: formatNumber(a, intlLocale),
    b: formatNumber(b, intlLocale),
    result: formatNumber(value, intlLocale),
  });
}

/*
 * Display string for a calculated result. Result words come from the
 * dictionary templates so locales can reorder them ("25% increase" vs
 * "25 % de aumento"); the numeric part is formatted with the locale's
 * conventions.
 */
export function describeResult(
  mode: Mode,
  value: number,
  results: ResultStrings,
  intlLocale = "en-US",
): string {
  switch (mode) {
    case "percent-of":
      return interpolate(results.plain, {
        value: formatNumber(value, intlLocale),
      });
    case "what-percent":
      return interpolate(results.percent, {
        value: formatNumber(value, intlLocale),
      });
    case "percent-change": {
      if (value > 0) {
        return interpolate(results.increase, {
          value: formatNumber(value, intlLocale),
        });
      }
      if (value < 0) {
        return interpolate(results.decrease, {
          value: formatNumber(-value, intlLocale),
        });
      }
      return results.zero;
    }
  }
}
