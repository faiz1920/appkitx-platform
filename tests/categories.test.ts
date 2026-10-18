import { describe, expect, it } from "vitest";
import { dictionaries, locales } from "../src/i18n/config";
import type { CategoryStrings } from "../src/i18n/dictionary";
import {
  CATEGORY_IDS,
  CATEGORY_PAGE_MIN_TOOLS,
  CATEGORY_SLUGS,
  categoryPath,
  isCategoryPublished,
  publishedCategories,
  publishedCategoryPaths,
  toolCategory,
  toolsInCategory,
} from "../src/lib/categories";
import { tools } from "../src/lib/tools";

/*
 * M5 invariants: category membership is the tools registry's `category`
 * field, page publication is derived from the registered tool count, slugs
 * are stable and collision-free, and every published category carries
 * page copy in every locale.
 */

describe("category taxonomy", () => {
  it("defines the canonical ids and a slug for every category", () => {
    expect(CATEGORY_IDS).toEqual([...Object.keys(CATEGORY_SLUGS)]);
    for (const category of CATEGORY_IDS) {
      expect(CATEGORY_SLUGS[category]).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("keeps every registered tool in a known category", () => {
    for (const tool of tools) {
      expect(CATEGORY_IDS).toContain(tool.category);
    }
  });

  it("keeps slugs unique and collision-free", () => {
    const slugs = Object.values(CATEGORY_SLUGS);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(Object.hasOwn(locales, slug), `${slug} is a locale code`).toBe(
        false,
      );
      for (const tool of tools) {
        const firstSegment = tool.href.split("/").filter(Boolean)[0];
        expect(slug, `${slug} collides with tool route ${tool.href}`).not.toBe(
          firstSegment,
        );
      }
    }
  });

  it("builds locale-less category paths", () => {
    expect(categoryPath("Calculators")).toBe("/calculators");
  });
});

describe("category membership", () => {
  it("returns only registered tools of the requested category", () => {
    for (const category of CATEGORY_IDS) {
      const members = toolsInCategory(category);
      for (const member of members) {
        expect(member.category).toBe(category);
        expect(tools).toContain(member);
      }
    }
    expect(toolsInCategory("Calculators").map((tool) => tool.href)).toEqual([
      "/percentage-calculator",
      "/discount-calculator",
    ]);
    expect(toolsInCategory("Developer tools").map((tool) => tool.href)).toEqual(
      ["/base64-encoder", "/json-formatter"],
    );
    expect(toolsInCategory("Date & time").map((tool) => tool.href)).toEqual([
      "/date-calculator",
      "/age-calculator",
    ]);
  });

  it("derives a tool's category from the registry and fails fast otherwise", () => {
    expect(toolCategory("/percentage-calculator")).toBe("Calculators");
    expect(toolCategory("/discount-calculator")).toBe("Calculators");
    expect(toolCategory("/date-calculator")).toBe("Date & time");
    expect(toolCategory("/age-calculator")).toBe("Date & time");
    expect(() => toolCategory("/unit-converter")).toThrow(/unregistered tool/i);
  });
});

describe("category page publication", () => {
  it("requires at least two registered tools", () => {
    expect(CATEGORY_PAGE_MIN_TOOLS).toBe(2);
    expect(isCategoryPublished("Calculators")).toBe(true);
    expect(isCategoryPublished("Developer tools")).toBe(true);
    expect(isCategoryPublished("Date & time")).toBe(true);
    expect(isCategoryPublished("Converters")).toBe(false);
    expect(isCategoryPublished("Text tools")).toBe(false);
  });

  it("derives the published set from the registry", () => {
    const expected = CATEGORY_IDS.filter(
      (category) => toolsInCategory(category).length >= CATEGORY_PAGE_MIN_TOOLS,
    );
    expect(publishedCategories()).toEqual(expected);
    expect(publishedCategoryPaths()).toEqual(
      expected.map((category) => categoryPath(category)),
    );
    expect(publishedCategories()).toEqual([
      "Calculators",
      "Developer tools",
      "Date & time",
    ]);
  });
});

describe("category page copy", () => {
  it("ships a name for every category in every locale", () => {
    for (const dictionary of Object.values(dictionaries)) {
      for (const category of CATEGORY_IDS) {
        expect(
          dictionary.categories[category].name.trim().length,
        ).toBeGreaterThan(0);
      }
    }
    expect(dictionaries.en.categories.Calculators.name).toBe("Calculators");
    expect(dictionaries.es.categories.Calculators.name).toBe("Calculadoras");
  });

  it("ships complete page copy for every published category in every locale", () => {
    for (const [code, dictionary] of Object.entries(dictionaries)) {
      for (const category of publishedCategories()) {
        const entry = dictionary.categories[category];
        expect(
          entry.page,
          `${code} is missing ${category} page copy`,
        ).toBeDefined();
        const page = entry.page;
        if (page === undefined) continue;

        expect(page.title.trim().length).toBeGreaterThan(0);
        expect(page.metaDescription.trim().length).toBeGreaterThan(0);
        expect(page.toolsHeading.trim().length).toBeGreaterThan(0);
        expect(page.intro.length).toBeGreaterThan(0);
        for (const paragraph of page.intro) {
          expect(paragraph.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
});

/*
 * Compile-time proof that the category name stays required: dropping it
 * would no longer satisfy CategoryStrings, so this sentinel only resolves to
 * `true` while the contract holds.
 */
type CategoryNameRequired =
  Omit<CategoryStrings, "name"> extends CategoryStrings ? never : true;

const categoryNameRequired: CategoryNameRequired = true;

describe("category dictionary type safety", () => {
  it("keeps the category name required", () => {
    expect(categoryNameRequired).toBe(true);
  });
});
