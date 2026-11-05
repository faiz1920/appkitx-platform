# M10.16 — Gate A Owner Action Tracker

Status: **Gate A remains CONDITIONALLY READY — NOT PASSED.** This is a
documentation-only tracker. It does not approve, schedule, or perform any legal,
privacy, editorial, accessibility, Amazon, pricing, PC Builder, deployment, or
release action.

- Repository: `/Users/faiz/Work/nexverra/appkitx-platform-clean`
- Starting branch: `main`
- Starting HEAD: `c7d2e09c500f80e750727e59dbec3755193cde75`
- Audit date: **2026-11-05**
- Live site: `https://appkitx.com`
- Gate A decision: **CONDITIONALLY READY — NOT PASSED**
- Companion report:
  [`PC-BUILDER-M10-16-GATE-A-CLOSURE-READINESS.md`](./PC-BUILDER-M10-16-GATE-A-CLOSURE-READINESS.md)
- Public PC Builder: **not released; `/pc-builder/` returns HTTP 404**
- Amazon account, application, credentials, API call, affiliate link, or ASIN:
  **none**

This tracker is not legal advice. A tracker status of `PASS` means the action's
own completion criteria are supported by evidence; it is not a legal conclusion,
a compliance certification, or a release authorization.

## 1. Purpose and use

The companion readiness report establishes 33 Gate A requirements (`GA-01`
through `GA-33`), 24 legal findings (`LR-01` through `LR-24`), and 14 counsel
questions (`Q-01` through `Q-14`). This tracker converts the outstanding work
into 20 owner actions (`OA-01` through `OA-20`).

Use this tracker to:

- assign a named human owner to every open Gate A action;
- record the exact evidence required before an action can close;
- keep external dependencies visible;
- prevent a review, test, or approval from being inferred from repository work;
- provide the evidence index for the final Gate A decision.

Do not use this tracker to:

- mark Gate A passed;
- authorize Amazon integration, affiliate links, pricing providers, or a public
  PC Builder release;
- replace counsel's written advice or an independent reviewer's record;
- convert a repository-level check into an independent review.

## 2. Status and priority definitions

### 2.1 Status values

| Status         | Meaning for an action                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| PASS           | The completion criteria are met and the required evidence is recorded and reviewable.                        |
| CONDITIONAL    | Work is partially complete or evidence is partial; a named gap remains.                                      |
| BLOCKED        | The action cannot close until a named dependency, external reviewer, counsel, or owner decision is resolved. |
| NOT STARTED    | No meaningful work or evidence exists, and the action is available to begin.                                 |
| NOT APPLICABLE | The action is outside the current Gate A scope; the trigger that would bring it into scope is documented.    |

For a standing guardrail such as OA-19, `PASS` is a dated, point-in-time
attestation, not permanent closure. It must be re-verified with a new dated
attestation at every gate review.

### 2.2 Priority values

| Priority | Meaning                                                                                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Mandatory Gate A closure condition. Gate A cannot pass while this action is open, unless the owner records a specific written residual-risk acceptance for that condition. |
| P1       | Supporting evidence or documentation work. Required for a complete and credible final closure record, but not a P0 pass condition and not a substitute for P0 evidence.    |
| P2       | Future-gate or standing-guardrail work. Not a current Gate A closure condition.                                                                                            |

## 3. Current tracker position

| Status         | Actions                                                                     |  Count |
| -------------- | --------------------------------------------------------------------------- | -----: |
| PASS           | OA-19 (dated 2026-11-05; re-verify at each gate review)                     |      1 |
| CONDITIONAL    | None                                                                        |      0 |
| BLOCKED        | OA-06, OA-07, OA-08, OA-09, OA-13, OA-20                                    |      6 |
| NOT STARTED    | OA-01, OA-02, OA-03, OA-04, OA-05, OA-10, OA-11, OA-12, OA-14, OA-15, OA-16 |     11 |
| NOT APPLICABLE | OA-17, OA-18                                                                |      2 |
| **Total**      |                                                                             | **20** |

The 33-requirement Gate A matrix in the companion report remains: **11 PASS, 9
CONDITIONAL, 5 BLOCKED, 6 NOT STARTED, 2 NOT APPLICABLE**. The two sets of
counts measure different things and must not be added together.

Of the 20 actions, 15 are P0 (OA-01..OA-14 and OA-20), 2 are P1 (OA-15 and
OA-16), and 3 are P2 (OA-17..OA-19). OA-19's PASS is a dated 2026-11-05
attestation, not permanent closure. OA-16 remains open: the five documentation
inconsistencies are recorded, not reconciled, and documenting them is not
resolution.

## 4. Action register

