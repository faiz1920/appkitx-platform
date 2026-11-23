# Amazon India Readiness Gate & Manual ASIN Mapping Pilot (M10.14)

Status: **readiness assessment and pilot design complete, uncommitted for
review**. No Amazon account, API call, credential, ASIN, scraper, source-code
change, catalogue identity change, provider-mapping registry change, public
route, dependency, configuration or deployment was created.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Branch: `feature/m10-14-amazon-readiness-gate`
- Baseline: `0245b13972cebe285483e4220f0044d2ce9c921f`
- Baseline verification: local `main` = `origin/main`, HEAD = expected baseline
- M10.13 report: preserved unchanged as an untracked file
- M10.13 SHA-256 before work:
  `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee`
- Research/access date: **2026-11-01**
- Overall recommendation: **CONDITIONAL GO** for readiness work only; **NO-GO
  for live integration or public PC Builder release today**.

## 1. Executive summary

AppKitX is **not ready to apply for Amazon.in Associates** or to request
Creators API access today. The existing public website is accessible and has
original tool content, but it is a general calculator/developer-tools site with:

- six shipped tools across three categories;
- no PC-hardware reviews, guides, tutorials or buying advice;
- no About, Contact, Privacy Policy or Terms pages;
- no affiliate disclosure;
- no visible authorship or publication dates;
- no evidence of the content depth Amazon Associates review expects.

The development-only PC Builder is **not** a suitable substitute and should not
be exposed merely to satisfy an affiliate application.

The Amazon-side eligibility path remains the same as M10.13 reported:

1. Amazon.in Associates application and final acceptance.
2. Three qualifying sales within 180 days for Associates review.
3. Ten qualifying sales in the trailing 30 days for Creators API access.
4. Creators API registration, primary-account ownership and regional approval.
5. Ongoing sales activity to retain API access.

Catalogue identity reconciliation matches M10.13 exactly: **101 components, 50
source-verified identities, 0 human-reviewed identities, 46 MPNs, 9 GTINs, 5
with both, and 51 without source-verified identity**. All 15 GPUs and all 13
motherboards remain unverified.

The correct next step is **Gate A readiness**: build a credible public content
and legal surface, then apply for Associates. Do not implement the Amazon
adapter or expose the PC Builder until Gates A–D are separately passed.

## 2. M10.13 findings reconciliation

M10.13 was re-read and its key requirements were rechecked against current
official Amazon sources on 2026-11-01.

| M10.13 finding                                                               | Recheck result                                                                                                                                                  | Change?              | Confidence |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------- |
| PA-API 5 is deprecated; Creators API is the successor.                       | Confirmed: PA-API 5 calls return HTTP 403 and direct integrators to Creators API.                                                                               | No                   | High       |
| Creators API supports Amazon.in, INR and `en_IN`.                            | Confirmed: India locale lists `www.amazon.in`, INR, `en_IN`, Computers/Electronics search indices.                                                              | No                   | High       |
| Associates review requires three qualifying sales in 180 days.               | Confirmed by Amazon.in Account Dormancy and Application Review pages.                                                                                           | No                   | High       |
| Creators API requires 10 qualifying sales in the trailing 30 days.           | Confirmed by Creators API prerequisites and `AssociateNotEligible` error documentation.                                                                         | No                   | High       |
| API access is not immediate and requires final acceptance/registration.      | Confirmed: registration requires a reviewed/finally accepted Associates account; only the primary owner can register.                                           | No                   | High       |
| 50/101 components have source-verified identity; 0 human-reviewed.           | Confirmed by local identity audit.                                                                                                                              | No                   | High       |
| All 15 GPUs and 13 motherboards lack source-verified identity.               | Confirmed by local identity audit.                                                                                                                              | No                   | High       |
| OffersV2 does not provide complete payable totals.                           | Confirmed: shipping, tax and delivery fields are not available; featured listings only.                                                                         | No                   | High       |
| Caching, comparison, saved builds, SEO and price history need policy review. | Confirmed and expanded: 1-hour offer cache, 24-hour content cache, no image caching, no price tracking/alerts, licence limits on comparison and redistribution. | No (expanded detail) | High       |
| Amazon.in Creators API docs returned HTTP 500.                               | Still observed on direct `.in` documentation URLs; global official docs plus India locale/operating agreement used.                                             | No                   | Medium     |

### New details since M10.13

These refine, but do not change, the M10.13 requirements:

- India uses the **EU token endpoint** (`api.amazon.co.uk/auth/o2/token`,
  credential version 3.2).
- Creators API allows a maximum of **two applications per store** and **two
  credential sets per application**.
- Amazon.in Associates accounts can be closed for dormancy after **three years
  without advertising fees**, in addition to the Creators API 30-day sales
  access-loss rule.
- Amazon.in commission rates for **Oct–Nov 2026** are Computers 2.45%,
  Electronics 2.80%, Apple 0%, with Video Gaming Consoles & Hardware excluded.
- The India IP Licence says image content may not be stored; the Creators API
  best-practice table lists Images under a one-day cache. Treat the licence as
  stricter and confirm the exact image/metadata rule with Amazon.
- The public AppKitX site has **no About/Contact/Privacy/Terms routes** and no
  affiliate disclosure. This is an AppKitX-specific readiness gap, not an
  Amazon requirement change.

### Current official sources rechecked

| Source                             | URL                                                                                              | Accessed   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ---------- |
| Creators API introduction          | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction                         | 2026-11-01 |
| Creators API registration          | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api | 2026-11-01 |
| Creators API rates                 | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates                   | 2026-11-01 |
| Creators API India locale          | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/locale-reference/india               | 2026-11-01 |
| Creators API OffersV2              | https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/resources/offersV2     | 2026-11-01 |
| PA-API 5 deprecation               | https://webservices.amazon.com/paapi5/documentation/                                             | 2026-11-01 |
| Amazon.in Operating Agreement      | https://affiliate-program.amazon.in/help/operating/agreement                                     | 2026-11-01 |
| Amazon.in Account Dormancy         | https://affiliate-program.amazon.in/help/node/topic/G7MJTPEP9NC3YKMG                             | 2026-11-01 |
| Amazon.in Application Review       | https://affiliate-program.amazon.in/help/node/topic/G8TW5AE9XL2VX9VM                             | 2026-11-01 |
| Amazon.in Advertising Fee Schedule | https://affiliate-program.amazon.in/gp/associates/help/operating/advertisingfees                 | 2026-11-01 |

