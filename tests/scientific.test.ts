import { describe, expect, it } from "vitest";
import {
  MAX_EXPRESSION_LENGTH,
  MAX_FACTORIAL,
  MAX_NESTING_DEPTH,
  evaluateScientific,
  formatScientificValue,
  serializeScientificValue,
  type AngleMode,
  type ScientificIssue,
} from "../src/lib/scientific";

const value = (expression: string, angleMode: AngleMode = "degrees") => {
  const result = evaluateScientific(expression, angleMode);
  expect(result.ok, `${expression} should evaluate`).toBe(true);
  return result.ok ? result.value : Number.NaN;
};

const issue = (expression: string, angleMode: AngleMode = "degrees") => {
  const result = evaluateScientific(expression, angleMode);
  expect(result.ok, `${expression} should fail`).toBe(false);
  return result.ok ? null : result.issue;
};

describe("scientific arithmetic", () => {
  it("respects operator precedence", () => {
    expect(value("2+3*4")).toBe(14);
    expect(value("(2+3)*4")).toBe(20);
    expect(value("10-6/2")).toBe(7);
    expect(value("2+3*4^2")).toBe(50);
  });

  it("handles decimals, signs, and unary operators", () => {
    expect(value("0.1+0.2")).toBeCloseTo(0.3, 15);
    expect(value("-5+3")).toBe(-2);
    expect(value("--5")).toBe(5);
    expect(value("+-5")).toBe(-5);
    expect(value("2*-3")).toBe(-6);
    expect(value("-(2+3)")).toBe(-5);
  });

  it("handles nested parentheses", () => {
    expect(value("((2+3)*(4-1))^2")).toBe(225);
    expect(value("2*(3+(4*(5-1)))")).toBe(38);
  });

  it("treats powers as right-associative and unary minus below power", () => {
    expect(value("2^3^2")).toBe(512);
    expect(value("-2^2")).toBe(-4);
    expect(value("(-2)^2")).toBe(4);
    expect(value("2^-3")).toBe(0.125);
  });

  it("supports percentages as a postfix operator", () => {
    expect(value("50%")).toBe(0.5);
    expect(value("200*10%")).toBe(20);
    expect(value("200+10%")).toBe(200.1);
  });

  it("supports constants and Unicode input", () => {
    expect(value("pi")).toBeCloseTo(Math.PI, 15);
    expect(value("π")).toBeCloseTo(Math.PI, 15);
    expect(value("e")).toBeCloseTo(Math.E, 15);
    expect(value("2×3")).toBe(6);
    expect(value("8÷2")).toBe(4);
    expect(value("√(9)")).toBe(3);
    expect(value("2−3")).toBe(-1);
  });
});

describe("scientific functions", () => {
  it("computes square roots, cube roots, and nth roots", () => {
    expect(value("sqrt(81)")).toBe(9);
    expect(value("cbrt(27)")).toBe(3);
    expect(value("cbrt(-27)")).toBe(-3);
    expect(value("root(4, 16)")).toBe(2);
    expect(value("root(3, -8)")).toBe(-2);
  });

  it("computes powers and reciprocals", () => {
    expect(value("3^4")).toBe(81);
    expect(value("2^0.5")).toBeCloseTo(Math.SQRT2, 15);
    expect(value("1/(4)")).toBe(0.25);
    expect(value("1/(2+2)")).toBe(0.25);
  });

  it("computes factorials within the supported range", () => {
    expect(value("0!")).toBe(1);
    expect(value("1!")).toBe(1);
    expect(value("5!")).toBe(120);
    expect(value("3!!")).toBe(720);
    expect(value(`${MAX_FACTORIAL}!`)).toBeGreaterThan(1e306);
  });

  it("computes absolute values, exponentials, and logarithms", () => {
    expect(value("abs(-7)")).toBe(7);
    expect(value("exp(1)")).toBeCloseTo(Math.E, 15);
    expect(value("ln(e)")).toBeCloseTo(1, 15);
    expect(value("log(1000)")).toBe(3);
    expect(value("log10(100)")).toBe(2);
  });

  it("computes trigonometric and hyperbolic functions", () => {
    expect(value("sin(30)")).toBeCloseTo(0.5, 15);
    expect(value("cos(60)")).toBeCloseTo(0.5, 15);
    expect(value("tan(45)")).toBeCloseTo(1, 15);
    expect(value("sinh(0)")).toBe(0);
    expect(value("cosh(0)")).toBe(1);
    expect(value("tanh(0)")).toBe(0);
  });

  it("removes floating-point residues at quadrant boundaries", () => {
    expect(value("cos(90)")).toBe(0);
    expect(value("sin(180)")).toBe(0);
    expect(value("tan(180)")).toBe(0);
    expect(value("sin(270)")).toBe(-1);
    expect(value("cos(pi/2)", "radians")).toBe(0);
    expect(value("sin(pi)", "radians")).toBe(0);
  });
});

