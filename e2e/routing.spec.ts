import { expect, test } from "@playwright/test";
import { defaultLocale, locales } from "../src/i18n/config";
import { localizedPath, translatedPagePaths } from "../src/i18n/routing";
import { siteUrl } from "../src/lib/seo";

/*
 * M3/M4/M6 routing guarantees, checked against the built production output
 * served through `wrangler dev`: English stays the unprefixed default,
 * every registered locale is served under its prefix, unsupported prefixes
 * 404 without redirects, and the sitemap pairs every translated page with
 * reciprocal alternates (x-default lives in the HTML head only).
 *
 * The locale sets derive from the registry; explicit English/Spanish
 * regressions are kept below so a derivation bug cannot hide.
 */

const SITE = "https://appkitx.com";
const ALL_LOCALES = Object.keys(locales) as Array<keyof typeof locales>;
const NON_DEFAULT_LOCALES = ALL_LOCALES.filter(
  (code) => code !== defaultLocale,
);
const TRANSLATED_PATHS = translatedPagePaths();

const pageUrl = (path: string, locale: (typeof ALL_LOCALES)[number]): string =>
  siteUrl(localizedPath(path, locale), SITE);

const TRANSLATED_PAGES = TRANSLATED_PATHS.map((path) => ({
  path,
  urls: Object.fromEntries(
    ALL_LOCALES.map((locale) => [locale, pageUrl(path, locale)]),
  ) as Record<(typeof ALL_LOCALES)[number], string>,
}));

/* Request paths for every non-default locale page. */
const LOCALIZED_PAGES = TRANSLATED_PATHS.flatMap((path) =>
  NON_DEFAULT_LOCALES.map((locale) => new URL(pageUrl(path, locale)).pathname),
);

const UNSUPPORTED_PREFIXES = [
  "/en",
  "/en/",
  "/en/percentage-calculator",
  "/fr",
  "/fr/",
  "/de",
];

const ALTERNATE_EXPECTATIONS: Record<
  string,
  { hreflang: string; href: string }[]
> = Object.fromEntries(
  TRANSLATED_PAGES.flatMap(({ urls }) => {
    const links = [
      ...ALL_LOCALES.map((locale) => ({
        hreflang: locales[locale].hreflang,
        href: urls[locale],
      })),
      { hreflang: "x-default", href: urls[defaultLocale] },
    ];
    return [
      [new URL(urls[defaultLocale]).pathname, links],
      ...NON_DEFAULT_LOCALES.map((locale) => [
        new URL(urls[locale]).pathname,
        links,
      ]),
    ];
  }),
);

test("English URLs stay unprefixed and Spanish keeps its prefix", async () => {
  expect(NON_DEFAULT_LOCALES).toContain("es");
  expect(pageUrl("/percentage-calculator", defaultLocale)).toBe(
    "https://appkitx.com/percentage-calculator/",
  );
  expect(pageUrl("/percentage-calculator", "es")).toBe(
    "https://appkitx.com/es/percentage-calculator/",
  );
  expect(pageUrl("/", "es")).toBe("https://appkitx.com/es/");
  expect(TRANSLATED_PATHS).toEqual(
    expect.arrayContaining([
      "/",
      "/percentage-calculator",
      "/discount-calculator",
      "/calculators",
    ]),
  );
});

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

test("every indexable page advertises reciprocal alternates and x-default", async ({
  page,
}) => {
  for (const [path, links] of Object.entries(ALTERNATE_EXPECTATIONS)) {
    await page.goto(path);
    await expect(
      page.locator('link[rel="alternate"]'),
      `${path} must advertise every locale plus x-default`,
    ).toHaveCount(ALL_LOCALES.length + 1);
    for (const link of links) {
      await expect(
        page.locator(`link[rel="alternate"][hreflang="${link.hreflang}"]`),
        `${path} must carry hreflang ${link.hreflang}`,
      ).toHaveAttribute("href", link.href);
    }
  }
});

test("sitemap lists every translated page with reciprocal alternates", async ({
  request,
}) => {
  const response = await request.get("/sitemap-0.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
    return match[1];
  });
  const expectedLocs = TRANSLATED_PAGES.flatMap(({ urls }) =>
    ALL_LOCALES.map((locale) => urls[locale]),
  ).sort();
  expect(locs.sort()).toEqual(expectedLocs);

  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    expect(pathname === "/en" || pathname.startsWith("/en/")).toBe(false);
  }

  const blocks = Array.from(
    xml.matchAll(/<url>([\s\S]*?)<\/url>/g),
    (match) => match[1],
  );
  expect(blocks).toHaveLength(TRANSLATED_PATHS.length * ALL_LOCALES.length);

  for (const { urls } of TRANSLATED_PAGES) {
    for (const locale of ALL_LOCALES) {
      const loc = urls[locale];
      const block = blocks.find((candidate) =>
        candidate.includes(`<loc>${loc}</loc>`),
      );
      expect(block, `sitemap must list ${loc}`).toBeDefined();

      const links = block?.match(/<xhtml:link[^>]*\/>/g) ?? [];
      expect(links).toHaveLength(ALL_LOCALES.length);
      for (const alternate of ALL_LOCALES) {
        expect(
          links.some(
            (link) =>
              link.includes(`hreflang="${locales[alternate].hreflang}"`) &&
              link.includes(`href="${urls[alternate]}"`),
          ),
          `${loc} must reference ${urls[alternate]}`,
        ).toBe(true);
      }
    }
  }

  /* x-default is an HTML head signal only — the sitemap carries real pairs. */
  expect(xml).not.toContain("x-default");
});
