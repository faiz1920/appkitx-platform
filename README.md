# AppKitX

Global platform for free online calculators, developer utilities, and everyday tools.

## Design

The visual system and UI requirements are defined in [AppKitX-Design.md](./AppKitX-Design.md). All UI work follows that specification.

## Status

Homepage, navigation, and footer implemented to the AppKitX Design System v1.0 (teal "Precision" theme). Six tools are shipped, each built on the reusable `ToolLayout` template with cross-linked related tools:

| Tool                  | Category        | English route            | Spanish route               |
| --------------------- | --------------- | ------------------------ | --------------------------- |
| Percentage Calculator | Calculators     | `/percentage-calculator` | `/es/percentage-calculator` |
| Discount Calculator   | Calculators     | `/discount-calculator`   | `/es/discount-calculator`   |
| Base64 Encoder        | Developer tools | `/base64-encoder`        | `/es/base64-encoder`        |
| JSON Formatter        | Developer tools | `/json-formatter`        | `/es/json-formatter`        |
| Date Calculator       | Date & time     | `/date-calculator`       | `/es/date-calculator`       |
| Age Calculator        | Date & time     | `/age-calculator`        | `/es/age-calculator`        |

Category landing pages are live in both locales for [Calculators](/calculators), [Developer tools](/developer-tools), and [Date & time](/date-time). Unit Converter and Loan Calculator are the two remaining planned tools: they appear on the homepage and in the footer as non-interactive "Coming soon" entries, are absent from the tool registry, and can never surface in search results, related-tools sections, or category pages.