The full M10.13 source list remains valid and is not duplicated here.

## 3. Public website readiness

### 3.1 What exists today

The public AppKitX website is a static, indexable, bilingual tools site:

- 6 shipped tools: Percentage Calculator, Discount Calculator, Base64 Encoder,
  JSON Formatter, Date Calculator, Age Calculator.
- 3 published category pages: Calculators, Developer tools, Date & time.
- English and provisional Spanish routes.
- 21 built pages including the 404.
- Public access, no login/paywall, `robots.txt` allows crawling, sitemap exists.
- Tool pages contain original explanatory prose: 30 prose sections across the
  six tools, covering how each tool works, formulas, worked examples and edge
  cases.
- No PC-hardware reviews, buying guides, build guides, benchmark articles,
  tutorials or hardware buying advice.
- No About, Contact, Privacy Policy or Terms routes.
- No affiliate disclosure.
- No visible author bylines or publication/updated dates.
- The PC Builder is mounted only in `astro dev` by
  `src/integrations/pc-builder-dev-preview.ts`; it is not in the production
  build.

### 3.2 Explicit Amazon requirements vs inferred readiness

| Type                 | Requirement                                                                                              | AppKitX current state                                                                                   | Evidence                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Explicit**         | Site must be publicly available, not closed or paywalled.                                                | Pass: static public site, no login/paywall.                                                             | `src/pages`, `public/robots.txt`                                     |
| **Explicit**         | Applicant must own the website and identify it in the application.                                       | Partial: AppKitX brand/domain; no About/company/contact page demonstrating ownership.                   | `astro.config.ts` site `https://appkitx.com`; no About/Contact route |
| **Explicit**         | Site must have original content and meet a customer-experience bar.                                      | Partial: original tool prose exists, but only six tool pages and three category pages.                  | `src/i18n/dictionaries/en.ts`; `src/lib/tools.ts`                    |
| **Explicit**         | Content should generally be recent (within the last 60 days).                                            | Partial: repository content changed in October 2026, but no visible publication dates.                  | Git history; no dates in UI                                          |
| **Explicit**         | Review uses a rule of thumb of at least 10 posts.                                                        | Not met: six tool pages + three category pages; no editorial posts.                                     | `src/lib/tools.ts`; route inventory                                  |
| **Explicit**         | Privacy disclosure: explain how visitor data is collected, used, stored and disclosed.                   | Not met: no privacy policy route; README explicitly says no privacy-policy text was added.              | `README.md` “Privacy and consent”; no `privacy` route                |
| **Explicit**         | Affiliate disclosure when using Amazon links: “As an Amazon Associate I earn from qualifying purchases.” | Not met: no affiliate links or disclosure yet.                                                          | No affiliate disclosure in `Footer.astro`/dictionaries               |
| **Inferred**         | Clear About/Contact pages and brand ownership.                                                           | Not met.                                                                                                | No routes; footer has only Tools/Categories                          |
| **Inferred**         | Terms, privacy, disclosure and contact in navigation/footer.                                             | Not met: dictionary has Company/Legal labels but `Footer.astro` renders only Tools/Categories.          | `src/i18n/dictionaries/en.ts`; `src/components/Footer.astro`         |
| **Inferred**         | Editorial authorship and dates to demonstrate freshness/credibility.                                     | Not met: no author bylines or dates.                                                                    | `src/views`, dictionaries                                            |
| **Inferred**         | PC-hardware relevance/value for an Amazon PC-component integration.                                      | Not met: public site is general calculators/developer tools; PC Builder is dev-only.                    | `src/lib/tools.ts`; `src/integrations/pc-builder-dev-preview.ts`     |
| **AppKitX-specific** | Content depth sufficient to avoid a thin-site rejection.                                                 | At risk: six utility tools, no reviews/guides; Amazon says rejected applications may not be reassessed. | `src/lib/tools.ts`; Amazon Application Review page                   |
| **AppKitX-specific** | Do not expose dev-only PC Builder just to satisfy the application.                                       | Not exposed; must remain dev-only until separate release approval.                                      | `pc-builder-dev-preview.ts` only mounts on `command === "dev"`       |

### 3.3 Prioritized readiness checklist

| Priority | Item                          | Current state                        | Evidence                                           | Gap                                             | Recommended action                                                                     | Blocks application?                   |
| -------- | ----------------------------- | ------------------------------------ | -------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| P0       | Public site accessibility     | Pass                                 | Static site, robots allow, sitemap                 | None                                            | Keep public and crawlable                                                              | No                                    |
| P0       | Privacy policy                | Missing                              | No route; README says no privacy text              | No disclosure of data collection/use/storage    | Publish an accurate privacy policy; review Cloudflare RUM/analytics implications       | **Yes**                               |
| P0       | Affiliate disclosure          | Missing                              | No affiliate content/disclosure                    | Required once Amazon links are used             | Add disclosure before any affiliate link; include in footer/offer module               | **Yes** (before links)                |
| P0       | Content depth                 | 6 tools / 3 categories               | `src/lib/tools.ts`                                 | Below 10-post rule of thumb; no editorial posts | Publish substantive PC-hardware guides/reviews/buying advice or other original content | **Yes** (likely)                      |
| P0       | PC-hardware relevance         | None public                          | Tools are percentage/discount/base64/JSON/date/age | No hardware expertise or buying advice          | Build a PC-hardware editorial track; do not expose PC Builder solely for this          | **Yes** (for credible PC integration) |
| P1       | About page                    | Missing                              | No route                                           | Ownership/brand story unclear                   | Add About with team/ownership, mission, editorial standards                            | Recommended; likely review blocker    |
| P1       | Contact page                  | Missing                              | No route                                           | No accountability/contact                       | Add contact method and response expectations                                           | Recommended; likely review blocker    |
| P1       | Terms page                    | Missing                              | No route                                           | No site terms                                   | Add terms covering tools, content, external links, liability                           | Recommended                           |
| P1       | Authorship/dates              | Missing                              | No bylines/dates                                   | Freshness/credibility not visible               | Add author, published/updated dates to editorial content                               | Recommended                           |
| P1       | Navigation/footer legal links | Missing                              | Footer only Tools/Categories                       | Legal/company pages undiscoverable              | Add Company/Legal columns when pages exist                                             | Recommended                           |
| P1       | Content freshness cadence     | Recent repo changes, no public dates | Git history                                        | Reviewers cannot see cadence                    | Publish dated content and update policy                                                | Recommended                           |
| P2       | Editorial policy/corrections  | Missing                              | No page                                            | Trust signal                                    | Add editorial/corrections policy                                                       | Nice to have                          |
| P2       | PC Builder public release     | Dev-only                             | `pc-builder-dev-preview.ts`                        | Not suitable for application                    | Keep dev-only; separate release gate                                                   | No (do not expose)                    |