| ID    | Action                                                                                                     | Related Gate A requirements                                | Responsible party                              | Priority | Dependencies                                                                                                                                  | Required evidence                                                                                                                                                                                                   | Status         | Completion criteria                                                                                                                                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OA-01 | Engage India-qualified legal counsel and define the review scope.                                          | GA-10..GA-17; LR-01..LR-24; Q-01..Q-14                     | Owner                                          | P0       | Owner budget and counsel selection                                                                                                            | Engagement record naming counsel, scope, and expected deliverables; counsel's conflict check.                                                                                                                       | NOT STARTED    | Counsel is engaged in writing and the 14 questions are included in the agreed scope. This action closes on engagement, not on counsel's substantive review; written answers or documented unresolved outcomes belong to OA-06..OA-09. |
| OA-02 | Decide the legal entity and registered-address approach.                                                   | GA-17; LR-01; LR-16; Q-01                                  | Owner, with counsel advice                     | P0       | OA-01                                                                                                                                         | Written owner decision: register an entity, use a sole-proprietor formulation, or adopt counsel-approved wording.                                                                                                   | NOT STARTED    | The decision is recorded and counsel confirms the resulting public wording.                                                                                                                                                           |
| OA-03 | Confirm Cloudflare analytics, cookies, legal basis, retention, DPA, subprocessors, and transfers.          | GA-13; LR-02..LR-05; LR-12; Q-04; Q-05                     | Owner, with Cloudflare account access          | P0       | Cloudflare dashboard and contract access                                                                                                      | Dashboard exports/notes; production `Set-Cookie` inspection; retention settings; current DPA and subprocessor list; transfer analysis.                                                                              | NOT STARTED    | Evidence covers every data category in the privacy policy and counsel accepts the resulting wording.                                                                                                                                  |
| OA-04 | Set and document CSP report retention and access control.                                                  | GA-14; LR-06; Q-06                                         | Owner, with Cloudflare access                  | P0       | Analytics Engine access                                                                                                                       | Written retention period; access list; configuration evidence for `appkitx_csp_reports`; deletion process.                                                                                                          | NOT STARTED    | Retention and access are configured, documented, and consistent with the privacy policy.                                                                                                                                              |
| OA-05 | Confirm Gmail ownership, security, access list, retention, and Google processing.                          | GA-15; LR-07; LR-21; Q-07; Q-08                            | Owner, with mailbox access                     | P0       | Gmail account access                                                                                                                          | Ownership attestation; 2FA and recovery settings; access list; retention decision; Google terms/transfer record.                                                                                                    | NOT STARTED    | Account controls and processing terms are documented, and counsel accepts the contact/privacy wording.                                                                                                                                |
| OA-06 | Obtain counsel review of the privacy policy and produce final bilingual wording.                           | GA-10; LR-02..LR-08; LR-11; LR-12; LR-24; Q-04..Q-08; Q-14 | Owner and counsel                              | P0       | OA-01, OA-02, OA-03, OA-04, OA-05                                                                                                             | Counsel memo; approved English and Spanish privacy text; version/date; record of accepted changes.                                                                                                                  | BLOCKED        | Counsel signs off on the final bilingual policy, including retention, cookies, transfers, CSP, and contact processing.                                                                                                                |
| OA-07 | Obtain counsel review of terms, liability, browsewrap, IP, and governing law.                              | GA-06; GA-11; LR-13..LR-16; Q-01..Q-03; Q-09; Q-13         | Owner and counsel                              | P0       | OA-01, OA-02                                                                                                                                  | Counsel memo; approved English and Spanish terms; acceptance-mechanism decision; governing-law clause.                                                                                                              | BLOCKED        | Counsel approves the final bilingual terms and the acceptance mechanism.                                                                                                                                                              |
| OA-08 | Obtain counsel review of the affiliate disclosure and its timing.                                          | GA-12; LR-18; LR-19; Q-10; Q-11                            | Owner and counsel                              | P0       | OA-01; future program terms if an application is prepared                                                                                     | Approved disclosure wording; placement decision; trigger for publication; program-specific confirmation.                                                                                                            | BLOCKED        | Counsel approves the wording and the condition that must be met before any affiliate link is published.                                                                                                                               |
| OA-09 | Complete independent Spanish legal translation review.                                                     | GA-16; LR-24; Q-12                                         | Owner and independent Spanish legal translator | P0       | OA-06, OA-07; translator appointment                                                                                                          | Review record with reviewer identity, date, scope, corrections, and verdict; precedence clause decision.                                                                                                            | BLOCKED        | The Spanish legal pages are reviewed, corrected, and approved as equivalent to the approved English text.                                                                                                                             |
| OA-10 | Complete independent English editorial and technical review of all 10 English guides.                      | GA-18; GA-22                                               | Owner and independent English reviewer         | P0       | Reviewer appointment; current manufacturer documentation                                                                                      | Per-guide review record; claim and reference checks; manual check of the four HTTP 403 URLs; correction log; verdict.                                                                                               | NOT STARTED    | All 10 English guides have a signed review record and every correction is applied or explicitly accepted.                                                                                                                             |
| OA-11 | Complete independent Spanish review of all 10 Spanish guides.                                              | GA-19; GA-22                                               | Owner and independent Spanish reviewer         | P0       | Reviewer appointment; OA-10 terminology baseline                                                                                              | Per-guide review record; translation and technical checks; correction log; verdict.                                                                                                                                 | NOT STARTED    | All 10 Spanish guides have a signed review record and every correction is applied or explicitly accepted.                                                                                                                             |
| OA-12 | Run the manual accessibility audit.                                                                        | GA-23..GA-26                                               | Owner and accessibility tester                 | P0       | Tester appointment; current production build                                                                                                  | Screen-reader report; 200% zoom/reflow report; high-contrast/forced-colors report; full keyboard-journey report.                                                                                                    | NOT STARTED    | Every required page and journey is tested, findings are recorded, and fixes are verified.                                                                                                                                             |
| OA-13 | Resolve the manual accessibility Gate A weight and record sign-off.                                        | GA-27; OD-I                                                | Owner and accessibility tester                 | P0       | OA-12; owner decision on required vs recommended                                                                                              | Written owner decision on Gate A weight; final accessibility report; signed sign-off.                                                                                                                               | BLOCKED        | The owner records the Gate A weight, and the sign-off is either completed or explicitly and consistently downgraded.                                                                                                                  |
| OA-14 | Record explicit owner disposition of gated functionality.                                                  | GA-30                                                      | Owner                                          | P0       | OA-06..OA-09, OA-10, OA-11, OA-13                                                                                                             | Written disposition per gated item: Amazon application, Creators API, affiliate links, pricing providers, and public PC Builder; each marked approved, deferred, or rejected, with scope, date, and owner identity. | NOT STARTED    | Each of the five gated items has a separate recorded approval, deferral, or rejection. Gate A closure is not a disposition, and silence is not approval.                                                                              |
| OA-15 | Re-read Search Console sitemap, discovered URLs, and indexing status.                                      | GA-28; GA-29                                               | Owner, with Search Console access              | P1       | Search Console owner access; stable production deployment                                                                                     | Current sitemap status; discovered-URL count; indexing report; export or dated screenshots.                                                                                                                         | NOT STARTED    | The fresh read is recorded, and no indexing or visibility claim exceeds the evidence.                                                                                                                                                 |
| OA-16 | Reconcile the documentation inconsistencies.                                                               | Report quality; OD-K                                       | Owner and agent                                | P1       | Owner approval to edit the affected documents                                                                                                 | Errata or corrected documents covering word counts, accessibility weight, draft-notice wording, M10.14 staleness, and the PR #51 record.                                                                            | NOT STARTED    | Each inconsistency is resolved in the authoritative document, with the resolution dated and traceable.                                                                                                                                |
| OA-17 | Complete a privacy/legal design review for future PC Builder saved and shared builds.                      | GA-31                                                      | Owner and counsel                              | P2       | A decision to prepare a public PC Builder release                                                                                             | Future-release privacy assessment covering `localStorage`, share-link fragments, disclosure, retention, and clearing.                                                                                               | NOT APPLICABLE | Not required for current Gate A; becomes required before any public PC Builder release.                                                                                                                                               |
| OA-18 | Obtain written answers on future pricing, caching, ASIN/non-ASIN storage, price history, and price alerts. | GA-32                                                      | Owner, counsel, and Amazon                     | P2       | A pricing-provider or Amazon integration decision                                                                                             | Written answers mapped to the M10.14 questions; provider terms; legal review.                                                                                                                                       | NOT APPLICABLE | Not required for current Gate A; becomes required before any pricing or Amazon release.                                                                                                                                               |
| OA-19 | Maintain the standing no-activation guardrail and re-verify it at each gate review.                        | GA-33; future Gates B/C/D/E                                | Owner and agent                                | P2       | Explicit owner authorization for the specific activity; re-verification at each gate review                                                   | Dated no-activation attestation for each gate review; current attestation dated 2026-11-05.                                                                                                                         | PASS           | The guardrail was verified true on 2026-11-05. PASS is a dated attestation, not permanent closure; a new attestation is required at every gate review.                                                                                |
| OA-20 | Run the final Gate A closure review and record owner acceptance.                                           | GA-01..GA-33                                               | Owner, with counsel and reviewers              | P0       | OA-01..OA-14 (P0 closure conditions); OA-15, OA-16 (P1 supporting evidence, complete or explicitly recorded as open documentation exceptions) | Completed action evidence index; final matrix; written counsel answers or documented unresolved outcomes; written Gate A decision.                                                                                  | BLOCKED        | Every P0 action (OA-01..OA-14) is closed or individually accepted as a written residual risk; OA-15 and OA-16 are complete or explicitly recorded as open documentation exceptions; the owner records the final Gate A decision.      |

