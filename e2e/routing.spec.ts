import { expect, test } from "@playwright/test";

/*
 * M3 routing guarantees, checked against the built production output served
 * through `astro preview`: English stays the only supported locale, URLs stay
 * unprefixed, unsupported locale prefixes 404 without redirects, and the
 * sitemap lists exactly the English routes with no hreflang alternates.
 */

const UNSUPPORTED_PREFIXES = [
  "/en",
  "/en/",
  "/en/percentage-calculator",
  "/es",
  "/es/",
];

const PAGES = [
  "/",
  "/percentage-calculator",
  "/discount-calculator",
  "/definitely-not-a-real-page",
];

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

test("a locale-prefixed URL renders the noindex 404 page", async ({ page }) => {
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

test("no page advertises hreflang alternates while English is the only locale", async ({
  page,
}) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator("link[hreflang]")).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  }
});

test("sitemap lists exactly the English routes with no alternates", async ({
  request,
}) => {
  const response = await request.get("/sitemap-0.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();

  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => {
    return match[1];
  });
  expect(locs.sort()).toEqual([
    "https://appkitx.com/",
    "https://appkitx.com/discount-calculator/",
    "https://appkitx.com/percentage-calculator/",
  ]);

  for (const loc of locs) {
    const pathname = new URL(loc).pathname;
    expect(pathname === "/en" || pathname.startsWith("/en/")).toBe(false);
  }
  expect(xml).not.toContain("hreflang");
  expect(xml).not.toContain("xhtml:link");
});
