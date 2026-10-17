import { expect, test } from "@playwright/test";

test("homepage renders the chrome, hero, and token styles", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Free tools for everyday work.",
  );

  const cta = page.getByRole("link", { name: "Browse tools" }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveCSS("background-color", "rgb(0, 102, 204)");
  await expect(cta).toHaveCSS("border-radius", "9999px");

  await expect(page.locator("body")).toHaveCSS("font-size", "17px");
  await expect(page.locator("body")).toHaveCSS("color", "rgb(29, 29, 31)");
  await expect(page.locator("footer")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 247)",
  );

  await page.screenshot({ path: "test-results/homepage.png", fullPage: true });
});

test("global nav collapses to a menu on tablet widths", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 900 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator("#global-menu").getByRole("link", { name: "Calculators" }),
  ).toBeVisible();
});