## 5. Detailed action notes

**Counsel question closure rule.** OA-01 covers engagement only. OA-06, OA-07,
OA-08, and OA-09 must collectively record a written answer or a documented
unresolved outcome for every Q-01..Q-14 in the relevant legal review record. A
question named in the engagement scope but never answered or dispositioned
remains open.

### OA-01 — Engage India-qualified legal counsel

**Why it matters:** The 24 legal findings and 14 counsel questions cannot be
closed by repository evidence. Counsel must review the entity position, privacy
policy, terms, liability, affiliate disclosure, international transfers, and
incident/data-subject-request process.

**Scope to put in the engagement:** entity and address; governing law and
jurisdiction; browsewrap acceptance; Cloudflare analytics and cookies; retention;
international transfers; CSP reports; Gmail processing; limitation of liability
and Indian consumer law; IP/training restriction; affiliate disclosure and
timing; Spanish legal equivalence and precedence; hardware-safety disclaimers;
security-incident and data-subject-request process.

**Engagement is not substantive review.** OA-01 closes when counsel is engaged in
writing and all 14 questions are included in the agreed scope. Inclusion does not
answer them. Each question must later receive a written answer or a documented
unresolved outcome in the applicable OA-06..OA-09 legal review record.

**Do not close this action on:** a proposal, a quote, an informal conversation,
or a general statement that the pages "look fine". The engagement and the
written advice are separate evidence items.

