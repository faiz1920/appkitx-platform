export type Mode = "percent-of" | "what-percent" | "percent-change";

/*
 * Pure percentage arithmetic. Contract:
 * - Inputs must be finite numbers; non-finite inputs return null.
 * - Zero denominators return null instead of Infinity or NaN.
 * - Full precision is kept here; rounding happens only in formatNumber.
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
  if (from === 0) return null;
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

export function formatNumber(value: number): string {
  const safe = value === 0 ? 0 : value;
  return safe.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function formulaTemplate(mode: Mode): string {
  switch (mode) {
    case "percent-of":
      return "(X ÷ 100) × Y";
    case "what-percent":
      return "(X ÷ Y) × 100";
    case "percent-change":
      return "((To − From) ÷ From) × 100";
  }
}

export function describeFormula(
  mode: Mode,
  a: number,
  b: number,
  value: number,
): string {
  const x = formatNumber(a);
  const y = formatNumber(b);
  const result = formatNumber(value);
  switch (mode) {
    case "percent-of":
      return `(${x} ÷ 100) × ${y} = ${result}`;
    case "what-percent":
      return `(${x} ÷ ${y}) × 100 = ${result}`;
    case "percent-change":
      return `((${y} − ${x}) ÷ ${x}) × 100 = ${result}`;
  }
}

export function describeResult(mode: Mode, value: number): string {
  switch (mode) {
    case "percent-of":
      return formatNumber(value);
    case "what-percent":
      return `${formatNumber(value)}%`;
    case "percent-change": {
      if (value > 0) return `${formatNumber(value)}% increase`;
      if (value < 0) return `${formatNumber(Math.abs(value))}% decrease`;
      return "0%";
    }
  }
}
