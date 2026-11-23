# PC Builder M10.6 — UX Refinement & End-to-End Product Validation

Status: **complete, uncommitted, awaiting human review**. No commit, push, PR,
merge, deployment or production change was made.

- Branch: `feature/m10-6-pc-builder-product-validation`
- Base branch: `main`
- Starting commit: `75edbcb205829c242a47e197b252e27d12809664`
- Scope: product-quality review of M10.1–M10.5, not new feature development.
- Preview: `/pc-builder` during `astro dev` only.

## 1. Audit methodology

The audit combined static review, browser-driven interaction, automated
journeys, measurements and production-isolation checks.

1. Read `AppKitX-Design.md` and the M10.4/M10.5 architecture documents in full
   before changing UI.
2. Traced every state transition in `PcBuilder.astro`, `build-state.ts`,
   `engine.ts`, `power.ts`, the recommendation modules and the saved-build
   repository/share codec.
3. Exercised the real development preview with Playwright at 320, 390, 768,
   1024, 1440 and 1920 px, including short mobile heights (320×568).
4. Inspected screenshots of the guided form, generated result, manual builder,
   picker, saved-build library, dialogs and shared view.
5. Created six explicit end-to-end journeys plus cross-cutting tests for
   storage failures, navigation, clipboard fallback, focus restoration,
   responsive reflow and the full questionnaire option matrix.
6. Ran the PC Builder suite in Chromium, Firefox and WebKit.
7. Measured recommendation, evaluation, picker and rendering costs in the
   browser and in the pure domain code.
8. Rebuilt the production site and checked `dist`, the sitemap and CSP hashes.
9. Used manual DOM/accessibility inspection and targeted keyboard tests. No
   automated accessibility scanner or new dependency was added, so this report
   does not claim full WCAG conformance from scanner output.

No pricing, stock, FPS, benchmark, account, cloud, backend, analytics or
affiliate data was introduced.

## 2. User journeys validated

| Journey                             | Result | Coverage note                                                                                                                   |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. First-time guided user           | Pass   | Requirements, generate, inspect all 9 categories, summary, power, limitations, replace alternative, edit and regenerate.        |
| 2. Experienced manual builder       | Pass   | Search/filter, 9 categories, multi-slot RAM, incompatible board, explanation, compatible replacement, removal, mobile status.   |
| 3. Guided-to-manual transition      | Pass   | Transfer, save as active Guided-origin build, replacement, recommendation state preserved, replacement confirmation and cancel. |
| 4. Save and restore                 | Pass   | Save, modified indicator, update, save separate entry, rename, duplicate, delete, focus restoration, reload, load original.     |
| 5. Share and import                 | Pass   | Fragment link, independent read-only view, save copy, import, cancel, confirmation over a different build.                      |
| 6. Invalid and outdated data        | Pass   | Malformed, oversized, unsupported version, nothing-resolves, missing ID, discontinued part, corrupt/quota/unavailable storage.  |
| Browser back/forward                | Pass   | Shared view opens/closes without mutating the underlying manual build.                                                          |
| Clipboard fallback                  | Pass   | Link is selected and manual-copy instructions appear when clipboard access is unavailable.                                      |
| Questionnaire option matrix         | Pass   | 4 use cases, 4 resolutions, 4 priorities, 3 CPU brands, 3 GPU brands, 3 cooling, 3 sizes, 3 upgrade modes.                      |
| Production website regression suite | Pass   | 666 Playwright tests across Chromium, Firefox and WebKit.                                                                       |

## 3. Findings by severity

### Critical

None found, and none remain.

### High (all fixed)

| ID  | Finding                                                                                                                                                      | Impact                                                                                                                                | Fix                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Changing a requirement left the previous recommendation visible and still offered Save, Transfer and Share.                                                  | A user could save/share/transfer a build that no longer matched their requirements. This directly violated the M10.6 stale-data rule. | Requirements changes now clear the result immediately, show a requirements-changed notice and disable result actions.             |
| H2  | Rename, duplicate and delete re-rendered the saved-build list and dropped keyboard focus to `<body>`.                                                        | Keyboard users lost their place after every library mutation; rename/duplicate/delete became disorienting.                            | Focus returns to the renamed/duplicate card control, the next surviving card, or the Saved builds heading.                        |
| H3  | An 80-character unbroken build name produced 667 px of horizontal page overflow at 320 px and overflowed the active status, share dialog and confirm dialog. | Reflow failure at 320 px and clipped dialog content.                                                                                  | Added wrapping/min-width handling to every user-name surface (cards, active status, notices, share/confirm dialogs).              |
| H4  | The manual builder allowed 9–10 RAM kits, but saving/sharing then failed with “At most 8 component id(s) are allowed for ram.”                               | A user could assemble a build the product could not save or share, with an internal-schema error.                                     | Per-category limits now live in the domain model; the 9th selection is prevented, disabled and explained in both slot and picker. |
| H5  | Saving a transferred guided build from Manual mode did not make it the active saved build, so Update stayed disabled.                                        | The guided-to-manual-to-save/update journey was broken.                                                                               | Any save from Manual mode now marks the new entry active, regardless of Manual/Guided provenance.                                 |

