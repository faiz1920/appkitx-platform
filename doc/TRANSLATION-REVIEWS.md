# Translation reviews

This ledger records translation provenance and human review for every served locale. The machine-readable source of truth is `LocaleMeta.translation` in `src/i18n/config.ts`; this file carries the reviewer-facing checklist and the evidence behind that metadata.

Automated tests prove completeness, placeholder parity, and code-span parity. They never prove linguistic quality.

## Status ledger

| Locale         | URL     | Status      | Reviewer | Reviewed at | Scope | Verdict | Notes                                                                                                                                                                 |
| -------------- | ------- | ----------- | -------- | ----------- | ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English (`en`) | `/`     | Source      | —        | —           | —     | —       | Source language; no translation review applies.                                                                                                                       |
| Spanish (`es`) | `/es/…` | Provisional | —        | —           | —     | —       | Copy was compared against the English source using an online translation service. Native-speaker review has not been recorded; no native-speaker approval is claimed. |

`es` is the only locale in the explicit `PROVISIONAL_LOCALES` allowlist. A new locale must not be added to that allowlist without a documented product decision; the normal path is a complete review before registration.

## What a review record contains

Add the record to the locale's `translation` entry:

```ts
translation: {
  status: "reviewed",
  review: {
    reviewer: "Name or verified handle",
    reviewerType: "native-speaker", // or "professional-translator" | "fluent-reviewer"
    reviewedAt: "YYYY-MM-DD",
    scope: "src/i18n/dictionaries/es.ts @ <commit>, category copy, metadata",
    verdict: "approved", // or "approved-with-fixes"
    notes: "Optional: open items or follow-up scope",
  },
}
```

Rules enforced by `tests/translation-reviews.test.ts`:

- The default locale is `source` and never carries a review.
- `reviewed` requires non-empty reviewer, reviewer type, ISO date, scope, and verdict.
- `provisional` must have no review record and must be on the allowlist.
- A reviewed locale must not remain on the allowlist.
- The allowlist and registry cannot drift apart.

Record only what was verified. Only `reviewerType: "native-speaker"` permits the phrase “native-speaker reviewed”; a professional or fluent review is described as such. Never infer native status from a name, locale, or community role.

## Checklist

| Area                  | Check                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| Completeness          | Every key present; no unintended English; approved brand/technical terms only                           |
| Tokens and markup     | `{tokens}` preserved; backtick code spans preserved; punctuation around them correct                    |
| Navigation and UI     | Nav, footer, buttons, labels, chips, switcher: consistent glossary and tone; fits 320px                 |
| Calculator interface  | Mode labels, input labels/hints, validation errors, reset/copy feedback                                 |
| Formulas and examples | Wording and symbols correct; examples recalculated; arithmetic unchanged; no invented claims            |
| Number formatting     | Decimal separator, grouping, percent spacing, negatives, zero, display rounding; sample values verified |
| Metadata              | Page title, meta description, category title/description: accurate and natural; no keyword stuffing     |
| Category copy         | Category-specific, not template boilerplate; names match nav/footer/search                              |
| Search vocabulary     | Localized keywords; accented and common unaccented forms behave correctly                               |
| Accessibility strings | `aria-label`s, skip link, status messages, plural forms, screen-reader phrasing                         |
| Prose                 | Grammar, typography (quotes, dashes, percent spacing), inline code rendering, tone consistency          |
| Visual and SEO QA     | 320/768/desktop screenshots; keyboard; canonical/hreflang/x-default/sitemap; no English leakage         |

## Current review scope

At the time of this ledger update, the Spanish review covers the complete dictionary (`src/i18n/dictionaries/es.ts`), both tool pages, the calculators category page, homepage placeholders, navigation/footer, validation and error strings, metadata titles/descriptions, and search keywords.

## Release gate

A locale may be advertised as supported only when:

1. Its dictionary and every published category page are complete.
2. Placeholder and code-span parity tests pass.
3. `translation.status` is `reviewed` with a complete, committed review record, or it is the explicitly approved provisional exception.
4. Every route exists in the locale and alternates/sitemap pairs are verified.
5. Screenshots and keyboard/320px checks are recorded.
6. No open translation defects remain.

Spanish remains provisional until a review record above replaces this row. Do not mark it reviewed, remove the caveat, or claim native approval without that evidence.
