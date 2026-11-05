# M10.16 — Public Launch Gate A Closure Readiness

Status: **Gate A remains CONDITIONALLY READY — NOT PASSED.** This is an audit
and documentation package. No application source, dependency, build, worker,
deployment, DNS, security, analytics, Search Console, Amazon, or PC Builder
change was made.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Starting branch: `main`
- Starting HEAD: `c7d2e09c500f80e750727e59dbec3755193cde75`
- `main` and `origin/main`: `c7d2e09c500f80e750727e59dbec3755193cde75`
- Audit date: **2026-11-05**
- PR #51 merged: **2026-11-04T18:50:51Z**
- PR #51 merge commit: `c7d2e09c500f80e750727e59dbec3755193cde75`
- Automatic Workers Builds deployment: **success at 2026-11-04T18:52:19Z**
- Live site: `https://appkitx.com`
- Gate A decision: **CONDITIONALLY READY — NOT PASSED**
- Amazon account, application, credentials, API call, affiliate link, or ASIN:
  **none**
- Public PC Builder: **not released; `/pc-builder/` returns HTTP 404**
- M10.13 report SHA-256:
  `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee`
  (unchanged)
- Companion tracker:
  [`PC-BUILDER-M10-16-OWNER-ACTION-TRACKER.md`](./PC-BUILDER-M10-16-OWNER-ACTION-TRACKER.md)

## 1. Executive summary

The public editorial site is live and technically credible. All 20 guide routes
and all 10 information-page routes returned HTTP 200 on 2026-11-05. The
production sitemap contains 52 URLs and includes every guide and information
page. `/pc-builder/` still returns HTTP 404, and the recorded security headers
are unchanged.

Gate A is still **not passed**. The remaining work is not primarily engineering
work. It is evidence and approval work:

- qualified legal review of the privacy policy, terms, and affiliate disclosure;
- owner confirmation of Cloudflare analytics, cookies, retention, transfers, CSP
  report handling, and Gmail processing;
- an independent English editorial/technical review of 10 guides;
- an independent Spanish review of 10 guides and the Spanish legal pages;
- a manual accessibility audit and sign-off;
- explicit owner disposition of remaining gated functionality.

The consolidated matrix contains **33 requirements**:

| Status         |  Count |
| -------------- | -----: |
| PASS           |     11 |
| CONDITIONAL    |      9 |
| BLOCKED        |      5 |
| NOT STARTED    |      6 |
| NOT APPLICABLE |      2 |
| **Total**      | **33** |

The legal register contains **24 findings**: 11 are factually supported by
repository or live evidence, 1 is conditional, and 12 require counsel or owner
evidence. All **14 counsel questions** remain unanswered. All 20 guides have
review-tracking entries; the Spanish locale remains provisional.

Search Console evidence remains limited to the owner-reported read of
**2026-10-29**. The sitemap was submitted and 20 pages were discovered at that
time. The production sitemap now exposes 52 URLs. This report does **not** claim
that all 52 URLs are discovered or indexed, and does not claim search visibility.

### Documentation inconsistencies found

The five inconsistencies below are **recorded, not reconciled**. Recording them
in this report is not a resolution. OA-16 in the companion tracker remains open
until each item is corrected in the authoritative document, with the correction
dated and traceable.

1. **Word-count totals disagree.** The readiness executive summary reports
   **32,860** prose words (15,291 English, 17,569 Spanish). Its own inventory
   table totals **31,845** (14,970 English, 16,875 Spanish). The quality review
   uses 32,860. The counting method and the authoritative total should be
   reconciled.
2. **Manual accessibility has conflicting Gate A weight.** The readiness report
   says Gate A moves to PASSED only when the manual accessibility audit is
   recorded. The quality review and owner-inputs tables label the manual audit
   "Recommended". This report applies the conservative interpretation: manual
   accessibility sign-off is a Gate A closure condition unless the owner
   explicitly downgrades it.
3. **Deployed draft notices still say "before publication".** The Privacy,
   Terms, and Affiliate Disclosure pages are publicly deployed as drafts, but
   their review notices still use pre-publication wording. This is a clarity
   issue for the final legal review, not a reason to remove the notices now.
4. **M10.14 is historically stale.** It describes a public site with no guides,
   legal pages, or affiliate disclosure. That was true before M10.15. Its
   Amazon-side Gate B/C/D/E constraints remain relevant, but its Gate A
   current-site assessment is superseded by M10.15 and must not be read as
   current.
5. **PR #51 is not recorded in the M10.15 documents.** The M10.15 records cover
   PR #50 and the 2026-11-03 deployment. PR #51 and the 2026-11-04 deployment
   are recorded here. There is no standalone M10.15.3 file; the M10.15.3 record
   is the embedded "Production Deployment Record — 2026-11-03" in the M10.15
   documents.

## 2. Scope and methodology

### 2.1 Sources read

- `PC-BUILDER-M10-15-PUBLIC-SITE-READINESS.md`
- `PC-BUILDER-M10-15-2-QUALITY-REVIEW.md`
- `PC-BUILDER-M10-15-2-LEGAL-REVIEW-REGISTER.md`
- `PC-BUILDER-M10-15-OWNER-INPUTS.md`
- `README.md`
- `PC-BUILDER-M10-13-AMAZON-IN-FEASIBILITY.md`
- `PC-BUILDER-M10-14-AMAZON-READINESS-GATE.md`
- `PC-BUILDER-M10-14-ASIN-MAPPING-TEMPLATE.md`
- Guide frontmatter and source under `src/content/guides/en/` and
  `src/content/guides/es/`
- Privacy, Terms, Affiliate Disclosure, Contact, and About views under
  `src/views/info/`
- PC Builder saved-build and pricing source under `src/lib/pc-builder/`
- The live production site on **2026-11-05**

### 2.2 Checks performed

- Confirmed `main` = `origin/main` at
  `c7d2e09c500f80e750727e59dbec3755193cde75`.
- Confirmed the working tree was clean before this documentation work.
- Confirmed the M10.15.3 merge commit is an ancestor of `main`.
- Requested all 20 guide URLs and all 10 information-page URLs with HTTP
  requests.
- Requested the guide indexes, home page, sitemap index, sitemap, and
  `/pc-builder/`.
- Counted sitemap URLs and compared guide/information routes against the
  sitemap.
- Checked that the live guide pages contain `AppKitX Editorial`.
- Checked that the 10 Spanish guide pages carry a provisional-translation
  notice.
- Checked the live privacy date and the PSU ATX 3.0 / ATX 3.1 / 12VHPWR /
  12V-2x6 terminology.
