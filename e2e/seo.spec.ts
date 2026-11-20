import { expect, test, type Page } from "@playwright/test";
import { getDictionary, locales } from "../src/i18n/config";
import { localizedHref } from "../src/i18n/routing";
import { categoryPath, publishedCategories } from "../src/lib/categories";
import { siteUrl } from "../src/lib/seo";
import { tools } from "../src/lib/tools";

const jsonLdScripts = (page: Page) =>
  page.locator('script[type="application/ld+json"]');

/**
 * Read and parse every JSON-LD script on the page. Parsing proves the
 * serialized payload never breaks the script element or produces invalid
 * JSON; a hostile-input guarantee is additionally unit-tested in
 * tests/seo.test.ts.
 */
const readJsonLd = async (page: Page): Promise<Record<string, unknown>[]> => {
  const scripts = jsonLdScripts(page);
  const count = await scripts.count();
  const documents: Record<string, unknown>[] = [];
  for (let index = 0; index < count; index++) {
    const raw = await scripts.nth(index).textContent();
    documents.push(JSON.parse(raw ?? ""));
  }
  return documents;
};

const ORIGIN = "https://appkitx.com";
const LOCALE_METAS = Object.values(locales);

const TOOL_PAGES = LOCALE_METAS.flatMap((locale) => {
  const dictionary = getDictionary(locale.code);
  return tools.map((tool) => {
    const strings = dictionary.tools[tool.dictionaryKey];
    const path = localizedHref(tool.href, locale.code);
    return {
      path,
      title: strings.title,
      name: strings.name,
      description: strings.description,
      metaDescription: strings.metaDescription,
      breadcrumbLabel: dictionary.toolLayout.breadcrumbLabel,
      homeName: dictionary.toolLayout.breadcrumbHome,
      homePath: localizedHref("/", locale.code),
      homeUrl: siteUrl(localizedHref("/", locale.code), ORIGIN),
      canonical: siteUrl(path, ORIGIN),
      lang: locale.hreflang,
    };
  });
});

test("homepage exposes Open Graph, Twitter, and WebSite structured data", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "AppKitX",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "AppKitX — Free Online Tools",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://appkitx.com/",
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "AppKitX — Free Online Tools",
  );

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", "https://appkitx.com/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://appkitx.com/",
  );

  const documents = await readJsonLd(page);
  expect(documents).toHaveLength(1);
  expect(documents[0]).toEqual({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AppKitX",
    url: "https://appkitx.com/",
    inLanguage: "en",
  });
});

for (const tool of TOOL_PAGES) {
  test(`${tool.lang} ${tool.name} exposes breadcrumb and WebApplication structured data`, async ({
    page,
  }) => {
    await page.goto(tool.path);

    await expect(page.locator("html")).toHaveAttribute("lang", tool.lang);
    await expect(page).toHaveTitle(tool.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tool.name);
    await expect(page.locator("h1 + p")).toHaveText(tool.description);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      tool.metaDescription,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      tool.canonical,
    );
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", tool.canonical);

    const documents = await readJsonLd(page);
    expect(documents).toHaveLength(2);

    const breadcrumb = documents.find(
      (document) => document["@type"] === "BreadcrumbList",
    );
    expect(breadcrumb).toMatchObject({
      "@context": "https://schema.org",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: tool.homeName,
          item: tool.homeUrl,
        },
        { "@type": "ListItem", position: 2, name: tool.name },
      ],
    });

    const visibleBreadcrumb = page.getByRole("navigation", {
      name: tool.breadcrumbLabel,
    });
    await expect(
      visibleBreadcrumb.getByRole("link", { name: tool.homeName }),
    ).toHaveAttribute("href", tool.homePath);
    await expect(visibleBreadcrumb.locator('[aria-current="page"]')).toHaveText(
      tool.name,
    );

    const webApplication = documents.find(
      (document) => document["@type"] === "WebApplication",
    );
    expect(webApplication).toMatchObject({
      "@context": "https://schema.org",
      name: tool.name,
      description: tool.description,
      url: tool.canonical,
      applicationCategory: "UtilitiesApplication",
      isAccessibleForFree: true,
      inLanguage: tool.lang,
    });
    for (const forbidden of [
      "aggregateRating",
      "review",
      "offers",
      "price",
      "author",
    ]) {
      expect(webApplication).not.toHaveProperty(forbidden);
    }
  });
}

