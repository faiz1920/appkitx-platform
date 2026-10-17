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
  await expect(page.getByPlaceholder("Search free tools…")).toBeVisible();

  const openLabel = page.getByText("Open tool").first();
  await expect(openLabel).toHaveCSS("color", "rgb(15, 118, 110)");

  const card = page
    .locator("#tools")
    .getByRole("link")
    .filter({ hasText: "Percentage Calculator" });
  await expect(card).toHaveCSS("border-radius", "12px");
  await expect(card).toHaveAttribute("href", "/percentage-calculator");

  await expect(page.getByRole("navigation", { name: "Global" })).toHaveCSS(
    "height",
    "64px",
  );
  await expect(page.locator("body")).toHaveCSS("font-size", "16px");
  await expect(page.locator("body")).toHaveCSS("color", "rgb(15, 23, 42)");
  await expect(page.locator("footer")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );

  await page.screenshot({ path: "test-results/homepage.png", fullPage: true });
});

test("global nav collapses and icon buttons keep 44px targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");

  const banner = page.getByRole("banner");
  const toggle = banner.getByRole("button", { name: "Menu" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  for (const name of ["Search tools", "Menu"]) {
    const box = await banner.getByRole("button", { name }).boundingBox();
    if (!box) throw new Error(`${name} button is not visible`);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.screenshot({
    path: "test-results/homepage-mobile.png",
    fullPage: false,
  });

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator("#global-menu").getByRole("link", { name: "Tools" }),
  ).toBeVisible();
});

test("keyboard focus shows the focus ring on the skip link", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(skipLink).toHaveCSS("outline-width", "2px");
});

test("navigation buttons show the design-system focus ring", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");

  const banner = page.getByRole("banner");
  const search = banner.getByRole("button", { name: "Search tools" });
  const menu = banner.getByRole("button", { name: "Menu" });

  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // logo
  await page.keyboard.press("Tab"); // search trigger
  await expect(search).toBeFocused();
  await expect(search).toHaveCSS("outline-width", "2px");
  await expect(search).toHaveCSS("outline-style", "solid");
  await expect(search).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(search).toHaveCSS("outline-offset", "2px");

  await page.keyboard.press("Tab"); // menu toggle
  await expect(menu).toBeFocused();
  await expect(menu).toHaveCSS("outline-width", "2px");
  await expect(menu).toHaveCSS("outline-style", "solid");
  await expect(menu).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(menu).toHaveCSS("outline-offset", "2px");
});

test("navigation and footer links show pressed states", async ({ page }) => {
  await page.goto("/");

  const navLink = page.getByRole("banner").getByRole("link", { name: "Tools" });
  await navLink.hover();
  await expect(navLink).toHaveCSS("color", "rgb(15, 23, 42)");
  await page.mouse.down();
  await expect(navLink).toHaveCSS("color", "rgb(19, 78, 74)");
  await page.mouse.move(4, 4);
  await page.mouse.up();

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "About" });
  await footerLink.hover();
  await expect(footerLink).toHaveCSS("color", "rgb(15, 118, 110)");
  await page.mouse.down();
  await expect(footerLink).toHaveCSS("color", "rgb(19, 78, 74)");
  await page.mouse.move(4, 4);
  await page.mouse.up();
});