- Checked the presence of the recorded security headers.
- Inspected guide frontmatter for byline, locale, dates, category, and
  references.
- Inspected PC Builder saved-build storage, share-link encoding, pricing
  freshness, and public-route exposure.
- Cross-referenced the 24 legal findings and 14 counsel questions against the
  existing register and current repository evidence.

### 2.3 Limits

No Cloudflare dashboard, Google Search Console property, Gmail account, legal
agreement, or Amazon account was accessed. No screen reader, 200% zoom,
high-contrast, or assistive-technology session was run. No independent
editorial, translation, or legal review was performed. This document is not
legal advice.

### 2.4 Status definitions

| Status         | Meaning in this report                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PASS           | Supported by sufficient repository, live, or owner-recorded evidence for the stated scope. A PASS on a legal finding means factual accuracy only, not legal sufficiency. |
| CONDITIONAL    | Partially satisfied or awaiting specific evidence, review, or approval.                                                                                                  |
| BLOCKED        | Cannot proceed until an external dependency is resolved, such as counsel, an independent reviewer, or an account owner.                                                  |
| NOT STARTED    | No meaningful work or evidence exists.                                                                                                                                   |
| NOT APPLICABLE | Not required for the current Gate A scope, with the reason documented.                                                                                                   |

### 2.5 Evidence classes

- **Repository-verifiable:** source, frontmatter, routes, build output, tests.
- **Live-production:** HTTP status, rendered content, response headers.
- **Owner decision:** confirmed values recorded in M10.15 owner inputs.
- **External counsel:** qualified legal review and written advice.
- **Independent editorial:** a reviewer who is not the coding agent.
- **Independent translation:** a fluent or native Spanish reviewer.
- **Manual accessibility:** a tester using assistive technology and manual
  browser checks.
- **External platform:** Cloudflare, Google, Gmail, Amazon.

## 3. Verified baseline and merge commit

| Item                            | Verified value                                                     |
| ------------------------------- | ------------------------------------------------------------------ |
| Repository                      | `/Users/faiz/Work/nexverra/appkitx-platform-clean`                 |
| Starting branch                 | `main`                                                             |
| Starting HEAD                   | `c7d2e09c500f80e750727e59dbec3755193cde75`                         |
| Local `main`                    | `c7d2e09c500f80e750727e59dbec3755193cde75`                         |
| `origin/main`                   | `c7d2e09c500f80e750727e59dbec3755193cde75`                         |
| PR #50 merge                    | `2026-11-03T19:13:20Z`, merge commit `019fd60`                     |
| PR #50 deployment               | Workers Builds success at `2026-11-03T19:14:39Z`                   |
| PR #51 merge                    | `2026-11-04T18:50:51Z`, merge commit `c7d2e09`                     |
| PR #51 deployment               | Workers Builds success at `2026-11-04T18:52:19Z`                   |
| Manual deployment               | None recorded                                                      |
| Cloudflare dashboard            | Not accessed                                                       |
| Working tree before this report | Clean                                                              |
| M10.13 report SHA-256           | `390f8c79eb963112f1ba602c9c65d8937bcb8c4e4954517c9ac3c361690b4dee` |
| M10.14 deliverables             | Unchanged                                                          |

The M10.15.3 production record is embedded in the M10.15 readiness, quality, and
owner-input documents. No standalone M10.15.3 file exists.

PR #51 was documentation-only. Its merge nevertheless triggered the automatic
Cloudflare Workers Builds production deployment. This is the documented
deployment-automation behavior: any merge to `main` can deploy, including a
documentation-only merge.

## 4. Gate A closure matrix

The matrix consolidates the Gate A criteria from M10.14/M10.15 with the
closure requirements established by the legal, editorial, accessibility, and
production evidence. A `PASS` is not a legal conclusion.