test("the 404 page stays noindex for every locale path", async ({ page }) => {
  for (const path of [
    "/definitely-not-a-real-page",
    "/es/definitely-not-a-real-page",
    "/fr/nope",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} must 404`).toBe(404);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
    await expect(jsonLdScripts(page)).toHaveCount(0);
    await expect(
      page.locator('meta[name="google-site-verification"]'),
    ).toHaveCount(1);
  }
});

test("Spanish homepage exposes localized metadata and structured data", async ({
  page,
}) => {
  await page.goto("/es/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("html")).toHaveAttribute("data-locale", "es");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "AppKitX — Herramientas online gratuitas",
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "es_ES",
  );
  await expect(
    page.locator('meta[property="og:locale:alternate"]'),
  ).toHaveAttribute("content", "en_US");

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", "https://appkitx.com/es/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://appkitx.com/es/",
  );

  const documents = await readJsonLd(page);
  expect(documents).toHaveLength(1);
  expect(documents[0]).toEqual({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AppKitX",
    url: "https://appkitx.com/es/",
    inLanguage: "es",
  });

  await page.screenshot({
    path: "test-results/es-homepage.png",
    fullPage: true,
  });
});

const CATEGORY_PAGES = LOCALE_METAS.flatMap((locale) => {
  const dictionary = getDictionary(locale.code);
  return publishedCategories().map((category) => {
    const strings = dictionary.categories[category];
    const pageCopy = strings.page;
    if (pageCopy === undefined) {
      throw new Error(`Missing category page copy: ${category}`);
    }
    const path = localizedHref(categoryPath(category), locale.code);
    return {
      path,
      title: pageCopy.title,
      name: strings.name,
      metaDescription: pageCopy.metaDescription,
      breadcrumbLabel: dictionary.categoryLayout.breadcrumbLabel,
      homeName: dictionary.toolLayout.breadcrumbHome,
      homePath: localizedHref("/", locale.code),
      homeUrl: siteUrl(localizedHref("/", locale.code), ORIGIN),
      canonical: siteUrl(path, ORIGIN),
      lang: locale.hreflang,
    };
  });
});

for (const categoryPage of CATEGORY_PAGES) {
  test(`${categoryPage.lang} ${categoryPage.name} category page exposes breadcrumb and CollectionPage structured data`, async ({
    page,
  }) => {
    await page.goto(categoryPage.path);

    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      categoryPage.lang,
    );
    await expect(page).toHaveTitle(categoryPage.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      categoryPage.name,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      categoryPage.metaDescription,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      categoryPage.canonical,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      categoryPage.canonical,
    );

    const documents = await readJsonLd(page);
    expect(documents).toHaveLength(2);

    const breadcrumb = documents.find(
      (document) => document["@type"] === "BreadcrumbList",
    );
    expect(breadcrumb).toMatchObject({
      "@context": "https://schema.org",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: categoryPage.homeName,
          item: categoryPage.homeUrl,
        },
        { "@type": "ListItem", position: 2, name: categoryPage.name },
      ],
    });

    const visibleBreadcrumb = page.getByRole("navigation", {
      name: categoryPage.breadcrumbLabel,
    });
    await expect(
      visibleBreadcrumb.getByRole("link", { name: categoryPage.homeName }),
    ).toHaveAttribute("href", categoryPage.homePath);
    await expect(visibleBreadcrumb.locator('[aria-current="page"]')).toHaveText(
      categoryPage.name,
    );

    const collection = documents.find(
      (document) => document["@type"] === "CollectionPage",
    );
    expect(collection).toMatchObject({
      "@context": "https://schema.org",
      name: categoryPage.name,
      description: categoryPage.metaDescription,
      url: categoryPage.canonical,
      inLanguage: categoryPage.lang,
    });
    for (const forbidden of [
      "aggregateRating",
      "review",
      "offers",
      "price",
      "author",
      "mainEntity",
    ]) {
      expect(collection).not.toHaveProperty(forbidden);
    }
  });
}
