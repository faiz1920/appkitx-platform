import { describe, expect, it } from "vitest";
import { dictionaries } from "../src/i18n/config";
import { toolsInCategory } from "../src/lib/categories";

/*
 * Homepage copy contract: the hero, default metadata description, and social
 * image alt text describe only tool families that are actually registered.
 * Converters ship as a registered tool family, so the copy must mention them.
 */

const FAMILY_TERMS: Record<
  string,
  {
    calculator: RegExp;
    converter: RegExp;
    developer: RegExp;
    date: RegExp;
  }
> = {
  en: {
    calculator: /calculators?/i,
    converter: /converters?/i,
    developer: /developer/i,
    date: /date and time/i,
  },
  es: {
    calculator: /calculadoras?/i,
    converter: /conversores?/i,
    developer: /desarrollador/i,
    date: /fecha y hora/i,
  },
};

describe("homepage copy", () => {
  it("claims converters only because a converter is registered", () => {
    expect(toolsInCategory("Converters").length).toBeGreaterThan(0);

    for (const [code, dictionary] of Object.entries(dictionaries)) {
      const copy = [
        dictionary.home.heroSubline,
        dictionary.layout.defaultDescription,
        dictionary.layout.socialImageAlt,
      ].join(" ");

      expect(copy, `${code} homepage copy`).toMatch(
        FAMILY_TERMS[code]?.converter ?? /converters?/i,
      );
    }
  });

  it("describes every implemented tool family in both locales", () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      const terms = FAMILY_TERMS[code];
      expect(terms, `copy contract for ${code}`).toBeDefined();
      if (terms === undefined) continue;

      const copy = [
        dictionary.home.heroSubline,
        dictionary.layout.defaultDescription,
        dictionary.layout.socialImageAlt,
      ].join(" ");

      expect(copy, `${code} calculator coverage`).toMatch(terms.calculator);
      expect(copy, `${code} converter coverage`).toMatch(terms.converter);
      expect(copy, `${code} developer coverage`).toMatch(terms.developer);
      expect(copy, `${code} date and time coverage`).toMatch(terms.date);
    }
  });

  it("keeps the homepage description and hero copy non-empty", () => {
    for (const dictionary of Object.values(dictionaries)) {
      expect(dictionary.home.heroSubline.trim()).not.toBe("");
      expect(dictionary.layout.defaultDescription.trim()).not.toBe("");
      expect(dictionary.layout.socialImageAlt.trim()).not.toBe("");
    }
  });
});
