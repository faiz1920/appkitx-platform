import { expect, test } from "@playwright/test";

/*
 * M5 category landing pages: registry-derived content, internal linking from
 * the homepage, footer, and tool pages, the provisioning gates for
 * unpublished categories, and locale behavior — all against the production
 * build served by `wrangler dev`.
 */

test("the English category page lists the registered calculators", async ({
  page,
}) => {
  const response = await page.goto("/calculators/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculators",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Free online calculators");

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
  await expect(cards).toHaveCount(10);
  await expect(cards.nth(0)).toContainText("Percentage Calculator");
  await expect(cards.nth(0)).toHaveAttribute("href", "/percentage-calculator/");
  await expect(cards.nth(1)).toContainText("Discount Calculator");
  await expect(cards.nth(1)).toHaveAttribute("href", "/discount-calculator/");
  await expect(cards.nth(2)).toContainText("Loan Calculator");
  await expect(cards.nth(2)).toHaveAttribute("href", "/loan-calculator/");
  await expect(cards.nth(3)).toContainText("EMI Calculator");
  await expect(cards.nth(3)).toHaveAttribute("href", "/emi-calculator/");
  await expect(cards.nth(4)).toContainText("Compound Interest Calculator");
  await expect(cards.nth(4)).toHaveAttribute(
    "href",
    "/compound-interest-calculator/",
  );
  await expect(cards.nth(5)).toContainText("Savings Goal Calculator");
  await expect(cards.nth(5)).toHaveAttribute(
    "href",
    "/savings-goal-calculator/",
  );
  await expect(cards.nth(6)).toContainText("Retirement Calculator");
  await expect(cards.nth(6)).toHaveAttribute("href", "/retirement-calculator/");
  await expect(cards.nth(7)).toContainText("Scientific Calculator");
  await expect(cards.nth(7)).toHaveAttribute("href", "/scientific-calculator/");
  await expect(cards.nth(8)).toContainText("BMI Calculator");
  await expect(cards.nth(8)).toHaveAttribute("href", "/bmi-calculator/");
  await expect(cards.nth(9)).toContainText("GPA Calculator");
  await expect(cards.nth(9)).toHaveAttribute("href", "/gpa-calculator/");

  /* The converters belong to another category. */
  await expect(page.getByRole("main").getByText("Unit Converter")).toHaveCount(
    0,
  );
  await expect(page.getByRole("main").getByText("Speed Converter")).toHaveCount(
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
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Calculadoras online gratis");

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
  await expect(cards).toHaveCount(10);
  await expect(cards.nth(0)).toContainText("Calculadora de porcentajes");
  await expect(cards.nth(0)).toHaveAttribute(
    "href",
    "/es/percentage-calculator/",
  );
  await expect(cards.nth(1)).toContainText("Calculadora de descuentos");
  await expect(cards.nth(1)).toHaveAttribute(
    "href",
    "/es/discount-calculator/",
  );
  await expect(cards.nth(2)).toContainText("Calculadora de préstamos");
  await expect(cards.nth(2)).toHaveAttribute("href", "/es/loan-calculator/");
  await expect(cards.nth(3)).toContainText("Calculadora de EMI");
  await expect(cards.nth(3)).toHaveAttribute("href", "/es/emi-calculator/");
  await expect(cards.nth(4)).toContainText("Calculadora de interés compuesto");
  await expect(cards.nth(4)).toHaveAttribute(
    "href",
    "/es/compound-interest-calculator/",
  );
  await expect(cards.nth(5)).toContainText("Calculadora de objetivo de ahorro");
  await expect(cards.nth(5)).toHaveAttribute(
    "href",
    "/es/savings-goal-calculator/",
  );
  await expect(cards.nth(6)).toContainText("Calculadora de jubilación");
  await expect(cards.nth(6)).toHaveAttribute(
    "href",
    "/es/retirement-calculator/",
  );
  await expect(cards.nth(7)).toContainText("Calculadora científica");
  await expect(cards.nth(7)).toHaveAttribute(
    "href",
    "/es/scientific-calculator/",
  );
  await expect(cards.nth(8)).toContainText("Calculadora de IMC");
  await expect(cards.nth(8)).toHaveAttribute("href", "/es/bmi-calculator/");
  await expect(cards.nth(9)).toContainText("Calculadora de GPA");
  await expect(cards.nth(9)).toHaveAttribute("href", "/es/gpa-calculator/");

  await page.screenshot({
    path: "test-results/category-calculators-es.png",
    fullPage: true,
  });
});

test("the English converters page lists the registered converters", async ({
  page,
}) => {
  const response = await page.goto("/converters/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Converters",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Free online converters");

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Converters",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Open tool" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Unit Converter");
  await expect(cards.nth(0)).toHaveAttribute("href", "/unit-converter/");
  await expect(cards.nth(1)).toContainText("Speed Converter");
  await expect(cards.nth(1)).toHaveAttribute("href", "/speed-converter/");

  await page.screenshot({
    path: "test-results/category-converters-en.png",
    fullPage: true,
  });
});

test("the Spanish converters page is fully localized", async ({ page }) => {
  const response = await page.goto("/es/converters/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Conversores",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Conversores online gratis");

  const breadcrumb = page.getByRole("navigation", {
    name: "Ruta de navegación",
  });
  await expect(
    breadcrumb.getByRole("link", { name: "Inicio" }),
  ).toHaveAttribute("href", "/es/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Conversores",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Abrir herramienta" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Conversor de unidades");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/unit-converter/");
  await expect(cards.nth(1)).toContainText("Conversor de velocidad");
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/speed-converter/");

  await page.screenshot({
    path: "test-results/category-converters-es.png",
    fullPage: true,
  });
});

test("the English developer tools page lists the registered tools", async ({
  page,
}) => {
  const response = await page.goto("/developer-tools/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Developer tools",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Free developer tools");

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
  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0)).toContainText("Base64 Encoder");
  await expect(cards.nth(0)).toHaveAttribute("href", "/base64-encoder/");
  await expect(cards.nth(1)).toContainText("JSON Formatter");
  await expect(cards.nth(1)).toHaveAttribute("href", "/json-formatter/");
  await expect(cards.nth(2)).toContainText("QR Code Generator");
  await expect(cards.nth(2)).toHaveAttribute("href", "/qr-code-generator/");
  await expect(cards.nth(3)).toContainText("UUID Generator");
  await expect(cards.nth(3)).toHaveAttribute("href", "/uuid-generator/");
  await expect(cards.nth(4)).toContainText("Hash Generator");
  await expect(cards.nth(4)).toHaveAttribute("href", "/hash-generator/");

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
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Herramientas de desarrollo gratis");

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
  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0)).toContainText("Codificador Base64");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/base64-encoder/");
  await expect(cards.nth(1)).toContainText("Formateador JSON");
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/json-formatter/");
  await expect(cards.nth(2)).toContainText("Generador de códigos QR");
  await expect(cards.nth(2)).toHaveAttribute("href", "/es/qr-code-generator/");
  await expect(cards.nth(3)).toContainText("Generador de UUID");
  await expect(cards.nth(3)).toHaveAttribute("href", "/es/uuid-generator/");
  await expect(cards.nth(4)).toContainText("Generador de hash");
  await expect(cards.nth(4)).toHaveAttribute("href", "/es/hash-generator/");

  await page.screenshot({
    path: "test-results/category-developer-tools-es.png",
    fullPage: true,
  });
});

test("the English date & time page lists the registered tools", async ({
  page,
}) => {
  const response = await page.goto("/date-time/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Date & time",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Free date & time tools");

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
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Date Calculator");
  await expect(cards.nth(0)).toHaveAttribute("href", "/date-calculator/");
  await expect(cards.nth(1)).toContainText("Time Zone Converter");
  await expect(cards.nth(1)).toHaveAttribute("href", "/time-zone-converter/");
  await expect(cards.nth(2)).toContainText("Age Calculator");
  await expect(cards.nth(2)).toHaveAttribute("href", "/age-calculator/");

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
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Herramientas de fecha y hora gratis");

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
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Calculadora de fechas");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/date-calculator/");
  await expect(cards.nth(1)).toContainText("Conversor de zonas horarias");
  await expect(cards.nth(1)).toHaveAttribute(
    "href",
    "/es/time-zone-converter/",
  );
  await expect(cards.nth(2)).toContainText("Calculadora de edad");
  await expect(cards.nth(2)).toHaveAttribute("href", "/es/age-calculator/");

  await page.screenshot({
    path: "test-results/category-date-time-es.png",
    fullPage: true,
  });
});

test("the English text tools page lists the registered tools", async ({
  page,
}) => {
  const response = await page.goto("/text-tools/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Text tools",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Free text tools");

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Text tools",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Open tool" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Word Counter");
  await expect(cards.nth(0)).toHaveAttribute("href", "/word-counter/");
  await expect(cards.nth(1)).toContainText("Case Converter");
  await expect(cards.nth(1)).toHaveAttribute("href", "/case-converter/");

  await page.screenshot({
    path: "test-results/category-text-tools-en.png",
    fullPage: true,
  });
});

test("the Spanish text tools page is fully localized", async ({ page }) => {
  const response = await page.goto("/es/text-tools/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Herramientas de texto",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { level: 2 }),
  ).toHaveText("Herramientas de texto gratis");

  const breadcrumb = page.getByRole("navigation", {
    name: "Ruta de navegación",
  });
  await expect(
    breadcrumb.getByRole("link", { name: "Inicio" }),
  ).toHaveAttribute("href", "/es/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Herramientas de texto",
  );

  const cards = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Abrir herramienta" });
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Contador de palabras");
  await expect(cards.nth(0)).toHaveAttribute("href", "/es/word-counter/");
  await expect(cards.nth(1)).toContainText(
    "Conversor de mayúsculas y minúsculas",
  );
  await expect(cards.nth(1)).toHaveAttribute("href", "/es/case-converter/");

  await page.screenshot({
    path: "test-results/category-text-tools-es.png",
    fullPage: true,
  });
});

test("unregistered category paths return 404 without redirects", async ({
  request,
}) => {
  for (const path of ["/categories/"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), `${path} must 404`).toBe(404);
    expect(
      response.headers()["location"],
      `${path} must not redirect`,
    ).toBeUndefined();
  }
});