### Medium (all fixed)

| ID  | Finding                                                                                                                                       | Fix                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| M1  | Generated results were ~7,400 px tall; the compatibility summary began ~5,500 px down, after all nine component cards and their alternatives. | Requirements collapse after generation; summary panels now precede the component list; alternatives are collapsed disclosures. |
| M2  | The component picker scrolled its own header and search/filter controls out of view, leaving only the result list scrollable in practice.     | Dialog is now an open-only flex column; header/filter stay fixed and the result viewport scrolls independently.                |
| M3  | On mobile, compatibility/power were below all nine component slots, so selection feedback was far off-screen.                                 | Added a compact sticky mobile build-status bar with status, counts and a Details jump.                                         |
| M4  | The empty Saved builds panel consumed roughly 500 px above the first task on a 320 px viewport.                                               | Disabled library actions and the redundant active line are hidden while there is neither a build nor saved data.               |
| M5  | Seven questionnaire selects had no helper text or programmatic description; option meanings such as “High” were unexplained.                  | Every select now has visible dynamic helper text and `aria-describedby`.                                                       |
| M6  | “Selection fit” was shown without explanation, leaving benchmark/FPS ambiguity.                                                               | Added an explicit 0–100 specification/preference weighting note and “not a benchmark, FPS estimate or price score” copy.       |
| M7  | Summary controls (“Power breakdown”, “Power assumptions”, compatible checks, alternatives) were under 44 px high.                             | Buttons and disclosure summaries now meet the 44 px minimum target.                                                            |
| M8  | “Clear build” discarded unsaved work without confirmation.                                                                                    | Confirmation is required only when the manual build has unsaved changes; an up-to-date saved build clears immediately.         |
| M9  | The picker did not explain that a candidate conflicts with the current build.                                                                 | Each candidate now shows its own relevant incompatible/warning finding before selection, filtered to findings that involve it. |
| M10 | The guided compatibility badge showed “Unknown” but carried a generated-recommendation tooltip.                                               | Badge title now matches the compatibility message it displays.                                                                 |
| M11 | The save dialog described a transferred guided build as “Manual build”.                                                                       | Context now says “Guided-origin build in the manual builder”.                                                                  |
| M12 | Escape-closing save/rename/confirm dialogs left pending internal state.                                                                       | Dialog `close` handlers clear pending save/rename/confirmation state.                                                          |
| M13 | “Save recommendation” remained enabled for a no-safe-recommendation result.                                                                   | It is now disabled alongside Transfer when the result cannot be transferred.                                                   |
| M14 | The first mobile sticky status implementation wrapped to ~130 px and covered too much content.                                                | Compacted to about 56 px at 390 and 73 px at 320 with a short Details action.                                                  |

### Low

No low-severity defect remains open. Minor refinements that accompanied the
fixes above include consistent long-name wrapping, the compact mobile status
bar, removal of the incorrect compatibility-badge title assignment, and
disabling Save recommendation for an untransferable result.

## 4. Fixes implemented

### Guided experience

- Result generation now collapses the requirements panel and moves the
  compatibility, power, budget and confidence summary above the component list.
- Requirements changes invalidate and hide the result immediately; a visible
  warning explains that a new recommendation is required. Stale results are
  never available for transfer/save/share.
- Component alternatives are collapsed behind labelled disclosures, reducing
  the initial result height without hiding replacement.
- Selection-fit explanation clarifies that the score is not a benchmark, FPS
  or price score.
- Every questionnaire select has dynamic helper text and an accessible
  description.
- No-safe recommendations disable both Transfer and Save recommendation.

### Manual builder

- The pure build-state model enforces the same per-category maxima as the
  saved-build schema: 8 RAM kits, 12 storage devices and 16 case fans.
- Limit-reached slots explain why Add is disabled; the picker disables further
  additions and reports the limit in its live count.
- The picker evaluates each candidate against the current build and shows only
  the candidate’s own confirmed incompatibility or warning.
- The picker header/search/filter remain fixed while results scroll.
- A compact sticky mobile status bar keeps compatibility visible while
  scrolling through component slots.