| Requirement                                                       | Current status | Evidence                                                                                                                                  | Remaining action                                                                                                | Responsible party        | Closure evidence                                                            | Gate impact                           |
| ----------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------- | ------------------------------------- |
| GA-01 Public production site live and accessible                  | PASS           | Home, guide indexes, 20 guide routes, and 10 information routes returned HTTP 200 on 2026-11-05.                                          | None.                                                                                                           | Owner / agent            | Live HTTP checks.                                                           | Gate A prerequisite.                  |
| GA-02 Independent unregistered brand; no Nexverra association     | PASS           | Owner decision OD-2; source and live checks found no Nexverra mention in public content.                                                  | Keep the wording under review if the brand or entity changes.                                                   | Owner                    | Source/live brand check; owner decision.                                    | Gate A prerequisite.                  |
| GA-03 Public contact email                                        | PASS           | `appkitx@gmail.com` is published on Contact, About, Privacy, Terms, and Affiliate Disclosure in both locales; live checks confirmed.      | None.                                                                                                           | Owner                    | Live/source check.                                                          | Gate A prerequisite.                  |
| GA-04 AppKitX Editorial byline                                    | PASS           | 20/20 guide frontmatter entries and 20/20 live guide pages contain `AppKitX Editorial`.                                                   | None.                                                                                                           | Owner                    | Frontmatter and live-page check.                                            | Gate A prerequisite.                  |
| GA-05 English and Spanish coverage                                | PASS           | 10 English and 10 Spanish guides; 5 English and 5 Spanish information pages; all guide/information URLs are in the 52-URL sitemap.        | None for coverage. Translation quality is tracked separately.                                                   | Owner                    | Route/sitemap inventory.                                                    | Gate A prerequisite.                  |
| GA-06 Intended India jurisdiction documented                      | CONDITIONAL    | Owner decision OD-3 and the legal drafts state India as intended jurisdiction; final governing law is unconfirmed.                        | Obtain counsel-approved governing-law and jurisdiction wording.                                                 | Owner / counsel          | Counsel-reviewed terms and privacy wording.                                 | Gate A.                               |
| GA-07 Public PC Builder unavailable                               | PASS           | `/pc-builder/` returned HTTP 404 on 2026-11-05; no public route, navigation entry, or sitemap entry exists.                               | Keep it unavailable until a separate release gate.                                                              | Owner / agent            | Live 404 and source route check.                                            | Gate A guardrail.                     |
| GA-08 Navigation, sitemap, and discoverability                    | PASS           | 52 sitemap URLs; all 20 guide URLs and 10 information URLs are present; prior internal-link review found 0 broken links.                  | Re-run after any route change.                                                                                  | Owner / agent            | Sitemap comparison and live route checks.                                   | Gate A prerequisite.                  |
| GA-09 Recent content and visible dates                            | PASS           | Guides published 2026-11-01; PSU EN and all Spanish guides updated 2026-11-02; rendered `<time>` elements.                                | None.                                                                                                           | Owner                    | Frontmatter and rendered-page check.                                        | Gate A prerequisite.                  |
| GA-10 Privacy policy finalization and legal review                | CONDITIONAL    | Bilingual draft is live with review notices; 24 findings and 14 counsel questions remain open.                                            | Complete owner confirmations and counsel review; update the policy.                                             | Owner / counsel          | Signed counsel review and final bilingual policy.                           | Gate A.                               |
| GA-11 Terms, liability, and India jurisdiction                    | CONDITIONAL    | Bilingual draft is live; browsewrap, liability, and jurisdiction wording remain unconfirmed.                                              | Obtain counsel review and final wording.                                                                        | Owner / counsel          | Counsel-reviewed bilingual terms.                                           | Gate A.                               |
| GA-12 Affiliate disclosure review and timing                      | CONDITIONAL    | Future-use disclosure is live; no affiliate program or links exist; wording and timing are not approved.                                  | Obtain counsel review before any affiliate link or program application.                                         | Owner / counsel          | Approved disclosure wording and placement.                                  | Gate A.                               |
| GA-13 Cloudflare analytics, cookies, legal basis, and transfers   | BLOCKED        | Owner-reported configuration only; dashboard, cookie set, retention, DPA, and transfer mechanism are unconfirmed.                         | Owner supplies dashboard/cookie/DPA evidence; counsel confirms legal position.                                  | Owner / counsel          | Dashboard export, cookie inspection, DPA, transfer analysis.                | Gate A.                               |
| GA-14 CSP report retention and access control                     | BLOCKED        | CSP endpoint and `appkitx_csp_reports` dataset exist; retention and access controls are not configured or confirmed.                      | Set and document retention and access policy.                                                                   | Owner / counsel          | Written retention/access policy and configuration evidence.                 | Gate A.                               |
| GA-15 Gmail ownership, security, retention, and transfers         | BLOCKED        | `appkitx@gmail.com` is confirmed; account ownership, 2FA, access list, retention, and Google processing terms are unconfirmed.            | Owner confirms account controls; counsel reviews processing/transfers.                                          | Owner / counsel          | Written confirmation and counsel-approved policy wording.                   | Gate A.                               |
| GA-16 Spanish legal translation review                            | BLOCKED        | Spanish legal pages are provisional; no independent legal/translation review is recorded.                                                 | Independent Spanish legal review.                                                                               | Owner / reviewer         | Review record with reviewer, date, scope, and verdict.                      | Gate A.                               |
| GA-17 Legal entity, registered address, and counsel sign-off      | BLOCKED        | AppKitX is unregistered; no entity/address is claimed; no legal sign-off exists.                                                          | Owner decides entity/address; counsel approves final formulation.                                               | Owner / counsel          | Written entity decision and counsel sign-off.                               | Gate A.                               |
| GA-18 Independent English editorial/technical review              | CONDITIONAL    | Repository-level review complete; no independent review record for the 10 English guides.                                                 | Independent reviewer verifies claims, references, and corrections.                                              | Owner / reviewer         | Review record and correction log.                                           | Gate A.                               |
| GA-19 Independent Spanish translation review                      | CONDITIONAL    | Repository-level Spanish audit complete; no independent fluent/native review record.                                                      | Independent reviewer checks terminology, grammar, and technical wording.                                        | Owner / reviewer         | Review record and correction log.                                           | Gate A.                               |
| GA-20 Spanish provisional labeling                                | PASS           | Spanish locale is marked provisional; 10/10 live Spanish guide pages show a provisional-translation notice.                               | Remove the provisional label only after independent review.                                                     | Owner                    | Locale config and live-page check.                                          | Launch quality.                       |
| GA-21 PSU ATX 3.0 / ATX 3.1 correction preserved                  | PASS           | Live PSU guide contains ATX 3.0, ATX 3.1, 12VHPWR, and 12V-2x6; documents record the correction.                                          | Keep the terminology through any editorial revision.                                                            | Owner / reviewer         | Live-page check and review record.                                          | Factual accuracy.                     |
| GA-22 Reference reachability and manual browser check             | CONDITIONAL    | 10/14 unique reference URLs returned HTTP 200; 4 returned HTTP 403 to automated requests; manual browser check outstanding.               | Open the four 403 URLs manually and record the result.                                                          | Owner / reviewer         | Manual reference-check record.                                              | Editorial quality.                    |
| GA-23 Manual screen-reader review                                 | NOT STARTED    | No screen-reader session or assistive-technology evidence exists.                                                                         | Run a screen-reader pass on the guide index, one EN article, one ES article, and privacy.                       | Owner / tester           | Test report with findings and fixes.                                        | Gate A via GA-27.                     |
| GA-24 200% zoom and reflow                                        | NOT STARTED    | No 200% zoom evidence exists.                                                                                                             | Test guide index, articles, legal pages, tables, and TOC at 200%.                                               | Owner / tester           | Zoom test report.                                                           | Gate A via GA-27.                     |
| GA-25 High-contrast mode                                          | NOT STARTED    | No high-contrast or forced-colors evidence exists.                                                                                        | Test representative pages in high-contrast/forced-colors mode.                                                  | Owner / tester           | High-contrast test report.                                                  | Gate A via GA-27.                     |
| GA-26 Complete keyboard navigation journeys                       | CONDITIONAL    | Automated focus, target-size, skip-link, and current-language checks pass; full manual journey is not recorded.                           | Run complete keyboard journeys through navigation, guides, TOC, legal pages, and language switcher.             | Owner / tester           | Journey report with findings and fixes.                                     | Gate A via GA-27.                     |
| GA-27 Manual accessibility sign-off                               | NOT STARTED    | Depends on GA-23 through GA-26.                                                                                                           | Complete the manual audit and record owner/tester sign-off.                                                     | Owner / tester           | Signed accessibility sign-off.                                              | Gate A — conservative interpretation. |
| GA-28 Fresh Search Console sitemap and indexing review            | CONDITIONAL    | Last read 2026-10-29: 20 discovered pages, indexing processing; production sitemap now 52 URLs; no fresh read.                            | Re-read sitemap status, discovered URLs, and indexing report.                                                   | Owner                    | Current Search Console export/screenshots.                                  | Launch quality; not a legal blocker.  |
| GA-29 Search indexing and visibility evidence                     | NOT STARTED    | No current indexed-URL or search-visibility evidence exists; no claim is made.                                                            | Review indexed URLs and search-performance data after the fresh sitemap review.                                 | Owner                    | Indexing and performance report.                                            | Post-launch measurement.              |
| GA-30 Explicit owner disposition of remaining gated functionality | NOT STARTED    | No written disposition exists for the Amazon application, Creators API, affiliate links, pricing providers, or public PC Builder release. | Owner records approval, deferral, or rejection separately for each gated item; otherwise the gates stay closed. | Owner                    | Written disposition decision per gated item, with date and owner.           | Gate A.                               |
| GA-31 PC Builder saved/shared build data handling                 | NOT APPLICABLE | PC Builder is dev-only and returns 404; saved builds use browser `localStorage`; share links use a URL fragment, not a server.            | Complete a privacy/legal design review before any public PC Builder release.                                    | Owner / counsel          | Future-release privacy assessment.                                          | Not current Gate A; future Gate D/E.  |
| GA-32 Price comparison, caching, and historical-price questions   | NOT APPLICABLE | No live pricing provider or Amazon integration exists; M10.14 questions remain future-gate work.                                          | Obtain written answers before any pricing or Amazon release.                                                    | Owner / counsel / Amazon | Future-gate legal and provider answers.                                     | Not current Gate A; future Gate D/E.  |
| GA-33 No Amazon/API/affiliate/pricing/PC Builder activation       | PASS           | As of 2026-11-05, no Amazon account, API call, credential, ASIN, affiliate link, live provider, or public PC Builder route was found.     | Re-verify this standing guardrail at each gate review; keep it until separate written approval.                 | Owner                    | Dated source/live checks and owner records; current attestation 2026-11-05. | Standing guardrail (dated).           |

