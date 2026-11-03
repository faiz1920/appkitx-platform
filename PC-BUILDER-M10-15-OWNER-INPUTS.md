# M10.15.1 — Owner Decisions and Remaining Inputs

Status: **owner decisions incorporated; legal and quality review still open**.
This document records what is confirmed, what remains unresolved, and what must
happen before Gate A or publication. Nothing here authorizes an Amazon
Associates application, Creators API access, an affiliate link, a public PC
Builder release, or a deployment.

## 1. Confirmed owner decisions (2026-11-01)

| ID   | Decision              | Confirmed value                                                                                                                                             | Effect on the site                                                                                                                                    |
| ---- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-1 | Public contact email  | `appkitx@gmail.com`                                                                                                                                         | Published on Contact, About, Privacy, Terms, and Affiliate Disclosure in English and Spanish; `mailto:` links use the address                         |
| OD-2 | Ownership             | AppKitX is a separate, independent brand; not yet legally registered                                                                                        | About and legal pages describe an unregistered independent brand; no registered company name, address, or legal identity is invented                  |
| OD-3 | Intended jurisdiction | India                                                                                                                                                       | Privacy, Terms, and Affiliate Disclosure state India as the intended jurisdiction and remain drafts pending legal review                              |
| OD-4 | Editorial identity    | `AppKitX Editorial`, approved for English and Spanish                                                                                                       | All 20 guide entries use the organizational byline; no individual author or qualification is invented                                                 |
| OD-5 | Multilingual strategy | English and Spanish are existing supported languages; both must cover guides and information pages                                                          | Ten guides and five information pages exist in both locales; language switcher, hreflang, and sitemap pair them                                       |
| OD-6 | Analytics             | Production uses Cloudflare Web Analytics                                                                                                                    | Privacy policy describes Cloudflare Web Analytics separately from search administration                                                               |
| OD-7 | Search Console        | Domain property `appkitx.com`; primary verified owner `appkitx@gmail.com`; personal Gmail retained as backup owner; DNS TXT verification through Cloudflare | Privacy policy and README document the arrangement; sitemap submitted and read-only state recorded; no account setting was modified in this milestone |
| OD-8 | Affiliate status      | No affiliate program is active; no affiliate links                                                                                                          | Affiliate disclosure is explicitly future-use and makes no current-participation claim                                                                |

### Ownership wording constraint

AppKitX is described only as a separate, independent brand. It is not associated
with any other company or technology brand. No registered entity, registered
address, phone number, or legal identity is claimed. The legal pages remain
drafts pending legal review.

## 2. Remaining decisions and reviews

| ID   | Item                                                              | Owner                      | Blocks Gate A?                          | Current state                                                                                                                                           |
| ---- | ----------------------------------------------------------------- | -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RI-1 | Privacy policy legal review and production analytics confirmation | Site owner + legal counsel | **Yes**                                 | Draft with review notice; Cloudflare RUM and Search Console described but retention, consent, cookie behavior, and transfer mechanism need confirmation |
| RI-2 | Terms, liability, and India jurisdiction review                   | Site owner + legal counsel | **Yes**                                 | Draft with review notice; India is stated as intended jurisdiction, not a legal conclusion                                                              |
| RI-3 | Affiliate disclosure review                                       | Site owner + legal counsel | **Yes**                                 | Future-use draft; no program or link exists                                                                                                             |
| RI-4 | External editorial/technical review of the 20 guides              | Site owner / reviewer      | **Yes**                                 | Not recorded                                                                                                                                            |
| RI-5 | Spanish translation review                                        | Site owner / reviewer      | **Yes** for Spanish publication quality | Spanish is provisional; no native-speaker review is recorded                                                                                            |
| RI-6 | Accessibility audit                                               | Site owner                 | Recommended                             | Automated focus, keyboard, link, and 320px checks pass; no manual assistive-technology audit                                                            |
| RI-7 | Search Console ownership transition                               | Site owner                 | No                                      | Complete: `appkitx@gmail.com` is the verified primary owner, personal Gmail is backup owner; sitemap submitted; page indexing still processing          |
| RI-8 | Release, merge, and deployment approval                           | Site owner                 | **Yes** for publication                 | Not requested                                                                                                                                           |

