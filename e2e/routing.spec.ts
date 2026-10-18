import { expect, test } from "@playwright/test";

/*
 * M3/M4 routing guarantees, checked against the built production output
 * served through `astro preview`: English stays the unprefixed default,
 * Spanish is served at /es/..., unsupported prefixes 404 without redirects,
 * and the sitemap pairs every translated page with reciprocal en/es
 * alternates (x-default lives in the HTML head only).
 */

const UNSUPPORTED_PREFIXES = [
  "/en",
  "/en/",
  "/en/percentage-calculator",
  "/fr",
  "/fr/",
  "/de",
];

const LOCALIZED_PAGES = [
  "/es/",
  "/es/percentage-calculator/",
  "/es/discount-calculator/",
];

/* Every logical page paired with the same page in each locale. */
const TRANSLATED_PAGES = [
  {
    en: "https://appkitx.com/",
    es: "https://appkitx.com/es/",
  },
  {
    en: "https://appkitx.com/percentage-calculator/",
    es: "https://appkitx.com/es/percentage-calculator/",
  },
  {
    en: "https://appkitx.com/discount-calculator/",
    es: "https://appkitx.com/es/discount-calculator/",
  },
];

const ALTERNATE_EXPECTATIONS: Record<
  string,
  { hreflang: string; href: string }[]
> = Object.fromEntries(
  TRANSLATED_PAGES.flatMap(({ en, es }) => [
    [
      new URL(en).pathname,
      [
        { hreflang: "en", href: en },
        { hreflang: "es", href: es },
        { hreflang: "x-default", href: en },
      ],
    ],
    [
      new URL(es).pathname,
      [
        { hreflang: "en", href: en },
        { hreflang: "es", href: es },
        { hreflang: "x-default", href: en },
      ],
    ],
  ]),
);

test("unsupported locale prefixes return 404 without redirects", async ({
  request,
}) => {
  for (const path of UNSUPPORTED_PREFIXES) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), `${path} must not redirect`).toBe(404);
    expect(
      response.headers()["location"],
      `${path} must not send a Location header`,
    ).toBeUndefined();
  }
});

test("localized pages are served as static routes without redirects", async ({
  request,
}) => {
  for (const path of LOCALIZED_PAGES) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), `${path} must be served`).toBe(200);
    expect(
      response.headers()["location"],
      `${path} must not redirect`,
    ).toBeUndefined();
  }
});

test("a locale-prefixed URL outside the supported set renders the noindex 404 page", async ({
  page,
}) => {
  const response = await page.goto("/en/percentage-calculator");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("every indexable page advertises reciprocal en/es alternates and x-default", async ({
  page,
}) => {
  for (const [path, links] of Object.entries(ALTERNATE_EXPECTATIONS)) {
    await page.goto(path);
    await expect(
      page.locator('link[rel="alternate"]'),
      `${path} must advertise three alternates`,
    ).toHaveCount(3);
    for (const link of links) {
      await expect(
        page.locator(`link[rel="alternate"][hreflang="${link.hreflang}"]`),
        `${path} must carry hreflang ${link.hreflang}`,
      ).toHaveAttribute("href", link.href);
    }
  }
});

test("sitemap lists every translated page with reciprocal en/es alternates", async ({
  request,
}) => {
  const response = await request.get("/sitemap-0.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
    return match[1];
  });
  expect(locs.sort()).toEqual(
    TRANSLATED_PAGES.flatMap((pair) => [pair.en, pair.es]).sort(),
  );

  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    expect(pathname === "/en" || pathname.startsWith("/en/")).toBe(false);
  }

  const blocks = Array.from(
    xml.matchAll(/<url>([\s\S]*?)<\/url>/g),
    (match) => match[1],
  );
  expect(blocks).toHaveLength(6);

  for (const pair of TRANSLATED_PAGES) {
    const enBlock = blocks.find((block) =>
      block.includes(`<loc>${pair.en}</loc>`),
    );
    const esBlock = blocks.find((block) =>
      block.includes(`<loc>${pair.es}</loc>`),
    );
    expect(enBlock, `sitemap must list ${pair.en}`).toBeDefined();
    expect(esBlock, `sitemap must list ${pair.es}`).toBeDefined();

    for (const block of [enBlock ?? "", esBlock ?? ""]) {
      const links = block.match(/<xhtml:link[^>]*\/>/g) ?? [];
      expect(links).toHaveLength(2);
      expect(
        links.some(
          (link) =>
            link.includes('hreflang="en"') &&
            link.includes(`href="${pair.en}"`),
        ),
      ).toBe(true);
      expect(
        links.some(
          (link) =>
            link.includes('hreflang="es"') &&
            link.includes(`href="${pair.es}"`),
        ),
      ).toBe(true);
    }
  }

  /* x-default is an HTML head signal only — the sitemap carries real pairs. */
  expect(xml).not.toContain("x-default");
});
