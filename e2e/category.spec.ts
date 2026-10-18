import { expect, test } from "@playwright/test";

/*
 * M5 category landing pages: registry-derived content, internal linking from
 * the homepage, footer, and tool pages, the provisioning gates for
 * unpublished categories, and locale behavior — all against the production
 * build served by `astro preview`.
 */

test("the English category page lists both registered calculators", async ({
  page,
}) => {
  const response = await page.goto("/calculators/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculators",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Free online calculators",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Calculators",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Open tool" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Percentage Calculator");
  await expect(cards.nth(0)).toHaveAttribute("href", "/percentage-calculator");
  await expect(cards.nth(1)).toContainText("Discount Calculator");
  await expect(cards.nth(1)).toHaveAttribute("href", "/discount-calculator");

  /* Placeholder cards must never appear on a category page. */
  await expect(page.getByRole("main").getByText("Unit Converter")).toHaveCount(
    0,
  );
  await expect(page.getByRole("main").getByText("Loan Calculator")).toHaveCount(
    0,
  );

  await page.screenshot({
    path: "test-results/category-calculators-en.png",
    fullPage: true,
  });
});

test("the Spanish category page is fully localized", async ({ page }) => {
  const response = await page.goto("/es/calculators/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadoras",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Calculadoras online gratis",
  );

  const breadcrumb = page.getByRole("navigation", {
    name: "Ruta de navegación",
  });
  await expect(
    breadcrumb.getByRole("link", { name: "Inicio" }),
  ).toHaveAttribute("href", "/es/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Calculadoras",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Abrir herramienta" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Calculadora de porcentajes");
  await expect(cards.nth(0)).toHaveAttribute(
    "href",
    "/es/percentage-calculator",
  );
  await expect(cards.nth(1)).toContainText("Calculadora de descuentos");
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/discount-calculator");

  await page.screenshot({
    path: "test-results/category-calculators-es.png",
    fullPage: true,
  });
});

test("unpublished categories return 404 without redirects", async ({
  request,
}) => {
  for (const path of [
    "/converters/",
    "/developer-tools/",
    "/date-time/",
    "/text-tools/",
    "/es/converters/",
    "/categories/",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), `${path} must 404`).toBe(404);
    expect(
      response.headers()["location"],
      `${path} must not redirect`,
    ).toBeUndefined();
  }
});

test("an unpublished category path renders the noindex 404 page", async ({
  page,
}) => {
  const response = await page.goto("/converters/");
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("the homepage chip and footer link the published category", async ({
  page,
}) => {
  await page.goto("/");

  const chip = page
    .getByRole("main")
    .getByRole("link", { name: "Calculators" });
  await expect(chip).toHaveAttribute("href", "/calculators");

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Calculators" });
  await expect(footerLink).toHaveAttribute("href", "/calculators");

  /* Unpublished categories keep their in-page anchor and placeholder href. */
  await expect(
    page.getByRole("main").getByRole("link", { name: "Converters" }),
  ).toHaveAttribute("href", "#tools");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Converters" }),
  ).toHaveAttribute("href", "#");

  await page.goto("/es/");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Calculadoras" }),
  ).toHaveAttribute("href", "/es/calculators");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Calculadoras" }),
  ).toHaveAttribute("href", "/es/calculators");
});

test("tool pages link to their published category", async ({ page }) => {
  for (const item of [
    {
      path: "/percentage-calculator/",
      label: "See all",
      href: "/calculators",
    },
    {
      path: "/discount-calculator/",
      label: "See all",
      href: "/calculators",
    },
    {
      path: "/es/percentage-calculator/",
      label: "Ver todas",
      href: "/es/calculators",
    },
    {
      path: "/es/discount-calculator/",
      label: "Ver todas",
      href: "/es/calculators",
    },
  ]) {
    await page.goto(item.path);
    const link = page.getByRole("main").getByRole("link", { name: item.label });
    await expect(link, `${item.path} must link its category`).toHaveAttribute(
      "href",
      item.href,
    );
  }
});

test("the language switcher preserves the category page", async ({ page }) => {
  await page.goto("/calculators/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/calculators\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  /* The stored explicit choice carries to later visits in both directions. */
  await page.goto("/calculators/");
  await expect(page).toHaveURL(/\/es\/calculators\/?$/);
});

test("category pages keep layout at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ["/calculators/", "/es/calculators/"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }

  await page.goto("/es/calculators/");
  await page.screenshot({
    path: "test-results/category-calculators-320.png",
    fullPage: true,
  });
});