### OA-02 — Decide the legal entity and registered-address approach

**Why it matters:** The public pages currently describe an unregistered brand and
do not invent an entity or address. That is honest, but it is not a final legal
position.

**Options for the owner to decide:** register an entity; use a counsel-approved
sole-proprietor formulation; or adopt another counsel-approved formulation. The
tracker does not recommend one option.

**Do not close this action on:** a draft name, a planned registration, or an
address that is not yet legally usable.

### OA-03 — Confirm Cloudflare analytics, cookies, legal basis, retention, DPA, subprocessors, and transfers

**Why it matters:** The privacy policy describes current website behavior but
expressly avoids claiming a verified production configuration. The owner-reported
configuration is not independent evidence.

**Evidence to collect:** dashboard settings for Web Analytics; the production
cookie inventory from response headers and a browser session; retention settings;
the current Cloudflare DPA; the subprocessor list; the contracting entity; the
transfer mechanism; and the consent/legal-basis decision.

**Do not close this action on:** a memory of the settings, a marketing page, or an
undated screenshot without the account and date identified.

### OA-04 — Set and document CSP report retention and access control

**Why it matters:** The CSP endpoint writes normalized records to the
`appkitx_csp_reports` Analytics Engine dataset. Retention and access are not
currently configured or confirmed.

**Evidence to collect:** the retention period; who can query or export the
dataset; the deletion process; the purpose limitation; and the matching privacy
policy wording.

**Do not close this action on:** the existence of the endpoint alone.

### OA-05 — Confirm Gmail ownership, security, access, retention, and Google processing

**Why it matters:** `appkitx@gmail.com` is the public contact address. The policy
must accurately describe who can access messages, how long they are kept, and
how Google processes them.

**Evidence to collect:** ownership; 2FA and recovery settings; the access list;
the retention decision; the Google terms that apply; and the transfer position.
Counsel must accept the resulting wording.

**Do not close this action on:** the address being published. Publication proves
the address exists, not that the account controls are adequate.

### OA-06 — Counsel review of the privacy policy

**Why it matters:** The privacy policy is the largest concentration of open
findings: analytics, cookies, retention, transfers, CSP reports, Gmail, and
data-subject requests.

**Evidence to collect:** a counsel memo; the approved English text; the approved
Spanish text; the version and date; and a change record showing which findings
were addressed.

**Do not close this action on:** an internal read-through or a repository-level
source comparison.

### OA-07 — Counsel review of terms, liability, browsewrap, IP, and governing law

**Why it matters:** The terms contain a limitation clause, an IP/training
restriction, and an intended-India governing-law position. Enforceability and
Indian consumer-law effect are not assessed.

**Evidence to collect:** a counsel memo; approved bilingual terms; the
acceptance-mechanism decision; the final governing-law and jurisdiction clause;
and the IP ownership wording for an unregistered brand.

