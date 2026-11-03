import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  GUIDE_CATEGORIES,
  GUIDE_SLUGS,
  INFO_PAGE_PATHS,
  type GuideCategory,
} from "../src/lib/editorial";
import { publishedCategoryPaths } from "../src/lib/categories";
import { tools } from "../src/lib/tools";

const GUIDE_DIR = "src/content/guides";
const LOCALES = ["en", "es"] as const;

interface ParsedGuide {
  lang: (typeof LOCALES)[number];
  slug: string;
  body: string;
  title: string;
  description: string;
  category: string;
  published: string;
  updated: string;
  author: string;
  referenceUrls: string[];
}

function parseGuide(lang: (typeof LOCALES)[number], file: string): ParsedGuide {
  const text = readFileSync(join(GUIDE_DIR, lang, file), "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${lang}/${file} is missing YAML frontmatter`);
  }
  const [, frontmatter, body] = match;
  const field = (name: string): string => {
    const line = frontmatter
      .split(/\r?\n/)
      .find((candidate) => candidate.startsWith(`${name}:`));
    if (!line) return "";
    return line
      .slice(name.length + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  };

  return {
    lang,
    slug: field("slug"),
    body,
    title: field("title"),
    description: field("description"),
    category: field("category"),
    published: field("published"),
    updated: field("updated"),
    author: field("author"),
    referenceUrls: Array.from(
      frontmatter.matchAll(/^\s+url:\s*["']([^"']+)["']/gm),
      (match) => match[1]!,
    ),
  };
}

const guidesByLocale = {
  en: readdirSync(join(GUIDE_DIR, "en"))
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => parseGuide("en", file)),
  es: readdirSync(join(GUIDE_DIR, "es"))
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => parseGuide("es", file)),
};

const allGuides = [...guidesByLocale.en, ...guidesByLocale.es];

function allowedInternalPaths(lang: (typeof LOCALES)[number]): Set<string> {
  const prefix = lang === "en" ? "" : "/es";
  return new Set([
    prefix === "" ? "/" : "/es",
    `${prefix}/guides`,
    ...Object.values(INFO_PAGE_PATHS).map((path) => `${prefix}${path}`),
    ...tools.map((tool) => `${prefix}${tool.href}`),
    ...publishedCategoryPaths().map((path) => `${prefix}${path}`),
    ...GUIDE_SLUGS.map((slug) => `${prefix}/guides/${slug}`),
  ]);
}

