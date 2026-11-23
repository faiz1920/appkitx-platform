import { describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  PRODUCTION_HOSTS,
  buildAnalyticsScript,
  parseConsent,
} from "../src/lib/analytics";

describe("analytics configuration", () => {
  it("uses a GA4 measurement ID and the approved storage key", () => {
    expect(GA_MEASUREMENT_ID).toMatch(/^G-[A-Z0-9]+$/);
    expect(CONSENT_STORAGE_KEY).toBe("appkitx.consent");
    expect(PRODUCTION_HOSTS).toEqual(["appkitx.com", "www.appkitx.com"]);
  });

  it("accepts only the two stored consent values", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    expect(parseConsent("yes")).toBeNull();
    expect(parseConsent("")).toBeNull();
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });
});

describe("buildAnalyticsScript", () => {
  it("denies advertising and reads the stored analytics choice", () => {
    const script = buildAnalyticsScript();

    expect(script).toContain('gtag("consent", "default"');
    expect(script).toContain('ad_storage: "denied"');
    expect(script).toContain('ad_user_data: "denied"');
    expect(script).toContain('ad_personalization: "denied"');
    expect(script).toContain('localStorage.getItem("appkitx.consent")');
    expect(script).toContain(
      'var analytics = stored === "granted" ? "granted" : "denied"',
    );
    expect(script).toContain("analytics_storage: analytics");
  });

  it("loads the tag on production hosts only", () => {
    const script = buildAnalyticsScript();

    expect(script).toContain('"appkitx.com"');
    expect(script).toContain('"www.appkitx.com"');
    expect(script).toContain("production.indexOf(host) === -1");
  });

  it("configures the approved stream", () => {
    const script = buildAnalyticsScript("G-TEST123");

    expect(script).toContain(
      "https://www.googletagmanager.com/gtag/js?id=G-TEST123",
    );
    expect(script).toContain('gtag("config", "G-TEST123")');
  });

  it("rejects malformed measurement IDs", () => {
    expect(() => buildAnalyticsScript("UA-123")).toThrow();
    expect(() => buildAnalyticsScript("G-")).toThrow();
    expect(() => buildAnalyticsScript("G-lowercase")).toThrow();
  });

  it("is deterministic so every page shares one CSP hash", () => {
    expect(buildAnalyticsScript()).toBe(buildAnalyticsScript());
  });
});