- Clearing a build with unsaved changes requires confirmation.

### Saved builds and sharing

- Rename/duplicate/delete restore keyboard focus instead of dropping it.
- Saving a transferred guided build from Manual mode sets it active and enables
  Update.
- Dialog context distinguishes a guided-origin build from a purely manual one.
- Escaped dialogs no longer retain pending save/rename/confirmation actions.
- Long names cannot create horizontal overflow anywhere in the library or
  share UI.
- Empty saved-library controls no longer occupy the first screen when there is
  nothing to manage.

## 5. Accessibility checks

| Check                           | Result                                                                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landmarks / one h1 / unique ids | Pass in Chromium; existing assertions retained.                                                                                                             |
| Visible labels                  | Every input, select, search field and share field has a visible label.                                                                                      |
| Programmatic descriptions       | All questionnaire selects and the budget field have `aria-describedby`; save/rename errors are associated.                                                  |
| Error identification            | Budget and saved-name errors use `aria-invalid`, visible error text, and alert roles.                                                                       |
| Keyboard operation              | Mode switch, picker, save, rename, confirm, transfer, delete, reset, return and summary toggles all work without a pointer.                                 |
| Dialog Escape behavior          | Native dialog Escape closes all dialogs; cancel paths preserve existing state; focus returns to the trigger.                                                |
| Focus restoration               | Save dialog, rename, duplicate, delete, reset and shared-view return paths were tested.                                                                     |
| Focus visibility                | Existing 2 px ring / 2 px offset assertions pass; summaries and the mobile Details button use the same ring.                                                |
| Status announcements            | Selection, recommendation, replacement, save, rename, duplicate, delete, import and storage errors are announced via the polite announcer or alert regions. |
| Status not color-only           | Every compatibility/availability badge includes text (and icons where the existing design uses them).                                                       |
| Touch targets                   | Buttons and disclosure summaries are ≥44 px; the primary controls are 44 px.                                                                                |
| Reduced motion                  | Global reduced-motion rule remains; PC Builder has no autoplay, parallax or essential animation.                                                            |
| Text reflow                     | 320 px layouts reflow without horizontal page overflow; dialogs fit 320×568.                                                                                |
| Contrast                        | New UI uses existing semantic token pairs already recorded in `AppKitX-Design.md`; no new foreground/background pair was added.                             |
| Screen-reader scope             | Announcer/alert behavior is asserted in automation. No NVDA/VoiceOver session was performed, so full WCAG 2.2 AA conformance is not claimed.                |

Manual checks intentionally covered things scanners often miss: focus after
re-render, Escape cleanup, read-only shared view, invalid-payload recovery,
disabled-action explanations, long-name reflow and mobile dialog height.

## 6. Responsive validation

Widths tested automatically: **320, 390, 768, 1024, 1440, 1920 px**. Short
mobile height tested: **320×568** and **390×844**.

| Area                            | Result                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Guided questionnaire            | No horizontal overflow; two-column form at ≥640 px, single column below.                               |
| Generated results               | No overflow; summary first; component cards stack at mobile widths.                                    |
| Manual builder                  | Single column <1024 px with sticky status; two columns with sticky result sidebar ≥1024 px.            |
| Saved-build library             | One column at narrow widths, two from 1024 px; 80-character unbroken names wrap without page overflow. |
| Component picker                | Fits viewport; results scroll internally; header/search remain fixed.                                  |
| Save / rename / confirm dialogs | Fit 320 px width; long names wrap; no page overflow.                                                   |
| Shared view                     | Read-only layout stacks; long names and catalogue warnings wrap; no horizontal overflow.               |
| Overflow                        | 0 px horizontal overflow at every tested width and view.                                               |
| Unexpected layout shift         | No material shift observed; sticky header height is reserved by normal flow and status bar is compact. |

No important information was hidden to solve layout problems. Alternative
lists are disclosed rather than removed, and mobile status still reports all
three finding counts.

## 7. Cross-browser results

Playwright 1.64.1 with the existing Chromium, Firefox and WebKit installations.

| Browser  | Tests | Result                                                                                                                             |
| -------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| Chromium |    66 | 47 existing PC Builder tests + 19 new product-validation tests: pass.                                                              |
| Firefox  |     9 | Tagged product journeys: guided, manual, transfer, save/restore, share/import, navigation, invalid data, clipboard fallback: pass. |
| WebKit   |     9 | Same tagged journeys: pass.                                                                                                        |

Cross-browser coverage includes localStorage persistence, URL-fragment
decoding, native `<dialog>` open/close/Escape, keyboard operation, clipboard
fallback, responsive manual status and browser back/forward. No browser-specific
workaround was required. The successful clipboard path remains covered in
Chromium; the fallback is covered in all three engines.