## 5. Legal and privacy outstanding actions

The legal register records 24 page-level findings and 14 questions for counsel.
The table below accounts for every finding. `PASS` means the repository or live
evidence supports the factual statement; it is **not** a legal conclusion.

### 5.1 The 24 legal findings

| ID    | Finding summary                                                          | Current status | Evidence currently available                                                                            | Outstanding decision or action                                                                          | Counsel required? | Closure evidence                                                  | Blocks Gate A? |
| ----- | ------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------- | -------------- |
| LR-01 | Operator is an unregistered brand; no entity or address is stated.       | CONDITIONAL    | Owner decision OD-2; legal drafts describe an unregistered brand; no entity/address is invented.        | Decide whether to register, use a sole-proprietor formulation, or use another counsel-approved wording. | Yes               | Written entity/address decision and approved wording.             | Yes            |
| LR-02 | Cloudflare Web Analytics retention, cookies, legal basis, and consent.   | BLOCKED        | Owner-reported configuration only; policy expressly avoids unsupported claims.                          | Confirm dashboard settings, retention, cookie behavior, legal basis, and consent approach.              | Yes               | Dashboard/cookie evidence and counsel-approved policy wording.    | Yes            |
| LR-03 | Production cookie set is not verified.                                   | BLOCKED        | Repository sets no cookies; edge cookie behavior is unverified.                                         | Inspect production `Set-Cookie` headers and browser storage.                                            | Yes               | Cookie inventory with name, purpose, duration, provider.          | Yes            |
| LR-04 | International transfer mechanism is unconfirmed.                         | BLOCKED        | Policy acknowledges possible processing outside the user's country; no mechanism is identified.         | Confirm Cloudflare/Google contracting entities, subprocessors, destinations, and safeguards.            | Yes               | Counsel-approved transfer analysis and policy wording.            | Yes            |
| LR-05 | Retention periods are not set.                                           | BLOCKED        | Policy describes retention as configuration-dependent; no concrete periods.                             | Set retention for logs, analytics, Search Console, CSP reports, and contact email.                      | Yes               | Documented retention schedule and policy wording.                 | Yes            |
| LR-06 | CSP report retention and access control are unconfirmed.                 | BLOCKED        | Worker writes normalized records to `appkitx_csp_reports`; retention/access are not configured.         | Set Analytics Engine retention and access policy.                                                       | Yes               | Documented retention/access policy and configuration evidence.    | Yes            |
| LR-07 | Gmail processing, access, retention, and transfers are undocumented.     | BLOCKED        | `appkitx@gmail.com` is confirmed; 2FA, access list, retention, and Google terms are unconfirmed.        | Confirm mailbox ownership, security, access, retention, and Google processing.                          | Yes               | Written account-control confirmation and approved policy wording. | Yes            |
| LR-08 | Policy says AppKitX does not sell personal information.                  | PASS           | Source and policy review found no sale, advertising, or data-broker mechanism.                          | Re-confirm if analytics, affiliate, or advertising integrations are added.                              | No                | Source/policy evidence; future change review.                     | No             |
| LR-09 | Policy says there is no visitor-profile database.                        | PASS           | Only application-level collection found is the CSP endpoint; no account/form/comment system.            | Re-check if a server-side form, account, or comment system is added.                                    | No                | Source evidence and future change review.                         | No             |
| LR-10 | Language preference uses `appkitx.locale`; auto-detection is disabled.   | PASS           | `src/i18n/preferences.ts` matches the policy statement.                                                 | Re-check if detection is enabled or the storage key changes.                                            | No                | Source/policy comparison.                                         | No             |
| LR-11 | Search Console is described as administration, not a page script.        | PASS           | Owner record and source/policy review; no indexing or ranking claim is made.                            | Keep the statement factual; refresh after a Search Console review.                                      | No                | Source/policy evidence and owner record.                          | No             |
| LR-12 | Cookies section distinguishes static build from edge beacon.             | PASS           | Policy and source distinguish the static build from Cloudflare's edge-injected beacon.                  | Re-verify after any hosting or analytics change.                                                        | No                | Source/policy comparison.                                         | No             |
| LR-13 | Browsewrap acceptance wording is unconfirmed.                            | BLOCKED        | Terms use "By using the site, you agree" language; enforceability is not assessed.                      | Counsel decides whether clickwrap, notice, or revised wording is required.                              | Yes               | Counsel-reviewed acceptance mechanism and final terms.            | Yes            |
| LR-14 | Limitation of liability and Indian consumer law are unconfirmed.         | BLOCKED        | Terms include a limitation clause subject to non-excludable law; consumer-law effect is not assessed.   | Counsel reviews against Indian consumer law and mandatory rights.                                       | Yes               | Counsel memo and final liability wording.                         | Yes            |
| LR-15 | IP/training restriction enforceability is unconfirmed.                   | BLOCKED        | Terms include the restriction; scope and enforceability are not assessed.                               | Counsel reviews the clause and the unregistered-brand ownership statement.                              | Yes               | Counsel-approved IP wording.                                      | Yes            |
| LR-16 | Governing law and jurisdiction are stated as intended India only.        | BLOCKED        | Terms and privacy state intended India with a warning that the final position is unconfirmed.           | Confirm entity and governing-law/jurisdiction clause with counsel.                                      | Yes               | Final counsel-approved clause.                                    | Yes            |
| LR-17 | PC Builder is described as in development and is not public.             | PASS           | Live `/pc-builder/` returns 404; no public route, link, or sitemap entry exists.                        | Keep it out of the public build until a separate release review.                                        | No                | Live/source route check.                                          | No             |
| LR-18 | Affiliate disclosure is explicitly future-use.                           | PASS           | Live disclosure states no active program and no affiliate links; source review matches.                 | Re-review before any affiliate link, application, or commission claim.                                  | No                | Live/source evidence and future review.                           | No             |
| LR-19 | Commission/price statement is a general statement.                       | BLOCKED        | Disclosure says a commission would not change the price paid; no retailer-specific confirmation exists. | Counsel confirms wording, especially for Amazon.in and India.                                           | Yes               | Counsel-approved disclosure wording.                              | Yes            |
| LR-20 | No Amazon branding, ASIN, tracking tag, API call, or membership claim.   | PASS           | Source and live checks found no Amazon branding, ASIN, affiliate link, or API call.                     | Keep it that way until written program approval and compliance review.                                  | No                | Source/live evidence.                                             | No             |
| LR-21 | Contact page promises no response time and asks for no sensitive data.   | PASS           | Contact page source matches the absence of a ticketing system.                                          | Confirm mailbox monitoring and retention expectations.                                                  | No                | Source/live evidence and owner confirmation.                      | No             |
| LR-22 | About page states independence and no manufacturer/retailer affiliation. | PASS           | About page states independent, unregistered, and unaffiliated; no Nexverra association appears.         | Re-confirm before any corporate or brand change.                                                        | No                | Source/live evidence.                                             | No             |
| LR-23 | Draft notices and provisional-translation note are present.              | PASS           | Live legal pages retain review notices; Spanish legal pages retain the provisional note.                | Keep notices until review is recorded.                                                                  | No                | Live/source evidence.                                             | No             |
| LR-24 | Spanish legal translation review is missing.                             | BLOCKED        | Spanish legal pages are provisional; no independent legal/translation review record exists.             | Record a Spanish legal/translation review.                                                              | Yes               | Review record with reviewer, date, scope, and verdict.            | Yes            |

