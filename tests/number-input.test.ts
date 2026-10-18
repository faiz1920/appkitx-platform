import { describe, expect, it } from "vitest";
import { numberSeparators, parseLocaleNumber } from "../src/lib/number-input";

/*
 * M6 boundary: the calculators receive plain numbers from text inputs.
 * These cases lock the locale conventions, the forgiving single-separator
 * behavior, and — most importantly — that ambiguous formats are rejected
 * instead of silently producing a wrong value.
 */

const value = (raw: string, locale: string) => {
  const result = parseLocaleNumber(raw, locale);
  if (!result.ok) throw new Error(`expected a number for "${raw}" (${locale})`);
  return result.value;
};

const issue = (raw: string, locale: string) => {
  const result = parseLocaleNumber(raw, locale);
  if (result.ok) throw new Error(`expected a failure for "${raw}" (${locale})`);
  return result.issue;
};

describe("numberSeparators", () => {
  it("derives English and Spanish conventions from Intl", () => {
    expect(numberSeparators("en-US")).toEqual({ decimal: ".", group: "," });
    expect(numberSeparators("es-ES")).toEqual({ decimal: ",", group: "." });
  });
});

describe("parseLocaleNumber", () => {
  it("parses English locale formats", () => {
    expect(value("19.99", "en-US")).toBe(19.99);
    expect(value("1,234.56", "en-US")).toBe(1234.56);
    expect(value("1,234", "en-US")).toBe(1234);
    expect(value("1.234", "en-US")).toBe(1.234);
  });

  it("parses Spanish locale formats", () => {
    expect(value("19,99", "es-ES")).toBe(19.99);
    expect(value("1.234,56", "es-ES")).toBe(1234.56);
    expect(value("1.234", "es-ES")).toBe(1234);
    expect(value("1,234", "es-ES")).toBe(1.234);
  });

  it("accepts the swapped full format when grouping is unambiguous", () => {
    expect(value("1,234.56", "es-ES")).toBe(1234.56);
    expect(value("1.234,56", "en-US")).toBe(1234.56);
    expect(value("12.345.678,9", "en-US")).toBe(12345678.9);
    expect(value("12,345,678.9", "es-ES")).toBe(12345678.9);
  });

  it("prioritizes locale conventions for a single separator", () => {
    /* The locale's own meaning wins: dot groups in Spanish, comma in English. */
    expect(value("123.456", "es-ES")).toBe(123456);
    expect(value("123,456", "en-US")).toBe(123456);
    expect(value("1.234", "es-ES")).toBe(1234);
    expect(value("1,234", "en-US")).toBe(1234);
  });

  it("treats a single non-grouping separator as a decimal", () => {
    expect(value("19.99", "es-ES")).toBe(19.99);
    expect(value("19,99", "en-US")).toBe(19.99);
    expect(value("1.2", "es-ES")).toBe(1.2);
    expect(value("1,2", "en-US")).toBe(1.2);
    /* Three trailing digits stop being valid grouping in this position. */
    expect(value("1234,567", "en-US")).toBe(1234.567);
    expect(value("1234.567", "es-ES")).toBe(1234.567);
  });

  it("accepts signs, surrounding spaces, and space grouping", () => {
    expect(value("-1.234,56", "es-ES")).toBe(-1234.56);
    expect(value("+19,99", "es-ES")).toBe(19.99);
    expect(value(" 19,99 ", "es-ES")).toBe(19.99);
    expect(value("1 234,56", "es-ES")).toBe(1234.56);
    expect(value("- 19,99", "es-ES")).toBe(-19.99);
    /* Whitespace inside a number is ignored, not treated as a separator. */
    expect(value("1 23", "es-ES")).toBe(123);
  });

  it("preserves plain exponent notation", () => {
    expect(value("1e3", "en-US")).toBe(1000);
    expect(value("1,5e3", "es-ES")).toBe(1500);
    expect(value("-2.5e2", "en-US")).toBe(-250);
    expect(value("1e-3", "en-US")).toBe(0.001);
    expect(value("2,5e-2", "es-ES")).toBe(0.025);
    expect(value("+1,5e3", "es-ES")).toBe(1500);
  });

  it("applies the same separator rules to the exponent mantissa", () => {
    /* Same mantissa as the bare number in that locale, then scaled. */
    expect(value("1,234e2", "en-US")).toBe(123400);
    expect(value("1.234e2", "es-ES")).toBe(123400);
    expect(value("1,234e2", "es-ES")).toBe(123.4);
    expect(value("1.234e2", "en-US")).toBe(123.4);
  });

  it("parses integers and zero", () => {
    expect(value("0", "en-US")).toBe(0);
    expect(value("1999", "es-ES")).toBe(1999);
    expect(value("-0", "en-US")).toBe(-0);
    expect(value("0,00", "es-ES")).toBe(0);
    expect(value("-0,00", "es-ES")).toBe(-0);
  });

  it("parses missing integer and fraction parts", () => {
    expect(value(".5", "en-US")).toBe(0.5);
    expect(value("-.5", "en-US")).toBe(-0.5);
    expect(value("5.", "en-US")).toBe(5);
    expect(value("5,", "es-ES")).toBe(5);
    expect(value(",5", "en-US")).toBe(0.5);
  });

  it("rejects empty, non-numeric, and non-finite input", () => {
    for (const raw of ["", "   ", "abc", "12a", "1e999", "--1", "1+"]) {
      expect(issue(raw, "en-US"), raw).toBe("invalid");
    }
  });

  it("rejects multiple decimal separators, including signed input", () => {
    expect(issue("1.2.3", "en-US")).toBe("invalid");
    expect(issue("1,2,3", "es-ES")).toBe("invalid");
    expect(issue("-1,2,3", "es-ES")).toBe("invalid");
    expect(issue("+1.2.3", "en-US")).toBe("invalid");
  });

  it("rejects ambiguous grouping instead of guessing", () => {
    expect(issue("1,23,456", "en-US")).toBe("ambiguous");
    expect(issue("1.23.456", "es-ES")).toBe("ambiguous");
    expect(issue("12,34,567", "en-US")).toBe("ambiguous");
    expect(issue("12.34.567", "es-ES")).toBe("ambiguous");
    expect(issue("1,234.56.7", "en-US")).toBe("ambiguous");
    expect(issue("1.234.56,7", "es-ES")).toBe("ambiguous");
  });

  it("rejects malformed exponent notation", () => {
    for (const raw of ["1e", "e3", "1e+", "1E", "1e2.5", "1.2.3e4"]) {
      expect(issue(raw, "en-US"), raw).toBe("invalid");
    }
    expect(issue("1,23,456e2", "en-US")).toBe("ambiguous");
  });
});