## 3. Privacy, analytics, and Search Console (RI-1, RI-7)

The privacy policy now distinguishes:

- **Cloudflare Web Analytics / RUM** — production website analytics; the
  documentation states it is enabled, EU visitor data is excluded, and the owner
  has retained the configuration. The beacon is injected by Cloudflare and is not
  part of the static build.
- **Google Search Console** — search-performance administration, not a tracking
  script embedded in public pages. The confirmed arrangement (read
  **2026-10-29**) is a domain property for `appkitx.com`, with
  `appkitx@gmail.com` as the verified primary owner and the owner's personal
  Gmail retained as a backup owner. Verification uses a DNS TXT record managed
  through Cloudflare. The sitemap `https://appkitx.com/sitemap-index.xml` was
  submitted successfully and the sitemap index publicly references
  `https://appkitx.com/sitemap-0.xml`. Search Console reported **20 discovered
  pages**; the page indexing report was still processing, so no claim is made
  that any page is indexed. `robots.txt` allows crawling.

Still required:

- Confirm the current Cloudflare dashboard settings, retention, cookie/security
  behavior, data processing agreement, and international transfer mechanism.
- Confirm whether Cloudflare Web Analytics is cookieless in the deployed
  configuration. Do not state that it is without evidence.
- Confirm the legal basis and consent approach for the target jurisdictions.
- Record the Search Console users and review access periodically. The primary
  owner and backup owner are confirmed; additional delegated users are not.
- Confirm how long contact emails and CSP reports are retained.

### Search Console status (confirmed 2026-10-29)

| Item             | Confirmed state                                                |
| ---------------- | -------------------------------------------------------------- |
| Property         | Domain property `appkitx.com`                                  |
| Primary owner    | `appkitx@gmail.com` (verified)                                 |
| Backup owner     | Owner's personal Gmail                                         |
| Verification     | DNS TXT record via Cloudflare                                  |
| Sitemap          | `https://appkitx.com/sitemap-index.xml` submitted successfully |
| Sitemap index    | Publicly references `https://appkitx.com/sitemap-0.xml`        |
| Discovered pages | 20 (current production site, not the undeployed M10.15 branch) |
| Page indexing    | Report still processing; indexing not confirmed for any page   |
| `robots.txt`     | Allows crawling                                                |

No Google account or Search Console setting was accessed or modified in this
milestone; the state above is a read-only record supplied by the owner.

## 4. Legal drafts (RI-1, RI-2, RI-3)

The English and Spanish Privacy Policy, Terms of Use, and Affiliate Disclosure
carry visible draft notices. Spanish legal pages also carry a provisional
translation note; the English draft is the reference version until both are
reviewed.

Required before publication:

- Confirm the operating legal entity or confirm that no entity is registered.
- Confirm the registered address if one exists. Do not invent one.
- Confirm India as the governing jurisdiction and the final governing-law
  wording with counsel.
- Review liability, consumer-rights, and dispute-resolution wording for India.
- Review the affiliate disclosure and the exact statement required by any future
  affiliate program.
- Remove or update the draft notices only after review.

## 5. Editorial and translation quality (RI-4, RI-5)

All 20 guide entries (10 English, 10 Spanish) use `AppKitX Editorial`, carry
publication and update dates, and include references. The Spanish versions are
full translations of the English guides, not summaries.

Required before Gate A:

- Technical review of each guide against current manufacturer documentation.
- Check that no page implies hands-on testing, ownership, or benchmark results.
- Check references for reachability and relevance.
- Review Spanish terminology, grammar, and legal/technical wording with a
  native or fluent reviewer; record the reviewer, date, scope, and verdict.
- Update the guide's `updated` date when a correction is made.

The article count meets the "10 posts" rule of thumb in both locales. It does not
guarantee Amazon acceptance; originality and quality are judgement calls.

## 6. Accessibility (RI-6)

The implementation reuses the skip link, landmarks, focus ring, 44px targets,
semantic headings, and color tokens. Automated checks cover keyboard focus,
mobile overflow, canonical links, and route targets.

