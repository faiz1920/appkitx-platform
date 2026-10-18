import { defaultLocale, PROVISIONAL_LOCALES, locales } from "./config";

/*
 * Pure validator for translation provenance (M6).
 *
 * The registry is the source of truth for what is served, but it does not
 * prove that a translation was reviewed. These checks make the difference
 * explicit:
 *
 * - the default locale is the source language and never carries a review;
 * - every other locale is either "provisional" (allowlisted, no review
 *   record, caveat documented) or "reviewed" (complete record);
 * - "reviewed" requires a non-empty reviewer, reviewer type, ISO date,
 *   scope, and verdict;
 * - the provisional allowlist and the registry cannot drift apart.
 *
 * Tests assert that the shipped registry produces zero issues. The same
 * function accepts fixtures so the rules themselves stay covered.
 */

export type TranslationIssueField =
  | "translation"
  | "status"
  | "review"
  | "reviewer"
  | "reviewerType"
  | "reviewedAt"
  | "scope"
  | "verdict"
  | "notes"
  | "allowlist";

export interface TranslationIssue {
  locale: string;
  field: TranslationIssueField;
  message: string;
}

/**
 * Loose input shape so tests can exercise invalid records; the shipped
 * registry is one valid instance of it.
 */
export interface TranslationRegistryEntry {
  translation?: {
    status?: string;
    review?: Record<string, unknown>;
  };
}

const REVIEWER_TYPES = [
  "native-speaker",
  "professional-translator",
  "fluent-reviewer",
] as const;

const VERDICTS = ["approved", "approved-with-fixes"] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed);
}

function isMember<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return (
    typeof value === "string" && (allowed as readonly string[]).includes(value)
  );
}

export function validateTranslationRegistry(
  registry: Record<string, TranslationRegistryEntry> = locales,
  allowlist: Record<string, unknown> = PROVISIONAL_LOCALES,
): TranslationIssue[] {
  const issues: TranslationIssue[] = [];

  for (const [code, entry] of Object.entries(registry)) {
    const translation = entry.translation;
    if (translation === undefined) {
      issues.push({
        locale: code,
        field: "translation",
        message: "translation provenance is required",
      });
      continue;
    }

    const { status, review } = translation;
    if (status === undefined) {
      issues.push({
        locale: code,
        field: "status",
        message: "translation status is required",
      });
      continue;
    }

    if (code === defaultLocale) {
      if (status !== "source") {
        issues.push({
          locale: code,
          field: "status",
          message: "the default locale must be the source language",
        });
      }
      if (review !== undefined) {
        issues.push({
          locale: code,
          field: "review",
          message: "the source language must not carry a review record",
        });
      }
      continue;
    }

    if (status === "source") {
      issues.push({
        locale: code,
        field: "status",
        message: "only the default locale may use the source status",
      });
      continue;
    }

    if (status === "provisional") {
      if (!Object.hasOwn(allowlist, code)) {
        issues.push({
          locale: code,
          field: "allowlist",
          message: "provisional locales must be explicitly allowlisted",
        });
      }
      if (review !== undefined) {
        issues.push({
          locale: code,
          field: "review",
          message: "a provisional locale must not claim a review record",
        });
      }
      continue;
    }

    if (status !== "reviewed") {
      issues.push({
        locale: code,
        field: "status",
        message: `unknown translation status: ${String(status)}`,
      });
      continue;
    }

    if (review === undefined) {
      issues.push({
        locale: code,
        field: "review",
        message: "a reviewed locale requires a complete review record",
      });
      continue;
    }

    if (!isNonEmptyString(review.reviewer)) {
      issues.push({
        locale: code,
        field: "reviewer",
        message: "reviewer must be a non-empty name or verified handle",
      });
    }
    if (!isMember(review.reviewerType, REVIEWER_TYPES)) {
      issues.push({
        locale: code,
        field: "reviewerType",
        message: "reviewerType must be a supported reviewer type",
      });
    }
    if (!isValidIsoDate(review.reviewedAt)) {
      issues.push({
        locale: code,
        field: "reviewedAt",
        message: "reviewedAt must be an ISO 8601 date (YYYY-MM-DD)",
      });
    }
    if (!isNonEmptyString(review.scope)) {
      issues.push({
        locale: code,
        field: "scope",
        message: "scope must identify what was reviewed",
      });
    }
    if (!isMember(review.verdict, VERDICTS)) {
      issues.push({
        locale: code,
        field: "verdict",
        message: "verdict must be approved or approved-with-fixes",
      });
    }
    if (review.notes !== undefined && !isNonEmptyString(review.notes)) {
      issues.push({
        locale: code,
        field: "notes",
        message: "notes must be non-empty when present",
      });
    }
    if (Object.hasOwn(allowlist, code)) {
      issues.push({
        locale: code,
        field: "allowlist",
        message:
          "reviewed locales must not remain on the provisional allowlist",
      });
    }
  }

  for (const code of Object.keys(allowlist)) {
    if (!Object.hasOwn(registry, code)) {
      issues.push({
        locale: code,
        field: "allowlist",
        message: "allowlisted locale is not registered",
      });
      continue;
    }
    const status = registry[code]?.translation?.status;
    if (status !== "provisional") {
      issues.push({
        locale: code,
        field: "allowlist",
        message: "allowlisted locale must have provisional status",
      });
    }
  }

  return issues;
}

export function translationRegistryIssues(): TranslationIssue[] {
  return validateTranslationRegistry(locales, PROVISIONAL_LOCALES);
}
