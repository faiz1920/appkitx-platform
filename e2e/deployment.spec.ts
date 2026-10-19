import { expect, test } from "@playwright/test";

test("unknown routes render the 404 page", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-real-page");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const main = page.getByRole("main");
  await expect(
    main.getByRole("link", { name: "Percentage Calculator" }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(
    main.getByRole("link", { name: "Discount Calculator" }),
  ).toHaveAttribute("href", "/discount-calculator/");

  const home = page.getByRole("link", { name: "Go to homepage" });
  await expect(home).toHaveAttribute("href", "/");
  await home.click();
  await expect(page).toHaveURL(/\/$/);
});

test("search from the 404 page opens the palette", async ({ page }) => {
  await page.goto("/definitely-not-a-real-page");

  await page.getByPlaceholder("Search free tools…").fill("markdown");
  await page.getByPlaceholder("Search free tools…").press("Enter");

  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await expect(page.locator("[data-search-input]")).toHaveValue("markdown");
});

test("indexable pages expose the Google site verification tag", async ({
  page,
}) => {
  for (const path of ["/", "/percentage-calculator", "/discount-calculator"]) {
    await page.goto(path);
    await expect(
      page.locator('meta[name="google-site-verification"]'),
    ).toHaveAttribute("content", "FqtwFyw8U6onLFiInewftYVJ-kJePykEmuxN2SwOe0c");
  }
});

test("public pages expose absolute canonical URLs", async ({ page }) => {
  const pages = [
    { path: "/", canonical: "https://appkitx.com/" },
    {
      path: "/percentage-calculator",
      canonical: "https://appkitx.com/percentage-calculator/",
    },
    {
      path: "/discount-calculator",
      canonical: "https://appkitx.com/discount-calculator/",
    },
  ];

  for (const { path, canonical } of pages) {
    await page.goto(path);
    const link = page.locator('link[rel="canonical"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", canonical);
  }
});

test("robots.txt and the sitemap are served with the intended routes", async ({
  page,
}) => {
  const robots = await page.request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Allow: /");
  expect(robotsText).toContain(
    "Sitemap: https://appkitx.com/sitemap-index.xml",
  );

  const index = await page.request.get("/sitemap-index.xml");
  expect(index.status()).toBe(200);
  expect(await index.text()).toContain("sitemap-0.xml");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  for (const url of [
    "https://appkitx.com/",
    "https://appkitx.com/percentage-calculator",
    "https://appkitx.com/discount-calculator",
  ]) {
    expect(sitemapText).toContain(url);
  }
  expect(sitemapText).not.toContain("/404");
  expect(sitemapText).not.toContain("localhost");
});