### 5.2 The 14 counsel questions

All 14 questions remain open. None is answered by repository evidence. Including
these questions in counsel's engagement scope (OA-01) is **not** an answer.
Each question must receive a written answer or a documented unresolved outcome in
the applicable OA-06..OA-09 legal review record before the related finding can be
reconsidered.

| Q    | Question summary                                                          | Related findings | Status  | Evidence needed for closure                                    | Responsible party  |
| ---- | ------------------------------------------------------------------------- | ---------------- | ------- | -------------------------------------------------------------- | ------------------ |
| Q-01 | What entity/address details must appear in the privacy policy and terms?  | LR-01, LR-16     | BLOCKED | Written entity/address decision and approved wording.          | Owner / counsel    |
| Q-02 | Is the intended India governing-law/jurisdiction clause enforceable?      | LR-16            | BLOCKED | Counsel memo and final clause.                                 | Counsel            |
| Q-03 | Does browsewrap acceptance satisfy the intended jurisdictions?            | LR-13            | BLOCKED | Counsel opinion and final acceptance mechanism.                | Counsel            |
| Q-04 | How should the policy describe Cloudflare analytics/cookies/transfers?    | LR-02..05, LR-12 | BLOCKED | Dashboard/cookie/DPA evidence and approved policy wording.     | Owner / counsel    |
| Q-05 | Is the EU-visitor exclusion sufficient, or does it create a separate gap? | LR-02            | BLOCKED | Counsel analysis of the exclusion and target audience.         | Counsel            |
| Q-06 | What CSP retention and access controls are required?                      | LR-06            | BLOCKED | Documented retention/access policy and configuration evidence. | Owner / counsel    |
| Q-07 | Is a Gmail contact address acceptable, or is a domain mailbox required?   | LR-07, LR-21     | BLOCKED | Counsel opinion and owner mailbox decision.                    | Owner / counsel    |
| Q-08 | How should the policy describe Gmail processing and transfers?            | LR-04, LR-07     | BLOCKED | Google terms/transfer analysis and approved wording.           | Counsel            |
| Q-09 | Does the limitation-of-liability clause comply with Indian consumer law?  | LR-14            | BLOCKED | Counsel memo and final liability wording.                      | Counsel            |
| Q-10 | What affiliate disclosure wording is required, and when must it appear?   | LR-18, LR-19     | BLOCKED | Counsel-approved disclosure and placement/timing decision.     | Owner / counsel    |
| Q-11 | Is the "commission does not change the price" statement accurate?         | LR-19            | BLOCKED | Retailer/program-specific confirmation and approved wording.   | Counsel            |
| Q-12 | Are the Spanish legal drafts equivalent, and which version prevails?      | LR-24            | BLOCKED | Spanish legal/translation review and precedence clause.        | Counsel / reviewer |
| Q-13 | Are the hardware-safety disclaimers sufficient for editorial content?     | LR-14, LR-15     | BLOCKED | Counsel review of disclaimers and final wording.               | Counsel            |
| Q-14 | What security-incident and data-subject-request process is required?      | LR-05..07        | BLOCKED | Written incident/DSAR process and policy wording.              | Owner / counsel    |

### 5.3 Cross-cutting owner inputs

| Input                                      | Current state                          | Status         | Closure evidence                                       |
| ------------------------------------------ | -------------------------------------- | -------------- | ------------------------------------------------------ |
| Legal entity or approved alternative       | Not supplied                           | BLOCKED        | Written owner decision and counsel approval.           |
| Registered address or approved alternative | Not supplied                           | BLOCKED        | Written owner decision and counsel approval.           |
| Confirmed governing law and jurisdiction   | Intended India only                    | BLOCKED        | Counsel-approved clause.                               |
| Cloudflare dashboard confirmation          | Documented, not independently verified | BLOCKED        | Dashboard export/notes and cookie inspection.          |
| Cloudflare data-processing terms           | Not supplied                           | BLOCKED        | Current DPA/subprocessor/transfer record.              |
| Analytics and log retention periods        | Not supplied                           | BLOCKED        | Documented retention schedule.                         |
| Cookie inspection results                  | Not supplied                           | BLOCKED        | Cookie inventory and consent decision.                 |
| CSP dataset retention and access policy    | Not supplied                           | BLOCKED        | Written policy and configuration evidence.             |
| Mailbox ownership and retention            | Partially confirmed                    | CONDITIONAL    | Written account-control and retention confirmation.    |
| Legal review sign-off                      | Missing                                | BLOCKED        | Signed counsel review.                                 |
| Spanish legal/translation review           | Missing                                | BLOCKED        | Review record with reviewer, date, scope, and verdict. |
| Affiliate program terms                    | Not applicable today                   | NOT APPLICABLE | Future program terms if an application is prepared.    |