### 3.4 Public-site conclusion

The existing public AppKitX site **could** be used for an Associates
application in principle because it is public, owned and has original tool
content. It is **not ready today** because it lacks the legal/company pages,
content depth, PC-hardware relevance and visible editorial provenance that a
credible application needs. Applying now risks rejection, and Amazon states
that a rejected application may not be reassessed.

**Gate A status: NOT PASSED.**

## 4. Associates and Creators API eligibility plan

### 4.1 Rechecked requirements

| Question                                                                   | Current answer                                                                                                                                                                     | Evidence                                                                     | Confidence |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| Associates registration requirements                                       | Apply with a complete, accurate application identifying the site; site must be suitable, public, owned and original.                                                               | Amazon.in Operating Agreement; Application Review                            | High       |
| Application review requirements                                            | Review after at least three qualifying sales within 180 days; personal orders do not qualify; content recent/generally within 60 days; rule of thumb at least 10 posts.            | Account Dormancy; Application Review                                         | High       |
| Qualifying-sale thresholds                                                 | 3 qualifying sales / 180 days for Associates review; 10 qualifying sales / trailing 30 days for Creators API.                                                                      | Account Dormancy; Application Review; Creators API introduction; error codes | High       |
| Creators API registration prerequisites                                    | Fully accepted Associates account; primary account owner; register in Associates Central; create app/credentials.                                                                  | Register for Creators API                                                    | High       |
| Regional approval/account restrictions                                     | Credentials work globally, but partner tag must match marketplace and Creators API access must be approved in the region. India uses EU token endpoint/version 3.2.                | Creators API FAQ; Using cURL; Common headers                                 | High       |
| Can a new website apply before PC Builder is public?                       | Yes, an existing public website can be the application site; the PC Builder does not need to be public. But the site must meet content/review requirements.                        | Application Review; Operating Agreement                                      | High       |
| Can an existing public website be used?                                    | Yes, if owned by the applicant, publicly available, suitable and original.                                                                                                         | Application Review                                                           | High       |
| Does API eligibility depend on a particular Associates account/storefront? | Yes: primary account owner, partner tag/store ID for the marketplace, credentials linked to that account; regional approval.                                                       | Register; FAQ; Using cURL                                                    | High       |
| Account inactivity/access loss                                             | Creators API access can be lost after 30 consecutive days without qualified referring sales; Associates account can be closed for dormancy after 3 years without advertising fees. | API Rates; Account Dormancy                                                  | High       |
| Changes since M10.13                                                       | No threshold/API-status changes; additional operational details only.                                                                                                              | Recheck table above                                                          | High       |

### 4.2 Practical sequence

1. **Prepare public content and compliance.** Publish a credible public site
   with PC-hardware editorial content, About/Contact/Privacy/Terms, affiliate
   disclosure, authorship/dates, and no thin/duplicated pages. Do not expose
   the PC Builder solely for this purpose.
2. **Apply for Amazon.in Associates, if appropriate.** Use the existing public
   AppKitX site only when it genuinely meets the review criteria. Do not submit
   a premature application; rejected applications may not be reassessed.
3. **Meet the qualifying-sales requirement.** Use manual affiliate links and
   genuine audience traffic to reach three qualifying sales within 180 days.
   No API is required for this phase.
4. **Request/obtain Creators API access.** After final Associates acceptance and
   ten qualifying sales in the trailing 30 days, register in Associates Central
   as the primary account owner and request India regional access.
5. **Verify credentials and regional API access.** Confirm the Amazon.in partner
   tag, EU token endpoint/version, and that the account is not
   `AssociateNotEligible`. Do not make API calls until separately approved.
6. **Only then consider implementation approval.** Gate D and Gate E remain
   separate; API eligibility alone does not authorize live integration or
   production release.

### 4.3 Questions requiring direct Amazon confirmation

1. Is the current public AppKitX tools site acceptable for an Amazon.in
   Associates application, or is PC-hardware editorial content required for a
   PC-component integration?
2. Does the 10-post rule of thumb apply strictly to tool pages, or to editorial
   posts/articles?
3. Can a single Associates account use the same primary credentials for a
   future PC Builder subdirectory or separate tracking ID?
4. What is the exact India regional approval path for Creators API?
5. What evidence does Amazon require for the three and ten qualifying sales?
6. How are returns/cancellations handled in the trailing-30-day count?
7. What happens to Creators API access if sales pause for 30 days but the
   Associates account remains active?
8. Are manual ASIN mappings and ASIN-only records retainable indefinitely?
9. Is a responsive PC Builder web app treated as a website or a mobile
   application?
10. What is the correct contact/channel for written policy clarification?

## 5. Catalogue identity readiness

### 5.1 Reconciliation with M10.13

The local identity audit matches M10.13 exactly:

| Metric                                         | Count |
| ---------------------------------------------- | ----: |
| Total catalogue components                     |   101 |
| Source-verified identities                     |    50 |
| Human-reviewed identities                      |     0 |
| Components with MPN                            |    46 |
| Components with GTIN                           |     9 |
| Components with both MPN and GTIN              |     5 |
| Components without source-verified identity    |    51 |
| MPN-shaped model candidates (not verified MPN) |    16 |
| Descriptive model names                        |    35 |
| Duplicate normalized models                    |     0 |
| Invalid catalogue records                      |     0 |

