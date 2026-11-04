# M10.15.1 / M10.15.2 — Owner Decisions, Multilingual Readiness, and Quality Review

Status: **public editorial site merged and automatically deployed to production
on 2026-11-03**. M10.15.2 adds the editorial, accessibility, legal-preparation,
and Search Console documentation corrections. Gate A remains **CONDITIONALLY
READY — NOT PASSED** pending legal and independent editorial/translation review.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Historical feature branch: `feature/m10-15-public-site-readiness` (merged in
  PR #50)
- Baseline: `db3f2d805700d10dc1819c44570597604a93dc0f`
- Baseline verification: local `main` = `origin/main`, HEAD = expected baseline
- Merge commit: `019fd602d7a779f4035ae58339238781fa0c280f`
- Deployment: automatic Cloudflare Workers Builds production deployment after
  the PR #50 merge; completed **2026-11-03T19:14:39Z**
- Live site: `https://appkitx.com`
- M10.13 report preserved unchanged:
  `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee`
- Research/access date: **2026-11-01**
- Amazon account, application, credentials, API call, affiliate link: **none**

## Production Deployment Record — 2026-11-03

This section supersedes the pre-deployment statements in this document. The
M10.15.2 review was written while the work was still on a feature branch; PR #50
was subsequently merged and Cloudflare Workers Builds deployed the merge commit
to production.

### Merge and deployment evidence

| Item              | Recorded value                                       | Evidence                        |
| ----------------- | ---------------------------------------------------- | ------------------------------- |
| Pull request      | #50, `feature/m10-15-public-site-readiness` → `main` | GitHub PR metadata              |
| Merged by         | `faiz1920`                                           | GitHub PR metadata              |
| Merge time        | `2026-11-03T19:13:20Z`                               | GitHub PR metadata              |
| Merge commit      | `019fd602d7a779f4035ae58339238781fa0c280f`           | GitHub PR metadata              |
| Deployment        | Cloudflare Workers Builds production build           | GitHub check-run metadata       |
| Build started     | `2026-11-03T19:14:10Z`                               | GitHub check-run metadata       |
| Build completed   | `2026-11-03T19:14:39Z`                               | Owner report and check-run data |
| Manual deployment | None by the owner                                    | Owner report                    |

The Cloudflare dashboard was not accessed. The deployment evidence above comes
from GitHub PR/check-run metadata and the owner-supplied report. The check run
for the merge commit reported `completed / success`; its details URL points to
the Cloudflare dashboard, which was not opened.

### Live verification

Owner-reported and independently rechecked by the agent on **2026-11-04** with
HTTP requests. Results matched. No additional HTTP results are claimed.

| URL                                                                | Result                                              |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `https://appkitx.com/guides/`                                      | HTTP 200 — English guide index                      |
| `https://appkitx.com/es/guides/`                                   | HTTP 200 — Spanish guide index                      |
| `https://appkitx.com/privacy/`                                     | HTTP 200 — English privacy page, dated `2026-11-02` |
| `https://appkitx.com/es/privacy/`                                  | HTTP 200 — Spanish privacy page                     |
| `https://appkitx.com/guides/how-to-choose-the-right-power-supply/` | HTTP 200 — ATX 3.1 / 12V-2x6 correction live        |
| `https://appkitx.com/sitemap-0.xml`                                | HTTP 200 — 52 URLs                                  |
| `https://appkitx.com/pc-builder/`                                  | HTTP 404 — PC Builder remains unpublished           |

### Production security status

Owner-reported and independently observed in live response headers on
**2026-11-04**:

| Header                                | Observed state                                       |
| ------------------------------------- | ---------------------------------------------------- |
| `Content-Security-Policy-Report-Only` | Present; CSP remains Report-Only                     |
| `Strict-Transport-Security`           | Present (`max-age=2592000`)                          |
| `X-Content-Type-Options`              | Present (`nosniff`)                                  |
| `Referrer-Policy`                     | Present (`strict-origin-when-cross-origin`)          |
| `Permissions-Policy`                  | Present (`camera=(), geolocation=(), microphone=()`) |

No security-header changes were made as part of M10.15. CSP enforcement remains
off.

### Production state and limits

- The production sitemap exposes **52 URLs**.
- `/pc-builder/` remains HTTP 404 and is not linked from navigation or the
  sitemap.
- The public editorial website is deployed. This does **not** authorize an Amazon
  Associates application, Creators API access, affiliate links, live Amazon
  integration, a public PC Builder release, or pricing-provider activation.
- Gate A remains **CONDITIONALLY READY — NOT PASSED**. The outstanding reviews are
  listed in section 10.

### Deployment automation warning

The repository uses Cloudflare Workers Builds automation. A documentation-only
pull request may trigger another production deployment when merged. Do not
attempt to disable or bypass the existing deployment automation; any merge
requires explicit approval.

### Search Console state after deployment

The last known Search Console read remains **2026-10-29**: domain property
`appkitx.com`, `appkitx@gmail.com` as verified primary owner, personal Gmail as
backup owner, and `https://appkitx.com/sitemap-index.xml` submitted successfully.
The previous discovered-page count was **20**. The production sitemap now exposes
**52 URLs**, but this record does not claim that Google has discovered or indexed
all 52. The page-indexing report was previously processing. A fresh sitemap and
indexing review is still required; Search Console was not accessed or modified in
this milestone.

## 1. Executive summary

M10.15.1 incorporates the confirmed owner decisions and makes the editorial and
information surface fully bilingual:

- **20 guide entries** — ten English and ten Spanish — approximately **32,860
  prose words** in total (15,291 English, 17,569 Spanish). Every guide has a
  descriptive introduction, structured headings, practical explanations,
  caveats, internal links, references, the approved **AppKitX Editorial** byline,
  and genuine publication/update dates.
- **Bilingual guide indexes** at `/guides/` and `/es/guides/`.
- **Bilingual information pages**: About, Contact, Privacy Policy, Terms of Use,
  and Affiliate Disclosure in English and Spanish.
- **Localized navigation and footer**: the Guides link, Company links, and Legal
  links point to the current locale; no English-only destination remains.
- **Localized article UI**: byline, dates, reading time, table of contents,
  references, disclosure, author note, related guides, and structured data.
- **Confirmed contact address** `appkitx@gmail.com` on Contact, About, Privacy,
  Terms, and Affiliate Disclosure in both languages.
- **Ownership wording**: AppKitX is a separate, independent brand, not yet
  legally registered. No registered entity, address, or legal identity is
  invented.
- **Intended jurisdiction**: India, stated in the legal drafts with visible
  review notices. The documents remain drafts pending legal review.
- **Search Console documentation**: the confirmed arrangement is a domain
  property for `appkitx.com` with `appkitx@gmail.com` as the verified primary
  owner and the owner's personal Gmail as backup owner. DNS TXT verification runs
  through Cloudflare; `https://appkitx.com/sitemap-index.xml` was submitted and
  the sitemap index references `sitemap-0.xml`. Search Console reported 20
  discovered pages on 2026-10-29 and the page-indexing report was still
  processing, so no indexing claim is made. No account was accessed or modified
  in this milestone.

Gate A is **not passed**. The content, localization, contact, ownership, and
editorial identity are in place, M10.15.2 corrects verified technical and
accessibility defects, but the privacy/terms drafts still need legal review, the
Spanish translation and 20 guides need independent quality review, the
production analytics configuration needs confirmation, and release approval for
remaining gated functionality has not been given. See
`PC-BUILDER-M10-15-OWNER-INPUTS.md` and
`PC-BUILDER-M10-15-2-QUALITY-REVIEW.md`.

At the time of the M10.15.2 review, no deployment had been made. PR #50 was
subsequently merged and automatically deployed by Cloudflare Workers Builds; the
deployment record above supersedes the earlier "undeployed" status. No Amazon
Associates application was submitted, no account or credential was created, no
API was called, no ASIN was discovered, no affiliate link was added, and no
manual deployment was run.

## 2. Baseline and branch verification

| Check                    | Result                                                                         |
| ------------------------ | ------------------------------------------------------------------------------ |
| Starting branch          | `main`                                                                         |
| Local `main` HEAD        | `db3f2d805700d10dc1819c44570597604a93dc0f`                                     |
| `origin/main`            | `db3f2d805700d10dc1819c44570597604a93dc0f`                                     |
| Working tree before work | Clean except the untracked M10.13 report and the existing M10.15 work          |
| M10.13 SHA-256           | `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee` (unchanged) |
| Feature branch           | `feature/m10-15-public-site-readiness` (merged in PR #50)                      |
| M10.14 deliverables      | Unchanged                                                                      |

This table records the pre-M10.15 baseline. It is retained as historical context
and is superseded by the Production Deployment Record — 2026-11-03.

No reset, stash, clean, or discard was used. Existing M10.15 work was preserved.

## 3. Confirmed owner decisions

| Decision              | Confirmed value                                                                                  | Implementation                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contact email  | `appkitx@gmail.com`                                                                              | Published with `mailto:` links on Contact, About, Privacy, Terms, and Affiliate Disclosure in both locales                                               |
| Ownership             | Separate, independent brand; not yet legally registered                                          | About and legal pages state the status without inventing a registered entity, address, or legal identity                                                 |
| Intended jurisdiction | India                                                                                            | Privacy, Terms, and Affiliate Disclosure state India as the intended jurisdiction and remain drafts pending legal review                                 |
| Editorial identity    | `AppKitX Editorial` for English and Spanish                                                      | All 20 guide entries use the organizational byline; no individual author or credentials are invented                                                     |
| Multilingual strategy | English and Spanish are existing supported languages                                             | Ten guides and five information pages exist in both locales; routes, hreflang, sitemap, and language switcher pair them                                  |
| Analytics             | Production uses Cloudflare Web Analytics                                                         | Privacy policy describes Cloudflare Web Analytics separately from search administration                                                                  |
| Search Console        | Domain property `appkitx.com`; `appkitx@gmail.com` primary verified owner; personal Gmail backup | Documented in the privacy policy and README; sitemap submitted; 20 discovered pages on 2026-10-29; production sitemap now 52 URLs; fresh review required |
| Affiliate status      | No active affiliate program or links                                                             | Future-use disclosure only; no current-participation claim                                                                                               |

AppKitX is not associated with any other company or technology brand. No public
page mentions another company.

## 4. Editorial content inventory

Both locales are complete, paired on the same stable slug, and published/updated
on **2026-11-01**. Reading time is an estimate at 220 words per minute.

| Slug                                                  | Category            |   EN words | EN min |   ES words | ES min | References |
| ----------------------------------------------------- | ------------------- | ---------: | -----: | ---------: | -----: | ---------: |
| `how-to-choose-a-cpu`                                 | Choosing components |      1,756 |      8 |      2,011 |     10 |          3 |
| `gpu-buying-guide`                                    | Buying advice       |      1,630 |      8 |      1,853 |      9 |          4 |
| `how-to-choose-a-compatible-motherboard`              | Choosing components |      1,572 |      8 |      1,721 |      8 |          4 |
| `ddr4-vs-ddr5`                                        | Choosing components |      1,401 |      7 |      1,574 |      8 |          4 |
| `how-much-ram-for-gaming`                             | Choosing components |      1,375 |      7 |      1,560 |      8 |          3 |
| `ssd-buying-guide`                                    | Buying advice       |      1,467 |      7 |      1,646 |      8 |          4 |
| `how-to-choose-the-right-power-supply`                | Choosing components |      1,404 |      7 |      1,538 |      7 |          3 |
| `pc-cooling-explained`                                | Choosing components |      1,382 |      7 |      1,587 |      8 |          3 |
| `how-to-check-pc-component-compatibility`             | Compatibility       |      1,398 |      7 |      1,619 |      8 |          5 |
| `a-practical-guide-to-building-your-first-desktop-pc` | Building & upgrades |      1,585 |      8 |      1,766 |      9 |          4 |
| **Total**                                             |                     | **14,970** |        | **16,875** |        |     **37** |

The Spanish versions are full translations, not summaries. They preserve the
section structure, technical caveats, internal links, references, and the
organizational byline.

### Editorial architecture

| File                                       | Purpose                                                                                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`                    | Validated bilingual `guides` collection: stable slug, lang, title, optional SEO title, description, category, tags, dates, literal organizational author, related slugs, references |
| `src/content/guides/en/*.md`               | Ten English guides                                                                                                                                                                  |
| `src/content/guides/es/*.md`               | Ten Spanish guides                                                                                                                                                                  |
| `src/lib/editorial.ts`                     | Pure helpers: localized paths, date formatting, reading time, related-guide selection, category labels, guide/info UI copy                                                          |
| `src/views/GuidesIndexView.astro`          | Localized guide index grouped by category                                                                                                                                           |
| `src/views/GuideArticleView.astro`         | Localized article route and collection lookup                                                                                                                                       |
| `src/layouts/ArticleLayout.astro`          | Localized article header, byline/dates, prose, TOC, references, disclosure, author note, related guides                                                                             |
| `src/layouts/InfoPageLayout.astro`         | Localized information-page header, last-updated line, review/translation notices, prose, information rail                                                                           |
| `src/views/info/*.astro`                   | Bilingual About, Contact, Privacy, Terms, and Affiliate Disclosure content                                                                                                          |
| `src/components/GuideCard.astro`           | Localized whole-card guide link                                                                                                                                                     |
| `src/components/AffiliateDisclosure.astro` | Localized future-use disclosure, compact and full variants                                                                                                                          |

No CMS, external content service, database, or new dependency was introduced.

## 5. Information architecture and localization

### Routes

| Route (English)          | Route (Spanish)             | Purpose                         |
| ------------------------ | --------------------------- | ------------------------------- |
| `/guides/`               | `/es/guides/`               | Guide index                     |
| `/guides/<slug>/`        | `/es/guides/<slug>/`        | Ten paired guide articles       |
| `/about/`                | `/es/about/`                | About and editorial principles  |
| `/contact/`              | `/es/contact/`              | Contact and approved email      |
| `/privacy/`              | `/es/privacy/`              | Privacy policy draft            |
| `/terms/`                | `/es/terms/`                | Terms of use draft              |
| `/affiliate-disclosure/` | `/es/affiliate-disclosure/` | Future-use affiliate disclosure |

`translatedPagePaths()` now contains 26 paths: the original 10 tool/category
pages, the guide index, 10 guide slugs, and 5 information pages. Every path is
built in both locales.

### Navigation and footer

- Global navigation adds **Guides / Guías** after Tools and Categories. The link
  points to the current locale's guide index.
- The footer renders four columns in both locales: **Tools**, **Categories**,
  **Company**, and **Legal**. Guides, About, Contact, Privacy, Terms, and
  Affiliate Disclosure all point to the current locale.
- No English-only destination remains in the chrome. The previous
  `hreflang="en"` workaround was removed because the targets are now translated.
- No PC Builder link, navigation entry, or sitemap entry exists.

### Build output

- `npm run build` produced **53 pages** (52 indexable pages plus `404.html`).
- `dist/sitemap-0.xml` contains **52 URLs**: 26 paths × 2 locales.
- Every guide and information page emits reciprocal `en`/`es` alternates and
  `x-default`.
- `robots.txt` still allows crawling and points at the sitemap index.
- No `/pc-builder` route, link, or sitemap entry appears in `dist`.

## 6. Legal and compliance page status

| Page                 | Status                                              | What is implemented                                                                                                                                                                                                     | What remains                                                                              |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| About                | Bilingual, no legal review notice                   | Purpose, audience, editorial principles, research basis, unregistered independent brand, intended India jurisdiction, approved email                                                                                    | Legal ownership wording review; editorial review                                          |
| Contact              | Bilingual, approved address                         | `appkitx@gmail.com`, general enquiries/support, what to include, what not to send, response caveat                                                                                                                      | Confirm inbox monitoring and response expectations                                        |
| Privacy Policy       | Bilingual draft with review and translation notices | Browser-only tools, `appkitx.locale` storage, Cloudflare hosting/logs, Cloudflare Web Analytics/RUM, Search Console administration, CSP report fields, third-party links, retention, rights, children, changes, contact | Confirm production analytics, retention, cookies, legal basis, transfers; legal review    |
| Terms of Use         | Bilingual draft with review and translation notices | Acceptance, site description, no professional advice, accuracy, user responsibilities, IP, third-party services, affiliate links, availability, liability, India intended jurisdiction, contact                         | Confirm legal entity status, governing law, jurisdiction, liability wording; legal review |
| Affiliate Disclosure | Bilingual draft with review and translation notices | Clear future-use disclosure, current no-program status, commission explanation, editorial independence, no current-participation claim                                                                                  | Legal review; approve placement and wording before any affiliate link                     |

The Spanish legal pages carry a provisional translation note: the English draft
is the reference version until both versions are reviewed. No legal entity,
registered address, phone number, or legal conclusion is invented.

### Privacy and Search Console distinction

The privacy policy now separates:

- **Cloudflare Web Analytics / RUM** — production website analytics. The
  documentation states it is enabled, EU visitor data is excluded, and the owner
  has retained the configuration. The beacon is injected by Cloudflare and is not
  part of the static build.
- **Google Search Console** — search-performance administration. It is not a
  tracking script embedded in public pages. The domain property `appkitx.com` is
  verified with `appkitx@gmail.com` as the primary owner and the personal Gmail
  retained as a backup owner. The sitemap was submitted successfully; the
  page-indexing report was still processing on 2026-10-29. No account was
  accessed or modified in this milestone.

The policy does not claim that Cloudflare Web Analytics is cookieless, that a
particular retention period applies, or that a particular legal basis has been
established.

## 7. Amazon Associates requirement mapping

Requirements were rechecked against official Amazon sources on **2026-11-01**.
This is not legal advice and does not guarantee acceptance.

| Official requirement                                                         | Source (accessed 2026-11-01)                                                                                                                                                                                            | AppKitX implementation                                                                                                               | Remaining gap                                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Complete, accurate application identifying the site                          | [Operating Agreement](https://affiliate-program.amazon.in/help/operating/agreement) §2                                                                                                                                  | Public, owned, identifiable site; About page describes the project                                                                   | Application not submitted; legal entity status pending            |
| Publicly available, owned site                                               | [Application Review Process](https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM)                                                                                                                      | Static public site, no login/paywall, `robots.txt` allows crawling                                                                   | Domain/legal ownership confirmation                               |
| Robust original content; rule of thumb at least 10 posts                     | Application Review Process                                                                                                                                                                                              | 10 guides per locale (20 total) plus 6 tool pages and 3 category pages per locale                                                    | Independent editorial/technical review not recorded               |
| Content recent, generally within 60 days                                     | Application Review Process                                                                                                                                                                                              | All guides published 2026-11-01; PSU EN and all Spanish guides updated 2026-11-02                                                    | Keep cadence; update dates on future edits                        |
| Review checks every site listed                                              | Application Review Process                                                                                                                                                                                              | English and Spanish are the same site; both locales are complete                                                                     | Decide how to describe the bilingual site in an application       |
| Privacy disclosure                                                           | Operating Agreement §5                                                                                                                                                                                                  | Bilingual privacy policy draft covers tools, local storage, Cloudflare, RUM, Search Console, CSP reports, contact, retention, rights | Legal/analytics confirmation                                      |
| Affiliate disclosure                                                         | Operating Agreement §10                                                                                                                                                                                                 | Bilingual future-use disclosure; no Amazon relationship claimed; no affiliate links                                                  | Add the required statement only after acceptance and before links |
| Tagged Special Links; no cloaking or alteration                              | [Linking Requirements](https://affiliate-program.amazon.in/help/operating/linking)                                                                                                                                      | No affiliate links exist; no shortener or redirect layer                                                                             | Implement only in an approved integration milestone               |
| Price/availability and comparison rules                                      | Linking Requirements; Operating Agreement §11                                                                                                                                                                           | No prices or availability displayed                                                                                                  | Resolve before live integration                                   |
| No price tracking or alerts unless agreed                                    | [Participation Requirements](https://affiliate-program.amazon.in/help/operating/policies) §31                                                                                                                           | No price history, alerts, or tracking features                                                                                       | Keep out of scope unless approved                                 |
| No image storage; non-image content cache up to 24 hours; ASINs indefinite   | Operating Agreement §11.3.13                                                                                                                                                                                            | No Amazon content or images stored                                                                                                   | Design ASIN-only durable mapping and ephemeral evidence           |
| Mobile application restrictions                                              | Participation Requirements §7                                                                                                                                                                                           | Responsive website, no native app, no public PC Builder route                                                                        | Confirm website-vs-mobile-app classification                      |
| 3 qualifying sales / 180 days for Associates review                          | [Account Dormancy](https://affiliate-program.amazon.in/help/node/topic/G7MJTPEP9NC3YKMG)                                                                                                                                | No account, sales, or affiliate links                                                                                                | Gate B; requires audience and genuine traffic                     |
| Creators API: final acceptance, 10 qualifying sales / 30 days, primary owner | [Creators API introduction](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction); [registration](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api) | No account or API access                                                                                                             | Gate B                                                            |
| India marketplace `www.amazon.in`, INR, `en_IN`                              | [Creators API India locale](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/locale-reference/india)                                                                                                         | No API integration                                                                                                                   | Gate B/D                                                          |
| Maximum two applications per store; two credentials per application          | Creators API registration FAQ                                                                                                                                                                                           | No applications or credentials                                                                                                       | Gate B                                                            |

### Rejection and reapplication nuance

The sources are not identical in wording:

- The Application Review page says Amazon **cannot reassess an application once
  it has been rejected**.
- The Operating Agreement §2 says an applicant is **welcome to reapply**.
- The Account Dormancy page says Amazon **cannot reinstate the account or
  Associates ID** after rejection.

The safe reading is: a rejected application is not re-scored, a new application
may be possible, but the prior account/ID may not be restored. AppKitX should
not submit a premature application on the assumption that a rejection can simply
be appealed.

### Changes since M10.14

- The 3-sale/180-day threshold, 10-sale/30-day Creators API threshold, final
  acceptance requirement, primary-owner rule, India locale, and content/caching
  rules are unchanged.
- M10.14's statement that a rejected application may not be reassessed is
  accurate for the same application, but should be read with the Operating
  Agreement's reapplication language and the dormancy page's account/ID rule.
- No Amazon account, application, credential, or API call was created or used.

## 8. SEO and accessibility changes

### SEO

- **Article structured data**: `Article` JSON-LD with localized headline,
  description, ISO dates, `Organization` author (AppKitX Editorial), localized
  author URL, `Organization` publisher, canonical `mainEntityOfPage`,
  `inLanguage` (`en` or `es`), localized section, and keywords. No `Person`
  author, ratings, reviews, prices, or offers.
- **Breadcrumbs**: localized `BreadcrumbList` JSON-LD on guides and information
  pages.
- **Collection page**: localized `CollectionPage` JSON-LD on both guide indexes.
- **Open Graph**: `og:type=article`, `article:published_time`,
  `article:modified_time`, `article:section`, and `article:tag` on guides;
  `og:type=website` elsewhere. Canonical `og:url`, shared social image, Twitter
  card, and locale metadata remain.
- **Canonical URLs**: one canonical per page, trailing-slash form, matching the
  sitemap. Every page advertises reciprocal `en`/`es` alternates and
  `x-default`.
- **Sitemap**: 52 indexable URLs, no `/404`, no `/en`, no PC Builder.
- **No duplicate canonicals**: covered by the social-metadata end-to-end test
  for every built indexable route.

### Accessibility and reading experience

- New pages reuse the existing skip link, landmarks, focus ring, 44px targets,
  semantic headings, and color tokens.
- Article prose uses the 720px measure, H2/H3 hierarchy, tables with overline
  headers and row rules, blockquotes, ordered lists, and horizontally scrollable
  code blocks.
- Tables use a fixed layout and `overflow-wrap: anywhere` below 640px so a
  three-column table does not force horizontal page scrolling.
- Guide cards are whole-card links with a visible focus ring and a localized
  "Read guide / Leer guía" affordance.
- The table of contents is hidden below 1024px and only rendered when an article
  has at least three H2 sections.
- 320px overflow checks cover both guide indexes, representative articles in
  both locales, and all ten information pages.
- Existing keyboard/focus/contrast checks pass. No automated axe scan was run,
  and no accessibility dependency was added; a manual audit remains an owner
  input.

## 9. Validation results

| Command                | Result                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm run format:check` | Passed: all matched files use Prettier style                                 |
| `npm run check`        | Passed: 0 errors, 0 warnings, 0 hints (266 files)                            |
| `npm run build`        | Passed: 53 pages, sitemap index, CSP report-only header with 6 inline hashes |
| `npm test`             | Passed: 48 test files, 849 tests                                             |
| `npm run test:e2e`     | Passed: 825 tests across Chromium, Firefox, and WebKit (275 per browser)     |

### Route, sitemap, and metadata inspection

- 52 indexable HTML pages and 52 sitemap URLs; the 53rd build page is
  `404.html`.
- Sitemap includes both guide indexes, all 20 guide routes, and all 10
  information pages.
- No `/pc-builder` route, link, or sitemap entry in `dist`.
- Every built indexable route is covered by the social-metadata test for
  canonical URL, description, Open Graph, Twitter, locale, structured data, and
  indexability.
- Article pages expose `og:type=article`, publication/modification timestamps,
  section, tags, and `Article` JSON-LD in the page language.
- No public HTML page mentions Nexverra or contains an Amazon affiliate link.
- Guide and information pages have no `noindex`; the 404 remains `noindex`.

### Visual proof

Playwright captured:

- `test-results/guides-index.png`
- `test-results/guide-article-en-desktop.png`
- `test-results/guide-article-es-desktop.png`
- `test-results/privacy-en-desktop.png`
- `test-results/privacy-es-desktop.png`
- `test-results/guides-320.png`
- `test-results/info-320.png`

### What was not changed

- `package.json`, `package-lock.json`, `wrangler.jsonc`, `public/_headers`,
  `astro.config.ts`, `src/worker.ts`, and the CSP integration are unchanged.
- No Cloudflare setting, CSP enforcement, HSTS, or security header was changed.
- No deployment was triggered during the M10.15.2 review itself. The later PR #50
  merge triggered an automatic Cloudflare Workers Builds production deployment;
  see the Production Deployment Record.
- The PC Builder remains mounted only by
  `src/integrations/pc-builder-dev-preview.ts` during `astro dev`; it is not in
  the production build.
- `PC-BUILDER-M10-13-AMAZON-IN-FEASIBILITY.md` and both M10.14 deliverables are
  unchanged.

## 10. Remaining owner and legal decisions

The full list is in `PC-BUILDER-M10-15-OWNER-INPUTS.md`. The Gate A blockers are:

1. **Privacy policy legal review** — confirm Cloudflare RUM configuration,
   retention, cookies, legal basis, transfers, CSP report retention, and contact
   mailbox handling.
2. **Terms, liability, and India jurisdiction review** — the intended
   jurisdiction is stated, but the final legal entity status, governing law, and
   liability wording require counsel.
3. **Affiliate disclosure review** — approve the future-use wording and placement
   before any affiliate link is published.
4. **External editorial/technical review** — review all 20 guides against current
   manufacturer documentation and record the reviewer, date, scope, and
   corrections.
5. **Spanish translation review** — record a native or fluent review; the Spanish
   locale remains provisional.
6. **Accessibility audit** — M10.15.2 adds automated landmark, heading, name,
   language, focus, target-size, and contrast checks plus source review. A manual
   screen-reader and 200% zoom pass remains open.
7. **Release approval for remaining gated functionality** — the public editorial
   site is deployed, but Amazon integration, affiliate links, pricing-provider
   activation, and a public PC Builder release remain unauthorized.

Search Console ownership is no longer an open item: `appkitx@gmail.com` is the
verified primary owner, the personal Gmail is a backup owner, and the sitemap is
submitted. Indexing status remains unconfirmed because the report was still
processing.

## 11. Gate A assessment

**Status: CONDITIONALLY READY — NOT PASSED.**

| Gate A criterion                           | Status                                 | Evidence                                                                                                    |
| ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Public, accessible, owned site             | Pass (legal ownership wording pending) | Live at `appkitx.com`; static site, no login/paywall, robots allow, sitemap                                 |
| Original content, not thin affiliate pages | Pass by inspection                     | 20 guides (~32k words), 6 tools, 3 categories, no affiliate links                                           |
| PC-hardware relevance                      | Pass                                   | CPU, GPU, motherboard, memory, storage, PSU, cooling, compatibility, first build                            |
| At least 10 substantive posts/pages        | Pass by count                          | 10 guides per locale plus tool/category pages                                                               |
| Recent content and visible dates           | Pass                                   | Guides published 2026-11-01; PSU EN and all Spanish guides updated 2026-11-02; byline and `<time>` elements |
| About page and brand identity              | Pass for wording                       | Independent, unregistered brand; no invented entity or address                                              |
| Contact page                               | Pass                                   | `appkitx@gmail.com` in both locales                                                                         |
| Privacy policy                             | **Conditional**                        | Bilingual draft; legal/analytics confirmation pending                                                       |
| Terms of use                               | **Conditional**                        | Bilingual draft; India intended, legal review pending                                                       |
| Affiliate disclosure                       | Pass as preparation                    | Future-use page/component; no program or current-participation claim                                        |
| Authorship and dates                       | Pass                                   | AppKitX Editorial approved for both locales; no individual author invented                                  |
| Multilingual coverage                      | Pass                                   | 10 guides and 5 information pages per locale; switcher, hreflang, sitemap                                   |
| Navigation and discoverability             | Pass                                   | Localized Guides in nav/footer; Company/Legal in footer; internal links tested                              |
| No dev-only PC Builder exposure            | Pass                                   | No route, link, or sitemap entry in `dist`; live `/pc-builder/` returns 404                                 |
| No policy/legal blockers                   | **Not yet**                            | Legal review, analytics confirmation, editorial/translation review, release approval                        |

Gate A moves to **PASSED** only when the legal drafts are reviewed, the
production analytics configuration is confirmed, the 20 guides and Spanish
translation receive independent review, the manual accessibility audit is
recorded, and release approval is given. Search Console ownership and sitemap
submission are complete and no longer block Gate A. A Gate A pass would
authorize preparing an Associates application; it would **not** authorize API
access, live integration, or a public PC Builder release.

## 12. Recommended next action

1. Owner/legal review of the bilingual privacy, terms, and affiliate disclosure
   drafts, including the India jurisdiction wording.
2. Confirm the production Cloudflare Web Analytics configuration, retention,
   cookies, legal basis, and transfers.
3. Complete an external editorial/technical review of the 20 guides.
4. Record a Spanish translation review.
5. Complete the manual accessibility audit (screen reader, 200% zoom, tables,
   TOC).
6. Re-check Gate A. Only then decide whether to apply for Amazon.in Associates.

The public editorial site is already deployed. Do not submit an Associates
application, request Creators API access, implement an Amazon adapter, add
affiliate links, activate pricing providers, or expose the PC Builder until
those steps are complete and separately approved. Any further deployment
requires explicit approval.

## 13. Limitations

- No live crawl, Search Console data export, or production analytics were used.
  The Search Console state recorded here is a read-only owner report from
  2026-10-29; the production sitemap now exposes 52 URLs, but no indexing or
  full-discovery claim is made.
- The deployment record uses owner-supplied evidence and GitHub PR/check-run
  metadata; the Cloudflare dashboard was not accessed. The live checks listed in
  that record were independently rechecked on 2026-11-04.
- No Amazon account, application, credential, or API call was created or used.
- No ASIN was discovered or fabricated.
- No affiliate link or Amazon branding was added to the public pages.
- No public page mentions Nexverra or any other company.
- No legal advice is given; the privacy, terms, and affiliate pages are drafts.
- No independent editorial or Spanish translation review is recorded.
- The 20-article library is a foundation, not a guarantee of Amazon acceptance.
- Validation proves the repository's build and behavior, not production
  Cloudflare configuration, search rankings, or traffic.
