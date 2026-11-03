import { describe, expect, it } from "vitest";
import {
  GUIDE_CATEGORIES,
  estimateReadingMinutes,
  formatEditorialDate,
  groupGuidesByCategory,
  guideHref,
  guideIndexHref,
  guidePath,
  infoPageHref,
  isoDate,
  selectRelatedGuides,
  sortGuidesByDate,
  toGuideSummary,
  type GuideSummary,
} from "../src/lib/editorial";

const guide = (
  slug: string,
  overrides: Partial<GuideSummary> = {},
): GuideSummary => ({
  slug,
  lang: "en",
  title: `Guide ${slug}`,
  description: "A sufficiently descriptive guide summary for the test.",
  category: "Choosing components",
  published: new Date("2026-11-01T00:00:00Z"),
  updated: new Date("2026-11-01T00:00:00Z"),
  readingMinutes: 5,
  tags: ["test"],
  ...overrides,
});

describe("editorial paths", () => {
  it("builds canonical guide paths and the index href", () => {
    expect(guidePath("how-to-choose-a-cpu")).toBe(
      "/guides/how-to-choose-a-cpu",
    );
    expect(guideHref("how-to-choose-a-cpu")).toBe(
      "/guides/how-to-choose-a-cpu/",
    );
    expect(guideIndexHref()).toBe("/guides/");
    expect(guidePath("how-to-choose-a-cpu", "es")).toBe(
      "/es/guides/how-to-choose-a-cpu",
    );
    expect(guideHref("how-to-choose-a-cpu", "es")).toBe(
      "/es/guides/how-to-choose-a-cpu/",
    );
    expect(guideIndexHref("es")).toBe("/es/guides/");
  });

  it("builds localized information-page paths", () => {
    expect(infoPageHref("privacy")).toBe("/privacy/");
    expect(infoPageHref("privacy", "es")).toBe("/es/privacy/");
  });
});

describe("editorial dates", () => {
  it("formats dates in a stable global English form", () => {
    expect(formatEditorialDate(new Date("2026-11-01T00:00:00Z"))).toBe(
      "1 November 2026",
    );
    expect(isoDate(new Date("2026-11-01T23:30:00Z"))).toBe("2026-11-01");
    expect(formatEditorialDate(new Date("2026-11-01T00:00:00Z"), "es")).toBe(
      "1 de noviembre de 2026",
    );
  });
});

describe("reading time", () => {
  it("never returns less than one minute", () => {
    expect(estimateReadingMinutes("")).toBe(1);
    expect(estimateReadingMinutes("A short sentence.")).toBe(1);
  });

  it("scales with word count and ignores fenced code blocks", () => {
    const words = Array.from({ length: 660 }, () => "word").join(" ");
    expect(estimateReadingMinutes(words)).toBe(3);
    expect(estimateReadingMinutes(`${words}\n\`\`\`\n${words}\n\`\`\``)).toBe(
      3,
    );
  });
});

describe("related guides", () => {
  const guides = [
    guide("current", {
      category: "Compatibility",
      related: ["explicit"],
      published: new Date("2026-11-01T00:00:00Z"),
    }),
    guide("explicit", {
      category: "Buying advice",
      published: new Date("2026-10-01T00:00:00Z"),
    }),
    guide("same-category", {
      category: "Compatibility",
      published: new Date("2026-09-01T00:00:00Z"),
    }),
    guide("other-category", {
      category: "Choosing components",
      published: new Date("2026-08-01T00:00:00Z"),
    }),
  ];

  it("honours explicit references first and never duplicates the current guide", () => {
    const related = selectRelatedGuides(guides, "current", 3);
    expect(related.map((entry) => entry.slug)).toEqual([
      "explicit",
      "same-category",
      "other-category",
    ]);
  });

  it("returns an empty list for an unknown current guide", () => {
    expect(selectRelatedGuides(guides, "missing")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(selectRelatedGuides(guides, "current", 1)).toHaveLength(1);
  });
});

describe("guide ordering and grouping", () => {
  const guides = [
    guide("older", {
      category: "Choosing components",
      published: new Date("2026-01-01T00:00:00Z"),
    }),
    guide("newer", {
      category: "Compatibility",
      published: new Date("2026-11-01T00:00:00Z"),
    }),
  ];

  it("sorts newest first", () => {
    expect(sortGuidesByDate(guides).map((entry) => entry.slug)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("groups in the canonical category order and omits empty groups", () => {
    const groups = groupGuidesByCategory(guides);
    expect(groups.map((group) => group.category)).toEqual([
      "Choosing components",
      "Compatibility",
    ]);
    for (const group of groups) {
      expect(GUIDE_CATEGORIES).toContain(group.category);
    }
  });
});

describe("toGuideSummary", () => {
  it("maps a content entry to the pure summary shape", () => {
    const summary = toGuideSummary({
      id: "example",
      body: "One two three four five.",
      data: {
        slug: "example",
        lang: "en",
        title: "Example guide",
        description: "An example guide description for the unit test.",
        category: "Buying advice",
        published: new Date("2026-11-01T00:00:00Z"),
        updated: new Date("2026-11-02T00:00:00Z"),
        tags: ["example"],
        related: ["other"],
      },
    });

    expect(summary).toMatchObject({
      slug: "example",
      lang: "en",
      title: "Example guide",
      category: "Buying advice",
      readingMinutes: 1,
      tags: ["example"],
      related: ["other"],
    });
  });
});