### 5.2 Coverage by category

| Category    |   Total | Source-verified |    MPN |  GTIN |  Both | Without | Human-reviewed |
| ----------- | ------: | --------------: | -----: | ----: | ----: | ------: | -------------: |
| CPU         |      16 |              14 |     14 |     0 |     0 |       2 |              0 |
| GPU         |      15 |               0 |      0 |     0 |     0 |      15 |              0 |
| Motherboard |      13 |               0 |      0 |     0 |     0 |      13 |              0 |
| RAM         |      10 |               7 |      7 |     0 |     0 |       3 |              0 |
| Cooler      |      11 |               7 |      6 |     3 |     2 |       4 |              0 |
| Storage     |       9 |               4 |      4 |     0 |     0 |       5 |              0 |
| PSU         |       9 |               6 |      6 |     0 |     0 |       3 |              0 |
| Case        |      11 |               6 |      6 |     1 |     1 |       5 |              0 |
| Case fan    |       7 |               6 |      3 |     5 |     2 |       1 |              0 |
| **Total**   | **101** |          **50** | **46** | **9** | **5** |  **51** |          **0** |

No identity was promoted, changed or invented in this milestone.

### 5.3 Prioritized identity expansion plan

Two tracks should run in parallel:

- **Track 1 — pilot-ready:** use the 50 source-verified components for the
  manual ASIN mapping pilot; no new identity evidence is required to start the
  pilot design.
- **Track 2 — coverage expansion:** close the 51 gaps. GPU and motherboard work
  is strategically important but harder; the 23 remaining gaps are faster wins.

| Priority | Category                                      | Gap | Why identity matters for retailer mapping                                                          | Manufacturer source types                                                                 | Appropriate identifiers                                   | Variant/regional risks                                                                          | Evidence required                                                                 |
| -------- | --------------------------------------------- | --: | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| P0       | Existing 50 source-verified                   |   0 | Pilot baseline; ASIN mapping can start with exact MPN/GTIN candidates.                             | Existing M10.9–M10.12 sources                                                             | MPN/GTIN as recorded                                      | ASIN variants must still be reviewed                                                            | Existing source verification + M10.12 mapping review                              |
| P1       | GPU                                           |  15 | High-value components; board-partner, cooler, OC and memory variants create many similar listings. | Board-partner product pages, NVIDIA/AMD reference pages, manufacturer documents/packaging | Board-partner MPN, GTIN/EAN/UPC; model alone insufficient | Board partner, OC edition, cooler design, memory size, form factor, bundled games, regional SKU | Manufacturer page/document with exact board-partner MPN and, where possible, GTIN |
| P1       | Motherboard                                   |  13 | High-value; Wi-Fi, revision, form factor and BIOS variants create collisions.                      | Motherboard vendor product/spec pages, support/CPU QVL pages, packaging                   | Manufacturer MPN, GTIN/EAN/UPC; model plus revision       | Wi-Fi module, revision, form factor, color, regional SKU, BIOS                                  | Manufacturer page/document with exact MPN and revision; GTIN if published         |
| P1       | CPU gaps                                      |   2 | Boxed/tray and regional SKUs can look identical by model.                                          | AMD product pages, Intel ARK ordering/compliance pages                                    | Boxed order code/MPN, GTIN/EAN/UPC; model                 | Boxed vs tray, cooler included, regional SKU                                                    | Manufacturer ordering page or packaging                                           |
| P1       | PSU gaps                                      |   3 | Regional SKU, cable set and ATX version change identity.                                           | PSU vendor product pages, datasheets, packaging                                           | MPN, GTIN/EAN/UPC; wattage/model                          | Regional SKU, cable set, ATX version, color                                                     | Manufacturer page/document with regional SKU where applicable                     |
| P1       | Case gaps                                     |   5 | Color, panel, edition and bundled fans change the product.                                         | Case vendor product/spec pages, packaging                                                 | MPN, GTIN/EAN/UPC; model                                  | Color, glass/mesh panel, edition, bundled fans, regional SKU                                    | Manufacturer page/document with exact variant                                     |
| P1       | RAM gaps                                      |   3 | Kit capacity, module count, speed, timings and color change identity.                              | RAM vendor product/spec pages, packaging                                                  | Kit MPN, GTIN/EAN/UPC; model                              | Single module vs kit, capacity, speed, timings, color, profile                                  | Manufacturer page/document with exact kit code                                    |
| P1       | Cooler gaps                                   |   4 | Socket kit, revision, color and radiator size change identity.                                     | Cooler vendor product/spec pages, datasheets, packaging                                   | MPN, GTIN/EAN/UPC; model                                  | Socket kit, revision, color, radiator/fan size                                                  | Manufacturer page/document with exact variant                                     |
| P1       | Storage gaps                                  |   5 | Capacity, interface, form factor, heatsink and revision change identity.                           | Storage vendor product pages, datasheets, packaging                                       | MPN, GTIN/EAN/UPC; model                                  | Capacity, interface, form factor, heatsink, revision, retail vs OEM                             | Manufacturer page/document with exact model code                                  |
| P2       | Case fan gap                                  |   1 | Single vs multipack, PWM/DC, color and reverse blade change identity.                              | Fan vendor product pages, datasheets, packaging                                           | MPN, GTIN/EAN/UPC; model                                  | Single vs 3-pack, PWM/DC, color, reverse blade, connector                                       | Manufacturer page/document with exact pack/variant                                |
| P2       | Human review of 50 source-verified identities |  50 | Mapping review and catalogue identity review are separate; human review is not yet complete.       | Existing source evidence                                                                  | Existing MPN/GTIN                                         | Reviewer must re-open source and fingerprint                                                    | Named human review; no promotion in this milestone                                |

**Sequencing recommendation:**

1. Start the manual ASIN pilot with the 50 source-verified components (Track 1).
2. In parallel, close the 23 lower-ambiguity gaps (CPU/PSU/case/RAM/cooler/
   storage/fan).
