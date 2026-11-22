import { describe, expect, it } from "vitest";
import { dictionaries } from "../src/i18n/config";
import { translatedPagePaths } from "../src/i18n/routing";
import {
  CATEGORY_IDS,
  publishedCategories,
  toolsInCategory,
} from "../src/lib/categories";
import { GUIDE_SLUGS, INFO_PAGE_PATHS } from "../src/lib/editorial";
import { tools } from "../src/lib/tools";

const LOCALE_CODES = Object.keys(dictionaries) as Array<
  keyof typeof dictionaries
>;

/*
 * Catalogue contract: the tool registry, category derivation, and bilingual
 * metadata describe the same published catalogue. Expected values come from
 * those registries; only the confirmed route baseline is pinned so an
 * accidental extra or missing page cannot pass unnoticed.
 */

describe("published catalogue", () => {
  it("publishes every registered tool in exactly one category", () => {
    expect(tools).toHaveLength(16);
    expect(CATEGORY_IDS).toHaveLength(5);
    expect(publishedCategories()).toEqual(CATEGORY_IDS);

    const members = CATEGORY_IDS.flatMap((category) =>
      toolsInCategory(category),
    );
    expect(members).toHaveLength(tools.length);
    expect(new Set(members.map((tool) => tool.href)).size).toBe(tools.length);
  });

  it("derives the confirmed 76 indexable routes", () => {
    const localeLess =
      1 + // homepage
      tools.length +
      publishedCategories().length +
      1 + // guide index
      GUIDE_SLUGS.length +
      Object.keys(INFO_PAGE_PATHS).length;
    const paths = translatedPagePaths();

    expect(paths).toHaveLength(localeLess);
    expect(new Set(paths).size).toBe(paths.length);
    expect(localeLess * LOCALE_CODES.length).toBe(76);
  });
});

describe("tool metadata", () => {
  for (const locale of LOCALE_CODES) {
    it(`ships complete, unique tool metadata in ${locale}`, () => {
      const dictionary = dictionaries[locale];
      const metadata = tools.map((tool) => {
        const strings = dictionary.tools[tool.dictionaryKey];
        expect(strings.name.trim(), `${tool.href} name`).not.toBe("");
        expect(strings.title, `${tool.href} title`).toBe(
          `${strings.name} — AppKitX`,
        );
        expect(
          strings.metaDescription.trim().length,
          `${tool.href} meta description`,
        ).toBeGreaterThan(40);
        expect(
          strings.cardDescription.trim().length,
          `${tool.href} card description`,
        ).toBeGreaterThan(0);
        return strings;
      });

      for (const field of [
        "name",
        "title",
        "metaDescription",
        "cardDescription",
      ] as const) {
        const values = metadata.map((strings) => strings[field]);
        expect(new Set(values).size, `${locale} ${field} uniqueness`).toBe(
          metadata.length,
        );
      }
    });
  }

  it("keeps English names and card text aligned with the registry", () => {
    for (const tool of tools) {
      const strings = dictionaries.en.tools[tool.dictionaryKey];
      expect(strings.name).toBe(tool.title);
      expect(strings.cardDescription).toBe(tool.description);
    }
  });
});

describe("category metadata", () => {
  for (const locale of LOCALE_CODES) {
    it(`ships complete, unique category metadata in ${locale}`, () => {
      const dictionary = dictionaries[locale];
      const pages = publishedCategories().map((category) => {
        const strings = dictionary.categories[category];
        const page = strings.page;
        expect(page, `${category} page copy`).toBeDefined();
        if (page === undefined) throw new Error(`${category} page copy`);

        expect(strings.name.trim()).not.toBe("");
        expect(
          page.title.toLowerCase(),
          `${category} title must name the category`,
        ).toContain(strings.name.toLowerCase());
        expect(page.metaDescription.trim().length).toBeGreaterThan(40);
        expect(page.intro.length).toBeGreaterThan(0);
        return page;
      });

      expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
      expect(new Set(pages.map((page) => page.metaDescription)).size).toBe(
        pages.length,
      );
    });

    it(`describes loan, EMI, compound interest, savings goals, and scientific calculations on the Calculators page in ${locale}`, () => {
      const page = dictionaries[locale].categories.Calculators.page;
      if (page === undefined) throw new Error("Calculators page copy");

      const copy = [page.metaDescription, ...page.intro].join(" ");
      expect(copy).toMatch(locale === "es" ? /préstamos?/i : /loans?/i);
      expect(copy).toMatch(locale === "es" ? /intereses/i : /interest/i);
      expect(copy).toMatch(
        locale === "es"
          ? /interés compuesto|crecimiento de una inversión/i
          : /compound interest|investment growth/i,
      );
      expect(copy).toMatch(
        locale === "es"
          ? /objetivos? de ahorro|ahorro mensual/i
          : /savings goals?|monthly savings/i,
      );
      expect(copy).toMatch(
        locale === "es"
          ? /científic|grados|radianes/i
          : /scientific|degrees|radians/i,
      );
    });
  }
});