**Do not close this action on:** the current "By using the site, you agree"
wording being present. Presence is not enforceability.

### OA-08 — Counsel review of the affiliate disclosure and timing

**Why it matters:** The disclosure is future-use only. No affiliate program or
link exists today, but the wording and the trigger for publication must be
approved before any application or link.

**Evidence to collect:** approved wording; approved placement; the publication
trigger; and program-specific confirmation for any future Amazon.in
participation.

**Do not close this action on:** the current page being live. The page is a draft
and is not an approval.

### OA-09 — Independent Spanish legal translation review

**Why it matters:** The Spanish legal pages are provisional. A Spanish-speaking
legal reviewer must confirm equivalence, terminology, and which version prevails.

**Evidence to collect:** reviewer identity and qualifications; date; scope;
corrections; verdict; and the precedence clause decision.

**Do not close this action on:** a repository-level terminology check or a
machine translation review.

### OA-10 — Independent English editorial and technical review

**Why it matters:** The repository-level review is not an independent review.
All 10 English guides need a human reviewer to check claims, references, and
safety statements against current manufacturer documentation.

**Evidence to collect:** a per-guide record; the references checked; the manual
check of the four HTTP 403 URLs (PCI-SIG, Intel, and the two JEDEC pages); the
correction log; and the verdict.

**Do not close this action on:** the pages being live, the byline being present,
or the automated reference status alone.

### OA-11 — Independent Spanish guide review

**Why it matters:** The Spanish locale remains provisional. All 10 Spanish guides
need a fluent or native reviewer to check translation, technical meaning, and
terminology against the English source.

**Evidence to collect:** a per-guide record; the terminology check; the
correction log; and the verdict. The PSU guide must preserve ATX 3.0 / ATX 3.1,
12VHPWR, and 12V-2x6 correctly.

**Do not close this action on:** the provisional notice being present. The notice
is a disclosure, not a review.

### OA-12 — Manual accessibility audit

**Why it matters:** Automated checks cannot prove screen-reader pronunciation,
full focus order across a journey, 200% zoom reflow, or high-contrast behavior.

**Coverage:** guide index; one English article; one Spanish article; privacy;
terms; affiliate disclosure; tables; table of contents; navigation; language
switcher; skip link; and the contact page.

**Evidence to collect:** screen-reader report; 200% zoom/reflow report;
high-contrast/forced-colors report; keyboard-journey report; findings; fixes; and
retest results.

**Do not close this action on:** the seven-test Playwright suite passing. That
suite is automated evidence, not a manual audit.

### OA-13 — Manual accessibility Gate A weight and sign-off

**Why it matters:** The readiness report treats manual accessibility as a Gate A
closure condition, while the quality review and owner-inputs tables label it
"Recommended". The inconsistency must be resolved by the owner, not inferred.

**Evidence to collect:** the written owner decision on the Gate A weight; the
final accessibility report; and the signed sign-off.

**Do not close this action on:** silence, a verbal comment, or an assumption that
"recommended" means optional.

### OA-14 — Explicit owner disposition of gated functionality

**Why it matters:** No written disposition exists for the Amazon application,
Creators API, affiliate links, pricing providers, or a public PC Builder release.
Silence must not be read as approval, deferral, or rejection.

**Evidence to collect:** a written decision for each of the five gated items:
Amazon application, Creators API, affiliate links, pricing providers, and public
PC Builder; each marked approved, deferred, or rejected, with the scope, date,
and owner's identity.

**Do not close this action on:** a Gate A pass alone. Gate A closure does not
itself authorize the Amazon application, Creators API access, affiliate links,
live integration, pricing activation, or a public PC Builder release. Each item
requires its own recorded owner disposition, plus any applicable counsel review
and a new gate assessment.

### OA-15 — Fresh Search Console review

**Why it matters:** The last known read is 2026-10-29: 20 discovered pages and
indexing still processing. The production sitemap now exposes 52 URLs. No fresh
read exists.

**Evidence to collect:** current sitemap status; discovered-URL count; indexing
report; and dated exports or screenshots.

**Do not close this action on:** the sitemap being live. A live sitemap is not
proof of discovery or indexing.

### OA-16 — Documentation reconciliation

**Status:** OA-16 remains open (status: NOT STARTED). The five inconsistencies
below are recorded, not reconciled. Recording them in this tracker or the
companion report is not resolution.

**Why it matters:** The audit found five inconsistencies that weaken the closure
record:

1. word totals of 32,860 versus 31,845;
2. manual accessibility labeled "required" in one place and "Recommended" in
   another;
3. deployed draft notices still saying "before publication";
4. M10.14's current-site assessment being historically stale;
5. PR #51 and the 2026-11-04 deployment not being recorded in the M10.15
   documents, with no standalone M10.15.3 file.