## 8. Performance observations

Measured on the current 101-record catalogue.

| Operation                                            | Measurement                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `recommendBuild` pure domain (30 runs)               | median **5.11 ms**, P95 **9.92 ms**, max **12.01 ms**         |
| Generated result in the browser (click → visible)    | **94–114 ms**, including DOM and scroll                       |
| `evaluateBuild` on a complete 9-component build      | median **0.004 ms**                                           |
| Component picker open                                | **~40 ms**                                                    |
| Picker search re-render with candidate compatibility | **~15 ms** (search input to results)                          |
| Generated result page height at 1440 px              | **~4,814 px**, down from ~7,413 px before the result refactor |
| Compatibility summary position at 1440 px            | **~875 px** from document top, down from ~5,497 px            |
| Generated result DOM                                 | **~1,197** elements                                           |
| 30-build library initial render (local 5-run median) | **~73 ms vs ~62 ms** for an empty library, ~11 ms delta       |

Interpretation:

- Catalogue scans, candidate ranking, compatibility evaluation, saved-build
  loading and share decoding are all comfortably below interaction thresholds
  at the current catalogue size. A full 30-build library adds only about 11 ms
  to initial render in the local five-run median.
- The largest user-visible cost was layout volume, not computation. Collapsing
  alternatives and moving the summary removed most unnecessary scrolling.
- Per-candidate compatibility in the picker is negligible: `evaluateBuild` is
  microseconds and the measured search render stays around 15 ms.
- No new dependency was added and no premature optimization was introduced.
  Re-measure before adding caching if the catalogue grows substantially.

## 9. State-integrity findings

| Required invariant                                          | Result                                                                            |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| No stale recommendation after requirements change           | Fixed. Result is cleared and actions disabled immediately.                        |
| Compatibility recalculated after every component change     | Pass; single `evaluateBuild` authority on every render.                           |
| Power recalculated after every component change             | Pass; derived from the same report.                                               |
| Saved-build association cleared or retained appropriately   | Pass; transfer/import/clear detach, direct manual save attaches, load attaches.   |
| Failed storage writes preserve previous data                | Pass; repository writes once after validation; quota/write/corrupt tests confirm. |
| Cancelled confirmations preserve existing state             | Pass for transfer, load, import, delete, reset and clear.                         |
| Invalid share payload never mutates the manual builder      | Pass; shared view is read-only and errors never import.                           |
| Shared view is read-only until explicit import              | Pass; builder chrome hidden, import is the only state-changing action.            |
| Missing catalogue references are never silently substituted | Pass; unresolved IDs are listed, excluded and reported.                           |
| Critical Unknown never becomes Compatible                   | Pass; engine tests and guided grouping keep critical Unknowns visible.            |
| Multi-slot limits cannot create an unsaveable build         | Fixed; domain model, slot UI, picker UI and schema now share one limit table.     |
| Browser back/forward does not corrupt the build             | Pass in all three engines.                                                        |

## 10. Remaining known limitations

- Saved builds remain browser-local; there is no account, cloud sync, server
  copy or revocation. Clearing site data removes them.
- Share links are portable payloads but work only where the development
  preview is available; they are not public or permanently hosted.
- Anyone with a share link can read the build name, source, component IDs,
  optional questionnaire provenance and timestamp in the URL fragment.
- The catalogue stores no prices, stock or regional availability. Budget
  figures are target allocations, not quotes.
- There are no benchmark, FPS or application-performance results. Selection
  fit and capability indices are specification weightings only.
- The catalogue is curated: 101 records, 23 manufacturers, 22 critical-unknown
  records (mostly AMD boost power, case GPU slot thickness and legacy GPU
  dimensions).
- Multi-tab localStorage changes are not synchronised in this milestone.
- Automated accessibility coverage is targeted, not exhaustive. No real
  screen-reader (NVDA/VoiceOver) session or axe-style scan was run; full WCAG
  2.2 AA conformance is not claimed.
- Browser zoom was reviewed through 320 px reflow and token inspection, but a
  dedicated 200% browser-zoom automation pass was not added. Text-only scaling
  with a user stylesheet was not separately automated.
- Cross-browser testing uses Playwright desktop engines, not physical iOS or
  Android browsers.
- Stable component-ID renames still require an explicit catalogue migration;
  name matching is intentionally never used.

## 11. Release blockers

**None for the development-only M10.6 milestone.** All six journeys pass, no
critical or high-severity defect remains open, and production isolation is
intact.

