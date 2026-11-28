import { describe, expect, it } from "vitest";
import {
  calculateGpa,
  DEFAULT_GPA_GRADES,
  DEFAULT_GPA_MAX,
  defaultGpaGrades,
  formatCredits,
  formatGpa,
  formatGradePoints,
  GPA_MAX_COURSES,
  validateGpaScale,
  type GpaScale,
} from "../src/lib/gpa";

/*
 * GPA contract: independent weighted reference values, credit weighting,
 * zero-point grades, decimal credits, custom scales, display rounding,
 * invalid course rows, and grading-scale validation.
 */

const defaultScale: GpaScale = {
  name: "4.0 letter scale",
  max: DEFAULT_GPA_MAX,
  grades: defaultGpaGrades(),
};

describe("DEFAULT_GPA_GRADES", () => {
  it("contains the documented 4.0 example mapping", () => {
    expect(DEFAULT_GPA_GRADES).toHaveLength(13);
    expect(DEFAULT_GPA_GRADES).toEqual([
      { label: "A+", points: 4.0 },
      { label: "A", points: 4.0 },
      { label: "A−", points: 3.7 },
      { label: "B+", points: 3.3 },
      { label: "B", points: 3.0 },
      { label: "B−", points: 2.7 },
      { label: "C+", points: 2.3 },
      { label: "C", points: 2.0 },
      { label: "C−", points: 1.7 },
      { label: "D+", points: 1.3 },
      { label: "D", points: 1.0 },
      { label: "D−", points: 0.7 },
      { label: "F", points: 0.0 },
    ]);
  });

  it("returns a fresh copy", () => {
    const first = defaultGpaGrades();
    first[0]!.points = 1;
    expect(defaultGpaGrades()[0]!.points).toBe(4);
  });
});