**Evidence to collect:** an errata note or corrected authoritative documents,
each dated and traceable. Existing reports must not be silently overwritten.

**Do not close this action on:** this tracker alone. This tracker records the
inconsistencies; it does not correct the source documents. A tracker entry, a
report section, or an errata note that only repeats an inconsistency is not
closure evidence.

### OA-17 — Future PC Builder saved/shared build privacy review

**Why it matters:** Saved builds use browser `localStorage` under
`appkitx.pc-builder.saved-builds.v1`; share links place a base64url payload in
the URL fragment. The public privacy policy does not describe either behavior
because the PC Builder is not public.

**Trigger:** any decision to prepare a public PC Builder release.

**Evidence to collect:** a future-release privacy assessment covering disclosure,
storage, retention, clearing, share-link handling, and the legal basis.

### OA-18 — Future pricing and Amazon questions

**Why it matters:** The pricing domain has development freshness thresholds
(fresh 30 minutes, aging 6 hours, stale 24 hours), but no live provider. The
M10.14 questions about Amazon caching, ASIN-only storage, non-ASIN content,
price history, price alerts, and multi-retailer comparison remain future-gate
work.

**Trigger:** any decision to activate a pricing provider or prepare an Amazon
integration.

**Evidence to collect:** written answers mapped to the M10.14 questions; provider
terms; and legal review.

### OA-19 — Maintain the standing no-activation guardrail

**Why it matters:** The guardrail was satisfied as of the 2026-11-05 audit: no
Amazon account, application, credential, API call, affiliate link, ASIN, live
pricing provider, or public PC Builder route was found. The guardrail must remain
true until a separate written approval and gate review for the specific activity.

**Evidence to collect:** a dated no-activation attestation at each gate review.
The current attestation is dated 2026-11-05.

**Do not close this action permanently.** Its PASS is a dated, point-in-time
status, not permanent closure. It is a standing guardrail, not a one-time task,
and it must be re-verified at every gate review.

### OA-20 — Final Gate A closure review

**Why it matters:** Gate A can pass only when all mandatory P0 evidence is
recorded and the owner explicitly accepts the resulting decision.

**Evidence to collect:** the completed action evidence index; the updated
33-requirement matrix; the legal and review records, including written answers or
documented unresolved outcomes for all 14 counsel questions; the accessibility
sign-off; the P1 documentation status; the Search Console read; and the written
Gate A decision.

**Do not close this action on:** a majority of actions being complete. Every P0
action (OA-01..OA-14) must be closed or individually accepted as a written
residual risk, with the acceptance recorded. OA-15 and OA-16 must be completed or
explicitly recorded as open documentation exceptions; they cannot substitute for
missing P0 evidence. No P0 condition is waived by silence.

## 6. Critical path

### Phase 1 — Appointments and owner evidence

| Order | Action | Output                                                               |
| ----- | ------ | -------------------------------------------------------------------- |
| 1     | OA-01  | Counsel engaged with the 14 questions in scope.                      |
| 2     | OA-02  | Entity/address decision recorded.                                    |
| 3     | OA-03  | Cloudflare analytics, cookie, retention, DPA, and transfer evidence. |
| 4     | OA-04  | CSP retention and access policy.                                     |
| 5     | OA-05  | Gmail ownership, security, access, and retention evidence.           |
| 6     | OA-10  | English reviewer appointed.                                          |
| 7     | OA-11  | Spanish reviewer appointed.                                          |
| 8     | OA-12  | Accessibility tester appointed.                                      |
| 9     | OA-15  | Search Console access confirmed.                                     |
| 10    | OA-16  | Owner approves documentation reconciliation.                         |

### Phase 2 — Reviews and tests

| Order | Action | Output                                                                                                                  |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| 11    | OA-06  | Counsel-approved bilingual privacy policy; written answers or documented unresolved outcomes for Q-04..Q-08 and Q-14.   |
| 12    | OA-07  | Counsel-approved bilingual terms; written answers or documented unresolved outcomes for Q-01..Q-03, Q-09, and Q-13.     |
| 13    | OA-08  | Counsel-approved affiliate disclosure and trigger; written answers or documented unresolved outcomes for Q-10 and Q-11. |
| 14    | OA-09  | Spanish legal review record; written answer or documented unresolved outcome for Q-12.                                  |
| 15    | OA-10  | 10 English review records and correction log.                                                                           |
| 16    | OA-11  | 10 Spanish review records and correction log.                                                                           |
| 17    | OA-12  | Manual accessibility reports and fixes.                                                                                 |
| 18    | OA-13  | Accessibility weight decision and sign-off.                                                                             |
| 19    | OA-15  | Fresh Search Console record.                                                                                            |