3. Run a dedicated GPU workstream and a dedicated motherboard workstream;
   these are the largest zero-coverage categories and need board-partner/
   revision-specific evidence.
4. Only after new evidence is source-verified should it be considered for the
   provider mapping pilot. Human review remains separate.

**Do not** treat model names, Amazon titles, Amazon `itemPartNumber`, retailer
SKUs or search results as authoritative identity evidence.

## 6. Manual ASIN mapping pilot design

### 6.1 Scope

- Use the M10.12 `ProviderProduct` / `ProviderProductMapping` contracts.
- Pilot wave 1: a small, representative subset of the 50 source-verified
  components across CPU, cooler, PSU, case, RAM, storage and case fan.
- Exclude GPU and motherboard until source-verified identity exists.
- Do not assume any catalogue component already has an ASIN.
- No ASIN discovery is performed in M10.14; the template is blank.

### 6.2 Roles

| Role                     | Responsibility                                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mapping researcher       | Finds the exact Amazon.in listing using authoritative MPN/GTIN/model evidence; records ASIN, URL, title, brand/manufacturer, item part number, seller, condition and variant. |
| Evidence reviewer        | Re-opens manufacturer evidence and the Amazon listing; confirms exact identity; rejects ambiguity.                                                                            |
| Human approver           | Named person who approves/rejects the mapping; cannot be a process identity or the researcher alone for the same record.                                                      |
| Catalogue identity owner | Maintains the source-verified identity registry; does not approve provider mappings by default.                                                                               |
| Audit owner              | Runs duplicate/conflict/staleness audits and reports coverage.                                                                                                                |

### 6.3 Workflow

1. Select a catalogue component with source-verified MPN/GTIN.
2. Search Amazon.in manually for the exact MPN/GTIN/model and manufacturer.
3. Record the candidate ASIN and product URL; do not use search-result snippets
   as evidence.
4. Capture Amazon title, brand/manufacturer, model, item part number, seller,
   condition, variant and parent/child ASIN context.
5. Re-open the manufacturer source and compare exact MPN/GTIN/model.
6. Apply the decision rules below.
7. Record reviewer, date, evidence URLs, notes and decision.
8. Compute/store the mapping evidence fingerprint through the M10.12 workflow.
9. Run duplicate/conflict audit.
10. Only a named human approval may produce `verified`; the researcher cannot
    self-approve.
11. Revalidate on ASIN/content/variant/seller/lifecycle change or at the pilot
    review interval.

### 6.4 Decision rules

| Situation                                              | Decision                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Exact manufacturer + exact authoritative MPN agreement | Candidate; not verified until human approval                                             |
| Exact GTIN agreement + manufacturer agreement          | Candidate; not verified until human approval                                             |
| Exact MPN/GTIN but manufacturer disagreement           | Rejected; do not verify                                                                  |
| Model + manufacturer only                              | Needs-review; human investigation required                                               |
| Title-only similarity                                  | Unverified/rejected for mapping; title never establishes identity                        |
| Amazon `itemPartNumber` only                           | Needs-review; never treat as authoritative MPN without independent manufacturer evidence |
| Regional SKU or revision ambiguity                     | Rejected or needs-review; do not guess                                                   |
| Bundle, multipack, accessory or multi-component kit    | Rejected; must not map to a different single component                                   |
| Parent ASIN with multiple child products               | Map child ASIN only after review; parent ASIN alone is insufficient                      |
| Used/refurbished/unknown condition                     | Rejected for PC Builder pricing; pilot is New-only                                       |
| Discontinued/superseded listing                        | Record lifecycle; do not create a new verified mapping without review                    |
| Multiple ASIN candidates                               | Needs-review; never select the first                                                     |
| Same ASIN mapped to different components               | Fail closed; registry conflict                                                           |
| Same component with multiple legitimate ASINs          | Allowed only with distinct variant/region context and separate review                    |
| ASIN content/title/manufacturer/model/variant changes  | Review invalidated; revalidate                                                           |
| Seller context changes                                 | Review seller/listing context; revalidate if material                                    |
| Price/stock changes                                    | Not identity evidence; do not change mapping                                             |

### 6.5 Evidence and provenance

Required for each mapping:

- catalogue component ID and category;
- catalogue manufacturer/model;
- source-verified MPN and/or GTIN;
- Amazon marketplace (`www.amazon.in`);
- ASIN (child ASIN; parent ASIN separately if applicable);
- Amazon product URL;
- Amazon title;
- Amazon brand and manufacturer;
- Amazon item part number in a **separate field**;
- seller context;
- product condition;
- variant/revision;
- manufacturer evidence URL;
- evidence notes;
- reviewer and review date;
- mapping status and review status;
- rejection/revalidation reason;
- evidence fingerprint (system-computed, not manually invented).

The pilot template is in
`PC-BUILDER-M10-14-ASIN-MAPPING-TEMPLATE.md`. Amazon-specific fields are blank.

### 6.6 Fingerprint and review invalidation

Use the existing M10.12 fingerprint semantics:

- A review is current only when its evidence fingerprint matches the current
  mapping evidence.
- Changes to provider product identity, ASIN, catalogue component, MPN/GTIN,
  region, market, seller, variant, method or confidence invalidate the review.
- An invalidated `verified` mapping becomes `needs-review`; it is not usable.
- No automatic process may create a human-approved mapping.
- Rejected mappings remain rejected and are never usable.

### 6.7 Duplicate, conflict and revalidation

- Duplicate mapping IDs fail validation.
- Same provider product ID mapped to different components fails validation.
- Duplicate mappings for the same provider product/component fail validation.
- Same component/provider/region with conflicting non-null variants fails
  validation.
- ASIN reuse or product replacement must be recorded as supersession, not
  silently overwritten.
- Proposed pilot revalidation interval: **90 days or on any identity/content
  change, whichever comes first** (proposal only; not an existing policy).
- Stop conditions: no authoritative MPN/GTIN, manufacturer mismatch, bundle/
  multipack, regional/revision ambiguity, unavailable evidence, seller
  ambiguity, or policy uncertainty.

