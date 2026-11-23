import { expect, test, type Page } from "@playwright/test";

/*
 * The shared Playwright storage state preselects "denied" so the banner does
 * not overlay other specs. These tests start from a clean browser instead.
 */
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.locator("[data-consent-banner]");
const accept = (page: Page) =>
  page.getByRole("button", { name: "Accept analytics" });
const reject = (page: Page) =>
  page.getByRole("button", { name: "Reject analytics" });
const settings = (page: Page) =>
  page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Cookie settings" });

const dataLayer = async (page: Page) =>
  page.evaluate(() => {
    const layer = (window as unknown as { dataLayer?: ArrayLike<unknown>[] })
      .dataLayer;
    return (layer ?? []).map((entry) => Array.from(entry));
  });

const consentCommand = async (page: Page, command: "default" | "update") => {
  const entries = await dataLayer(page);
  const entry = entries.find(
    (item) => item[0] === "consent" && item[1] === command,
  );
  return entry?.[2] as Record<string, string> | undefined;
};

test("shows the banner on a first visit with analytics denied", async ({
  page,
}) => {
  await page.goto("/");

  await expect(banner(page)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cookies and analytics" }),
  ).toBeVisible();
  await expect(accept(page)).toBeVisible();
  await expect(reject(page)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Read the privacy policy" }),
  ).toBeVisible();

  const defaults = await consentCommand(page, "default");
  expect(defaults).toMatchObject({
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });

  /* The preview host is not a production host, so the tag must not load. */
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => document.cookie.includes("_ga"))).toBe(
    false,
  );
});

test("accepting grants analytics storage and persists across reloads", async ({
  page,
}) => {
  await page.goto("/");
  await accept(page).click();

  await expect(banner(page)).toBeHidden();
  expect(
    await page.evaluate(() => localStorage.getItem("appkitx.consent")),
  ).toBe("granted");

  const update = await consentCommand(page, "update");
  expect(update?.analytics_storage).toBe("granted");
  expect(update?.ad_storage).toBe("denied");

  await page.reload();
  await expect(banner(page)).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  /* A returning accepted visitor is granted from the very first hit. */
  const defaults = await consentCommand(page, "default");
  expect(defaults?.analytics_storage).toBe("granted");
  expect(defaults?.ad_storage).toBe("denied");
});

test("rejecting persists and clears any analytics cookies", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    document.cookie = "_ga=test-value; path=/";
    document.cookie = "_ga_TEST=test-value; path=/";
  });

  await reject(page).click();

  await expect(banner(page)).toBeHidden();
  expect(
    await page.evaluate(() => localStorage.getItem("appkitx.consent")),
  ).toBe("denied");
  expect(await page.evaluate(() => document.cookie.includes("_ga"))).toBe(
    false,
  );

  await page.reload();
  await expect(banner(page)).toBeHidden();
});

test("footer cookie settings reopens the banner and receives focus", async ({
  page,
}) => {
  await page.goto("/");
  await reject(page).click();
  await expect(banner(page)).toBeHidden();

  await settings(page).click();

  await expect(banner(page)).toBeVisible();
  await expect(banner(page)).toBeFocused();
});

test("the Spanish banner is localized and fits at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/es/");

  await expect(
    page.getByRole("heading", { name: "Cookies y analítica" }),
  ).toBeVisible();
  const acceptEs = page.getByRole("button", { name: "Aceptar analítica" });
  const rejectEs = page.getByRole("button", { name: "Rechazar analítica" });
  await expect(acceptEs).toBeVisible();
  await expect(rejectEs).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  for (const button of [acceptEs, rejectEs]) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    if (box === null) throw new Error("consent button has no box");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.screenshot({
    path: "test-results/consent-320-es.png",
    fullPage: false,
  });
});
