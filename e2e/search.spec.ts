import { expect, test, type Page } from "@playwright/test";

const palette = (page: Page) => page.locator("[data-search-palette]");
const searchInput = (page: Page) => page.locator("[data-search-input]");
const heroInput = (page: Page) => page.getByPlaceholder("Search free tools…");

const openWithShortcut = async (page: Page) => {
  await page.keyboard.press("Control+k");
  await expect(palette(page)).toBeVisible();
};

test("homepage search has a visible label and opens the palette with the query", async ({
  page,
}) => {
  await page.goto("/");

  const label = page.locator('label[for="hero-search"]');
  await expect(label).toBeVisible();
  await expect(label).toHaveText("Search tools");

  await heroInput(page).fill("markdown");
  await heroInput(page).press("Enter");

  await expect(palette(page)).toBeVisible();
  await expect(searchInput(page)).toHaveValue("markdown");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Discount Calculator");
});

test("submitting an empty query does nothing", async ({ page }) => {
  await page.goto("/");

  await heroInput(page).fill("   ");
  await heroInput(page).press("Enter");

  await expect(palette(page)).not.toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test("opens from the navigation trigger with the input focused", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("banner")
    .getByRole("button", { name: "Search tools" })
    .click();

  await expect(palette(page)).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.activeElement ===
          document.querySelector("[data-search-input]"),
      ),
    )
    .toBe(true);

  await page.screenshot({
    path: "test-results/search-palette.png",
    fullPage: false,
  });
});

test("Ctrl+K opens and Escape closes, restoring focus to the opener", async ({
  page,
}) => {
  await page.goto("/");

  await heroInput(page).focus();
  await openWithShortcut(page);

  await page.keyboard.press("Escape");
  await expect(palette(page)).not.toBeVisible();
  await expect(heroInput(page)).toBeFocused();

  const trigger = page
    .getByRole("banner")
    .getByRole("button", { name: "Search tools" });
  await trigger.focus();
  await openWithShortcut(page);

  await page.keyboard.press("Escape");
  await expect(palette(page)).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("arrow keys wrap through results and Enter activates the selection", async ({
  page,
}) => {
  await page.goto("/");
  await openWithShortcut(page);

  await expect(page.getByRole("option")).toHaveCount(2);

  await page.keyboard.press("ArrowDown");
  await expect(searchInput(page)).toHaveAttribute(
    "aria-activedescendant",
    "search-option-0",
  );
  await expect(page.getByRole("option").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.keyboard.press("ArrowUp");
  await expect(searchInput(page)).toHaveAttribute(
    "aria-activedescendant",
    "search-option-1",
  );

  await page.keyboard.press("ArrowDown");
  await expect(searchInput(page)).toHaveAttribute(
    "aria-activedescendant",
    "search-option-0",
  );

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/percentage-calculator$/);
});

test("typing filters results and shows the empty state", async ({ page }) => {
  await page.goto("/");
  await openWithShortcut(page);

  await searchInput(page).fill("markdown");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Discount Calculator");

  await searchInput(page).fill("zzz");
  await expect(page.getByRole("option")).toHaveCount(0);
  const empty = page.locator("[data-search-empty]");
  await expect(empty).toBeVisible();
  await expect(page.locator("[data-search-empty-message]")).toHaveText(
    "No tools match “zzz”",
  );
  await expect(searchInput(page)).toHaveAttribute("aria-expanded", "false");

  await searchInput(page).fill("");
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(empty).toBeHidden();
  await expect(searchInput(page)).toHaveAttribute("aria-expanded", "true");
});

test("clicking a result navigates to its route", async ({ page }) => {
  await page.goto("/");
  await openWithShortcut(page);

  await page.getByRole("option", { name: /Percentage Calculator/ }).click();

  await expect(page).toHaveURL(/\/percentage-calculator$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Percentage Calculator",
  );
});

test("shows the design-system focus ring on the palette input", async ({
  page,
}) => {
  await page.goto("/");
  await openWithShortcut(page);

  await expect(searchInput(page)).toHaveCSS("outline-width", "2px");
  await expect(searchInput(page)).toHaveCSS("outline-style", "solid");
  await expect(searchInput(page)).toHaveCSS(
    "outline-color",
    "rgb(13, 148, 136)",
  );
  await expect(searchInput(page)).toHaveCSS("outline-offset", "2px");
});

test("keeps keyboard focus contained inside the open dialog", async ({
  page,
}) => {
  await page.goto("/");
  await openWithShortcut(page);

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const dialog = document.querySelector("[data-search-palette]");
      return dialog?.contains(document.activeElement) ?? false;
    });
    expect(inside).toBe(true);
  }
});

test("searches and navigates from a tool page", async ({ page }) => {
  await page.goto("/discount-calculator");

  await page
    .getByRole("banner")
    .getByRole("button", { name: "Search tools" })
    .click();
  await expect(palette(page)).toBeVisible();

  await searchInput(page).fill("percent");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/percentage-calculator$/);
});

test("only lists registered tools with unique routes", async ({ page }) => {
  await page.goto("/");
  await openWithShortcut(page);

  const hrefs = await page
    .getByRole("option")
    .evaluateAll((options) =>
      options.map((option) => option.getAttribute("href")),
    );

  expect([...hrefs].sort()).toEqual([
    "/discount-calculator",
    "/percentage-calculator",
  ]);
  expect(new Set(hrefs).size).toBe(hrefs.length);

  await expect(palette(page).getByText("Unit Converter")).toHaveCount(0);
  await expect(palette(page).getByText("Loan Calculator")).toHaveCount(0);
  await expect(palette(page).getByText("Base64 Encoder")).toHaveCount(0);
});

test("uses the full-screen sheet at 320px without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  await openWithShortcut(page);

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const box = await palette(page).boundingBox();
  if (!box) throw new Error("palette is not visible");
  expect(box.width).toBeGreaterThanOrEqual(319);
  await expect(searchInput(page)).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(2);
});

test("the Spanish palette searches localized tools and stays localized", async ({
  page,
}) => {
  await page.goto("/es/");
  await openWithShortcut(page);

  await expect(page.getByPlaceholder("Buscar herramientas…")).toBeVisible();
  await searchInput(page).fill("rebaja");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText(
    "Calculadora de descuentos",
  );
  await expect(page.getByRole("option")).toContainText("Calculadoras");

  await page.getByRole("option").click();
  await expect(page).toHaveURL(/\/es\/discount-calculator\/?$/);
});

test("the Spanish palette shows the localized empty state", async ({
  page,
}) => {
  await page.goto("/es/");
  await openWithShortcut(page);

  await searchInput(page).fill("zzz");
  await expect(page.getByRole("option")).toHaveCount(0);
  await expect(page.locator("[data-search-empty]")).toBeVisible();
  await expect(page.locator("[data-search-empty-message]")).toHaveText(
    "Ninguna herramienta coincide con «zzz»",
  );
});

test("Spanish placeholder cards never appear in search results", async ({
  page,
}) => {
  await page.goto("/es/");
  await openWithShortcut(page);

  for (const query of ["unidades", "préstamo", "codificador", "formateador"]) {
    await searchInput(page).fill(query);
    await expect(
      page.getByRole("option"),
      `${query} must not match`,
    ).toHaveCount(0);
  }

  await searchInput(page).fill("");
  await expect(page.getByRole("option")).toHaveCount(2);
});
