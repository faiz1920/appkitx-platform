# M10.15.2 — Legal and Privacy Review Register

Status: **preparation only — no legal review has been completed**.
This register records what the M10.15 bilingual legal pages say, what the
repository can verify, and what must be decided by the owner and qualified
counsel before publication. It is not legal advice and does not certify
compliance with any law.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Branch: `feature/m10-15-public-site-readiness`
- Baseline: `db3f2d805700d10dc1819c44570597604a93dc0f`
- Review date: **2026-11-02**
- Deployment: **none**
- Amazon account, application, credentials, API call, or affiliate link:
  **none**
- Legal pages: visible drafts with review notices in English and Spanish

## 1. What was reviewed

| Source                                         | What it establishes                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/views/info/PrivacyPage.astro`             | Draft privacy policy, EN/ES, including the data-handling summary table         |
| `src/views/info/TermsPage.astro`               | Draft terms of use, EN/ES, including liability and India jurisdiction wording  |
| `src/views/info/AffiliateDisclosurePage.astro` | Future-use affiliate disclosure, EN/ES                                         |
| `src/views/info/ContactPage.astro`             | Public contact route and email expectations                                    |
| `src/views/info/AboutPage.astro`               | Independent-brand statement, editorial principles, no legal-registration claim |
| `src/lib/editorial.ts`                         | Contact address, intended jurisdiction, draft dates                            |
| `src/i18n/preferences.ts`                      | `appkitx.locale` local-storage behavior; automatic detection disabled          |
| `src/lib/csp-report.ts`, `src/worker.ts`       | CSP report endpoint, normalized fields, Analytics Engine sink                  |
| `wrangler.jsonc`                               | `appkitx_csp_reports` Analytics Engine dataset; asset and worker configuration |
| `README.md`                                    | Documented Cloudflare Web Analytics and Search Console state                   |
| `src/content/guides/**`                        | Editorial references and absence of testing, price, or affiliate claims        |

No Cloudflare dashboard, Google account, Search Console property, mailbox, or
legal agreement was accessed in this milestone. The Cloudflare and Search
Console statements below are read-only records supplied by the owner and
already documented in `README.md` and `PC-BUILDER-M10-15-OWNER-INPUTS.md`.

## 2. Review status

| Area                         | Status                                              | Consequence                                                                     |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Privacy policy               | **Draft — not legally reviewed**                    | Must not be presented as a final or compliant policy                            |
| Terms of use                 | **Draft — not legally reviewed**                    | Liability, consumer, and jurisdiction wording unconfirmed                       |
| Affiliate disclosure         | **Draft — not legally reviewed**                    | Future-use only; not an Amazon Associates disclosure                            |
| Operating entity             | **Unconfirmed**                                     | No legal entity, registered address, or registration number exists in the pages |
| Governing law / jurisdiction | **Intended India — unconfirmed**                    | Do not state that Indian law definitively applies                               |
| Analytics configuration      | **Documented, not independently verified**          | Retention, cookies, legal basis, and transfers unresolved                       |
| CSP report retention         | **Unconfirmed**                                     | Analytics Engine retention is not configured or documented                      |
| Contact mailbox              | **Address confirmed; processing terms unconfirmed** | Gmail retention, transfers, and access controls need review                     |
| Amazon Associates readiness  | **Not started**                                     | No account, application, approval, or program terms accepted                    |

## 3. Page-level register

Severity reflects publication risk, not a legal conclusion.

| ID    | Page / locale         | Finding                                                                                                                                                                                                            | Severity | Required action                                                                                                                                            |
| ----- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LR-01 | Privacy EN/ES         | The operator is described as an unregistered independent brand; no legal entity, address, or registration number is given.                                                                                         | High     | Supply the operating entity and registered address, or publish only after counsel approves an unregistered-brand formulation.                              |
| LR-02 | Privacy EN/ES         | Cloudflare Web Analytics is described from documentation: automatic setup, RUM enabled, EU visitor data excluded. Retention, cookie behavior, legal basis, and consent approach are expressly unresolved.          | High     | Confirm the deployed dashboard settings and obtain counsel's position on retention, cookies, legal basis, and consent.                                     |
| LR-03 | Privacy EN/ES         | Cloudflare may set security or performance cookies at the edge, but the exact production cookie set is not verified.                                                                                               | High     | Inspect production response headers and cookie behavior; document the actual cookies and their purpose.                                                    |
| LR-04 | Privacy EN/ES         | International transfers are acknowledged for Cloudflare and Google, but no transfer mechanism, safeguard, or destination list is confirmed.                                                                        | High     | Confirm the Cloudflare and Google contracting entities, data-processing terms, and transfer mechanism.                                                     |
| LR-05 | Privacy EN/ES         | Retention periods are described as configuration-dependent; no concrete period is stated for Cloudflare logs, analytics, Search Console, CSP reports, or contact email.                                            | High     | Set and document retention periods, or obtain counsel-approved wording that does not promise a period.                                                     |
| LR-06 | Privacy EN/ES         | CSP reports are written to the `appkitx_csp_reports` Analytics Engine dataset. The normalized record excludes IP address, full query string, and message content, but Cloudflare still processes request metadata. | Medium   | Confirm Analytics Engine retention and access; document it in the policy and the security runbook.                                                         |
| LR-07 | Privacy EN/ES         | Contact is `appkitx@gmail.com`. Gmail processing, mailbox access, retention, and international transfers are not covered by a documented agreement.                                                                | High     | Confirm mailbox ownership, two-factor authentication, access list, retention, and the provider's terms; consider a dedicated domain mailbox before launch. |
| LR-08 | Privacy EN/ES         | The policy states that AppKitX does not sell personal information. No advertising, data-broker, or sale mechanism exists in the code.                                                                              | Low      | Re-confirm if analytics, affiliate, or advertising integrations are added.                                                                                 |
| LR-09 | Privacy EN/ES         | The policy says the site does not operate a visitor-profile database; the only application-level collection is the CSP endpoint. This matches the repository.                                                      | Low      | Re-check if any server-side form, account, or comment system is added.                                                                                     |
| LR-10 | Privacy EN/ES         | The language preference is stored under `appkitx.locale`; automatic browser-language detection is disabled. This matches `src/i18n/preferences.ts`.                                                                | Low      | Re-check if detection is enabled or the storage key changes.                                                                                               |
| LR-11 | Privacy EN/ES         | The policy distinguishes Search Console from an embedded tracking script and records the confirmed domain property, primary owner, backup owner, DNS TXT verification, and sitemap submission.                     | Low      | Keep the statement read-only and factual; do not claim indexing or ranking outcomes.                                                                       |
| LR-12 | Privacy EN/ES         | The Cookies section now distinguishes the static build from the Cloudflare edge-injected beacon. This matches the documented production behavior.                                                                  | Low      | Re-verify after any hosting or analytics change.                                                                                                           |
| LR-13 | Terms EN/ES           | "By using the site, you agree to these terms" is browsewrap language. Its enforceability in India is unconfirmed.                                                                                                  | High     | Counsel to confirm whether clickwrap, notice, or revised wording is required.                                                                              |
| LR-14 | Terms EN/ES           | The limitation of liability excludes indirect, incidental, special, consequential, and punitive damages, subject to non-excludable law. Consumer-law effect in India is unconfirmed.                               | High     | Counsel to review against the Consumer Protection Act, 2019 and applicable contract law.                                                                   |
| LR-15 | Terms EN/ES           | The intellectual-property clause restricts republishing, attribution removal, and use to train or populate a competing service. Enforceability and scope are unconfirmed.                                          | Medium   | Counsel to review the wording and the ownership statement for an unregistered brand.                                                                       |
| LR-16 | Terms EN/ES           | Governing law and jurisdiction are stated as intended India, with an express warning that the final position is unconfirmed.                                                                                       | High     | Confirm the operating entity and the governing-law/jurisdiction clause with counsel.                                                                       |
| LR-17 | Terms EN/ES           | The terms say a PC builder is in development and is not part of the public site. The build contains no `/pc-builder` route or link.                                                                                | Low      | Keep the PC Builder out of the public build until a separate release review.                                                                               |
| LR-18 | Affiliate EN/ES       | The disclosure is explicitly future-use. It states that no affiliate program is active and no affiliate links exist. This matches the repository.                                                                  | Low      | Re-review before any affiliate link, program application, or commission claim.                                                                             |
| LR-19 | Affiliate EN/ES       | The disclosure says a commission would not change the price paid. This is a general statement, not a guarantee about every retailer's pricing.                                                                     | Medium   | Counsel to confirm wording, especially for Amazon Associates and India.                                                                                    |
| LR-20 | Affiliate EN/ES       | No Amazon branding, ASIN, tracking tag, API call, account claim, or program membership appears in the public pages.                                                                                                | Low      | Keep it that way until written program approval and a separate compliance review.                                                                          |
| LR-21 | Contact EN/ES         | The page promises no response time and asks users not to send sensitive data. This matches the absence of a ticketing system.                                                                                      | Low      | Confirm mailbox monitoring and retention expectations.                                                                                                     |
| LR-22 | About EN/ES           | The page states that AppKitX is independent, not legally registered, and not affiliated with manufacturers or retailers. No Nexverra association is claimed.                                                       | Low      | Re-confirm before any corporate or brand change.                                                                                                           |
| LR-23 | All legal pages EN/ES | Visible review notices and a provisional-translation note are present. They must remain until review is recorded.                                                                                                  | Low      | Do not remove the notices or change the status to "reviewed" without evidence.                                                                             |
| LR-24 | All legal pages EN/ES | English is identified as the reference draft and Spanish as provisional. Both locales contain the same substantive sections.                                                                                       | Medium   | Record a Spanish legal/translation review before publication.                                                                                              |

## 4. Cross-cutting issues for counsel

### 4.1 Operating entity and contact details

AppKitX is a separate, independent brand and is **not yet legally registered**.
The pages do not invent a company, address, registration number, or director.
Before publication, the owner must decide whether to:

1. register an entity and publish its legal name and registered address;
2. publish as an unregistered sole proprietor with a verified business address;
3. use another counsel-approved formulation.

The intended jurisdiction is **India**, but this is an intention, not a
confirmed legal conclusion. The pages must not imply that Indian law
definitively governs until counsel confirms it.

### 4.2 Cloudflare Web Analytics

Documented production configuration, as recorded by the owner:

- Cloudflare Web Analytics is enabled for `appkitx.com`.
- Setup method: automatic.
- Real User Measurements: enabled.
- Visitor data in the EU: excluded.
- The beacon is injected by Cloudflare at the edge and is not in `dist/`.
- The owner has decided to retain this configuration.

Unresolved:

- Whether the deployed service sets or reads cookies, and which ones.
- The retention period for analytics data.
- The legal basis and consent approach for each relevant jurisdiction.
- The Cloudflare contracting entity, data-processing terms, subprocessors, and
  international transfer mechanism.
- Whether excluding EU visitor data is sufficient for the target audience and
  whether it creates a separate gap for visitors outside the EU.
- How the policy should describe data that is aggregated or de-identified.

Do not state that Cloudflare Web Analytics is "cookieless", "GDPR-compliant",
or covered by a specific retention period without evidence.

### 4.3 Cookies and similar technologies

The repository does not set cookies. Cloudflare may set security or performance
cookies at the edge depending on account configuration. The exact production
cookie set has not been inspected. The policy says so and must remain accurate.

Required before publication:

- Inspect production `Set-Cookie` headers and browser storage.
- Document each cookie's name, purpose, duration, and provider.
- Decide whether a consent mechanism is required.
- Confirm that the language preference in local storage is described correctly.

### 4.4 Retention

| Data                     | Current statement                                       | Needed                             |
| ------------------------ | ------------------------------------------------------- | ---------------------------------- |
| Cloudflare request logs  | Controlled by the Cloudflare account configuration      | Concrete period and owner          |
| Cloudflare Web Analytics | Not stated; configuration-dependent                     | Concrete period and legal position |
| Search Console           | Controlled by Google under its terms                    | Confirm account and retention      |
| CSP reports              | Written to `appkitx_csp_reports`; period not configured | Set retention and access policy    |
| Contact email            | Kept as long as needed to answer and record corrections | Set a period and deletion process  |
| Local storage preference | Until the user clears site data                         | Confirm description                |

### 4.5 International transfers

Cloudflare operates a global network. Google processes Search Console data and
Gmail. The policy acknowledges possible processing outside the user's country
but does not identify a transfer mechanism. Counsel must confirm:

- the contracting entities and their locations;
- whether standard contractual clauses, adequacy decisions, or another
  mechanism apply;
- which countries are involved;
- how the policy should describe transfers without overpromising.

### 4.6 CSP reports

The worker accepts `application/csp-report` and `application/reports+json`,
limits the body to 32 KiB and 20 reports, and writes a normalized record to
Cloudflare Analytics Engine. The normalized record contains the effective and
violated directives, disposition, blocked origin or keyword, sanitized document
path, browser family, and count. The application code does not write the IP
address, full query string, or message content.

Unresolved: Analytics Engine retention, access control, whether Cloudflare adds
request metadata to the dataset, and whether the policy should call this
"security monitoring" in both locales.

### 4.7 Contact mailbox

`appkitx@gmail.com` is published in both locales. It is a Gmail address, not a
domain mailbox. Before publication, confirm:

- who controls the account and the recovery methods;
- whether two-factor authentication is enabled;
- who can read the mailbox;
- how long messages are retained;
- whether Google's terms and transfer mechanism are acceptable for the intended
  audience;
- whether a dedicated domain mailbox is preferable.

### 4.8 Affiliate and Amazon readiness

The public site contains:

- no Amazon link, ASIN, tracking tag, or API call;
- no Amazon account, application, approval, or program membership claim;
- no commission, ranking, or endorsement claim;
- a future-use affiliate disclosure in both locales.

If an Amazon.in Associates application is prepared later, counsel and the owner
must review the program's disclosure requirements, the India-specific terms,
the operating entity, the tax and payment arrangements, and the interaction
with the privacy policy. Nothing in this register authorizes an application.

### 4.9 Terms, liability, and consumer rights

The terms are a general draft. Counsel should review:

- browsewrap acceptance and whether a clickwrap or notice is needed;
- the limitation of liability against Indian consumer law and any mandatory
  rights in the user's jurisdiction;
- the "as is" and "as available" wording;
- the intellectual-property and training restriction;
- the third-party-link disclaimer;
- the availability and change clauses;
- the governing-law and jurisdiction clause;
- the affiliate-price statement.

### 4.10 Editorial and source claims

The guides state that they are based on manufacturer documentation, published
standards, and explained trade-offs. They do not claim hands-on testing,
ownership, benchmarks, or laboratory measurements. The About page repeats that
principle. Legal review should confirm that the disclaimers and the "no
professional advice" section are sufficient for the hardware-safety content.

## 5. Questions for counsel

1. What operating-entity and address details must appear in the privacy policy
   and terms before publication in India?
2. Is the intended India governing-law and jurisdiction clause enforceable, and
   what wording should replace it if not?
3. Does the browsewrap acceptance mechanism satisfy the intended jurisdictions?
4. How should the policy describe Cloudflare Web Analytics retention, cookies,
   legal basis, and international transfers?
5. Is the EU-visitor exclusion sufficient, or does it create a separate
   compliance gap?
6. What retention period should apply to CSP reports in Analytics Engine, and
   what access controls are required?
7. Is a Gmail contact address acceptable, or is a domain mailbox required?
8. How should the policy describe Gmail processing and transfers?
9. Does the limitation-of-liability clause comply with Indian consumer law?
10. What affiliate disclosure wording is required for Amazon.in Associates, and
    when must it be published?
11. Is the statement that a commission would not change the price paid accurate
    for the intended retailers?
12. Are the Spanish drafts legally equivalent to the English reference draft,
    and which version prevails in a dispute?
13. Are the hardware-safety disclaimers sufficient for the editorial content?
14. What security-incident and data-subject-request process must be documented
    before launch?

## 6. Owner inputs still required

| Input                                      | Needed for                           | Status                   |
| ------------------------------------------ | ------------------------------------ | ------------------------ |
| Legal entity or approved alternative       | Privacy, terms, affiliate disclosure | Missing                  |
| Registered address or approved alternative | Privacy, terms                       | Missing                  |
| Confirmed governing law and jurisdiction   | Terms                                | Intended India only      |
| Cloudflare dashboard confirmation          | Privacy, analytics                   | Documented, not verified |
| Cloudflare data-processing terms           | Privacy, transfers                   | Missing                  |
| Analytics and log retention periods        | Privacy                              | Missing                  |
| Cookie inspection results                  | Privacy, consent                     | Missing                  |
| CSP dataset retention and access policy    | Privacy, security                    | Missing                  |
| Mailbox ownership and retention            | Privacy, contact                     | Partially confirmed      |
| Legal review sign-off                      | All legal pages                      | Missing                  |
| Spanish legal/translation review           | All legal pages                      | Missing                  |
| Affiliate program terms (future)           | Affiliate disclosure                 | Not applicable today     |

## 7. What this register does not claim

- It does not claim that the privacy policy or terms are legally compliant.
- It does not claim that Cloudflare Web Analytics is cookieless or that a
  particular retention period applies.
- It does not claim that the site has completed a data-protection impact
  assessment.
- It does not claim that the Spanish legal text has been professionally
  reviewed.
- It does not claim that AppKitX is a registered legal entity.
- It does not authorize an Amazon Associates application, an affiliate link, a
  deployment, or a public PC Builder release.

## 8. Effect on Gate A

Gate A remains **CONDITIONALLY READY — NOT PASSED**. The legal pages exist in
both locales, carry visible review notices, and accurately describe the
repository's current behavior. They are not legally reviewed, the operating
entity is unconfirmed, and the analytics, cookie, retention, transfer, and CSP
questions above remain open.

Gate A can pass only when the owner supplies the missing entity and processing
details, qualified counsel records a review, the Spanish legal text is reviewed,
and release approval is given. A Gate A pass would authorize preparing an
Amazon.in Associates application; it would not authorize API access, live
integration, affiliate links, or a public PC Builder release.