### 5.4 PC Builder saved/shared builds and pricing questions

These are future-release questions, not current Gate A blockers. The PC Builder
is development-only and `/pc-builder/` returns HTTP 404.

- **Saved builds:** `src/lib/pc-builder/saved-builds/storage.ts` uses browser
  `localStorage`; the storage key is `appkitx.pc-builder.saved-builds.v1`. The
  schema stores stable component IDs, names, source, timestamps, and optional
  guided-questionnaire metadata. It does not store catalogue records, derived
  compatibility verdicts, or power calculations.
- **Share links:** `src/lib/pc-builder/saved-builds/share-codec.ts` places a
  compact base64url payload in the URL fragment (`#build=...`). The fragment is
  not sent to the server. The payload contains schema version, name, source,
  component IDs, optional questionnaire metadata, and an optional creation time.
- **Current privacy policy:** the public privacy page describes the language
  preference key `appkitx.locale` but does not describe PC Builder saved builds
  or share links, because the PC Builder is not public. A future public release
  must add disclosure and retention/clearing instructions.
- **Price comparison and caching:** `src/lib/pc-builder/pricing/freshness.ts`
  defines development freshness thresholds (fresh 30 minutes, aging 6 hours,
  stale 24 hours). M10.14's questions about Amazon caching, ASIN-only storage,
  non-ASIN content limits, price history, price alerts, and multi-retailer
  comparison remain future-gate work. No live pricing provider is active.

## 6. Editorial and Spanish review tracker

All 20 guides use the approved `AppKitX Editorial` byline and carry publication
and update dates. The repository-level review found no invented testing,
benchmarks, prices, ownership, or affiliate claims. That review is **not** an
independent editorial approval.

The Spanish locale is **provisional**. All 10 Spanish guide pages carry a
provisional-translation notice. The Spanish legal pages also require a legal and
translation review. The PSU correction is preserved: ATX 3.0 introduced
12VHPWR; ATX 3.1 revised the connector as 12V-2x6.

| Guide URL                                                         | Locale | Byline            | Review status | Reviewer requirement                       | Factual verification requirement                                               | Corrections identified                                         | Evidence required for approval                                |
| ----------------------------------------------------------------- | ------ | ----------------- | ------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------- |
| `/guides/a-practical-guide-to-building-your-first-desktop-pc/`    | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check assembly, safety, BIOS, and troubleshooting claims.                      | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/ddr4-vs-ddr5/`                                           | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check platform support, bandwidth, latency, capacity, upgrade risk.            | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/gpu-buying-guide/`                                       | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check VRAM, resolution, power, clearance, and workload claims.                 | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/how-much-ram-for-gaming/`                                | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check 16/32/64 GB guidance, dual-channel, and speed claims.                    | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/how-to-check-pc-component-compatibility/`                | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check socket, chipset, memory, GPU, PSU, case, cooler, storage.                | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/how-to-choose-a-compatible-motherboard/`                 | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check socket, chipset, form factor, lanes, BIOS, and QVL claims.               | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/how-to-choose-a-cpu/`                                    | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check cores, clocks, cache, platform, cooler, and workload claims.             | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/how-to-choose-the-right-power-supply/`                   | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Recheck ATX 3.0/3.1, 12VHPWR, 12V-2x6, wattage, protections, transient.        | ATX 3.0/3.1 chronology corrected in M10.15.2.                  | Review record confirming the correction and remaining claims. |
| `/guides/pc-cooling-explained/`                                   | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check air/liquid, airflow, pressure, noise, and mounting claims.               | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/guides/ssd-buying-guide/`                                       | EN     | AppKitX Editorial | CONDITIONAL   | Independent English technical/editorial    | Check SATA/NVMe, lanes, endurance, DRAM, and thermal claims.                   | None found in repository-level pass.                           | Review record, date, scope, corrections, verdict.             |
| `/es/guides/a-practical-guide-to-building-your-first-desktop-pc/` | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/ddr4-vs-ddr5/`                                        | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/gpu-buying-guide/`                                    | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/how-much-ram-for-gaming/`                             | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/how-to-check-pc-component-compatibility/`             | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/how-to-choose-a-compatible-motherboard/`              | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/how-to-choose-a-cpu/`                                 | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/how-to-choose-the-right-power-supply/`                | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning; confirm ATX 3.1/12V-2x6 terminology. | Repository-level corrections recorded in M10.15.2.             | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/pc-cooling-explained/`                                | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |
| `/es/guides/ssd-buying-guide/`                                    | ES     | AppKitX Editorial | CONDITIONAL   | Independent fluent/native Spanish reviewer | Verify translation and technical meaning against the English source.           | Repository-level terminology corrections recorded in M10.15.2. | Spanish review record, date, scope, corrections, verdict.     |

### 6.1 Reference check status

The repository-level review checked 14 unique external reference URLs on
2026-11-04. Ten returned HTTP 200. Four returned HTTP 403 to automated requests:
PCI-SIG specifications, Intel Core processor pages, and the two JEDEC standards
pages. A 403 is not evidence that the page is gone. These four URLs still need a
manual browser check before independent editorial approval.

## 7. Accessibility review tracker

### 7.1 Automated evidence

The repository has a seven-test Playwright accessibility suite in
`e2e/accessibility.spec.ts`. The M10.15.2 record reports 21/21 passing tests
across Chromium, Firefox, and WebKit. The suite covers:

1. one H1, ordered headings, landmarks, and a working skip link;
2. accessible names for article and information layouts, plus current-language
   state;
3. accessible names for visible links, buttons, and form controls;
4. image `alt` attributes and decorative or named inline icons;
5. guide-card and primary-navigation focus-ring and target-size invariants;
6. reduced-motion behavior;
7. representative WCAG AA contrast pairings.

No axe-core dependency was added. Automated checks cannot prove screen-reader
pronunciation, full focus order across a journey, 200% zoom reflow, or
high-contrast behavior.

