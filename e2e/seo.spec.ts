import { expect, test, type Page } from "@playwright/test";

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

const TOOLS = [
  {
    path: "/percentage-calculator",
    name: "Percentage Calculator",
    canonical: "https://appkitx.com/percentage-calculator/",
  },
  {
    path: "/discount-calculator",
    name: "Discount Calculator",
    canonical: "https://appkitx.com/discount-calculator/",
  },
  {
    path: "/base64-encoder",
    name: "Base64 Encoder",
    canonical: "https://appkitx.com/base64-encoder/",
  },
  {
    path: "/json-formatter",
    name: "JSON Formatter",
    canonical: "https://appkitx.com/json-formatter/",
  },
];

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
    "summary",
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

for (const tool of TOOLS) {
  test(`${tool.name} exposes breadcrumb and WebApplication structured data`, async ({
    page,
  }) => {
    await page.goto(tool.path);

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
          name: "Home",
          item: "https://appkitx.com/",
        },
        { "@type": "ListItem", position: 2, name: tool.name },
      ],
    });

    const webApplication = documents.find(
      (document) => document["@type"] === "WebApplication",
    );
    expect(webApplication).toMatchObject({
      "@context": "https://schema.org",
      name: tool.name,
      url: tool.canonical,
      applicationCategory: "UtilitiesApplication",
      isAccessibleForFree: true,
      inLanguage: "en",
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

for (const tool of [
  {
    path: "/es/percentage-calculator",
    name: "Calculadora de porcentajes",
    canonical: "https://appkitx.com/es/percentage-calculator/",
  },
  {
    path: "/es/discount-calculator",
    name: "Calculadora de descuentos",
    canonical: "https://appkitx.com/es/discount-calculator/",
  },
  {
    path: "/es/base64-encoder",
    name: "Codificador Base64",
    canonical: "https://appkitx.com/es/base64-encoder/",
  },
  {
    path: "/es/json-formatter",
    name: "Formateador JSON",
    canonical: "https://appkitx.com/es/json-formatter/",
  },
]) {
  test(`Spanish ${tool.name} exposes localized canonical, breadcrumb, and structured data`, async ({
    page,
  }) => {
    await page.goto(tool.path);

    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      tool.canonical,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      tool.canonical,
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
          name: "Inicio",
          item: "https://appkitx.com/es/",
        },
        { "@type": "ListItem", position: 2, name: tool.name },
      ],
    });

    const webApplication = documents.find(
      (document) => document["@type"] === "WebApplication",
    );
    expect(webApplication).toMatchObject({
      "@context": "https://schema.org",
      name: tool.name,
      url: tool.canonical,
      applicationCategory: "UtilitiesApplication",
      isAccessibleForFree: true,
      inLanguage: "es",
    });
  });
}

const CATEGORY_PAGES = [
  {
    path: "/calculators",
    name: "Calculators",
    homeName: "Home",
    homeUrl: "https://appkitx.com/",
    canonical: "https://appkitx.com/calculators/",
    inLanguage: "en",
  },
  {
    path: "/es/calculators",
    name: "Calculadoras",
    homeName: "Inicio",
    homeUrl: "https://appkitx.com/es/",
    canonical: "https://appkitx.com/es/calculators/",
    inLanguage: "es",
  },
  {
    path: "/developer-tools",
    name: "Developer tools",
    homeName: "Home",
    homeUrl: "https://appkitx.com/",
    canonical: "https://appkitx.com/developer-tools/",
    inLanguage: "en",
  },
  {
    path: "/es/developer-tools",
    name: "Herramientas de desarrollo",
    homeName: "Inicio",
    homeUrl: "https://appkitx.com/es/",
    canonical: "https://appkitx.com/es/developer-tools/",
    inLanguage: "es",
  },
];

for (const categoryPage of CATEGORY_PAGES) {
  test(`the ${categoryPage.path} category page exposes breadcrumb and CollectionPage structured data`, async ({
    page,
  }) => {
    await page.goto(categoryPage.path);

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

    const collection = documents.find(
      (document) => document["@type"] === "CollectionPage",
    );
    expect(collection).toMatchObject({
      "@context": "https://schema.org",
      name: categoryPage.name,
      url: categoryPage.canonical,
      inLanguage: categoryPage.inLanguage,
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
