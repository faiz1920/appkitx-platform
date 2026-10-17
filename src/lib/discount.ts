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

export function formatAmount(value: number): string {
  const safe = value === 0 ? 0 : value;
  return safe.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formulaTemplate(): string {
  return "discount = (price × percent) ÷ 100 · final = price − discount";
}

export function describeFormulas(
  price: number,
  discountPercent: number,
  savings: number,
  finalPrice: number,
): string {
  const p = formatAmount(price);
  const d = formatAmount(discountPercent);
  const s = formatAmount(savings);
  const f = formatAmount(finalPrice);
  return `discount = (${p} × ${d}) ÷ 100 = ${s} · final = ${p} − ${s} = ${f}`;
}
