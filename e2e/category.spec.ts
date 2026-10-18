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

test("the English developer tools page lists both registered tools", async ({
  page,
}) => {
  const response = await page.goto("/developer-tools/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Developer tools",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Free developer tools",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Developer tools",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Open tool" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Base64 Encoder");
  await expect(cards.nth(0)).toHaveAttribute("href", "/base64-encoder");
  await expect(cards.nth(1)).toContainText("JSON Formatter");
  await expect(cards.nth(1)).toHaveAttribute("href", "/json-formatter");

  await page.screenshot({
    path: "test-results/category-developer-tools-en.png",
    fullPage: true,
  });
});

test("the Spanish developer tools page is fully localized", async ({
  page,
}) => {
  const response = await page.goto("/es/developer-tools/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Herramientas de desarrollo",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Herramientas de desarrollo gratis",
  );

  const breadcrumb = page.getByRole("navigation", {
    name: "Ruta de navegación",
  });
  await expect(
    breadcrumb.getByRole("link", { name: "Inicio" }),
  ).toHaveAttribute("href", "/es/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Herramientas de desarrollo",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Abrir herramienta" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Codificador Base64");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/base64-encoder");
  await expect(cards.nth(1)).toContainText("Formateador JSON");
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/json-formatter");

  await page.screenshot({
    path: "test-results/category-developer-tools-es.png",
    fullPage: true,
  });
});

test("the English date & time page lists both registered tools", async ({
  page,
}) => {
  const response = await page.goto("/date-time/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Date & time",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Free date & time tools",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Date & time",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Open tool" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Date Calculator");
  await expect(cards.nth(0)).toHaveAttribute("href", "/date-calculator");
  await expect(cards.nth(1)).toContainText("Age Calculator");
  await expect(cards.nth(1)).toHaveAttribute("href", "/age-calculator");

  await page.screenshot({
    path: "test-results/category-date-time-en.png",
    fullPage: true,
  });
});

test("the Spanish date & time page is fully localized", async ({ page }) => {
  const response = await page.goto("/es/date-time/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Fecha y hora",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(
    "Herramientas de fecha y hora gratis",
  );

  const breadcrumb = page.getByRole("navigation", {
    name: "Ruta de navegación",
  });
  await expect(
    breadcrumb.getByRole("link", { name: "Inicio" }),
  ).toHaveAttribute("href", "/es/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Fecha y hora",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Abrir herramienta" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Calculadora de fechas");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/date-calculator");
  await expect(cards.nth(1)).toContainText("Calculadora de edad");
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/age-calculator");

  await page.screenshot({
    path: "test-results/category-date-time-es.png",
    fullPage: true,
  });
});

test("unpublished categories return 404 without redirects", async ({
  request,
}) => {
  for (const path of [
    "/converters/",
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

test("the homepage chip and footer link the published categories", async ({
  page,
}) => {
  await page.goto("/");

  for (const [name, href] of [
    ["Calculators", "/calculators"],
    ["Developer tools", "/developer-tools"],
    ["Date & time", "/date-time"],
  ] as const) {
    await expect(
      page.getByRole("main").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }

  /* Unpublished categories keep their in-page anchor and placeholder href. */
  await expect(
    page.getByRole("main").getByRole("link", { name: "Converters" }),
  ).toHaveAttribute("href", "#tools");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Converters" }),
  ).toHaveAttribute("href", "#");

  await page.goto("/es/");
  for (const [name, href] of [
    ["Calculadoras", "/es/calculators"],
    ["Herramientas de desarrollo", "/es/developer-tools"],
    ["Fecha y hora", "/es/date-time"],
  ] as const) {
    await expect(
      page.getByRole("main").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }
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
      path: "/base64-encoder/",
      label: "See all",
      href: "/developer-tools",
    },
    {
      path: "/json-formatter/",
      label: "See all",
      href: "/developer-tools",
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
    {
      path: "/es/base64-encoder/",
      label: "Ver todas",
      href: "/es/developer-tools",
    },
    {
      path: "/es/json-formatter/",
      label: "Ver todas",
      href: "/es/developer-tools",
    },
    {
      path: "/date-calculator/",
      label: "See all",
      href: "/date-time",
    },
    {
      path: "/age-calculator/",
      label: "See all",
      href: "/date-time",
    },
    {
      path: "/es/date-calculator/",
      label: "Ver todas",
      href: "/es/date-time",
    },
    {
      path: "/es/age-calculator/",
      label: "Ver todas",
      href: "/es/date-time",
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

test("the language switcher preserves the developer tools page", async ({
  page,
}) => {
  await page.goto("/developer-tools/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/developer-tools\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the language switcher preserves the date & time page", async ({
  page,
}) => {
  await page.goto("/date-time/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/date-time\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("category pages keep layout at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of [
    "/calculators/",
    "/developer-tools/",
    "/date-time/",
    "/es/calculators/",
    "/es/developer-tools/",
    "/es/date-time/",
  ]) {
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