Recommended before release:

- Manual screen-reader pass on the guide index, one English article, one Spanish
  article, and the privacy page.
- Check 200% zoom and 320px width.
- Check table reading order and table-of-contents links.
- Check that draft notices and translation notes are announced sensibly.
- Record fixes and re-run the relevant tests.

## 7. Release and deployment (RI-8)

The branch remains uncommitted and undeployed. Before publication:

- Resolve RI-1 through RI-5.
- Confirm the privacy policy matches the deployed Cloudflare and Search Console
  configuration.
- Remove or update draft notices only after legal review.
- Run `npm run format:check`, `npm run check`, `npm run build`, `npm test`, and
  `npm run test:e2e`.
- Obtain explicit approval to commit, push, open a PR, merge, and deploy.
- Do not deploy from this milestone.
- Do not expose the PC Builder or add PC Builder routes/navigation/sitemap
  entries.
- Do not enable CSP enforcement, change HSTS, or modify security headers.

## 8. Amazon-specific decisions (Gate B, not Gate A)

- Who will own the Amazon.in Associates account (primary owner).
- Which legal entity or person will be the applicant. AppKitX is not yet a
  registered entity; this must be resolved before an application.
- Which tracking IDs/sub-tags will be used.
- Who will monitor the account and respond to Amazon notices.
- Who will own Creators API credentials and where they will be stored.
- How the 3-sale/180-day and 10-sale/30-day requirements will be met with genuine
  traffic.
- Whether the site will use a separate Amazon module or a multi-retailer
  comparison view, subject to written policy confirmation.
- How ASIN-only mappings will be retained while non-ASIN content is kept within
  the 24-hour cache rule.
- Whether the PC Builder will be a website or a mobile application for Amazon
  policy purposes.

Do not create an account, submit an application, or request API access until
Gate A is passed and Gate B is explicitly authorized.

## 9. Sign-off record

| ID   | Decision                    | Status    | Approved by | Date       | Notes                                                                                |
| ---- | --------------------------- | --------- | ----------- | ---------- | ------------------------------------------------------------------------------------ |
| OD-1 | Contact email               | Confirmed | Owner       | 2026-11-01 | `appkitx@gmail.com`; general enquiries and support                                   |
| OD-2 | Ownership status            | Confirmed | Owner       | 2026-11-01 | Independent brand; not legally registered                                            |
| OD-3 | Intended jurisdiction       | Confirmed | Owner       | 2026-11-01 | India; legal drafts pending review                                                   |
| OD-4 | Editorial identity          | Confirmed | Owner       | 2026-11-01 | `AppKitX Editorial` for English and Spanish                                          |
| OD-5 | Bilingual coverage          | Confirmed | Owner       | 2026-11-01 | Ten guides and five information pages per locale                                     |
| OD-6 | Cloudflare Web Analytics    | Confirmed | Owner       | 2026-11-01 | Production analytics; configuration details still to verify                          |
| OD-7 | Search Console arrangement  | Confirmed | Owner       | 2026-11-01 | `appkitx@gmail.com` primary verified owner; personal Gmail backup; sitemap submitted |
| OD-8 | Affiliate status            | Confirmed | Owner       | 2026-11-01 | No program or links today; future-use disclosure                                     |
| RI-1 | Privacy/legal review        | Open      |             |            |                                                                                      |
| RI-2 | Terms/jurisdiction review   | Open      |             |            |                                                                                      |
| RI-3 | Affiliate disclosure review | Open      |             |            |                                                                                      |
| RI-4 | Editorial/technical review  | Open      |             |            |                                                                                      |
| RI-5 | Spanish translation review  | Open      |             |            |                                                                                      |
| RI-6 | Accessibility audit         | Open      |             |            | Automated checks added in M10.15.2; manual assistive-technology pass still open      |
| RI-7 | Search Console transition   | Complete  | Owner       | 2026-10-29 | Domain property verified; primary and backup owners set; sitemap submitted           |
| RI-8 | Release/deployment          | Open      |             |            |                                                                                      |
