/*
 * Weighted GPA calculation and grading-scale validation.
 *
 * Contract:
 * - GPA = Σ(credits × grade points) / Σ(credits).
 * - Full precision is kept internally; only the displayed GPA is rounded to
 *   two decimal places.
 * - Course credit hours must be finite, positive and within the documented
 *   per-course range. Grade labels must exist in the active scale.
 * - Scale labels are unique ignoring case; points are finite, non-negative
 *   and no higher than the configured scale maximum.
 * - Incomplete or invalid course rows are rejected, never dropped silently.
 *
 * Grading systems differ by institution and country. The default 4.0 mapping
 * is a common example, not a universal standard.
 */

export interface GpaGrade {
  label: string;
  points: number;
}

export interface GpaScale {
  name: string;
  max: number;
  grades: readonly GpaGrade[];
}

export interface GpaCourse {
  credits: number;
  gradeLabel: string;
}

export type GpaCourseIssueCode =
  | "creditsInvalid"
  | "creditsRange"
  | "gradeRequired"
  | "gradeUnknown"
  | "noCourses";

export interface GpaCourseIssue {
  /** Index into the supplied course array, or -1 for no courses. */
  index: number;
  code: GpaCourseIssueCode;
}

export type GpaScaleIssueCode =
  | "nameRequired"
  | "maxInvalid"
  | "maxRange"
  | "noGrades"
  | "labelRequired"
  | "labelDuplicate"
  | "pointsInvalid"
  | "pointsRange";

export interface GpaScaleIssue {
  field: "name" | "max" | "grades";
  /** Grade-row index when field is "grades". */
  index?: number;
  code: GpaScaleIssueCode;
}

export type GpaResult =
  | {
      ok: true;
      gpa: number;
      totalCredits: number;
      courseCount: number;
    }
  | { ok: false; issues: GpaCourseIssue[] };

export const GPA_MIN_CREDITS = 0.1;
export const GPA_MAX_CREDITS = 30;
export const GPA_MAX_COURSES = 30;
export const GPA_SCALE_MAX_LIMIT = 100;
export const DEFAULT_GPA_MAX = 4;

/** Common example 4.0 letter scale. Not a universal institutional standard. */
export const DEFAULT_GPA_GRADES: readonly GpaGrade[] = [
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
];

export function defaultGpaGrades(): GpaGrade[] {
  return DEFAULT_GPA_GRADES.map((grade) => ({ ...grade }));
}

export function validateGpaScale(scale: GpaScale): GpaScaleIssue[] {
  const issues: GpaScaleIssue[] = [];
  const name = scale.name.trim();

  if (name === "") {
    issues.push({ field: "name", code: "nameRequired" });
  }

  const maxValid = Number.isFinite(scale.max) && scale.max > 0;
  if (!maxValid) {
    issues.push({ field: "max", code: "maxInvalid" });
  } else if (scale.max > GPA_SCALE_MAX_LIMIT) {
    issues.push({ field: "max", code: "maxRange" });
  }

  const seen = new Map<string, number>();
  let validGrades = 0;

  scale.grades.forEach((grade, index) => {
    const label = grade.label.trim();
    let labelValid = false;
    let pointsValid = false;

    if (label === "") {
      issues.push({ field: "grades", index, code: "labelRequired" });
    } else {
      const key = label.toLowerCase();
      if (seen.has(key)) {
        issues.push({ field: "grades", index, code: "labelDuplicate" });
      } else {
        seen.set(key, index);
        labelValid = true;
      }
    }

    if (!Number.isFinite(grade.points) || grade.points < 0) {
      issues.push({ field: "grades", index, code: "pointsInvalid" });
    } else if (maxValid && grade.points > scale.max) {
      issues.push({ field: "grades", index, code: "pointsRange" });
    } else {
      pointsValid = true;
    }

    if (labelValid && pointsValid) validGrades += 1;
  });

  if (scale.grades.length === 0 || validGrades === 0) {
    issues.push({ field: "grades", code: "noGrades" });
  }

  return issues;
}

export function calculateGpa(
  courses: readonly GpaCourse[],
  scale: GpaScale,
): GpaResult {
  if (courses.length === 0) {
    return { ok: false, issues: [{ index: -1, code: "noCourses" }] };
  }

  const pointsByLabel = new Map(
    scale.grades.map((grade) => [grade.label, grade.points]),
  );
  const issues: GpaCourseIssue[] = [];
  let totalCredits = 0;
  let weightedPoints = 0;

  courses.forEach((course, index) => {
    if (!Number.isFinite(course.credits) || course.credits <= 0) {
      issues.push({ index, code: "creditsInvalid" });
    } else if (
      course.credits < GPA_MIN_CREDITS ||
      course.credits > GPA_MAX_CREDITS
    ) {
      issues.push({ index, code: "creditsRange" });
    }

    if (course.gradeLabel === "") {
      issues.push({ index, code: "gradeRequired" });
    } else {
      const points = pointsByLabel.get(course.gradeLabel);
      if (points === undefined || !Number.isFinite(points)) {
        issues.push({ index, code: "gradeUnknown" });
      } else if (
        !issues.some(
          (issue) =>
            issue.index === index &&
            (issue.code === "creditsInvalid" || issue.code === "creditsRange"),
        )
      ) {
        totalCredits += course.credits;
        weightedPoints += course.credits * points;
      }
    }
  });

  if (issues.length > 0) return { ok: false, issues };

  const gpa = weightedPoints / totalCredits;
  if (!Number.isFinite(gpa) || totalCredits <= 0) {
    return { ok: false, issues: [{ index: -1, code: "noCourses" }] };
  }

  return { ok: true, gpa, totalCredits, courseCount: courses.length };
}

/** Display GPA with exactly two fraction digits. */
export function formatGpa(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Display credit totals without forcing trailing zeros. */
export function formatCredits(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    maximumFractionDigits: 2,
  }).format(value);
}

/** Display grade points with at least one and at most two fraction digits. */
export function formatGradePoints(value: number, intlLocale = "en-US"): string {
  return new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
}
