# M10.15.2 — Editorial, Accessibility, and Compliance Quality Review

Status: **repository-level review complete; independent reviews outstanding**.
Gate A remains **CONDITIONALLY READY — NOT PASSED**. Nothing was committed,
pushed, opened as a pull request, merged, or deployed.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Branch: `feature/m10-15-public-site-readiness`
- Baseline: `db3f2d805700d10dc1819c44570597604a93dc0f`
- Review window: **2026-11-02 to 2026-11-04**
- Deployment: **none**
- Amazon account, application, credentials, API call, affiliate link, or ASIN:
  **none**
- Legal pages: visible drafts with review notices in English and Spanish
- Companion register:
  [`PC-BUILDER-M10-15-2-LEGAL-REVIEW-REGISTER.md`](./PC-BUILDER-M10-15-2-LEGAL-REVIEW-REGISTER.md)

## 1. Scope and method

This review covers the M10.15/M10.15.1 public-site work on the feature branch:

- 10 English and 10 Spanish guides in `src/content/guides/`;
- bilingual guide indexes and article routes;
- About, Contact, Privacy, Terms, and Affiliate Disclosure in both locales;
- shared navigation, footer, language switcher, article and information layouts;
- SEO metadata, structured data, sitemap, canonical URLs, and hreflang;
- the new no-dependency accessibility suite and the existing e2e assertions;
- the legal/privacy drafts and the owner-input documentation.

Method:

1. Read every guide in both locales and checked claims, dates, byline, internal
   links, references, and disclosure wording.
2. Rechecked the 14 unique external reference URLs with HTTP requests.
3. Reviewed the rendered HTML and computed styles through Playwright, plus source
   review of landmarks, heading order, names, focus, targets, and motion.
4. Ran the full repository validation suite against the production build.
5. Compared the documentation with the confirmed Search Console and Cloudflare
   configuration records.

Limits: this is not an independent editorial, translation, accessibility, or
legal review. No Cloudflare dashboard, Google account, Search Console property,
mailbox, or legal agreement was accessed. No screen reader, 200% zoom,
high-contrast, or assistive-technology session was run. No axe-core dependency
was added.

## 2. English editorial audit

The English corpus is 10 guides and **15,291 prose words** (frontmatter
excluded). Every guide carries:

- the organizational byline **AppKitX Editorial**;
- genuine `published` and `updated` dates rendered as `<time datetime>`;
- a descriptive introduction, structured H2/H3 sections, caveats, internal
  links, and a references list;
- a disclosure note and an author note that describes the documentary research
  basis without claiming hands-on testing.

Findings:

| Area                         | Result                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Invented testing/benchmarks  | None found. The guides describe published specifications and trade-offs, not laboratory measurements or personal ownership.                            |
| Invented authors             | None. The only byline is the approved organizational identity.                                                                                         |
| Invented prices/availability | None. No price, stock, or retailer claim is made.                                                                                                      |
| Affiliate/Amazon claims      | None. No Amazon link, ASIN, tracking tag, program membership, or commission claim appears.                                                             |
| Factual correction           | The PSU guide conflated the ATX 3.0 and ATX 3.1 connector chronology. It now states that ATX 3.0 introduced 12VHPWR and ATX 3.1 revised it as 12V-2x6. |
| Dates                        | The PSU guide is updated `2026-11-02`; the other nine English guides remain `2026-11-01`.                                                              |

No further factual defect was identified in this repository-level pass. That is
not a substitute for an independent technical review against current
manufacturer documentation.

## 3. Spanish editorial audit

The Spanish corpus is 10 guides and **17,569 prose words** (frontmatter
excluded). All ten guides now carry `updated: 2026-11-02`.

The review used natural global Spanish rather than a literal translation.
Accepted hardware vocabulary includes **zócalo**, **placa base**, and **fuente de
alimentación**. English loanwords are retained only where they are the practical
term, and are clarified on first use.

Corrections made:

| Pattern                               | Correction                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `backplate`, `blower`, `stepping`     | Clarified on first use instead of appearing as unexplained English borrowings. |
| `timings`                             | `temporizaciones`                                                              |
| `poblar`                              | `ocupar`                                                                       |
| `pinout`                              | `asignación de pines`                                                          |
| `checksum`                            | `suma de comprobación`                                                         |
| `hold-up time`                        | `tiempo de retención`                                                          |
| `push-pull`                           | `empuje-succión`                                                               |
| `mesa de pruebas`                     | `banco de pruebas`                                                             |
| `display de códigos POST`             | `pantalla de códigos POST`                                                     |
| QVL references                        | Explained as the motherboard vendor's qualified-vendor list.                   |
| Grammar, gender, and number agreement | Corrected across the affected guides.                                          |

The Spanish locale remains **provisional**. A native or fluent independent
review is still required before publication; this audit does not certify
translation quality.

