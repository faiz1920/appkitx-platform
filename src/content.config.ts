import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { EDITORIAL_NAME, GUIDE_CATEGORIES, GUIDE_SLUGS } from "./lib/editorial";

/*
 * Bilingual editorial collection (M10.15.1). Markdown is the source format:
 * no CMS, no external service, no new dependency. English and Spanish entries
 * pair on a stable `slug`; `lang` selects the locale route. Frontmatter is
 * validated at build time, so a missing description, date, category, author,
 * or reference fails the build instead of shipping an incomplete article.
 *
 * `author` is a literal organizational byline approved for both languages.
 * It is not a person, and it must not be changed to a named individual.
 */
const guides = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/guides",
    /* The locale directory is part of the ID; the public slug is frontmatter. */
    generateId: ({ entry }) => entry.replace(/\.md$/, "").replace(/\//g, "-"),
  }),
  schema: z.object({
    slug: z.enum(GUIDE_SLUGS),
    lang: z.enum(["en", "es"]),
    title: z.string().min(10).max(100),
    /** Optional shorter <title>; falls back to "<title> — AppKitX Guides". */
    seoTitle: z.string().min(10).max(70).optional(),
    description: z.string().min(50).max(200),
    category: z.enum(GUIDE_CATEGORIES),
    tags: z.array(z.string().min(2)).min(1).max(8),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    author: z.literal(EDITORIAL_NAME),
    related: z.array(z.string()).max(6).default([]),
    references: z
      .array(
        z.object({
          title: z.string().min(3),
          publisher: z.string().min(2),
          url: z.url(),
        }),
      )
      .min(1)
      .max(8),
  }),
});

export const collections = { guides };