### 7.2 Manual checks still outstanding

| Check                                 | Status      | Evidence today                                | Tester requirement   | Closure evidence                                          | Gate impact                           |
| ------------------------------------- | ----------- | --------------------------------------------- | -------------------- | --------------------------------------------------------- | ------------------------------------- |
| Screen-reader review                  | NOT STARTED | No assistive-technology session recorded.     | Screen-reader tester | Test report covering guide index, EN/ES article, privacy. | Gate A via GA-27.                     |
| 200% zoom and reflow                  | NOT STARTED | No zoom session recorded.                     | Accessibility tester | Zoom report covering guides, legal pages, tables, TOC.    | Gate A via GA-27.                     |
| High-contrast / forced-colors mode    | NOT STARTED | No high-contrast session recorded.            | Accessibility tester | High-contrast report and fixes.                           | Gate A via GA-27.                     |
| Complete keyboard navigation journeys | CONDITIONAL | Automated focus/target/skip-link checks pass. | Accessibility tester | Manual journey report through nav, guides, TOC, legal.    | Gate A via GA-27.                     |
| Manual accessibility sign-off         | NOT STARTED | Depends on the four checks above.             | Owner and tester     | Signed sign-off record.                                   | Gate A — conservative interpretation. |

## 8. Production and Search Console evidence

### 8.1 Deployments

| Event                | Recorded value                                   | Evidence                  |
| -------------------- | ------------------------------------------------ | ------------------------- |
| PR #50 merge         | `2026-11-03T19:13:20Z`, merge commit `019fd60`   | GitHub PR metadata        |
| PR #50 deployment    | Workers Builds success at `2026-11-03T19:14:39Z` | GitHub check-run metadata |
| PR #51 merge         | `2026-11-04T18:50:51Z`, merge commit `c7d2e09`   | GitHub PR metadata        |
| PR #51 deployment    | Workers Builds success at `2026-11-04T18:52:19Z` | GitHub check-run metadata |
| Manual deployment    | None recorded                                    | Owner report              |
| Cloudflare dashboard | Not accessed                                     | This audit                |

### 8.2 Live checks on 2026-11-05

| Check                                                    | Result                                              |
| -------------------------------------------------------- | --------------------------------------------------- |
| Home page                                                | HTTP 200                                            |
| `/guides/` and `/es/guides/`                             | HTTP 200                                            |
| All 20 guide routes                                      | HTTP 200                                            |
| All 10 information-page routes                           | HTTP 200                                            |
| `/sitemap-index.xml`                                     | HTTP 200                                            |
| `/sitemap-0.xml`                                         | HTTP 200, 52 URLs                                   |
| All 20 guide URLs present in sitemap                     | Yes                                                 |
| All 10 information URLs present in sitemap               | Yes                                                 |
| `/pc-builder/`                                           | HTTP 404                                            |
| Privacy page date                                        | `2026-11-02`                                        |
| PSU guide terms                                          | ATX 3.0, ATX 3.1, 12VHPWR, 12V-2x6 present          |
| CSP header                                               | Report-Only, present                                |
| HSTS                                                     | `max-age=2592000`, present                          |
| `X-Content-Type-Options`                                 | `nosniff`, present                                  |
| `Referrer-Policy`                                        | `strict-origin-when-cross-origin`, present          |
| `Permissions-Policy`                                     | `camera=(), geolocation=(), microphone=()`, present |
| `AppKitX Editorial` on live guide pages                  | 20/20                                               |
| Spanish provisional notice on live ES guide pages        | 10/10                                               |
| Nexverra mention in public source/live contact and About | None found                                          |

### 8.3 Search Console state

| Item               | Recorded state                                                             |
| ------------------ | -------------------------------------------------------------------------- |
| Property           | Domain property `appkitx.com`                                              |
| Primary owner      | `appkitx@gmail.com` (verified, owner-reported)                             |
| Backup owner       | Owner's personal Gmail                                                     |
| Verification       | DNS TXT record via Cloudflare                                              |
| Sitemap submitted  | `https://appkitx.com/sitemap-index.xml` submitted successfully             |
| Sitemap index      | Publicly references `https://appkitx.com/sitemap-0.xml`                    |
| Last read          | **2026-10-29**                                                             |
| Discovered pages   | **20** at the last read                                                    |
| Production sitemap | **52 URLs** now                                                            |
| Page indexing      | Report was still processing at the last read                               |
| Fresh review       | Required; not performed in this audit                                      |
| Account access     | None; no Google account or Search Console setting was accessed or modified |

Search Console distinctions:

- **Sitemap submission** is confirmed by the owner record.
- **Discovered URLs** were 20 at the 2026-10-29 read.
- **Indexed URLs** are not confirmed.
- **Search visibility** is not measured or claimed.
- The production sitemap now exposes 52 URLs, but this report does not claim that
  Google has discovered or indexed all 52.

## 9. Owner decisions required

| ID   | Decision required                                                                                                                                                             | Why it matters                                         | Related requirements |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| OD-A | Register an entity or approve an unregistered-brand formulation and address.                                                                                                  | Privacy, terms, affiliate disclosure, counsel scope.   | GA-10, GA-11, GA-17  |
| OD-B | Confirm India as governing jurisdiction and approve final governing-law wording.                                                                                              | Terms and dispute resolution.                          | GA-06, GA-11         |
| OD-C | Approve final privacy, terms, and affiliate wording after counsel review.                                                                                                     | Gate A legal closure.                                  | GA-10, GA-11, GA-12  |
| OD-D | Supply Cloudflare analytics, cookie, retention, DPA, and transfer confirmations.                                                                                              | Privacy accuracy and lawful processing.                | GA-13                |
| OD-E | Set and document CSP report retention and access control.                                                                                                                     | Privacy/security policy accuracy.                      | GA-14                |
| OD-F | Confirm Gmail ownership, 2FA, access list, retention, and Google processing.                                                                                                  | Contact/privacy accuracy.                              | GA-15                |
| OD-G | Appoint an independent English editorial/technical reviewer.                                                                                                                  | Independent review of 10 English guides.               | GA-18                |
| OD-H | Appoint an independent fluent/native Spanish reviewer and legal translator.                                                                                                   | Spanish guide and legal review.                        | GA-16, GA-19         |
| OD-I | Appoint an accessibility tester and confirm the Gate A weight of manual sign-off.                                                                                             | Resolve the "required" vs "recommended" inconsistency. | GA-23..27            |
| OD-J | Record explicit owner disposition (approve, defer, or reject) separately for the Amazon application, Creators API, affiliate links, pricing providers, and public PC Builder. | Amazon, affiliate, pricing, and PC Builder gates.      | GA-30                |
| OD-K | Authorize correction of the documentation inconsistencies listed in section 1.                                                                                                | Consistent evidence and closure records.               | Report quality       |
| OD-L | Define the privacy/legal approach for future PC Builder saved/shared builds.                                                                                                  | Future public PC Builder release.                      | GA-31, GA-32         |