### 6.8 Pilot metrics

- components in scope / mapped / verified / candidate / needs-review / rejected;
- unmapped components;
- duplicate ASINs;
- conflicting mappings;
- stale reviews;
- ASIN churn/replacements;
- reviewer throughput and rejection reasons;
- percentage of components with exact MPN vs GTIN vs model-only evidence.

## 7. Legal and policy decision register

No legal conclusions are made here. Each item requires confirmation from the
listed owner before live integration.

|   # | Question                                                                      | Why it matters                                                       | Existing evidence                                                                                                         | Risk if wrong                            | Who must confirm                        | Blocks live integration?         |
| --: | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------- | -------------------------------- |
|   1 | Can Amazon prices be displayed beside other retailers in one comparison view? | The PC Builder's value may depend on multi-retailer comparison.      | Amazon licence requires Amazon content to send users/sales to Amazon and restricts linking Amazon content to other sites. | Account termination/content removal.     | Amazon Associates/legal; Indian counsel | **Yes**                          |
|   2 | Can price/availability be shown when shipping/tax are unknown?                | OffersV2 omits shipping/tax; totals would be incomplete.             | OffersV2 docs; M10.7 offer contract.                                                                                      | Misleading total/consumer harm.          | Product/legal; Amazon if needed         | **Yes** (display rules)          |
|   3 | Can ASINs be stored indefinitely?                                             | Durable mapping needs stable identity.                               | India IP Licence explicitly permits indefinite ASIN storage.                                                              | Low if ASIN-only; still confirm.         | Amazon/legal                            | No, with ASIN-only design        |
|   4 | Can Amazon MPN/GTIN/model/brand/title be stored beyond 24 hours?              | M10.12 mapping evidence is durable; licence limits non-ASIN content. | Licence: non-image content cache up to 24h; ASINs indefinite.                                                             | Mapping registry may violate licence.    | Amazon/legal                            | **Yes**                          |
|   5 | Can Amazon product images be stored or proxied?                               | UI may want local images.                                            | Licence: may not store/cache image content; image links up to 24h.                                                        | Content/licence breach.                  | Amazon/legal                            | **Yes**                          |
|   6 | Are 1-hour offer and 1-day resource caches acceptable?                        | Freshness/performance design.                                        | Creators API best practices; India licence 24h.                                                                           | Stale price or cache breach.             | Amazon/legal                            | No, if implemented as documented |
|   7 | Can saved builds contain Amazon references?                                   | Users save/share builds.                                             | ASINs may be stored indefinitely; price/availability limited.                                                             | Stale price or content retention breach. | Product/legal; Amazon                   | **Yes** (price display)          |
|   8 | Can shared/public build URLs include Amazon references?                       | Shared links are public.                                             | Same as saved builds; public URL may index content.                                                                       | Content/indexing breach.                 | Product/legal; Amazon                   | **Yes**                          |
|   9 | Can Amazon product content be indexed by search engines?                      | SEO pages may include Amazon titles/prices.                          | Licence/caching rules; no explicit SEO permission.                                                                        | Stale/duplicated content; policy breach. | Amazon/legal; SEO                       | **Yes**                          |
|  10 | Is historical price tracking permitted?                                       | Users may expect price history.                                      | Participation Requirements prohibit price tracking unless agreed.                                                         | Account termination.                     | Amazon/legal                            | **Yes** (do not build)           |
|  11 | Are price alerts permitted?                                                   | Common affiliate feature.                                            | Same prohibition on price alerting.                                                                                       | Account termination.                     | Amazon/legal                            | **Yes** (do not build)           |
|  12 | What affiliate disclosures are required?                                      | Legal/consumer transparency.                                         | “As an Amazon Associate I earn from qualifying purchases.”                                                                | Non-compliance.                          | Legal/marketing                         | **Yes**                          |
|  13 | What link/image formatting is required?                                       | Vended links and images have rules.                                  | Partner tag, no URL alteration, image links to Amazon, no framing.                                                        | Lost attribution/termination.            | Amazon/legal                            | **Yes**                          |
|  14 | Can Amazon content be used in a free PC Builder?                              | Product is free; Amazon wants sales.                                 | Licence requires principal purpose of advertising Amazon/driving sales.                                                   | Application/account rejection.           | Amazon/legal                            | **Yes**                          |
|  15 | Can manual ASIN mappings be retained independently of restricted API content? | Durable mapping vs ephemeral evidence.                               | Only ASINs explicitly indefinite.                                                                                         | Mapping registry breach.                 | Amazon/legal                            | **Yes**                          |
|  16 | Is a responsive web PC Builder a “mobile application”?                        | Native/mobile policy differs.                                        | Participation Requirements restrict mobile apps; Approved Mobile Application path exists.                                 | Application/account issue.               | Amazon/legal                            | **Yes**                          |
|  17 | How are PC components classified for commission?                              | Revenue model.                                                       | Oct–Nov 2026 rates; Computers 2.45%, Electronics 2.80%, Apple 0%, gaming hardware excluded.                               | Revenue assumptions wrong.               | Amazon/Associates support; finance      | No (commercial)                  |
|  18 | What GST/tax/withholding applies?                                             | Affiliate payments.                                                  | India Operating Agreement tax clauses.                                                                                    | Tax non-compliance.                      | Tax advisor/CA                          | No (commercial)                  |
|  19 | Who owns the Associates account/credentials?                                  | Primary-owner and regional approval rules.                           | Register/FAQ.                                                                                                             | Access loss/attribution errors.          | AppKitX owner; Amazon                   | **Yes**                          |
|  20 | Can Amazon content be cached at edge/CDN layers?                              | Cloudflare/worker caching.                                           | Licence/caching rules.                                                                                                    | Content retention breach.                | Amazon/legal; engineering               | **Yes**                          |

## 8. Multi-retailer architecture principles

The existing M10.7–M10.12 architecture already separates most concerns. Preserve
these boundaries; do not modify the architecture in this milestone.

