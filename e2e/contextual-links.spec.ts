import { expect, test } from "@playwright/test";
import { dictionaries, type LocaleCode } from "../src/i18n/config";
import { splitProseSpans } from "../src/i18n/prose";
import { localizedHref } from "../src/i18n/routing";
import { tools } from "../src/lib/tools";

/*
 * Runtime proof for contextual internal links: every tool page renders the
 * dictionary's in-prose links as ordinary anchors, Spanish pages point at
 * Spanish destinations, and no duplicate or unpublished target slips in.
 */

const LOCALES = Object.keys(dictionaries) as LocaleCode[];
const REGISTERED = new Set(tools.map((tool) => tool.href));

const expectedLinks = (locale: LocaleCode, toolHref: string) => {
  const tool = tools.find((candidate) => candidate.href === toolHref);
  if (tool === undefined) throw new Error(`Unknown tool: ${toolHref}`);
  return dictionaries[locale].tools[tool.dictionaryKey].sections.flatMap(
    (section) =>
      [...(section.paragraphs ?? []), ...(section.items ?? [])].flatMap(
        (text) =>
          splitProseSpans(text).flatMap((segment) =>
            segment.href === undefined
              ? []
              : [
                  {
                    text: segment.text,
                    href: localizedHref(segment.href, locale),
                  },
                ],
          ),
      ),
  );
};

const renderedLinks = async (
  page: import("@playwright/test").Page,
): Promise<Array<{ text: string; href: string }>> =>
  page.locator("main .prose a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      text: (anchor.textContent ?? "").trim(),
      href: anchor.getAttribute("href") ?? "",
    })),
  );

test("every tool page renders its contextual links as localized anchors", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALES) {
    for (const tool of tools) {
      const expected = expectedLinks(locale, tool.href);
      if (expected.length === 0) continue;

      await page.goto(localizedHref(tool.href, locale));

      const anchors = page.locator("main .prose a[href]");
      await expect(anchors, `${locale} ${tool.href}`).toHaveCount(
        expected.length,
      );
      expect(await renderedLinks(page), `${locale} ${tool.href}`).toEqual(
        expected,
      );

      for (const link of expected) {
        const target = tools.find(
          (candidate) => localizedHref(candidate.href, locale) === link.href,
        );
        expect(
          target,
          `${locale} ${tool.href} links ${link.href} outside the registry`,
        ).toBeDefined();
      }
    }
  }
});

test("contextual link targets resolve without redirects", async ({
  request,
}) => {
  test.setTimeout(120_000);
  const targets = new Set<string>();
  for (const locale of LOCALES) {
    for (const tool of tools) {
      for (const link of expectedLinks(locale, tool.href)) {
        targets.add(link.href);
      }
      expect(REGISTERED.has(tool.href)).toBe(true);
    }
  }

  for (const target of targets) {
    const response = await request.get(target, { maxRedirects: 0 });
    expect(response.status(), `${target} must resolve with 200`).toBe(200);
  }
});

test("contextual linking leaves the route and sitemap set unchanged", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );

  expect(urls).toHaveLength(82);
  expect(sitemap).not.toContain("pc-builder");
  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);
});

test("contextual links keep the underline and design-system focus ring", async ({
  page,
}) => {
  await page.goto("/loan-calculator/");
  const link = page.locator('main .prose a[href="/emi-calculator/"]');

  await expect(link).toHaveCSS("text-decoration-line", "underline");

  await page.keyboard.press("Tab");
  await link.focus();

  await expect(link).toHaveCSS("outline-width", "2px");
  await expect(link).toHaveCSS("outline-style", "solid");
  await expect(link).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(link).toHaveCSS("outline-offset", "2px");
});