Global search (⌘K / Ctrl+K palette, hero search, nav trigger) searches the typed tool registry, localized per page. English is the source locale and Spanish (`/es/…`) is shipped as a provisional translation (see [Translation status](#translation-status)).

## Languages

Locale support is registry-driven: `src/i18n/config.ts` is the single source of truth, and the Astro i18n routing, the sitemap `i18n` option, the hreflang alternates, and the language switcher all derive from it. English is the default locale and stays unprefixed; every other locale is served under its prefix (for example `/es/`).

### Translation status

Each locale carries machine-readable provenance in `src/i18n/config.ts`: `source` (the language the copy is written in), `provisional` (served, but no human review recorded), or `reviewed` (a complete review record exists). Automated tests prove structural completeness and token parity; they never prove linguistic quality.

| Locale  | URL     | Status      | Review                                                                                                                                                               |
| ------- | ------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English | `/`     | Source      | —                                                                                                                                                                    |
| Spanish | `/es/…` | Provisional | Copy compared against the English source using an online translation service. No native-speaker review has been recorded, and no native-speaker approval is claimed. |

Spanish is the only entry in the explicit `PROVISIONAL_LOCALES` allowlist. The outstanding review, record template, and review checklist live in [TRANSLATION-REVIEWS.md](./TRANSLATION-REVIEWS.md). While Spanish remains provisional, the language switcher shows a “Traducción provisional” caption.

### Adding a language

1. Add a `LocaleMeta` entry to `locales` in `src/i18n/config.ts` (code, native name, English name, hreflang, `ogLocale`, direction, `intlLocale`) with `translation.status: "reviewed"` and a complete `review` record.
2. Create a complete dictionary at `src/i18n/dictionaries/<code>.ts` and register it in `dictionaries`. The `Record<LocaleCode, Dictionary>` type makes a missing or partial dictionary a compile error, and the `[locale]` pages plus the sitemap pick the locale up automatically.
3. Run `npm run check`, `npm test`, `npm run build`, and `npm run test:e2e`. Dictionary completeness and token parity are enforced generically; the routing and language-switcher end-to-end suites derive their locale sets from the registry, while explicit English/Spanish regression assertions remain.
4. **Merge gate**: a native speaker must review the complete user-facing copy — calculator labels, hints, errors, formulas, homepage, tool prose, metadata titles/descriptions, category copy, and navigation — and the review record (reviewer identity, reviewer type, date, scope, verdict) must be committed with the locale. A review by a fluent or professional reviewer is recorded as exactly that, never as native-speaker approval. Automated tests prove completeness, never translation quality.

Do not register a language or expose it in the switcher until its translations are complete and reviewed. A `provisional` locale is an explicit, allowlisted exception with a documented caveat — not a shortcut for new locales.

### Language behavior

- **Manual switcher**: a `<details>` disclosure in the navigation (and mobile drawer) lists every supported locale and links to the same page in that language. Choosing a language stores it under `appkitx.locale` in `localStorage`; the stored choice is honored on later visits, in both directions.
- **Browser-language detection ships disabled.** `AUTO_DETECT_ENABLED` in `src/i18n/preferences.ts` is the single kill switch. While it is `false` no detection code is emitted at all and a first visit never navigates, regardless of the browser's language. Enabling it (only after an SEO review) makes the pre-paint script match `navigator.languages` against supported locales on first visit.
- **No HTTP redirects, no server-side `Accept-Language` handling.** The only client-side navigation is the pre-paint preference script honoring an explicit choice (or, if enabled, a first-visit language match), and it only ever targets pages that exist in the target locale.
- **SEO trade-off (for review)**: both locale versions are fully rendered static HTML; non-JS crawlers always see exactly the requested URL. The preference script runs in `<head>` before paint, so there is no layout flash, and detection navigation is one-way (English pages may navigate to a matched locale; `/es/` pages never auto-navigate), so the Spanish URLs can never present as redirects to JavaScript-executing crawlers. `hreflang` alternates and `x-default` in the page head remain the primary language signals. If this trade-off is rejected, set `AUTO_DETECT_ENABLED` to `false` (already the default) and the site is free of all client-side navigation for visitors without a stored choice.

### SEO output

- Every indexable page carries a self-referencing canonical, reciprocal `hreflang` alternates for every supported locale, and `x-default` pointing at the unprefixed English URL — in the HTML head only.
- Every indexable page also shares one 1200×630 PNG social preview image at `/images/appkitx-og.png`, with localized alt text, explicit dimensions, and `summary_large_image` Twitter metadata.
- The sitemap pairs each translated page with its `en`/`es` alternates (emitted by `@astrojs/sitemap` from the registry via `sitemapI18n()`); it never contains `x-default` — the plugin has no support for it — and never lists `/en` URLs.
- **404 limitation**: static output has a single `404.html`, so unknown paths — including `/es/…` paths — serve the English noindex 404 page. Localized 404s are a future enhancement.

## Tools

`src/lib/tools.ts` is the single source of truth: only implemented tools are registered, and everything else derives from it — the homepage grid, the search palette, the footer, the 404 quick links, category membership, and the localized catalog (`src/i18n/tool-catalog.ts`). A planned tool is never registered: it may only appear as a non-interactive "Coming soon" card on the homepage and as plain text in the footer, never as a link, a search result, or a category member.

Every tool page renders through `ToolLayout` with a tool-specific component and view under `src/components/` and `src/views/`, plus thin route wrappers in `src/pages/` and `src/pages/[locale]/`. Tool logic lives in pure modules under `src/lib/` covered by Vitest; the Astro `<script>` blocks stay thin UI wrappers.

Adding a tool: register it in `src/lib/tools.ts`, add its dictionary strings to every locale, build the component and view, add the route wrappers, update the registry-derived tests, and run the standard validation (`npm run check`, `npm test`, `npm run build`, `npm run test:e2e`).

## Categories

Category landing pages are registry-driven. `src/lib/categories.ts` owns the taxonomy: an explicit `CATEGORY_SLUGS` map (stable English URL slugs, shared by every locale), the `CATEGORY_IDS` order, and membership helpers that read the `category` field on each tool in `src/lib/tools.ts`. There is no second list of tools per category, so a category page can only ever list registered, shipped tools.

- **Publication rule**: a category page ships when the category has at least `CATEGORY_PAGE_MIN_TOOLS` (2) registered tools. One-tool categories stay unpublished — a single-card page adds crawl surface without discovery value — and their URLs 404. `/calculators/` (English) and `/es/calculators/` (Spanish) are live.
- **Adding a category page**: add localized `categories.<Category>.page` copy to every dictionary — title, metaDescription, toolsHeading, and genuinely category-specific intro paragraphs (no repeated SEO templates, no claims the tools do not support) — then add the thin route wrappers `src/pages/<slug>.astro` and `src/pages/[locale]/<slug>.astro` for the shared `CategoryView` and run the standard validation. The dictionary-parity test fails until every locale has the page copy, and `CategoryView` fails the build if the category is under the two-tool threshold or missing copy.
- **Linking**: homepage chips and the footer Categories column activate automatically for published categories; each tool page links its category from the Related tools section ("See all"). Unpublished categories keep their in-page anchor on the homepage and render as plain text in the footer — never as links.
- **SEO**: category pages are indexable and carry a self-canonical, reciprocal `hreflang` alternates plus `x-default`, `BreadcrumbList` and `CollectionPage` JSON-LD, and the standard en/es sitemap pairing. Unpublished categories are never built, listed, or linked.

## Search Console monitoring

Google Search Console is a manual, maintainer-operated surface. Nothing in this repository submits sitemaps, requests indexing, or reads Search Console data, and this section deliberately contains no results — no Search Console data has been collected or verified in this repository. The site also ships **no analytics**: there are no tracking scripts or third-party embeds in the build, and none may be added without an explicit decision. Search Console is the intended performance signal until then.

### Automated checks (this repository)

- `npm run build` emits `dist/sitemap-index.xml` (referenced from `robots.txt`) and `dist/sitemap-0.xml` via `@astrojs/sitemap`, with the en/es alternates derived from the locale registry, no `/en` URLs, no `x-default`, and no 404.
- `npm test` asserts that the sitemap i18n configuration follows the locale registry (`tests/routing.test.ts`) and that canonical URL forms and the JSON-LD builders are consistent for every shipped page (`tests/seo.test.ts`).
- `npm run test:e2e` serves the production build and checks rendered canonicals, hreflang alternates, Open Graph, Twitter, and structured data per page, the noindex 404, the shared social image dimensions and format, and that `robots.txt` and the sitemap are served with the expected routes (`e2e/seo.spec.ts`, `e2e/social-metadata.spec.ts`, `e2e/deployment.spec.ts`).

These checks prove the site's output, never Google's behavior. Indexing, ranking, and reporting are only visible in Search Console.

### Manual checklist (maintainer, in Search Console)

**Sitemap submission and processing**

- Submit `https://appkitx.com/sitemap-index.xml` once under Sitemaps; after each deploy that adds or removes routes, re-check the status.
- Confirm the status reads "Success" and that the discovered-URL count matches the built page count for the release. Submitting a sitemap is a hint: it does not guarantee that any URL is crawled or indexed.

**Indexing and URL Inspection**

- Watch the Page indexing report for: "Indexed" growth; "Discovered – currently not indexed" and "Crawled – currently not indexed" on tool or category URLs; "Duplicate without user-selected canonical"; and unexpected 404s. `/converters/` and `/text-tools/` are expected 404s (unpublished categories) and must not be indexed.
- Use URL Inspection on one representative URL per surface — `/`, one tool page, one category page, and their `/es/` counterparts — and record, with the inspection date: whether the URL is on Google, the Google-selected canonical, the user-declared canonical, and crawl status.
- "Alternate page with proper canonical tag" on `/es/` pages is the expected correct state, not an issue. Requesting indexing only queues a crawl; it never guarantees indexing, and a URL must not be recorded as indexed without a dated URL Inspection result.

**Performance (impressions, clicks, CTR, average position)**

- Record impressions, clicks, CTR, and average position per reporting period from the Performance report, on both the Queries and Pages tabs.
- Compare English vs Spanish (`/es/…`) and tool vs category pages; watch for a tool page and its category page competing for the same query, and for Spanish pages appearing against English queries (hreflang should keep locales apart — the data shows whether it does).
- High impressions with low CTR on a page points at its title/description; record it as a follow-up instead of editing copy ad hoc.

**Canonical, hreflang, crawl, and sitemap issues**

- Canonical: every indexed tool/category URL should be self-canonical; `/es/` pages should report the English URL as the alternate and themselves as canonical.
- Hreflang: verify the en/es alternates and `x-default` resolve to the unprefixed English URLs (as emitted in the page head).
- Crawl: check Crawl stats for unexpected errors or `noindex` discoveries; the single English 404 for unknown paths — including `/es/…` — is expected (static output limitation) and stays noindex.
- Sitemap: investigate any "Couldn't fetch" or parse errors, and re-submit after route changes.

**Cadence and recording**

- Cadence: within a week of every production deploy that changes routes, copy, or locales; then at least monthly while the site is growing, and after any domain or locale change.
- Record findings where the work is tracked (milestone notes, PR descriptions, or dated notes in the repo's docs) — not in this README, which stays result-free. Every recorded claim needs its evidence: a dated URL Inspection result for indexing, the submitted URL and status for sitemaps, and the reporting period plus filters for performance numbers.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run check` — Astro and TypeScript checks
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright smoke tests (run `npm run build` first; the suite starts its own `astro preview` on port 4399 and never attaches to a dev server on 4321)
- `npm run format` / `npm run format:check` — Prettier

Line endings: the repository stores and checks out LF on every platform (`* text=auto eol=lf` in `.gitattributes`). If `format:check` reports CRLF files after a fresh Windows checkout, run `npx prettier --write .` once — it rewrites the working files to LF without changing any committed content.

## Deployment (Cloudflare Workers Static Assets)

The site is a static Astro build deployed as Cloudflare Workers Static Assets. `wrangler.jsonc` is the deployment contract: it serves the build output and renders the branded 404 page for unknown routes. There is no server-side runtime, API, or environment variable in the repository.

| Setting            | Value                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| Build command      | `npm run build`                                                          |
| Assets directory   | `dist` (configured in `wrangler.jsonc`)                                  |
| Unknown routes     | `not_found_handling: "404-page"` (branded `404.html`)                    |
| Compatibility date | `2026-10-17` (configured in `wrangler.jsonc`)                            |
| Node.js            | 22.22.0 or newer (the `engines` requirement of the pinned Astro release) |

Deployments run through the Wrangler CLI against `wrangler.jsonc`; the `previews` block in that file is required by the external deploy command. The exact invocation and any CI wiring are maintained outside this repository — no deploy script, workflow, or Wrangler dependency is checked in, so this file does not pin a command.

Validate a preview deployment before promoting to production.

The intended production domain is `appkitx.com` (canonical), with `www.appkitx.com` redirecting to it. Domain binding and DNS setup are manual Cloudflare steps and are not configured by this repository.

Security headers ship via `public/_headers` (content-type sniffing, referrer policy, framing, permissions policy, and immutable caching for hashed assets). HSTS is enabled at the Cloudflare zone level (SSL/TLS → Edge Certificates) once the domain is connected. A Content Security Policy is not set yet — the app uses small inline module scripts, so a strict CSP needs a hash-based pipeline first.
