import { interpolate } from "../i18n/interpolate";

export interface DiscountResult {
  savings: number;
  finalPrice: number;
}

/*
 * Pure discount arithmetic. Contract:
 * - Inputs must be finite numbers; non-finite inputs return null.
 * - price must be >= 0 and discountPercent must be within 0-100 inclusive;
 *   out-of-range inputs return null instead of NaN, Infinity, or a clamped value.
 * - Full precision is kept here; rounding happens only in formatAmount.
 * - Arithmetic never depends on the locale: only the display helpers
 *   (formatAmount, describeFormulas) take an Intl locale.
 */

export function calculateDiscount(
  price: number,
  discountPercent: number,
): DiscountResult | null {
  if (!Number.isFinite(price) || !Number.isFinite(discountPercent)) return null;
  if (price < 0) return null;
  if (discountPercent < 0 || discountPercent > 100) return null;
  const savings = (price * discountPercent) / 100;
  return { savings, finalPrice: price - savings };
}

export function formatAmount(value: number, intlLocale = "en-US"): string {
  const safe = value === 0 ? 0 : value;
  return safe.toLocaleString(intlLocale, { maximumFractionDigits: 2 });
}

/*
 * Substitute the entered and computed values into a localized formula line.
 * The template comes from the dictionary (FormulaStrings.describe) so the
 * words are translatable; only the numbers are localized here.
 */
export function describeFormulas(
  price: number,
  discountPercent: number,
  savings: number,
  finalPrice: number,
  describe: string,
  intlLocale = "en-US",
): string {
  return interpolate(describe, {
    price: formatAmount(price, intlLocale),
    percent: formatAmount(discountPercent, intlLocale),
    savings: formatAmount(savings, intlLocale),
    final: formatAmount(finalPrice, intlLocale),
  });
}