## 10. External dependencies

| Dependency                                    | Needed for                                              | Related requirements | Current status |
| --------------------------------------------- | ------------------------------------------------------- | -------------------- | -------------- |
| India-qualified legal counsel                 | Privacy, terms, liability, affiliate, entity, transfers | GA-10..17, LR-01..24 | Not engaged    |
| Cloudflare account owner/dashboard access     | Analytics, cookies, retention, DPA, CSP dataset         | GA-13, GA-14         | Not accessed   |
| Google Search Console owner access            | Fresh sitemap/indexing review                           | GA-28, GA-29         | Not accessed   |
| Gmail account owner                           | Ownership, 2FA, access, retention, transfers            | GA-15                | Not confirmed  |
| Independent English reviewer                  | 10 English guides                                       | GA-18                | Not appointed  |
| Independent Spanish reviewer/legal translator | 10 Spanish guides and 5 Spanish legal pages             | GA-16, GA-19         | Not appointed  |
| Manual accessibility tester                   | Screen reader, zoom, high contrast, keyboard journeys   | GA-23..27            | Not appointed  |
| Amazon.in Associates account and program      | Future Gate B/C                                         | Not current Gate A   | Not started    |

## 11. Prioritized closure roadmap

### P0 — Gate A blockers

1. **Engage India-qualified counsel and decide the entity/address approach.**
   Scope: entity/address, privacy, terms, liability, affiliate disclosure,
   international transfers, and the 14 counsel questions. Engagement includes
   the questions in scope; the written answers or documented unresolved outcomes
   are completed through the resulting counsel reviews. (OA-01, OA-02; the
   substantive reviews are OA-06..OA-09.)
2. **Owner supplies Cloudflare, CSP, and Gmail evidence.** Dashboard settings,
   cookie inspection, retention, DPA/subprocessors, transfer mechanism, CSP
   dataset retention/access, and Gmail controls. (OA-03..05)
3. **Complete independent English guide review.** All 10 English guides against
   current manufacturer documentation; record reviewer, date, scope, corrections,
   and verdict. (OA-10)
4. **Complete independent Spanish review.** All 10 Spanish guides and the Spanish
   legal pages; record reviewer, date, scope, corrections, and verdict. (OA-11)
5. **Complete the manual accessibility audit and sign-off.** Screen reader, 200%
   zoom, high contrast, and full keyboard journeys. Resolve the "required" vs
   "recommended" Gate A label. (OA-12, OA-13)
6. **Record explicit owner disposition of gated functionality.** Record
   approval, deferral, or rejection separately for the Amazon application,
   Creators API, affiliate links, pricing providers, and public PC Builder.
   Gate A closure does not itself authorize any of them. (OA-14)

### P1 — Launch quality and evidence consistency

7. Re-read Search Console sitemap, discovered URLs, and indexing report; do not
   claim indexing without current evidence. (OA-15)
8. Reconcile the documented word-count totals, accessibility Gate A weight,
   deployed draft-notice wording, and the stale M10.14 current-site assessment.
   (OA-16)
9. Recheck the four HTTP 403 reference URLs manually. (OA-10, OA-11)

### P2 — Future gates

10. Complete a privacy/legal design review for PC Builder saved/shared builds
    before any public release. (OA-17)
11. Obtain written answers on price comparison, caching, ASIN/non-ASIN storage,
    price history, and price alerts before any pricing or Amazon release. (OA-18)
12. Keep Amazon Gate B/C/D/E work closed until Gate A passes and the owner
    explicitly authorizes the next gate. (OA-19)

## 12. Explicit Gate A decision

**Gate A status: CONDITIONALLY READY — NOT PASSED.**

Reasons:

- The public editorial site is live and technically discoverable, but the legal
  and privacy drafts are not reviewed or finalized.
- Cloudflare analytics, cookies, retention, transfers, CSP report handling, and
  Gmail processing are not confirmed with evidence.
- The 10 English guides and 10 Spanish guides have not received independent
  review; the Spanish locale remains provisional.
- Manual accessibility checks and sign-off are not recorded.
- The owner has not recorded a disposition (approval, deferral, or rejection)
  for the remaining gated functionality.
- The 14 counsel questions remain unanswered; 12 of the 24 legal findings are
  blocked and 1 is conditional, all pending counsel or owner evidence.

Gate A can move to **PASSED** only when every mandatory P0 closure condition is
true and recorded and the owner explicitly accepts the resulting Gate A decision.
(OA-20.) The P1 items (OA-15 and OA-16) are supporting evidence and documentation
for a complete closure record; they must be completed or explicitly recorded as
open documentation exceptions, and they cannot replace P0 evidence. No P0
condition is waived by silence. Gate A closure does **not** itself authorize an
Amazon.in Associates application, Creators API access, affiliate links, live
Amazon integration, pricing-provider activation, or a public PC Builder release.
Each requires a separate written owner disposition (approval, deferral, or
rejection) recorded under OA-14, plus any applicable counsel review and a new
gate assessment.

## 13. Limitations and evidence gaps

- No Cloudflare dashboard, Cloudflare DPA, Google Search Console, Gmail account,
  or legal agreement was accessed.
- No qualified counsel has reviewed the legal pages or answered the 14 questions.
- No independent English or Spanish review record exists.
- No manual screen-reader, 200% zoom, high-contrast, or full keyboard-journey
  session was run.
- No current indexed-URL or search-visibility data exists.
- Four reference URLs returned HTTP 403 to automated requests; manual browser
  checks are still required.
- OA-16 remains open. The five documentation inconsistencies are recorded in
  section 1 but not reconciled; recording them is not resolution.
- The documented word-count totals disagree; this report does not resolve the
  counting method.
- M10.14's current-site assessment is historically stale. Its Amazon-side
  constraints remain relevant for future gates.
- There is no standalone M10.15.3 file; the M10.15.3 record is embedded in the
  M10.15 documents.
- Live checks prove HTTP status and spot-checked content, not a full crawl,
  security audit, legal review, or search ranking.
- This document is not legal advice and does not certify compliance with any law.

Prepared for owner review. No approval is implied by this document.
