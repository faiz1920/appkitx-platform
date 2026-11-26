import { describe, expect, it } from "vitest";
import { dictionaries, type LocaleCode } from "../src/i18n/config";
import { splitProseSpans } from "../src/i18n/prose";
import type { ToolStringsKey } from "../src/i18n/dictionary";
import { tools } from "../src/lib/tools";

/*
 * Contextual-link contract for tool prose.
 *
 * Dictionary prose carries internal links as [anchor](/path). These tests
 * assert the graph is registered, reciprocal where intended, identical
 * across locales, free of duplicate targets, and never points at an
 * unpublished route such as the PC Builder.
 */

interface ProseLink {
  text: string;
  href: string;
  section: string;
}

function proseLinks(locale: LocaleCode, key: ToolStringsKey): ProseLink[] {
  return dictionaries[locale].tools[key].sections.flatMap((section) =>
    [...(section.paragraphs ?? []), ...(section.items ?? [])].flatMap((text) =>
      splitProseSpans(text)
        .filter((segment) => segment.href !== undefined)
        .map((segment) => ({
          text: segment.text,
          href: segment.href as string,
          section: section.heading,
        })),
    ),
  );
}

const LOCALES = Object.keys(dictionaries) as LocaleCode[];
const REGISTERED = new Map(tools.map((tool) => [tool.href, tool]));

/** Contextual edges this release ships in both locales. */
const REQUIRED_EDGES: ReadonlyArray<readonly [string, string]> = [
  ["/loan-calculator", "/emi-calculator"],
  ["/loan-calculator", "/compound-interest-calculator"],
  ["/emi-calculator", "/loan-calculator"],
  ["/compound-interest-calculator", "/savings-goal-calculator"],
  ["/compound-interest-calculator", "/retirement-calculator"],
  ["/savings-goal-calculator", "/compound-interest-calculator"],
  ["/savings-goal-calculator", "/retirement-calculator"],
  ["/retirement-calculator", "/compound-interest-calculator"],
  ["/retirement-calculator", "/savings-goal-calculator"],
  ["/unit-converter", "/speed-converter"],
  ["/speed-converter", "/unit-converter"],
  ["/json-formatter", "/base64-encoder"],
  ["/base64-encoder", "/json-formatter"],
  ["/base64-encoder", "/qr-code-generator"],
  ["/base64-encoder", "/uuid-generator"],
  ["/qr-code-generator", "/base64-encoder"],
  ["/uuid-generator", "/base64-encoder"],
  ["/uuid-generator", "/json-formatter"],
  ["/word-counter", "/case-converter"],
  ["/case-converter", "/word-counter"],
];

const CLUSTER_PATHS = new Set(REQUIRED_EDGES.flat());

describe("contextual internal links", () => {
  for (const locale of LOCALES) {
    it(`${locale} links only registered tools and never itself`, () => {
      for (const tool of tools) {
        for (const link of proseLinks(locale, tool.dictionaryKey)) {
          expect(
            REGISTERED.has(link.href),
            `${locale} ${tool.href} links unregistered ${link.href}`,
          ).toBe(true);
          expect(
            link.href,
            `${locale} ${tool.href} must not link itself`,
          ).not.toBe(tool.href);
        }
      }
    });

    it(`${locale} keeps anchor text and destinations unique per page`, () => {
      for (const tool of tools) {
        const links = proseLinks(locale, tool.dictionaryKey);
        const hrefs = links.map((link) => link.href);
        const labels = links.map((link) => link.text);
        expect(new Set(hrefs).size, `${locale} ${tool.href} duplicates`).toBe(
          hrefs.length,
        );
        expect(
          new Set(labels).size,
          `${locale} ${tool.href} repeats anchor text`,
        ).toBe(labels.length);
        expect(
          links.length,
          `${locale} ${tool.href} link count`,
        ).toBeLessThanOrEqual(3);
      }
    });

    it(`${locale} ships every required cluster edge`, () => {
      const edges = new Set(
        tools.flatMap((tool) =>
          proseLinks(locale, tool.dictionaryKey).map(
            (link) => `${tool.href}->${link.href}`,
          ),
        ),
      );
      for (const [from, to] of REQUIRED_EDGES) {
        expect(edges.has(`${from}->${to}`), `${locale} ${from} -> ${to}`).toBe(
          true,
        );
      }
    });

    it(`${locale} gives every cluster tool a contextual in-link`, () => {
      const inDegree = new Map([...CLUSTER_PATHS].map((path) => [path, 0]));
      for (const tool of tools) {
        for (const link of proseLinks(locale, tool.dictionaryKey)) {
          const current = inDegree.get(link.href);
          if (current !== undefined) inDegree.set(link.href, current + 1);
        }
      }
      for (const [path, degree] of inDegree) {
        expect(
          degree,
          `${locale} ${path} contextual in-degree`,
        ).toBeGreaterThan(0);
      }
    });
  }

  it("English and Spanish link to the same destinations per tool", () => {
    for (const tool of tools) {
      const english = proseLinks("en", tool.dictionaryKey)
        .map((link) => link.href)
        .sort();
      const spanish = proseLinks("es", tool.dictionaryKey)
        .map((link) => link.href)
        .sort();
      expect(spanish, tool.href).toEqual(english);
    }
  });

  it("never links the PC Builder", () => {
    for (const locale of LOCALES) {
      for (const tool of tools) {
        for (const link of proseLinks(locale, tool.dictionaryKey)) {
          expect(link.href).not.toContain("pc-builder");
        }
      }
    }
  });
});