describe("angle modes", () => {
  it("uses degrees or radians for trigonometric input", () => {
    expect(value("sin(90)", "degrees")).toBeCloseTo(1, 15);
    expect(value("sin(pi/2)", "radians")).toBeCloseTo(1, 15);
    expect(value("cos(pi)", "radians")).toBeCloseTo(-1, 15);
    expect(value("sin(90)", "degrees")).not.toBeCloseTo(
      value("sin(90)", "radians"),
      2,
    );
  });

  it("returns inverse trigonometric results in the selected mode", () => {
    expect(value("asin(0.5)", "degrees")).toBeCloseTo(30, 12);
    expect(value("acos(0.5)", "degrees")).toBeCloseTo(60, 12);
    expect(value("atan(1)", "degrees")).toBeCloseTo(45, 12);
    expect(value("asin(0.5)", "radians")).toBeCloseTo(Math.PI / 6, 15);
    expect(value("atan(1)", "radians")).toBeCloseTo(Math.PI / 4, 15);
  });

  it("rejects tangent at undefined angles", () => {
    expect(issue("tan(90)", "degrees")).toBe("domain");
    expect(issue("tan(270)", "degrees")).toBe("domain");
    expect(issue("tan(pi/2)", "radians")).toBe("domain");
  });
});

describe("invalid input and numerical boundaries", () => {
  it("rejects empty and malformed expressions", () => {
    expect(evaluateScientific("")).toEqual({ ok: false, issue: "empty" });
    expect(evaluateScientific("   ")).toEqual({ ok: false, issue: "empty" });
    expect(issue("2+")).toBe("invalid");
    expect(issue("(2+3")).toBe("invalid");
    expect(issue("2**3")).toBe("invalid");
    expect(issue("2(3)")).toBe("invalid");
    expect(issue("sin()")).toBe("invalid");
    expect(issue("unknown(2)")).toBe("invalid");
    expect(issue("2=2")).toBe("invalid");
  });

  it("rejects division by zero", () => {
    expect(issue("1/0")).toBe("division-by-zero");
    expect(issue("0/0")).toBe("division-by-zero");
    expect(issue("5/(2-2)")).toBe("division-by-zero");
  });

  it("rejects invalid domains", () => {
    const domainCases: Array<[string, ScientificIssue]> = [
      ["sqrt(-1)", "domain"],
      ["root(2, -1)", "domain"],
      ["ln(0)", "domain"],
      ["log(-10)", "domain"],
      ["asin(2)", "domain"],
      ["acos(-2)", "domain"],
      ["acosh(0)", "domain"],
      ["atanh(1)", "domain"],
      ["(-1)^0.5", "domain"],
    ];
    for (const [expression, expected] of domainCases) {
      expect(issue(expression), expression).toBe(expected);
    }
  });

  it("rejects factorial values outside the supported range", () => {
    expect(issue(`${MAX_FACTORIAL + 1}!`)).toBe("factorial-range");
    expect(issue("(-1)!")).toBe("factorial-range");
    expect(issue("2.5!")).toBe("factorial-range");
  });

  it("rejects overflow and non-finite results", () => {
    expect(issue("1e309")).toBe("overflow");
    expect(issue("1e308*10")).toBe("overflow");
    expect(issue("10^400")).toBe("overflow");
    expect(issue("cosh(1000)")).toBe("overflow");
  });

  it("enforces expression and nesting limits", () => {
    expect(issue("1+".repeat(MAX_EXPRESSION_LENGTH) + "1")).toBe("limits");
    const nested = `${"(".repeat(MAX_NESTING_DEPTH)}1${")".repeat(
      MAX_NESTING_DEPTH,
    )}`;
    expect(value(nested)).toBe(1);
    expect(
      issue(
        `${"(".repeat(MAX_NESTING_DEPTH + 1)}1${")".repeat(
          MAX_NESTING_DEPTH + 1,
        )}`,
      ),
    ).toBe("limits");
  });
});

describe("display formatting and serialization", () => {
  it("removes binary floating-point artifacts from display", () => {
    expect(formatScientificValue(0.1 + 0.2, "en-US")).toBe("0.3");
    expect(formatScientificValue(1 / 3, "en-US")).toBe("0.333333333333");
    expect(formatScientificValue(1 / 3, "es-ES")).toBe("0,333333333333");
  });

  it("uses scientific notation for very large and very small values", () => {
    expect(formatScientificValue(1e12, "en-US")).toMatch(/^1E12$/i);
    expect(formatScientificValue(1e-10, "en-US")).toMatch(/^1E-10$/i);
    expect(formatScientificValue(-0, "en-US")).toBe("0");
  });

  it("serializes values that can be parsed back into expressions", () => {
    expect(serializeScientificValue(0.1 + 0.2)).toBe("0.3");
    expect(serializeScientificValue(-0)).toBe("0");
    expect(serializeScientificValue(1e306)).toBe("1e+306");
    expect(value(serializeScientificValue(1e306))).toBe(1e306);
  });
});
