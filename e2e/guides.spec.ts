import { expect, test, type Page } from "@playwright/test";
import {
  GUIDE_COPY,
  GUIDE_SLUGS,
  guideHref,
  guideIndexHref,
} from "../src/lib/editorial";

const LOCALES = ["en", "es"] as const;

const GUIDE_ROUTES = LOCALES.flatMap((locale) =>
  GUIDE_SLUGS.map((slug) => guideHref(slug, locale)),
);

const readJsonLd = async (page: Page): Promise<Record<string, unknown>[]> => {
  const scripts = page.locator('script[type="application/ld+json"]');
  const count = await scripts.count();
  const documents: Record<string, unknown>[] = [];
  for (let index = 0; index < count; index++) {
    documents.push(JSON.parse((await scripts.nth(index).textContent()) ?? ""));
  }
  return documents;
};

test("both guides indexes list every localized guide with collection metadata", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    const route = guideIndexHref(locale);
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      GUIDE_COPY[locale].guideIndexTitle,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://appkitx.com${route}`,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );

    for (const slug of GUIDE_SLUGS) {
      await expect(
        page.locator(`a[href="${guideHref(slug, locale)}"]`),
        `${locale} guides index must link ${slug}`,
      ).toHaveCount(1);
    }

    const documents = await readJsonLd(page);
    expect(
      documents.some((document) => document["@type"] === "CollectionPage"),
    ).toBe(true);
    expect(
      documents.some((document) => document["@type"] === "BreadcrumbList"),
    ).toBe(true);

    await expect(page.locator('a[href*="amazon."]')).toHaveCount(0);
    await expect(page.locator('a[href*="tag="]')).toHaveCount(0);
    await expect(page.locator('a[href*="pc-builder"]')).toHaveCount(0);
  }

  await page.screenshot({
    path: "test-results/guides-index.png",
    fullPage: true,
  });
});

test("every localized guide has an article header, byline, dates, references, and disclosure", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    for (const slug of GUIDE_SLUGS) {
      const route = guideHref(slug, locale);
      const response = await page.goto(route);
      expect(response?.status(), `${route} must return 200`).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://appkitx.com${route}`,
      );
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        "content",
        "article",
      );
      await expect(
        page.locator('meta[property="article:published_time"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('meta[property="article:modified_time"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('meta[property="article:section"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('meta[property="article:tag"]'),
      ).not.toHaveCount(0);

      await expect(
        page.getByText(`${GUIDE_COPY[locale].bylinePrefix} AppKitX Editorial`),
      ).toBeVisible();
      await expect(page.locator("main time")).toHaveCount(2);
      await expect(
        page.getByRole("heading", {
          name: GUIDE_COPY[locale].references,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.locator("article a[href^='https://']").first(),
      ).toBeVisible();
      await expect(page.locator("[data-affiliate-disclosure]")).toBeVisible();

      await expect(page.locator('a[href*="amazon."]')).toHaveCount(0);
      await expect(page.locator('a[href*="tag="]')).toHaveCount(0);
      await expect(page.locator('a[href*="pc-builder"]')).toHaveCount(0);

      const documents = await readJsonLd(page);
      const article = documents.find(
        (document) => document["@type"] === "Article",
      );
      expect(article, `${route} must emit Article JSON-LD`).toBeDefined();
      expect(article).toMatchObject({
        "@context": "https://schema.org",
        author: {
          "@type": "Organization",
          name: "AppKitX Editorial",
          url:
            locale === "es"
              ? "https://appkitx.com/es/about/"
              : "https://appkitx.com/about/",
        },
        publisher: {
          "@type": "Organization",
          name: "AppKitX",
          url:
            locale === "es"
              ? "https://appkitx.com/es/"
              : "https://appkitx.com/",
        },
        mainEntityOfPage: `https://appkitx.com${route}`,
        inLanguage: locale,
      });
      for (const forbidden of [
        "aggregateRating",
        "review",
        "offers",
        "price",
      ]) {
        expect(article).not.toHaveProperty(forbidden);
      }

      const breadcrumb = documents.find(
        (document) => document["@type"] === "BreadcrumbList",
      );
      expect(
        breadcrumb,
        `${route} must emit BreadcrumbList JSON-LD`,
      ).toBeDefined();
    }
  }
});

test("article table-of-contents links resolve to real headings in both locales", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    await page.goto(
      guideHref("how-to-check-pc-component-compatibility", locale),
    );

    const tocLinks = page.locator("aside nav a[href^='#']");
    const count = await tocLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let index = 0; index < count; index++) {
      const href = await tocLinks.nth(index).getAttribute("href");
      expect(href).not.toBeNull();
      const id = href?.slice(1) ?? "";
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    }
  }
});

test("guides remain readable at 320px without horizontal overflow in both locales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const locale of LOCALES) {
    for (const route of [
      guideIndexHref(locale),
      guideHref("how-to-choose-a-cpu", locale),
      guideHref("how-to-check-pc-component-compatibility", locale),
      guideHref("how-to-choose-the-right-power-supply", locale),
    ]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `${route} overflows horizontally`).toBeLessThanOrEqual(
        0,
      );
    }
  }

  await page.screenshot({
    path: "test-results/guides-320.png",
    fullPage: false,
  });
});

test("guide article desktop visual proof in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const locale of LOCALES) {
    await page.goto(guideHref("how-to-choose-a-cpu", locale));
    await page.screenshot({
      path: `test-results/guide-article-${locale}-desktop.png`,
      fullPage: true,
    });
  }
});

test("related guides link to other published guides in the same locale", async ({
  page,
}) => {
  for (const locale of LOCALES) {
    await page.goto(guideHref("how-to-choose-a-cpu", locale));

    const section = page.locator("section").filter({
      has: page.getByRole("heading", {
        name: GUIDE_COPY[locale].relatedGuides,
      }),
    });
    await expect(section).toBeVisible();

    const prefix = locale === "en" ? "/guides/" : "/es/guides/";
    const hrefs = await section
      .locator(`a[href^="${prefix}"]`)
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
      );

    const relatedHrefs = hrefs.filter(
      (href) => href !== guideIndexHref(locale),
    );
    expect(relatedHrefs.length).toBeGreaterThanOrEqual(1);
    for (const href of relatedHrefs) {
      expect(GUIDE_ROUTES).toContain(href);
    }
  }
});
