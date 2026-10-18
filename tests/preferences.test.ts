import { describe, expect, it } from "vitest";
import {
  AUTO_DETECT_ENABLED,
  PREFERENCE_STORAGE_KEY,
  buildLocalePreferenceScript,
  localePreferenceConfig,
} from "../src/i18n/preferences";

/*
 * M4 decision: browser-language detection ships disabled (single kill
 * switch). These tests prove the disabled configuration never emits any
 * detection code — the only client-side navigation left is the explicit
 * stored choice made through the language switcher.
 */

describe("locale preference configuration", () => {
  it("ships browser-language detection disabled for the pilot", () => {
    expect(AUTO_DETECT_ENABLED).toBe(false);
    expect(localePreferenceConfig().detectBrowserLanguage).toBe(false);
  });

  it("derives every value from the locale registry and page registry", () => {
    expect(localePreferenceConfig()).toEqual({
      storageKey: PREFERENCE_STORAGE_KEY,
      defaultLocale: "en",
      nonDefaultLocales: ["es"],
      translatedPaths: [
        "/",
        "/percentage-calculator",
        "/discount-calculator",
        "/calculators",
      ],
      detectBrowserLanguage: false,
    });
  });
});

describe("buildLocalePreferenceScript", () => {
  const base = { ...localePreferenceConfig(), currentLocale: "en" as const };

  it("always honors an explicit stored choice", () => {
    const script = buildLocalePreferenceScript(base);
    expect(script).toContain(PREFERENCE_STORAGE_KEY);
    expect(script).toContain("localStorage");
    expect(script).toContain("location.replace");
    expect(script).toContain("translatedPaths");
  });

  it("emits no browser-language detection code while disabled", () => {
    const script = buildLocalePreferenceScript({
      ...base,
      detectBrowserLanguage: false,
    });
    expect(script).not.toContain("navigator");
    expect(script).not.toContain("languages");
  });

  it("adds browser-language detection only when enabled", () => {
    const script = buildLocalePreferenceScript({
      ...base,
      detectBrowserLanguage: true,
    });
    expect(script).toContain("navigator");
    expect(script).toContain("languages");
  });

  it("stays self-contained with a safely encoded configuration", () => {
    const script = buildLocalePreferenceScript({
      ...base,
      storageKey: "</script><script>alert(1)</script>",
    });
    expect(script.startsWith("(function ()")).toBe(true);
    expect(script.endsWith("})();")).toBe(true);
    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c");
    expect(script).not.toContain("import ");
    expect(script).not.toContain("require(");
  });

  it("embeds the current locale so the page can be compared without config drift", () => {
    const script = buildLocalePreferenceScript({
      ...base,
      currentLocale: "es",
    });
    expect(script).toContain('"currentLocale":"es"');
  });
});
