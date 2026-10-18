/*
 * Locale-aware numeric input parsing (M6).
 *
 * Text inputs cannot rely on the browser's number-input behavior: a comma
 * typed on a Spanish page silently becomes part of the integer ("19,99" ->
 * 1999) in some browsers. This module owns the boundary between the raw
 * string and the locale-free arithmetic:
 *
 * - the locale's decimal and grouping separators are derived from Intl;
 * - both the locale format ("1.234,56" in Spanish, "1,234.56" in English)
 *   and the swapped format are accepted when the grouping is unambiguous;
 * - a single separator that cannot be valid grouping is treated as a
 *   decimal separator, so "19.99" on a Spanish page still means 19.99;
 * - inconsistent or ambiguous separators return an "ambiguous" issue
 *   instead of guessing and producing a wrong number.
 *
 * Arithmetic stays untouched: callers receive a plain JS number.
 */

export type NumberParseIssue = "invalid" | "ambiguous";

export type NumberParseResult =
  { ok: true; value: number } | { ok: false; issue: NumberParseIssue };

export interface NumberSeparators {
  decimal: string;
  group: string;
}

export function numberSeparators(intlLocale: string): NumberSeparators {
  const parts = new Intl.NumberFormat(intlLocale, {
    useGrouping: true,
  }).formatToParts(12345.6);
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const group = parts.find((part) => part.type === "group")?.value ?? ",";
  return decimal === group ? { decimal, group: "" } : { decimal, group };
}

function digitsOnly(value: string): boolean {
  return /^[0-9]*$/.test(value);
}

/*
 * A grouped integer part is valid when the first group has 1-3 digits and
 * every following group has exactly 3. A single group is just an integer.
 */
function validGrouping(integerPart: string, group: string): boolean {
  if (group === "") return digitsOnly(integerPart);
  const groups = integerPart.split(group);
  if (groups.length === 0) return false;
  if (groups.some((part) => part === "" || !digitsOnly(part))) return false;
  if (groups.length === 1) return true;
  if (groups[0].length < 1 || groups[0].length > 3) return false;
  return groups.slice(1).every((part) => part.length === 3);
}

function count(text: string, separator: string): number {
  return text.split(separator).length - 1;
}

function finish(sign: string, normalized: string): NumberParseResult {
  const value = Number(`${sign}${normalized}`);
  return Number.isFinite(value)
    ? { ok: true, value }
    : { ok: false, issue: "invalid" };
}

function parseDecimal(
  integerPart: string,
  fractionPart: string,
  sign: string,
): NumberParseResult {
  if (!digitsOnly(integerPart) || !digitsOnly(fractionPart)) {
    return { ok: false, issue: "invalid" };
  }
  if (integerPart === "" && fractionPart === "") {
    return { ok: false, issue: "invalid" };
  }
  return finish(sign, `${integerPart || "0"}.${fractionPart || "0"}`);
}

export function parseLocaleNumber(
  raw: string,
  intlLocale = "en-US",
): NumberParseResult {
  const compact = raw.trim().replace(/[\s\u00a0\u202f\u2009]/g, "");
  if (compact === "") return { ok: false, issue: "invalid" };

  /*
   * Preserve the plain exponent notation the number input accepted. The
   * mantissa goes through the same rules as a bare number, so "1,234e2" means
   * the same as "1,234" × 100 in every locale instead of a second, silent
   * interpretation of the separators.
   */
  const exponent = /^([+-]?)(\d+(?:[.,]\d+)?)[eE]([+-]?\d+)$/.exec(compact);
  if (exponent) {
    const mantissa = parseLocaleNumber(
      `${exponent[1] ?? ""}${exponent[2] ?? ""}`,
      intlLocale,
    );
    if (!mantissa.ok) return mantissa;
    const value = mantissa.value * 10 ** Number(exponent[3] ?? "");
    return Number.isFinite(value)
      ? { ok: true, value }
      : { ok: false, issue: "invalid" };
  }

  const sign =
    compact.startsWith("-") || compact.startsWith("+") ? compact[0] : "";
  const body = sign === "" ? compact : compact.slice(1);
  if (body === "") return { ok: false, issue: "invalid" };

  const { decimal, group } = numberSeparators(intlLocale);
  if (decimal === "") return { ok: false, issue: "invalid" };

  const hasDecimal = body.includes(decimal);
  const hasGroup = group !== "" && body.includes(group);

  if (hasDecimal && hasGroup) {
    /*
     * With both separators, the one that appears last is the decimal
     * separator. This accepts both "1.234,56" and "1,234.56" regardless of
     * the page locale, while invalid grouping is rejected as ambiguous.
     */
    const decimalSeparator =
      body.lastIndexOf(decimal) > body.lastIndexOf(group) ? decimal : group;
    const groupSeparator = decimalSeparator === decimal ? group : decimal;
    if (count(body, decimalSeparator) !== 1) {
      return { ok: false, issue: "ambiguous" };
    }

    const splitAt = body.lastIndexOf(decimalSeparator);
    const integerPart = body.slice(0, splitAt);
    const fractionPart = body.slice(splitAt + decimalSeparator.length);
    if (integerPart === "" || fractionPart === "") {
      return { ok: false, issue: "invalid" };
    }
    if (!validGrouping(integerPart, groupSeparator)) {
      return { ok: false, issue: "ambiguous" };
    }
    return parseDecimal(
      integerPart.split(groupSeparator).join(""),
      fractionPart,
      sign,
    );
  }

  if (hasDecimal) {
    if (count(body, decimal) !== 1) {
      return { ok: false, issue: "invalid" };
    }
    const splitAt = body.lastIndexOf(decimal);
    return parseDecimal(
      body.slice(0, splitAt),
      body.slice(splitAt + decimal.length),
      sign,
    );
  }

  if (hasGroup) {
    if (validGrouping(body, group)) {
      return finish(sign, body.split(group).join(""));
    }
    if (count(body, group) === 1) {
      const splitAt = body.lastIndexOf(group);
      const integerPart = body.slice(0, splitAt);
      const fractionPart = body.slice(splitAt + group.length);
      const parsed = parseDecimal(integerPart, fractionPart, sign);
      return parsed;
    }
    return { ok: false, issue: "ambiguous" };
  }

  return digitsOnly(body)
    ? finish(sign, body)
    : { ok: false, issue: "invalid" };
}
