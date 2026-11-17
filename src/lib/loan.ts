import { interpolate } from "../i18n/interpolate";

/*
 * Pure loan arithmetic (Loan Calculator). Contract:
 * - Inputs must be finite; non-finite or out-of-range inputs return null.
 * - principal must be > 0, annualRatePercent >= 0, months must be a whole
 *   number of months between 1 and MAX_LOAN_MONTHS inclusive.
 * - The monthly rate is annual / 12 / 100. A zero rate is handled as a plain
 *   division instead of dividing by zero in the annuity formula.
 * - Full precision is kept here; money is rounded only in formatMoney.
 */

export const MAX_LOAN_MONTHS = 1200;

export const TERM_UNITS = ["years", "months"] as const;

export type TermUnit = (typeof TERM_UNITS)[number];

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayable: number;
  /** Term in months after the unit conversion. */
  months: number;
}

/** Convert a term to months; returns null for non-finite or non-positive terms. */
export function termToMonths(value: number, unit: TermUnit): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const months = unit === "years" ? value * 12 : value;
  return Number.isFinite(months) ? months : null;
}

export function calculateLoan(
  principal: number,
  annualRatePercent: number,
  months: number,
): LoanResult | null {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePercent)) {
    return null;
  }
  if (!Number.isFinite(months)) return null;
  if (principal <= 0) return null;
  if (annualRatePercent < 0) return null;
  if (months < 1 || months > MAX_LOAN_MONTHS) return null;

  const monthlyRate = annualRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const growth = Math.pow(1 + monthlyRate, months);
    if (!Number.isFinite(growth)) return null;
    const denominator = growth - 1;
    if (denominator === 0 || !Number.isFinite(denominator)) return null;
    monthlyPayment = (principal * monthlyRate * growth) / denominator;
  }

  if (!Number.isFinite(monthlyPayment)) return null;

  const totalPayable = monthlyPayment * months;
  const totalInterest = totalPayable - principal;
  if (!Number.isFinite(totalPayable) || !Number.isFinite(totalInterest)) {
    return null;
  }

  return { monthlyPayment, totalInterest, totalPayable, months };
}

/** Money is currency-neutral and always shown with two decimal places. */
export function formatMoney(value: number, intlLocale = "en-US"): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalized);
}

/** Rates and month counts keep their meaningful decimals without noise. */
export function formatDecimal(value: number, intlLocale = "en-US"): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 3,
  }).format(normalized);
}

/*
 * Substitute the entered annual rate and the derived monthly rate into a
 * localized formula line. The template comes from the dictionary so the
 * words are translatable; only the numbers are localized here.
 */
export function describeLoanFormula(
  annualRatePercent: number,
  describe: string,
  intlLocale = "en-US",
): string {
  return interpolate(describe, {
    rate: formatDecimal(annualRatePercent, intlLocale),
    monthlyRate: formatDecimal(annualRatePercent / 12, intlLocale),
  });
}