## 4. Technical source verification

The guides cite 14 unique external URLs. They were requested with browser-like
headers on 2026-11-04:

- **10 returned HTTP 200**: Microsoft DirectStorage, NVMe.org, SATA-IO, AMD
  Radeon, AMD Ryzen, CLEAResult 80 PLUS, Cybenetics, DisplayPort, Microsoft
  Windows 11 specifications, and NVIDIA GeForce.
- **4 returned HTTP 403** to automated requests: PCI-SIG specifications, Intel
  Core processor pages, and the two JEDEC standards pages. These sites use
  anti-bot protection; 403 is not evidence that the page is gone.
- Cybenetics returned 403 to a minimal request and 200 with a fuller browser-like
  request header set. It is counted as reachable.

The four 403 URLs remain canonical references and should be opened manually in a
browser before publication. The PSU correction was checked against the published
ATX 3.0/3.1 distinction; no other claim was changed in this pass.

## 5. Accessibility audit and remediation

No axe-core package is installed and no dependency was added. The audit combined
manual source review with a new Playwright suite,
`e2e/accessibility.spec.ts`, containing seven tests:

1. one H1, ordered headings, landmarks, and a working skip link;
2. accessible names for article and information layouts, plus current-language
   state;
3. accessible names for visible links, buttons, and form controls;
4. image `alt` attributes and decorative or named inline icons;
5. guide-card and primary-navigation focus-ring and target-size invariants;
6. reduced-motion behavior;
7. representative WCAG AA contrast pairings.

Defects found and fixed:

| Defect                                                                      | Fix                                                                     | File(s)                                                               |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Footer column headings were `h3` under the page `h1`, skipping a level.     | Changed to `h2`.                                                        | `src/components/Footer.astro`                                         |
| Current language used `aria-current="true"` instead of the page token.      | Changed to `aria-current="page"`; design-system wording updated.        | `src/components/LanguageSwitcher.astro`, `AppKitX-Design.md`          |
| The guide article container had no accessible name.                         | Added `aria-labelledby="guide-title"` and `id="guide-title"` on the H1. | `src/layouts/ArticleLayout.astro`                                     |
| The table-of-contents and information-rail `<nav>` elements were unlabeled. | Added direct `aria-label` values.                                       | `src/layouts/ArticleLayout.astro`, `src/layouts/InfoPageLayout.astro` |
| Header brand and navigation links were below the 44px target.               | Added `min-h-11` to the brand and navigation links.                     | `src/components/GlobalNav.astro`                                      |
| Footer text links had a small hit area.                                     | Added `min-h-6` (24px), the WCAG 2.2 AA minimum for inline text links.  | `src/components/Footer.astro`                                         |
| Existing tests asserted the old current-language token.                     | Updated to `aria-current="page"`.                                       | `e2e/language.spec.ts`                                                |
| Footer `h2` headings made unscoped H2 assertions ambiguous.                 | Scoped category-intro assertions to `main`.                             | `e2e/category.spec.ts`                                                |

Residual accessibility notes:

- Primary navigation, guide cards, language rows, and form controls meet the
  design system's 44px target. Footer text links meet the 24px WCAG 2.2 AA
  minimum; if the owner reads the 44px design rule as applying to footer text
  links, raise them before publication.
- Automated checks cannot prove screen-reader pronunciation, focus order across
  a full journey, 200% zoom reflow, or high-contrast behavior. Those remain part
  of the manual audit.
- Contrast checks cover representative pairs: `text-muted` on `surface` (4.76:1)
  and `surface-subtle` (4.55:1), accent on `surface` (5.47:1), warning on
  `warning-subtle` (4.84:1), and the focus ring on `surface` (3.74:1).
  `text-muted` on `surface-muted` (4.34:1) is disallowed and is not used for
  public text.

## 6. SEO, localization, and discoverability

- **52 indexable pages** and **52 sitemap URLs**. The 53rd build file is
  `404.html`.
- **26 translated paths × 2 locales**: 10 original tool/category paths, the guide
  index, 10 guide slugs, and 5 information pages.
- Every indexable page has one trailing-slash canonical matching the sitemap,
  reciprocal `en`/`es` alternates, and `x-default`.
- Both guide indexes and all 20 guide routes are in the sitemap. The 404 remains
  `noindex`.
- Article pages expose `Article` JSON-LD, localized `BreadcrumbList`,
  `og:type=article`, publication/modification timestamps, section, tags, and
  `inLanguage`. The guide indexes expose `CollectionPage`.
- The language switcher preserves the current page, stores the explicit choice
  under `appkitx.locale`, and marks the current row with `aria-current="page"`.
- No `/en` prefix, `/pc-builder` route, PC Builder link, or PC Builder sitemap
  entry exists in `dist`.
