import { expect, test, type Page } from "@playwright/test";

/*
 * Development-only synthetic pricing preview tests (M10.7).
 *
 * These assert the architecture boundary, not live retail data: synthetic
 * labelling, market/currency isolation, stale-offer exclusion and explicit
 * no-price behaviour. No real retailer or price is involved.
 */

async function openManual(page: Page): Promise<void> {
  await page
    .locator('label:has(input[name="builder-mode"][value="manual"])')
    .click();
  await expect(page.locator('[data-mode-panel="manual"]')).toBeVisible();
}

async function openPricing(page: Page) {
  const preview = page.locator("[data-pricing-preview]");
  await expect(preview).toBeVisible();
  await preview.locator("summary").click();
  await expect(preview.getByText("Synthetic fixtures only.")).toBeVisible();
  return preview;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/pc-builder");
});

test("pricing preview is synthetic, market-scoped and hidden in Guided mode @cross-browser", async ({
  page,
}) => {
  const preview = page.locator("[data-pricing-preview]");
  await expect(preview).toBeHidden();

  await openManual(page);
  const panel = await openPricing(page);
  await expect(panel).toContainText(
    "not real retailer offers and are never used by the recommendation engine",
  );

  const summary = panel.locator("[data-pricing-summary]");
  await expect(summary).toHaveAttribute("data-pricing-market-id", "us");
  await expect(summary).toHaveAttribute("data-pricing-currency", "USD");
  await expect(summary).toHaveAttribute("data-pricing-total-count", "4");
  await expect(summary).toHaveAttribute("data-pricing-eligible-count", "2");
  await expect(
    panel.locator('[data-pricing-offer-state="eligible"]'),
  ).toHaveCount(2);
  await expect(
    panel.locator('[data-pricing-offer-state="excluded"]'),
  ).toHaveCount(2);
  await expect(panel.locator("[data-pricing-cheapest]")).toContainText(
    "339.50",
  );

  const syntheticFlags = await panel
    .locator("[data-pricing-offer]")
    .evaluateAll((offers) =>
      offers.map((offer) => offer.getAttribute("data-pricing-synthetic")),
    );
  expect(syntheticFlags).toEqual(["true", "true", "true", "true"]);

  const sourceHosts = await panel
    .getByRole("link", { name: "Synthetic source link" })
    .evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).hostname),
    );
  expect(sourceHosts.length).toBeGreaterThan(0);
  for (const host of sourceHosts) expect(host.endsWith(".example")).toBe(true);

  await panel.getByLabel("Market").selectOption("in");
  await expect(summary).toHaveAttribute("data-pricing-market-id", "in");
  await expect(summary).toHaveAttribute("data-pricing-currency", "INR");
  await expect(summary).toHaveAttribute("data-pricing-total-count", "3");
  await expect(summary).toHaveAttribute("data-pricing-eligible-count", "2");
  await expect(panel.locator("[data-pricing-cheapest]")).toContainText(
    "28,999.00",
  );
  await expect(panel.locator('[data-pricing-currency="USD"]')).toHaveCount(0);
  await expect(
    panel.locator('[data-pricing-offer-state="eligible"]').first(),
  ).toHaveAttribute("data-pricing-currency", "INR");

  await page
    .locator('label:has(input[name="builder-mode"][value="guided"])')
    .click();
  await expect(preview).toBeHidden();
});

test("pricing preview reflows without horizontal overflow", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/pc-builder");
    await openManual(page);
    const panel = await openPricing(page);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
      `overflow at ${width}`,
    ).toBeLessThanOrEqual(1);
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(width);
    expect(box!.x).toBeGreaterThanOrEqual(0);
  }
});

test("stale and unavailable offers are not current, and no-price is explicit", async ({
  page,
}) => {
  await openManual(page);
  const panel = await openPricing(page);

  const stale = panel.locator('[data-pricing-freshness="expired"]').first();
  await expect(stale).toHaveAttribute("data-pricing-offer-state", "excluded");
  await expect(stale).toContainText("Last observed price");
  await expect(stale).toContainText("Last observed total");
  await expect(stale).toContainText("Not current: Price is expired");
  await expect(panel.locator("[data-pricing-cheapest]")).not.toContainText(
    "329.99",
  );

  const unavailable = panel
    .locator('[data-pricing-availability="out-of-stock"]')
    .first();
  await expect(unavailable).toHaveAttribute(
    "data-pricing-offer-state",
    "excluded",
  );
  await expect(unavailable).toContainText("Not current: Out of stock");

  // A catalogue CPU without synthetic fixtures gets an explicit no-price state.
  await page.getByRole("button", { name: "Select CPU", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Select Intel Core i5-14600K$/ })
    .click();
  await expect(panel.locator("[data-pricing-component]")).toContainText(
    "Intel Core i5-14600K",
  );
  await expect(panel.locator("[data-pricing-empty]")).toBeVisible();
  await expect(panel.locator("[data-pricing-offer]")).toHaveCount(0);
  await expect(panel.locator("[data-pricing-summary]")).toHaveAttribute(
    "data-pricing-total-count",
    "0",
  );
  await expect(panel.locator("[data-pricing-summary]")).toContainText(
    "No offer is fabricated",
  );
});