This is not a public release. Before any public launch, separate approval is
required for hosting share links, revoking shares, pricing/stock verification,
privacy review, real assistive-technology testing and production observability.
Those are explicitly outside M10.6.

## 12. Files changed (uncommitted)

| File                                            | Change                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/lib/pc-builder/types.ts`                   | Added shared per-category selection maxima.                                                            |
| `src/lib/pc-builder/build-state.ts`             | Enforced maxima; added `isAtCategoryLimit`.                                                            |
| `src/lib/pc-builder/saved-builds/types.ts`      | Saved-build limits now alias the single domain table.                                                  |
| `src/dev/pc-builder/PcBuilder.astro`            | UX, accessibility, state-integrity, responsive and picker refinements.                                 |
| `tests/pc-builder-build-state.test.ts`          | Added multi-slot maximum regression test.                                                              |
| `e2e-pc-builder/product-validation.spec.ts`     | **New** six-journey suite, storage failures, navigation, clipboard fallback, a11y, responsive, matrix. |
| `e2e-pc-builder/guided-recommendations.spec.ts` | Updated alternatives disclosure, stale-result and mobile form assertions.                              |
| `e2e-pc-builder/pc-builder.spec.ts`             | Updated status scoping and clear-build confirmation.                                                   |
| `playwright.pc-builder.config.ts`               | Added Firefox/WebKit projects for `@cross-browser` journeys.                                           |
| `PC-BUILDER-GUIDED-RECOMMENDATIONS.md`          | Documented invalidation, collapsed requirements, summary order and test coverage.                      |
| `PC-BUILDER-SAVED-SHAREABLE-BUILDS.md`          | Documented limits, active-save behavior and focus restoration.                                         |
| `PC-BUILDER-M10-6-QUALITY-REPORT.md`            | This report.                                                                                           |

`package.json` and `package-lock.json` are unchanged; no dependency was added.

## 13. Quality gates

| Gate                                 | Result                                                                                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relevant PC Builder unit tests       | Pass                                                                                                                                                                        |
| Full unit suite                      | **639 passed / 34 files** (baseline 638; +1 max-selection test)                                                                                                             |
| Catalogue validation                 | **OK**; 101 records / 23 manufacturers; 84 in production / 11 discontinued / 6 unknown; 22 critical-unknown; 0 invalid, duplicate, unverified or missing-provenance records |
| `astro check`                        | **0 errors, 0 warnings, 0 hints** (189 files)                                                                                                                               |
| Prettier                             | Clean over the whole repository                                                                                                                                             |
| Production build                     | **21 pages**                                                                                                                                                                |
| CSP inline hashes                    | **6** (unchanged)                                                                                                                                                           |
| PC Builder Playwright                | **84 passed** (66 Chromium + 9 Firefox + 9 WebKit)                                                                                                                          |
| Full production Playwright           | **666 passed** (unchanged)                                                                                                                                                  |
| Production PC Builder artifacts      | **0** in `dist`                                                                                                                                                             |
| Sitemap PC Builder references        | **0**                                                                                                                                                                       |
| Public route/navigation/indexability | Unchanged; preview remains `astro dev` only                                                                                                                                 |
| Cloudflare/Wrangler/CSP/security     | Unchanged                                                                                                                                                                   |
| Deployment                           | None                                                                                                                                                                        |

### Test-count explanation

- Unit: 638 → 639. The added test proves the shared domain limit prevents a
  9th RAM kit, 13th storage device or 17th fan.
- PC Builder E2E: 47 → 84. Chromium gained 19 tests (6 journeys, navigation,
  two invalid-data scenarios, four storage-failure scenarios, state integrity,
  three accessibility checks, clipboard fallback, responsive sweep and the
  questionnaire matrix). Firefox and WebKit each run 9 tagged cross-browser
  journeys.
- Full production E2E: 666 → 666. No production behavior or test was changed.

## 14. Production isolation verification

After `npm run build`:

- `dist` contains **21 HTML pages**.
- `find dist -iname '*pc*builder*'` returns nothing.
- No file in `dist` contains “PC Builder” or “pc-builder”.
- `sitemap-0.xml` contains 20 URLs, none referencing the PC Builder.
- `_headers` contains **6 unique CSP inline hashes**, unchanged from baseline.
- No public `/pc-builder` route, navigation entry, indexability change,
  Cloudflare/Wrangler change, CSP/HSTS change, analytics or affiliate code.

The only access mechanism remains `src/integrations/pc-builder-dev-preview.ts`
during `astro dev`.

## 15. Review note

All changes are intentionally left uncommitted on
`feature/m10-6-pc-builder-product-validation`. Await human review before any
commit, PR, merge or deployment.