- No public HTML page mentions Nexverra, and no Amazon affiliate link or ASIN
  appears.
- `robots.txt` allows crawling and points to
  `https://appkitx.com/sitemap-index.xml`; the sitemap index references
  `sitemap-0.xml`.

Custom verification of the production build:

- 53 HTML files; 52 indexable pages; 52 sitemap URLs;
- 54 unique internal link targets; 0 broken internal links;
- 0 canonical, hreflang, reciprocity, or sitemap errors;
- 0 forbidden PC Builder, Nexverra, or Amazon-affiliate references.

## 7. Search Console documentation correction

The confirmed arrangement is now recorded consistently in `README.md`,
`PC-BUILDER-M10-15-OWNER-INPUTS.md`, `PC-BUILDER-M10-15-PUBLIC-SITE-READINESS.md`,
and both privacy locales:

- domain property **`appkitx.com`**;
- **`appkitx@gmail.com`** is the verified primary owner;
- the owner's personal Gmail remains a backup owner;
- verification uses a DNS TXT record managed through Cloudflare;
- `https://appkitx.com/sitemap-index.xml` was submitted successfully;
- the last read was **2026-10-29**, reporting **20 discovered pages**;
- `robots.txt` allows crawling;
- the sitemap index publicly references `sitemap-0.xml`;
- the page-indexing report was still processing.

RI-7 is therefore marked complete. The documentation no longer treats Search
Console ownership as an open item. It also does **not** claim that all pages are
indexed, that the M10.15 pages are in production, or that the undeployed branch
has affected the 20-page production count.

## 8. Legal and privacy preparation

The companion register records 24 page-level findings (LR-01 to LR-24), the
cross-cutting issues, 14 questions for counsel, and the owner inputs still
required. It is preparation only and is not legal advice.

Key unresolved items:

1. **Operating entity and address** — AppKitX is an independent brand, not yet
   legally registered. No entity, registered address, or registration number is
   invented.
2. **Cloudflare Web Analytics** — retention, cookies, legal basis, consent, and
   international transfers are unconfirmed. The policy must not call the service
   "cookieless" or "GDPR-compliant" without evidence.
3. **Production cookies** — the repository sets none, but the edge cookie set has
   not been inspected.
4. **CSP report retention** — reports go to the `appkitx_csp_reports` Analytics
   Engine dataset; retention and access controls are not configured or confirmed.
5. **Contact mailbox** — `appkitx@gmail.com` is confirmed as the public address,
   but mailbox ownership, two-factor authentication, access, retention, and
   Google's processing terms need review.
6. **Terms and liability** — browsewrap acceptance, the limitation of liability,
   and the intended India governing-law clause require counsel review.
7. **Affiliate disclosure** — the current page is explicitly future-use; the
   Amazon.in Associates wording and timing require separate review before any
   application or link.
8. **Spanish legal review** — English is the reference draft and Spanish is
   provisional; both locales need a recorded legal/translation review.

The privacy page now distinguishes the static build (no analytics script) from
the Cloudflare edge-injected Web Analytics beacon, and carries the draft date
**2026-11-02**. All legal pages retain visible review notices. Nothing in this
review claims legal compliance or authorizes an Amazon application.

## 9. Validation results

These are the final results for the production code on the branch. The quality
review document itself is documentation and does not affect the build.