describe("calculateGpa", () => {
  it("calculates a single course", () => {
    expect(
      calculateGpa([{ credits: 3, gradeLabel: "A" }], defaultScale),
    ).toEqual({ ok: true, gpa: 4, totalCredits: 3, courseCount: 1 });
  });

  it("calculates a weighted mixed-credit GPA", () => {
    const result = calculateGpa(
      [
        { credits: 3, gradeLabel: "A" },
        { credits: 4, gradeLabel: "B" },
        { credits: 3, gradeLabel: "C" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.gpa).toBe(3);
    expect(result.totalCredits).toBe(10);
    expect(result.courseCount).toBe(3);
    expect(formatGpa(result.gpa, "en-US")).toBe("3.00");
  });

  it("handles equal-credit courses", () => {
    const result = calculateGpa(
      [
        { credits: 3, gradeLabel: "A" },
        { credits: 3, gradeLabel: "B" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.gpa).toBe(3.5);
      expect(result.totalCredits).toBe(6);
    }
  });

  it("handles unequal credits", () => {
    const result = calculateGpa(
      [
        { credits: 2, gradeLabel: "A" },
        { credits: 3, gradeLabel: "C" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.gpa).toBe(2.8);
  });

  it("keeps zero grade points in the weighted average", () => {
    const result = calculateGpa(
      [
        { credits: 3, gradeLabel: "A" },
        { credits: 3, gradeLabel: "F" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.gpa).toBe(2);
  });

  it("supports decimal credit hours", () => {
    const result = calculateGpa(
      [
        { credits: 1.5, gradeLabel: "A" },
        { credits: 2.5, gradeLabel: "B" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.gpa).toBe(3.375);
    expect(result.totalCredits).toBe(4);
    expect(formatGpa(result.gpa, "en-US")).toBe("3.38");
  });

  it("uses a custom maximum and custom mappings", () => {
    const scale: GpaScale = {
      name: "5.0 example",
      max: 5,
      grades: [
        { label: "A", points: 5 },
        { label: "B", points: 4 },
        { label: "C", points: 3 },
      ],
    };
    const result = calculateGpa(
      [
        { credits: 3, gradeLabel: "A" },
        { credits: 1, gradeLabel: "C" },
      ],
      scale,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.gpa).toBe(4.5);
      expect(formatGpa(result.gpa, "en-US")).toBe("4.50");
    }
  });

  it("accepts a grade point value equal to the scale maximum", () => {
    const scale: GpaScale = {
      name: "5.0 example",
      max: 5,
      grades: [{ label: "A", points: 5 }],
    };
    expect(
      calculateGpa([{ credits: 3, gradeLabel: "A" }], scale),
    ).toMatchObject({
      ok: true,
      gpa: 5,
    });
  });

  it("rejects empty and invalid course lists", () => {
    expect(calculateGpa([], defaultScale)).toEqual({
      ok: false,
      issues: [{ index: -1, code: "noCourses" }],
    });

    for (const credits of [
      0,
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      0.05,
      30.1,
    ]) {
      expect(
        calculateGpa([{ credits, gradeLabel: "A" }], defaultScale).ok,
        String(credits),
      ).toBe(false);
    }

    expect(
      calculateGpa([{ credits: 3, gradeLabel: "" }], defaultScale).ok,
    ).toBe(false);
    expect(
      calculateGpa([{ credits: 3, gradeLabel: "Z" }], defaultScale).ok,
    ).toBe(false);
  });

  it("never returns a partial GPA when one row is invalid", () => {
    const result = calculateGpa(
      [
        { credits: 3, gradeLabel: "A" },
        { credits: 0, gradeLabel: "B" },
      ],
      defaultScale,
    );
    expect(result.ok).toBe(false);
  });

  it("keeps the 30-course limit constant available to the UI", () => {
    expect(GPA_MAX_COURSES).toBe(30);
  });
});

describe("validateGpaScale", () => {
  it("accepts the default scale and zero-point grades", () => {
    expect(validateGpaScale(defaultScale)).toEqual([]);
    expect(
      validateGpaScale({
        name: "Pass/fail",
        max: 1,
        grades: [{ label: "P", points: 0 }],
      }),
    ).toEqual([]);
  });

  it("requires a non-empty scale name", () => {
    expect(
      validateGpaScale({ ...defaultScale, name: "   " }).map((i) => i.code),
    ).toContain("nameRequired");
  });

  it("rejects invalid and unreasonable maxima", () => {
    for (const max of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(
        validateGpaScale({ ...defaultScale, max }).map((i) => i.code),
        String(max),
      ).toContain("maxInvalid");
    }
    expect(
      validateGpaScale({ ...defaultScale, max: 101 }).map((i) => i.code),
    ).toContain("maxRange");
  });

  it("requires at least one valid grade", () => {
    expect(
      validateGpaScale({ name: "Empty", max: 4, grades: [] }).map(
        (i) => i.code,
      ),
    ).toContain("noGrades");
    expect(
      validateGpaScale({
        name: "Invalid",
        max: 4,
        grades: [{ label: "", points: 4 }],
      }).map((i) => i.code),
    ).toContain("noGrades");
  });

  it("rejects empty and duplicate labels, ignoring case", () => {
    const issues = validateGpaScale({
      name: "Custom",
      max: 4,
      grades: [
        { label: "A", points: 4 },
        { label: "a", points: 3.7 },
        { label: " ", points: 3 },
      ],
    });
    expect(issues.some((i) => i.code === "labelDuplicate")).toBe(true);
    expect(issues.some((i) => i.code === "labelRequired")).toBe(true);
  });

  it("rejects negative, non-finite and over-maximum points", () => {
    for (const points of [-1, Number.NaN, Number.POSITIVE_INFINITY, 4.1]) {
      const issues = validateGpaScale({
        name: "Custom",
        max: 4,
        grades: [{ label: "A", points }],
      });
      expect(issues.length, String(points)).toBeGreaterThan(0);
    }
  });

  it("preserves zero points as a valid mapping", () => {
    expect(
      validateGpaScale({
        name: "Custom",
        max: 4,
        grades: [{ label: "F", points: 0 }],
      }),
    ).toEqual([]);
  });
});

describe("formatting", () => {
  it("rounds GPA to two decimals in both locales", () => {
    expect(formatGpa(3.375, "en-US")).toBe("3.38");
    expect(formatGpa(3.5, "en-US")).toBe("3.50");
    expect(formatGpa(3.375, "es-ES")).toBe("3,38");
    expect(formatGpa(4, "es-ES")).toBe("4,00");
  });

  it("formats credit totals and grade points", () => {
    expect(formatCredits(12.5, "en-US")).toBe("12.5");
    expect(formatCredits(10, "es-ES")).toBe("10");
    expect(formatGradePoints(4, "en-US")).toBe("4.0");
    expect(formatGradePoints(3.75, "es-ES")).toBe("3,75");
  });
});
