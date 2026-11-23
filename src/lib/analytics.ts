/*
 * Google Analytics 4 with Google Consent Mode v2.
 *
 * Contract:
 * - The GA4 tag is loaded only on the production hosts. Preview builds,
 *   local development, and the Playwright suite never contact Google.
 * - Consent defaults to denied for analytics, advertising, and personalization
 *   before any Google request is made. No analytics cookies are set in that
 *   state; GA4 may still send cookieless, aggregated signals.
 * - The visitor's choice is stored in localStorage and can be changed from the
 *   footer. Accepting grants analytics storage; rejecting keeps it denied and
 *   clears any GA cookies that were already set.
 * - The inline script is self-contained (no imports) so it can run before the
 *   first paint and receive a stable CSP hash.
 */

export const GA_MEASUREMENT_ID = "G-YF9V8GSC89";

export const CONSENT_STORAGE_KEY = "appkitx.consent";

export const PRODUCTION_HOSTS = ["appkitx.com", "www.appkitx.com"] as const;

export type ConsentChoice = "granted" | "denied";

/** Stored values are validated rather than trusted. */
export function parseConsent(
  raw: string | null | undefined,
): ConsentChoice | null {
  return raw === "granted" || raw === "denied" ? raw : null;
}

/**
 * One inline, pre-paint script: consent defaults, then a host-gated GA loader.
 *
 * `gtag` is defined globally so the consent banner can update the choice
 * later even when the tag itself is not loaded (local preview).
 */
export function buildAnalyticsScript(
  measurementId: string = GA_MEASUREMENT_ID,
): string {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error(`Invalid GA4 measurement ID: ${measurementId}`);
  }

  return `(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  var stored = null;
  try { stored = window.localStorage.getItem("${CONSENT_STORAGE_KEY}"); } catch (error) { stored = null; }
  var analytics = stored === "granted" ? "granted" : "denied";
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: analytics
  });
  var host = window.location.hostname;
  var production = ${JSON.stringify(PRODUCTION_HOSTS)};
  if (production.indexOf(host) === -1) return;
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=${measurementId}";
  document.head.appendChild(script);
  gtag("js", new Date());
  gtag("config", "${measurementId}");
})();`;
}