describe("bilingual editorial guide library", () => {
  it("pairs every guide across English and Spanish", () => {
    expect(guidesByLocale.en).toHaveLength(10);
    expect(guidesByLocale.es).toHaveLength(10);
    expect(guidesByLocale.en.map((guide) => guide.slug).sort()).toEqual(
      [...GUIDE_SLUGS].sort(),
    );
    expect(guidesByLocale.es.map((guide) => guide.slug).sort()).toEqual(
      [...GUIDE_SLUGS].sort(),
    );
  });

  it("has unique titles within each locale", () => {
    for (const lang of LOCALES) {
      const titles = guidesByLocale[lang].map((guide) => guide.title);
      expect(new Set(titles).size, `${lang} titles`).toBe(titles.length);
    }
  });

  it("has complete, valid frontmatter in both languages", () => {
    for (const guide of allGuides) {
      expect(guide.slug, `${guide.lang}/${guide.slug} slug`).not.toBe("");
      expect(GUIDE_SLUGS, `${guide.lang}/${guide.slug} known slug`).toContain(
        guide.slug,
      );
      expect(
        guide.title.length,
        `${guide.lang}/${guide.slug} title`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        guide.title.length,
        `${guide.lang}/${guide.slug} title`,
      ).toBeLessThanOrEqual(100);
      expect(
        guide.description.length,
        `${guide.lang}/${guide.slug} description`,
      ).toBeGreaterThanOrEqual(50);
      expect(
        guide.description.length,
        `${guide.lang}/${guide.slug} description`,
      ).toBeLessThanOrEqual(200);
      expect(
        GUIDE_CATEGORIES,
        `${guide.lang}/${guide.slug} category`,
      ).toContain(guide.category as GuideCategory);
      expect(guide.published, `${guide.lang}/${guide.slug} published`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(guide.updated, `${guide.lang}/${guide.slug} updated`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      );
      expect(guide.author, `${guide.lang}/${guide.slug} author`).toBe(
        "AppKitX Editorial",
      );
      expect(
        guide.referenceUrls.length,
        `${guide.lang}/${guide.slug} references`,
      ).toBeGreaterThanOrEqual(1);
      for (const url of guide.referenceUrls) {
        expect(url, `${guide.lang}/${guide.slug} reference URL`).toMatch(
          /^https:\/\//,
        );
      }
    }
  });

  it("contains substantial article bodies in both languages", () => {
    for (const guide of allGuides) {
      const words = guide.body
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[#>*_`[\]()|-]/g, " ")
        .split(/\s+/)
        .filter((word) => /[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/.test(word)).length;
      expect(
        words,
        `${guide.lang}/${guide.slug} word count`,
      ).toBeGreaterThanOrEqual(700);
    }
  });

  it("does not invent first-hand testing, reviews, or product ownership", () => {
    const forbidden = [
      /\b(?:I|we)\s+(?:tested|benchmarked|measured|reviewed)\b/i,
      /\bour\s+(?:test|review)\s+unit\b/i,
      /\bin\s+our\s+(?:testing|benchmarks?|lab)\b/i,
      /\bwe\s+(?:bought|own|owned)\b/i,
      /\b(?:he|hemos)\s+(?:probado|medido|analizado|comparado)\b/i,
      /\bnuestro\s+(?:equipo|unidad)\s+de\s+(?:pruebas|análisis)\b/i,
      /\ben\s+nuestras?\s+pruebas?\b/i,
    ];
    for (const guide of allGuides) {
      for (const pattern of forbidden) {
        expect(
          guide.body,
          `${guide.lang}/${guide.slug} matches ${pattern}`,
        ).not.toMatch(pattern);
      }
    }
  });

  it("does not mention Nexverra, Amazon links, or affiliate tags", () => {
    for (const guide of allGuides) {
      expect(guide.body, `${guide.lang}/${guide.slug} Nexverra`).not.toMatch(
        /Nexverra/i,
      );
      expect(guide.body, `${guide.lang}/${guide.slug} Amazon`).not.toMatch(
        /amazon\./i,
      );
      expect(guide.body, `${guide.lang}/${guide.slug} short link`).not.toMatch(
        /amzn\.to/i,
      );
      expect(
        guide.body,
        `${guide.lang}/${guide.slug} affiliate tag`,
      ).not.toMatch(/[?&]tag=/i);
      expect(guide.body, `${guide.lang}/${guide.slug} ASIN`).not.toMatch(
        /\bASIN\b/i,
      );
    }
  });

  it("contains no placeholder copy", () => {
    for (const guide of allGuides) {
      expect(guide.body, `${guide.lang}/${guide.slug} placeholder`).not.toMatch(
        /\b(?:TODO|TBD)\b|lorem ipsum|\[insert|placeholder text/,
      );
    }
  });

  it("only links to known localized internal routes", () => {
    for (const guide of allGuides) {
      const allowed = allowedInternalPaths(guide.lang);
      const links = Array.from(
        guide.body.matchAll(/\]\((\/[^)\s]+)\)/g),
        (match) => match[1]!,
      );
      for (const link of links) {
        const path = link.split("#")[0]!.replace(/\/$/, "") || "/";
        expect(
          allowed.has(path),
          `${guide.lang}/${guide.slug} links to unknown route ${link}`,
        ).toBe(true);
      }
    }
  });

  it("uses every guide category at least once in each language", () => {
    for (const lang of LOCALES) {
      const used = new Set(guidesByLocale[lang].map((guide) => guide.category));
      for (const category of GUIDE_CATEGORIES) {
        expect(used, `${lang} category ${category}`).toContain(category);
      }
    }
  });
});