| Command                                                     | Result                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm run format:check`                                      | Passed: all matched files use Prettier style                                 |
| `npm run check`                                             | Passed: 0 errors, 0 warnings, 0 hints (266 files)                            |
| `npm run build`                                             | Passed: 53 pages, sitemap index, CSP report-only header with 6 inline hashes |
| `npm test`                                                  | Passed: 48 test files, 849 tests                                             |
| `npm run test:e2e -- --workers=2 --reporter=line`           | Passed: 825/825 tests in about 3.0 minutes across Chromium, Firefox, WebKit  |
| Accessibility suite (`e2e/accessibility.spec.ts`)           | Passed: 21/21 across the three browsers                                      |
| Custom route/sitemap/canonical/hreflang/internal-link check | Passed: 0 errors                                                             |
| External reference URL check                                | 10 HTTP 200; 4 HTTP 403 to automated requests; no confirmed dead link        |

The e2e suite runs against the production build served by `wrangler dev`. A
stale `wrangler dev` process on port 4399 caused an earlier run to hang; it was
terminated before the final run. The final run used two workers for stability.

Visual proof captured by Playwright in `test-results/`:

- `guide-article-en-desktop.png`
- `guide-article-es-desktop.png`
- `guides-index.png`
- `guides-320.png`
- `privacy-en-desktop.png`
- `privacy-es-desktop.png`
- `info-320.png`

## 10. Guardrails and what was not changed

- `package.json`, `package-lock.json`, `wrangler.jsonc`, `public/_headers`,
  `astro.config.ts`, `src/worker.ts`, and the CSP integration have no diffs.
- No Cloudflare setting, CSP enforcement, HSTS, or security header was changed.
- No production deployment, publication, DNS change, or Search Console
  modification was made.
- The PC Builder remains mounted only by
  `src/integrations/pc-builder-dev-preview.ts` during `astro dev`; it has no
  public route, navigation entry, or sitemap entry.
- `PC-BUILDER-M10-13-AMAZON-IN-FEASIBILITY.md` is unchanged
  (SHA-256 `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee`).
- The M10.14 readiness gate and ASIN mapping template are unchanged.
- Nothing is staged, committed, pushed, or opened as a pull request.

## 11. Remaining external reviews

| Review                                    | Status   | Blocks Gate A? |
| ----------------------------------------- | -------- | -------------- |
| Privacy policy and analytics confirmation | Open     | Yes            |
| Terms, liability, and India jurisdiction  | Open     | Yes            |
| Affiliate disclosure wording              | Open     | Yes            |
| Independent editorial/technical review    | Open     | Yes            |
| Spanish translation review                | Open     | Yes            |
| Manual accessibility audit                | Open     | Recommended    |
| Release/merge/deployment approval         | Open     | Yes            |
| Search Console ownership and sitemap      | Complete | No             |

Gate B remains blocked: there is no Amazon.in Associates account, no qualifying
sales history, no Creators API credentials, and no India regional approval.
Gate C remains blocked: no ASIN mapping pilot is authorized and the template is
blank. Gates D and E remain blocked: no legal/policy approval or production
release approval exists.

## 12. Gate A assessment

**Status: CONDITIONALLY READY — NOT PASSED.**

| Gate A criterion                           | Status                  | M10.15.2 evidence                                                                    |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------ |
| Public, accessible, owned site             | Pass, ownership pending | Static site, no login/paywall, robots allow, sitemap                                 |
| Original content, not thin affiliate pages | Pass by inspection      | 20 guides, 32,860 prose words, 6 tools, 3 categories, no affiliate links             |
| PC-hardware relevance                      | Pass                    | CPU, GPU, motherboard, memory, storage, PSU, cooling, compatibility, first build     |
| At least 10 substantive posts/pages        | Pass by count           | 10 guides per locale plus tool and category pages                                    |
| Recent content and visible dates           | Pass                    | Published 2026-11-01; PSU EN and all Spanish guides updated 2026-11-02               |
| About page and brand identity              | Pass for wording        | Independent, unregistered brand; no invented entity or address                       |
| Contact page                               | Pass                    | `appkitx@gmail.com` in both locales                                                  |
| Privacy policy                             | Conditional             | Bilingual draft; legal/analytics confirmation pending                                |
| Terms of use                               | Conditional             | Bilingual draft; India intended, legal review pending                                |
| Affiliate disclosure                       | Pass as preparation     | Future-use page/component; no program or current-participation claim                 |
| Authorship and dates                       | Pass                    | AppKitX Editorial approved for both locales; no individual author invented           |
| Multilingual coverage                      | Pass                    | 10 guides and 5 information pages per locale; switcher, hreflang, sitemap            |
| Navigation and discoverability             | Pass                    | Localized Guides in nav/footer; Company/Legal in footer; internal links tested       |
| No dev-only PC Builder exposure            | Pass                    | No route, link, or sitemap entry in `dist`                                           |
| No policy/legal blockers                   | Not yet                 | Legal review, analytics confirmation, editorial/translation review, release approval |

Gate A moves to **PASSED** only when the legal drafts are reviewed, the
production analytics configuration is confirmed, the 20 guides and Spanish
translation receive independent review, the manual accessibility audit is
recorded, and release approval is given. A Gate A pass would authorize preparing
an Amazon.in Associates application; it would **not** authorize API access, live
integration, or a public PC Builder release.

## 13. PR #50 status

**No PR #50 exists.** `gh pr view 50` returns
`GraphQL: Could not resolve to a PullRequest with the number of 50.` The branch
has no upstream and has not been pushed. Nothing is staged or committed.

The working tree is ready for owner inspection, but it is **not ready for PR
review**: there is no PR to review, the external reviews above are outstanding,
and release approval has not been given. Do not merge or deploy.

## 14. Limitations and sign-off

This document records what the repository and automated checks can establish. It
does not replace:

- an independent English editorial/technical review;
- an independent Spanish translation review;
- a legal review of the privacy policy, terms, and affiliate disclosure;
- a manual assistive-technology, zoom, and high-contrast audit;
- confirmation of the production Cloudflare configuration, cookie set,
  retention, and transfer mechanisms;
- a Search Console indexing report for the undeployed M10.15 pages.

Prepared for owner review. No approval is implied by this document.