### Phase 3 — Approval

| Order | Action | Output                                                                            |
| ----- | ------ | --------------------------------------------------------------------------------- |
| 20    | OA-14  | Written disposition (approve, defer, or reject) for each of the five gated items. |
| 21    | OA-20  | Final Gate A closure review and owner acceptance.                                 |

### Standing and future work

| Action | Timing                                                                               |
| ------ | ------------------------------------------------------------------------------------ |
| OA-19  | Dated 2026-11-05 attestation; re-verify at every gate review; not permanent closure. |
| OA-17  | Before any public PC Builder release.                                                |
| OA-18  | Before any pricing-provider or Amazon integration release.                           |

## 7. Owner decision cross-reference

| Decision | Decision required                                                                                                                                                           | Tracker actions     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| OD-A     | Register an entity or approve an unregistered-brand formulation and address.                                                                                                | OA-02               |
| OD-B     | Confirm India as governing jurisdiction and approve final wording.                                                                                                          | OA-07               |
| OD-C     | Approve final privacy, terms, and affiliate wording after counsel review.                                                                                                   | OA-06, OA-07, OA-08 |
| OD-D     | Supply Cloudflare analytics, cookie, retention, DPA, and transfer confirmations.                                                                                            | OA-03               |
| OD-E     | Set and document CSP report retention and access control.                                                                                                                   | OA-04               |
| OD-F     | Confirm Gmail ownership, 2FA, access list, retention, and Google processing.                                                                                                | OA-05               |
| OD-G     | Appoint an independent English editorial/technical reviewer.                                                                                                                | OA-10               |
| OD-H     | Appoint an independent fluent/native Spanish reviewer and legal translator.                                                                                                 | OA-09, OA-11        |
| OD-I     | Appoint an accessibility tester and confirm the Gate A weight of manual sign-off.                                                                                           | OA-13               |
| OD-J     | Record explicit owner disposition (approve, defer, or reject) for each gated item: Amazon application, Creators API, affiliate links, pricing providers, public PC Builder. | OA-14               |
| OD-K     | Authorize correction of the documentation inconsistencies.                                                                                                                  | OA-16               |
| OD-L     | Define the privacy/legal approach for future PC Builder saved/shared builds.                                                                                                | OA-17               |

## 8. External dependencies

| Dependency                                    | Needed for                                              | Tracker actions | Current status |
| --------------------------------------------- | ------------------------------------------------------- | --------------- | -------------- |
| India-qualified legal counsel                 | Privacy, terms, liability, affiliate, entity, transfers | OA-01..OA-09    | Not engaged    |
| Cloudflare account owner/dashboard access     | Analytics, cookies, retention, DPA, CSP dataset         | OA-03, OA-04    | Not accessed   |
| Google Search Console owner access            | Fresh sitemap/indexing review                           | OA-15           | Not accessed   |
| Gmail account owner                           | Ownership, 2FA, access, retention, transfers            | OA-05           | Not confirmed  |
| Independent English reviewer                  | 10 English guides                                       | OA-10           | Not appointed  |
| Independent Spanish reviewer/legal translator | 10 Spanish guides and 5 Spanish legal pages             | OA-09, OA-11    | Not appointed  |
| Manual accessibility tester                   | Screen reader, zoom, high contrast, keyboard journeys   | OA-12, OA-13    | Not appointed  |
| Amazon.in Associates account and program      | Future Gate B/C                                         | OA-18, OA-19    | Not started    |

## 9. Evidence rules

1. **Name the human.** An action cannot close on "the team" or "the agent". Record
   the reviewer, tester, counsel, or owner by name or role.
2. **Date the evidence.** Record the date the evidence was produced, not the date
   the document was edited.
3. **State the scope.** "Reviewed the site" is not evidence. List the pages,
   guides, legal texts, or settings covered.
4. **Record the verdict.** Use `PASS`, `CONDITIONAL`, `BLOCKED`, `NOT STARTED`, or
   `NOT APPLICABLE`. Do not use "looks good" or "probably fine".
5. **Record corrections.** List what changed and where. If nothing changed, say
   so explicitly.
6. **Keep the artifact.** Store the memo, export, screenshot, or review record in
   a location the owner can retrieve later.
7. **Do not infer approval.** A live page, a passing test, a merged PR, or a
   deployment is not an approval.
8. **Do not upgrade a factual PASS.** A repository-level check that a statement
   appears on a page is not a legal conclusion that the statement is sufficient.

## 10. Gate A closure checklist

Gate A can move to **PASSED** only when every mandatory P0 closure condition in
part A is true and recorded, and the owner records the final decision. Part B is
supporting evidence and documentation for a complete closure record; it does not
substitute for any P0 evidence.