| Concept                       | Must remain separate                                | Why                                                       |
| ----------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Catalogue component identity  | AppKitX component ID, manufacturer/model/MPN/GTIN   | Canonical identity; provider-independent                  |
| Provider product identity     | Provider ID + external product ID (ASIN for Amazon) | Provider-scoped; ASIN is not an MPN                       |
| Provider-to-catalogue mapping | Mapping ID, evidence, confidence, status, review    | Auditable association; never inferred from title          |
| Seller/listing identity       | Seller/merchant ID/name, marketplace                | Marketplace seller context is not component identity      |
| Offer price                   | Money amount + currency, provider/market scoped     | Never mix currencies or providers                         |
| Currency                      | ISO 4217, exact minor units                         | No implicit conversion                                    |
| Product condition             | New/used/refurbished/unknown                        | Amazon PC Builder is New-only; other providers may differ |
| Availability                  | Provider-specific state + observation time          | No stock-count invention                                  |
| Shipping and tax              | Explicitly known or unknown                         | Never fabricate complete totals                           |
| Affiliate attribution         | Partner tag/tracking layer, separate from price     | Amazon rules must not leak to other providers             |

### Amazon-specific policy boundaries

- Apply Amazon cache, attribution, link, image, price-display and comparison
  restrictions only to Amazon data and Amazon-facing presentation.
- Do not apply Amazon restrictions blindly to Flipkart or direct retailer data.
- Keep provider-specific policy configuration separate from the offer model.
- Do not add affiliate tracking parameters to source URLs implicitly.
- Do not use one provider's content to redirect traffic from another provider.
- If multi-retailer comparison is not approved, present Amazon offers in a
  clearly separated Amazon module or not at all.

No code, interface, schema or registry change is made in M10.14.

## 9. Readiness gates

A passed gate does **not** automatically authorize the next gate. Each gate
requires explicit evidence and approval.

### Gate A — Associates application readiness

**Purpose:** decide whether AppKitX has a credible public site to apply for
Amazon.in Associates.

**Criteria:**

- public, owned, accessible site with original content;
- PC-hardware editorial value or an honest, sufficient content strategy;
- at least 10 substantive posts/pages (Amazon rule of thumb);
- recent content and visible publication/update dates;
- About/Contact/Privacy/Terms and affiliate disclosure;
- clear ownership/brand and navigation;
- no thin affiliate pages, no dev-only PC Builder exposure;
- no policy/legal blockers for the application site.

**Current status: NOT PASSED.**

Evidence: six tools, three categories, 30 prose sections, no PC-hardware
editorial content, no About/Contact/Privacy/Terms, no affiliate disclosure, no
visible authorship/dates, PC Builder dev-only.

**Pass condition:** all criteria documented and reviewed; application can be
submitted. A pass does not authorize API access or live integration.

### Gate B — Creators API eligibility

**Purpose:** confirm Amazon.in Associates acceptance and Creators API access.

**Criteria:**

- accepted Amazon.in Associates account;
- three qualifying sales within 180 days;
- ten qualifying sales in trailing 30 days;
- primary account owner and Amazon.in partner tag;
- Creators API registration and India regional approval;
- credentials stored securely outside the repository;
- no `AssociateNotEligible`/access-denied state.

**Current status: NOT STARTED.**

Evidence: no account, no sales, no credentials, no API access.

**Pass condition:** account/API access confirmed in writing and credentials
secured. A pass does not authorize live integration; Gate C/D remain.

### Gate C — Manual mapping readiness

**Purpose:** prove the ASIN mapping process is controlled and auditable.

**Criteria:**

- blank template adopted;
- pilot cohort selected from source-verified identities;
- named researcher/reviewer/approver roles;
- manufacturer evidence re-opened for every mapping;
- no fabricated ASINs; no title-only verification;
- duplicate/conflict audit passes;
- mapping registry validation passes;
- rejected/revalidation reasons recorded;
- evidence fingerprints current.

**Current status: DESIGN ONLY / NOT PASSED.**

Evidence: template and rules designed; no ASINs discovered or mappings created.

**Pass condition:** a reviewed pilot mapping set with zero unresolved conflicts
and complete evidence. A pass does not authorize live API ingestion.

### Gate D — Live integration approval

**Purpose:** authorize implementation of a live Amazon adapter.

**Criteria:**

- Gates A–C passed;
- legal/policy register resolved or explicitly accepted with controls;
- provider adapter design approved;
- secret management, token cache, rate limiting, retry/backoff and observability
  approved;
- 1-hour offer cache and 1-day metadata cache implemented in design;
- ASIN-only durable mapping/evidence policy approved;
- no price history/alerts;
- display attribution/disclaimer approved;
- multi-retailer comparison policy resolved;
- implementation milestone explicitly approved.

**Current status: NOT AUTHORIZED.**

**Pass condition:** written approval for the implementation scope. A pass does
not authorize public production release.

### Gate E — Production release approval

**Purpose:** authorize public PC Builder release and production activation.

**Criteria:**

- Gate D passed;
- separate public-release decision;
- production isolation/route/sitemap review;
- privacy/legal/security review;
- CSP/security headers unchanged or separately approved;
- monitoring, rollback and incident response;
- noindex/public indexing decision;
- no deployment until explicit approval.

**Current status: NOT AUTHORIZED.**

**Pass condition:** separate production release approval. Gate D does not imply
Gate E.

### Gate summary

| Gate                                 | Status             | What it authorizes                                               | What it does not authorize                 |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------- | ------------------------------------------ |
| A — Associates application readiness | **NOT PASSED**     | Preparing/submitting an Associates application once criteria met | API access, integration, public PC Builder |
| B — Creators API eligibility         | **NOT STARTED**    | Requesting/using Creators API after approval                     | Live integration, production release       |
| C — Manual mapping readiness         | **DESIGN ONLY**    | Running a controlled manual pilot                                | API ingestion, production release          |
| D — Live integration approval        | **NOT AUTHORIZED** | Implementing the approved adapter scope                          | Public release/deployment                  |
| E — Production release approval      | **NOT AUTHORIZED** | Public PC Builder/production activation                          | Anything beyond the approved release scope |

## 10. Risks and unresolved questions

