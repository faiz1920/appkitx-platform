import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  getLocale,
  locales,
  PROVISIONAL_LOCALES,
} from "../src/i18n/config";
import {
  translationRegistryIssues,
  validateTranslationRegistry,
} from "../src/i18n/translation-reviews";

/*
 * M6 translation provenance invariants. The shipped registry must be clean,
 * Spanish must remain explicitly provisional with no invented review, and
 * the validator must reject incomplete or misleading review records.
 */

describe("shipped translation registry", () => {
  it("passes every provenance invariant", () => {
    expect(translationRegistryIssues()).toEqual([]);
  });

  it("treats English as the source language", () => {
    const english = getLocale(defaultLocale);
    expect(english.translation.status).toBe("source");
    expect(english.translation.review).toBeUndefined();
  });

  it("keeps Spanish provisional without a review record", () => {
    const spanish = getLocale("es");
    expect(spanish.translation.status).toBe("provisional");
    expect(spanish.translation.review).toBeUndefined();
  });

  it("allowlists Spanish as the only provisional locale", () => {
    expect(Object.keys(PROVISIONAL_LOCALES)).toEqual(["es"]);
    expect(PROVISIONAL_LOCALES.es.reason).toMatch(
      /online translation service/i,
    );
    expect(PROVISIONAL_LOCALES.es.reason).toMatch(/native-speaker review/i);
  });

  it("keeps the allowlist in sync with the registry", () => {
    for (const code of Object.keys(PROVISIONAL_LOCALES)) {
      expect(Object.hasOwn(locales, code)).toBe(true);
    }
    for (const [code, meta] of Object.entries(locales)) {
      if (meta.translation.status === "provisional") {
        expect(Object.hasOwn(PROVISIONAL_LOCALES, code)).toBe(true);
      }
    }
  });
});

describe("validateTranslationRegistry", () => {
  const source = { translation: { status: "source" } };
  const provisional = { translation: { status: "provisional" } };

  it("accepts a complete reviewed record", () => {
    const issues = validateTranslationRegistry(
      {
        en: source,
        es: {
          translation: {
            status: "reviewed",
            review: {
              reviewer: "Reviewer name",
              reviewerType: "native-speaker",
              reviewedAt: "2026-10-18",
              scope: "dictionary and category copy @ abc1234",
              verdict: "approved",
            },
          },
        },
      },
      {},
    );
    expect(issues).toEqual([]);
  });

  it("rejects a reviewed locale without a review record", () => {
    const issues = validateTranslationRegistry(
      { en: source, es: { translation: { status: "reviewed" } } },
      {},
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ locale: "es", field: "review" }),
    );
  });

  it("rejects incomplete review fields", () => {
    const issues = validateTranslationRegistry(
      {
        en: source,
        es: {
          translation: {
            status: "reviewed",
            review: {
              reviewer: " ",
              reviewerType: "robot",
              reviewedAt: "18/10/2026",
              scope: "",
              verdict: "looks fine",
              notes: "",
            },
          },
        },
      },
      {},
    );
    const fields = issues.map((issue) => issue.field);
    expect(fields).toEqual(
      expect.arrayContaining([
        "reviewer",
        "reviewerType",
        "reviewedAt",
        "scope",
        "verdict",
        "notes",
      ]),
    );
  });

  it("requires provisional locales to be allowlisted and unreviewed", () => {
    const notAllowlisted = validateTranslationRegistry(
      { en: source, es: provisional },
      {},
    );
    expect(notAllowlisted).toContainEqual(
      expect.objectContaining({ locale: "es", field: "allowlist" }),
    );

    const claimsReview = validateTranslationRegistry(
      {
        en: source,
        es: {
          translation: {
            status: "provisional",
            review: { reviewer: "Someone" },
          },
        },
      },
      { es: { reason: "pending" } },
    );
    expect(claimsReview).toContainEqual(
      expect.objectContaining({ locale: "es", field: "review" }),
    );
  });

  it("rejects reviewed locales that remain allowlisted", () => {
    const issues = validateTranslationRegistry(
      {
        en: source,
        es: {
          translation: {
            status: "reviewed",
            review: {
              reviewer: "Reviewer",
              reviewerType: "native-speaker",
              reviewedAt: "2026-10-18",
              scope: "complete copy",
              verdict: "approved",
            },
          },
        },
      },
      { es: { reason: "stale" } },
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ locale: "es", field: "allowlist" }),
    );
  });

  it("keeps the source status exclusive to the default locale", () => {
    const issues = validateTranslationRegistry(
      { en: { translation: { status: "provisional" } }, es: source },
      { en: { reason: "wrong" } },
    );
    const messages = issues.map((issue) => issue.message).join(" ");
    expect(messages).toMatch(/default locale must be the source language/);
    expect(messages).toMatch(/only the default locale/);
  });

  it("rejects an allowlist entry that is not registered", () => {
    const issues = validateTranslationRegistry(
      { en: source },
      { es: { reason: "missing" } },
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ locale: "es", field: "allowlist" }),
    );
  });
});