### A. Mandatory P0 Gate A closure conditions

- [ ] OA-01 counsel engaged in writing and all 14 questions included in the agreed
      scope. Engagement alone does not answer them.
- [ ] OA-02 entity/address decision recorded and reflected in the public wording.
- [ ] OA-03 Cloudflare analytics, cookies, retention, DPA, subprocessors, and
      transfers confirmed.
- [ ] OA-04 CSP retention and access control configured and documented.
- [ ] OA-05 Gmail ownership, security, access, retention, and processing
      confirmed.
- [ ] OA-06 privacy policy approved in English and Spanish, with written answers
      or documented unresolved outcomes for Q-04..Q-08 and Q-14.
- [ ] OA-07 terms, liability, browsewrap, IP, and governing law approved in
      English and Spanish, with written answers or documented unresolved outcomes
      for Q-01..Q-03, Q-09, and Q-13.
- [ ] OA-08 affiliate disclosure wording, placement, and timing approved, with
      written answers or documented unresolved outcomes for Q-10 and Q-11.
- [ ] OA-09 Spanish legal translation reviewed and approved, with a written answer
      or documented unresolved outcome for Q-12.
- [ ] OA-10 all 10 English guides independently reviewed with corrections
      recorded.
- [ ] OA-11 all 10 Spanish guides independently reviewed with corrections
      recorded.
- [ ] OA-12 manual accessibility audit completed with findings and fixes.
- [ ] OA-13 accessibility Gate A weight resolved and sign-off recorded.
- [ ] OA-14 written owner disposition (approve, defer, or reject) recorded
      separately for each gated item: Amazon application, Creators API, affiliate
      links, pricing providers, and public PC Builder. Gate A closure does not
      itself authorize any of them.
- [ ] OA-20 final Gate A closure review and owner acceptance recorded, with every
      P0 condition closed or individually accepted as a written residual risk.

### B. P1 supporting evidence and documentation

- [ ] OA-15 fresh Search Console read recorded without overclaiming indexing.
- [ ] OA-16 documentation inconsistencies reconciled; recording an inconsistency
      is not reconciliation.

Part B must be completed or explicitly recorded as an open documentation
exception in the OA-20 closure record. It does not determine PASSED on its own and
cannot replace any P0 evidence. No P0 condition is waived by silence: an open P0
condition requires a specific written owner residual-risk acceptance in the
closure record.

`OA-17`, `OA-18`, and `OA-19` are not Gate A closure items. `OA-17` and `OA-18`
are future-release work; `OA-19` is a standing, dated guardrail that must be
re-verified at each gate review and is not permanently closed.

## 11. What this tracker does not authorize

This tracker does not authorize:

- an Amazon.in Associates application;
- an Amazon Creators API request or credential;
- any Amazon branding, ASIN, tracking tag, API call, or affiliate link;
- any pricing-provider activation or live price comparison;
- a public PC Builder release or a public `/pc-builder/` route;
- any change to deployment, DNS, security headers, analytics, Search Console,
  Gmail, or Cloudflare settings;
- any legal conclusion, compliance certification, or release authorization.

Any such action requires a separate written owner decision and, where relevant,
counsel review and a new gate assessment. A Gate A pass or closure decision does
not itself authorize any item in this list.

## 12. Maintenance

- Review this tracker at each Gate A evidence review.
- Re-verify OA-19 at every gate review and record a new dated attestation; do not
  carry a previous PASS forward as permanent closure.
- Update an action only when its required evidence exists and is retrievable.
- Keep the status values limited to `PASS`, `CONDITIONAL`, `BLOCKED`,
  `NOT STARTED`, and `NOT APPLICABLE`.
- Do not delete a closed action; record the closure evidence and date.
- Do not rewrite the companion report to match a tracker status. If the
  underlying evidence changes, update both documents deliberately.
- Re-run the Gate A matrix in the companion report after any action closes.

## 13. Limitations

- This tracker records work; it does not perform the work.
- No counsel, reviewer, translator, or accessibility tester has been engaged.
- No Cloudflare, Search Console, Gmail, or Amazon account was accessed.
- No manual accessibility session was run.
- No independent editorial, translation, or legal review was performed.
- OA-16 remains open. The tracker records but does not resolve the documented
  word-count discrepancy, the accessibility-weight inconsistency, the draft-notice
  wording, the stale M10.14 assessment, or the missing standalone M10.15.3
  record. Recording these items is not reconciliation.
- OA-19's PASS is a dated 2026-11-05 attestation, not permanent closure.
- This document is not legal advice and does not certify compliance with any law.

Prepared for owner review. No approval is implied by this document.