| Risk / question                                 | Severity   | Why it matters                                                                    | Suggested action                                                           |
| ----------------------------------------------- | ---------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public site lacks PC-hardware editorial content | High       | Amazon review may see a thin/general tools site; PC integration lacks credibility | Build reviews/guides/buying advice; do not expose PC Builder just for this |
| No About/Contact/Privacy/Terms                  | High       | Ownership, accountability and privacy disclosure gaps                             | Publish accurate pages; legal review                                       |
| No affiliate disclosure                         | High       | Required once Amazon links are used                                               | Add disclosure before links                                                |
| Only six tool pages vs 10-post rule of thumb    | High       | Application may be rejected; rejection may be final                               | Publish substantive content before applying                                |
| No visible authorship/dates                     | Medium     | Freshness/credibility hard to review                                              | Add author and published/updated dates                                     |
| Associates eligibility bootstrapping            | High       | New site may not reach 3/180 then 10/30                                           | Build audience; manual affiliate phase                                     |
| Ongoing 30-day API sales requirement            | High       | Access can be lost                                                                | Plan sustainable traffic/conversion                                        |
| Multi-retailer comparison policy                | High       | Core PC Builder value may conflict with Amazon licence                            | Written Amazon/legal approval or separated Amazon module                   |
| Durable Amazon evidence storage                 | High       | M10.12 evidence may exceed 24h content cache                                      | ASIN-only durable mapping; ephemeral evidence cache                        |
| Price history/alerts                            | High       | Prohibited without agreement                                                      | Do not build; confirm any “price drop” feature                             |
| Image caching                                   | Medium     | Licence prohibits storing image content                                           | Use image URLs only, ≤24h                                                  |
| No shipping/tax                                 | Medium     | Incomplete totals                                                                 | Keep unknown; never claim complete payable total                           |
| Featured offers only                            | Medium     | No all-seller comparison                                                          | Treat one featured listing as one offer                                    |
| Amazon `itemPartNumber` ambiguity               | High       | False MPN matches                                                                 | Keep separate; require manufacturer evidence                               |
| ASIN parent/child/bundle complexity             | High       | Wrong component mapping                                                           | Child ASIN only; reject bundles; human review                              |
| GPU/motherboard identity gap                    | High       | 28 high-value components unverified                                               | Dedicated identity workstreams                                             |
| Commission classification/low rates             | Medium     | Revenue uncertainty                                                               | Verify per ASIN; model conservatively                                      |
| Mobile app policy                               | Medium     | Native app may need approval                                                      | Launch responsive web first                                                |
| Amazon terms/API changes                        | Medium     | Platform risk                                                                     | Provider abstraction; monitor                                              |
| Amazon.in docs HTTP 500                         | Low/Medium | India-specific onboarding uncertainty                                             | Confirm with Amazon                                                        |
| Flipkart alternative docs stale                 | Medium     | Fallback may not be available                                                     | Verify current access before relying                                       |
| GST/tax/withholding                             | Medium     | Affiliate payment compliance                                                      | Tax advisor                                                                |
| No legal advice in this report                  | —          | Policy interpretation risk                                                        | Indian counsel review                                                      |

### Unresolved questions for Amazon

1. Is the current public AppKitX tools site acceptable for an Amazon.in
   Associates application, or is PC-hardware content required?
2. Does the 10-post rule of thumb count tool pages or only editorial posts?
3. Can one Associates account use a future PC Builder subdirectory/tracking ID?
4. What is the exact India Creators API regional approval path?
5. How are returns/cancellations counted in the trailing-30-day sales?
6. Can ASIN-only durable mappings be retained while Amazon evidence is
   re-fetched?
7. Can Amazon MPN/GTIN/model/brand/title be stored beyond 24 hours for mapping
   audit?
8. Are image URLs cacheable for one day, or only 24 hours as links?
9. Is a responsive PC Builder a website or a mobile application?
10. Is a multi-retailer comparison view permitted, or must Amazon content be
    isolated?
11. What exactly counts as price tracking versus a current price display?
12. How should saved/shared builds handle Amazon price/availability?
13. What commission classification applies to GPUs and gaming components?
14. What tax/GST documentation is required for affiliate payments?

## 11. Recommended next milestone

### M10.15 — Public Site & Associates Application Readiness (Gate A)

A non-code/content/legal milestone to:

- define and publish a PC-hardware editorial content plan (reviews, guides,
  buying advice, build examples);
- add About, Contact, Privacy Policy, Terms and affiliate disclosure;
- add visible authorship and publication/update dates;
- verify ownership/brand/navigation and content depth against Amazon review
  criteria;
- decide whether to apply with the existing tools site or a broader AppKitX
  content surface;
- keep the PC Builder dev-only and out of the application.

Gate A must pass before an Associates application is submitted. Gate B
(Associates/Creators API eligibility) follows only after Gate A. Gate C (manual
ASIN mapping pilot) can be prepared in parallel but must not create ASINs or
mappings until the pilot is explicitly authorized.

## 12. Final recommendation

# **CONDITIONAL GO — readiness work only**

- **Gate A:** NOT PASSED.
- **Gate B:** NOT STARTED.
- **Gate C:** DESIGN ONLY.
- **Gate D:** NOT AUTHORIZED.
- **Gate E:** NOT AUTHORIZED.

AppKitX should proceed with public-site content and legal readiness, then apply
for Amazon.in Associates only when Gate A is genuinely satisfied. It should not
request Creators API access, implement an Amazon adapter, or expose the PC
Builder until Gates B–E are separately passed.

## 13. Limitations

- No Amazon account, application, credentials or API calls were created/used.
- No ASINs were discovered or fabricated.
- No retailer was contacted.
- No source code, catalogue identity, provider mapping registry, route,
  dependency, configuration or deployment was changed.
- Amazon.in Creators API documentation returned HTTP 500 on 2026-11-01; global
  official docs plus India locale/operating agreement were used.
- Amazon requirements, rates and policies can change; this is a point-in-time
  readiness assessment, not legal advice.
- The public-site assessment is based on repository content, not a live crawl or
  Search Console data.
- Commission rates are an Oct–Nov 2026 snapshot.
- M10.13 remains the source of the full research evidence; this report
  reconciles and extends it.