test("an unregistered category path renders the noindex 404 page", async ({
  page,
}) => {
  const response = await page.goto("/categories/");
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("category intros avoid hardcoded tool counts", async ({ page }) => {
  for (const path of [
    "/calculators/",
    "/converters/",
    "/developer-tools/",
    "/date-time/",
    "/text-tools/",
    "/es/calculators/",
    "/es/converters/",
    "/es/developer-tools/",
    "/es/date-time/",
    "/es/text-tools/",
  ]) {
    await page.goto(path);

    const intro = page.locator("main section").first().locator("p");
    const firstParagraph = (await intro.first().innerText()).trim();
    const fullIntro = (await intro.allInnerTexts()).join(" ");

    expect(firstParagraph, `${path} intro start`).not.toMatch(
      /^(?:\d+|two|three|four|dos|tres|cuatro)\b/i,
    );
    expect(fullIntro, `${path} fixed-count pronouns`).not.toMatch(
      /\b(?:both|ambas)\b/i,
    );
  }
});

test("the homepage chip and footer link the published categories", async ({
  page,
}) => {
  await page.goto("/");

  for (const [name, href] of [
    ["Calculators", "/calculators/"],
    ["Converters", "/converters/"],
    ["Developer tools", "/developer-tools/"],
    ["Date & time", "/date-time/"],
    ["Text tools", "/text-tools/"],
  ] as const) {
    await expect(
      page.getByRole("main").getByRole("link", { name, exact: true }),
    ).toHaveAttribute("href", href);
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }

  await page.goto("/es/");
  for (const [name, href] of [
    ["Calculadoras", "/es/calculators/"],
    ["Conversores", "/es/converters/"],
    ["Herramientas de desarrollo", "/es/developer-tools/"],
    ["Fecha y hora", "/es/date-time/"],
    ["Herramientas de texto", "/es/text-tools/"],
  ] as const) {
    await expect(
      page.getByRole("main").getByRole("link", { name, exact: true }),
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
      href: "/calculators/",
    },
    {
      path: "/discount-calculator/",
      label: "See all",
      href: "/calculators/",
    },
    {
      path: "/loan-calculator/",
      label: "See all",
      href: "/calculators/",
    },
    {
      path: "/bmi-calculator/",
      label: "See all",
      href: "/calculators/",
    },
    {
      path: "/gpa-calculator/",
      label: "See all",
      href: "/calculators/",
    },
    {
      path: "/unit-converter/",
      label: "See all",
      href: "/converters/",
    },
    {
      path: "/speed-converter/",
      label: "See all",
      href: "/converters/",
    },
    {
      path: "/base64-encoder/",
      label: "See all",
      href: "/developer-tools/",
    },
    {
      path: "/json-formatter/",
      label: "See all",
      href: "/developer-tools/",
    },
    {
      path: "/qr-code-generator/",
      label: "See all",
      href: "/developer-tools/",
    },
    {
      path: "/uuid-generator/",
      label: "See all",
      href: "/developer-tools/",
    },
    {
      path: "/hash-generator/",
      label: "See all",
      href: "/developer-tools/",
    },
    {
      path: "/word-counter/",
      label: "See all",
      href: "/text-tools/",
    },
    {
      path: "/case-converter/",
      label: "See all",
      href: "/text-tools/",
    },
    {
      path: "/es/percentage-calculator/",
      label: "Ver todas",
      href: "/es/calculators/",
    },
    {
      path: "/es/discount-calculator/",
      label: "Ver todas",
      href: "/es/calculators/",
    },
    {
      path: "/es/loan-calculator/",
      label: "Ver todas",
      href: "/es/calculators/",
    },
    {
      path: "/es/bmi-calculator/",
      label: "Ver todas",
      href: "/es/calculators/",
    },
    {
      path: "/es/gpa-calculator/",
      label: "Ver todas",
      href: "/es/calculators/",
    },
    {
      path: "/es/unit-converter/",
      label: "Ver todas",
      href: "/es/converters/",
    },
    {
      path: "/es/speed-converter/",
      label: "Ver todas",
      href: "/es/converters/",
    },
    {
      path: "/es/base64-encoder/",
      label: "Ver todas",
      href: "/es/developer-tools/",
    },
    {
      path: "/es/json-formatter/",
      label: "Ver todas",
      href: "/es/developer-tools/",
    },
    {
      path: "/es/qr-code-generator/",
      label: "Ver todas",
      href: "/es/developer-tools/",
    },
    {
      path: "/es/uuid-generator/",
      label: "Ver todas",
      href: "/es/developer-tools/",
    },
    {
      path: "/es/hash-generator/",
      label: "Ver todas",
      href: "/es/developer-tools/",
    },
    {
      path: "/es/word-counter/",
      label: "Ver todas",
      href: "/es/text-tools/",
    },
    {
      path: "/es/case-converter/",
      label: "Ver todas",
      href: "/es/text-tools/",
    },
    {
      path: "/date-calculator/",
      label: "See all",
      href: "/date-time/",
    },
    {
      path: "/age-calculator/",
      label: "See all",
      href: "/date-time/",
    },
    {
      path: "/es/date-calculator/",
      label: "Ver todas",
      href: "/es/date-time/",
    },
    {
      path: "/es/age-calculator/",
      label: "Ver todas",
      href: "/es/date-time/",
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

test("the text tools link to each other as related tools", async ({ page }) => {
  await page.goto("/word-counter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Case Converter/ }),
  ).toHaveAttribute("href", "/case-converter/");

  await page.goto("/case-converter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Word Counter/ }),
  ).toHaveAttribute("href", "/word-counter/");

  await page.goto("/es/word-counter/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: /Conversor de mayúsculas y minúsculas/ }),
  ).toHaveAttribute("href", "/es/case-converter/");

  await page.goto("/es/case-converter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Contador de palabras/ }),
  ).toHaveAttribute("href", "/es/word-counter/");
});

test("the converters link to each other as related tools", async ({ page }) => {
  await page.goto("/unit-converter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Speed Converter/ }),
  ).toHaveAttribute("href", "/speed-converter/");

  await page.goto("/speed-converter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Unit Converter/ }),
  ).toHaveAttribute("href", "/unit-converter/");

  await page.goto("/es/unit-converter/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: /Conversor de velocidad/ }),
  ).toHaveAttribute("href", "/es/speed-converter/");

  await page.goto("/es/speed-converter/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Conversor de unidades/ }),
  ).toHaveAttribute("href", "/es/unit-converter/");
});

test("the language switcher preserves the category page", async ({ page }) => {
  await page.goto("/calculators/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/calculators\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  /* The stored explicit choice carries to later visits in both directions. */
  await page.goto("/calculators/");
  await expect(page).toHaveURL(/\/es\/calculators\/$/);
});

test("the language switcher preserves the developer tools page", async ({
  page,
}) => {
  await page.goto("/developer-tools/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/developer-tools\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the language switcher preserves the text tools page", async ({
  page,
}) => {
  await page.goto("/text-tools/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/text-tools\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("the language switcher preserves the date & time page", async ({
  page,
}) => {
  await page.goto("/date-time/");

  const switcher = page.locator("[data-language-switcher]:visible");
  await switcher.locator("summary").click();
  await switcher.locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/date-time\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("category pages keep layout at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of [
    "/calculators/",
    "/converters/",
    "/developer-tools/",
    "/date-time/",
    "/text-tools/",
    "/es/calculators/",
    "/es/converters/",
    "/es/developer-tools/",
    "/es/date-time/",
    "/es/text-tools/",
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
