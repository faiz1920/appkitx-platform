import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const amount = (page: Page) => page.getByLabel("Loan amount", { exact: true });
const rate = (page: Page) =>
  page.getByLabel("Annual interest rate (%)", { exact: true });
const tenure = (page: Page) => page.getByLabel("Loan tenure", { exact: true });
const tenureUnit = (page: Page) => page.getByLabel("Tenure unit");
const emi = (page: Page) => page.locator("[data-emi]");
const principal = (page: Page) => page.locator("[data-principal]");
const interest = (page: Page) => page.locator("[data-interest]");
const total = (page: Page) => page.locator("[data-total]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");
const schedule = (page: Page) => page.locator("[data-schedule]");
const scheduleEmpty = (page: Page) => page.locator("[data-schedule-empty]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy summary" });

const calculate = async (
  page: Page,
  values: { amount: string; rate: string; tenure: string; unit?: string },
) => {
  await amount(page).fill(values.amount);
  await rate(page).fill(values.rate);
  await tenure(page).fill(values.tenure);
  if (values.unit) await tenureUnit(page).selectOption(values.unit);
  await page.getByRole("button", { name: "Calculate" }).click();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, defaults, and empty state", async ({
  page,
}) => {
  await page.goto("/emi-calculator");

  await expect(page).toHaveTitle("EMI Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "EMI Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "EMI Calculator",
  );

  await expect(tenureUnit(page)).toHaveValue("years");
  await expect(emi(page)).toHaveText("—");
  await expect(principal(page)).toHaveText("—");
  await expect(interest(page)).toHaveText("—");
  await expect(total(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
  await expect(scheduleEmpty(page)).toBeVisible();
  await expect(schedule(page)).toBeHidden();
  await expect(formula(page)).toHaveText("EMI = P × r ÷ (1 − (1 + r)⁻ⁿ)");
});

test("computes the EMI summary and principal/interest split", async ({
  page,
}) => {
  await page.goto("/emi-calculator");
  await calculate(page, { amount: "100000", rate: "6", tenure: "30" });

  await expect(emi(page)).toHaveText("599.55");
  await expect(principal(page)).toHaveText("100,000.00");
  await expect(interest(page)).toHaveText("115,838.19");
  await expect(total(page)).toHaveText("215,838.19");
  await expect(caption(page)).toHaveText("100,000.00 at 6% over 360 months.");
  await expect(formula(page)).toHaveText("6% ÷ 12 = 0.5% per month");
  await expect(page.locator("[data-principal-share]")).toContainText(
    "100,000.00",
  );
  await expect(page.locator("[data-principal-share]")).toContainText("%");
  await expect(page.locator("[data-interest-share]")).toContainText(
    "115,838.19",
  );
  await expect(copy(page)).toBeEnabled();
  await expect(scheduleEmpty(page)).toBeHidden();
  await expect(schedule(page)).toBeVisible();

  await page.screenshot({
    path: "test-results/emi-calculator-en.png",
    fullPage: true,
  });
});

test("groups the schedule by year and expands monthly installments", async ({
  page,
}) => {
  await page.goto("/emi-calculator");
  await calculate(page, { amount: "100000", rate: "6", tenure: "30" });

  const years = schedule(page).locator("details");
  await expect(years).toHaveCount(30);
  await expect(years.nth(0)).toHaveAttribute("open");
  await expect(years.nth(0).locator("summary")).toContainText("Year 1");
  await expect(years.nth(0).locator("summary")).toContainText(
    "Opening balance",
  );

  const firstRow = years.nth(0).locator('[data-payment="1"]');
  await expect(firstRow).toContainText("100,000.00");
  await expect(firstRow).toContainText("599.55");
  await expect(firstRow).toContainText("500.00");
  await expect(firstRow).toContainText("99.55");
  await expect(firstRow).toContainText("99,900.45");

  await expect(years.nth(29).locator("summary")).toContainText("Year 30");
  await years.nth(29).locator("summary").click();
  await expect(years.nth(29)).toHaveAttribute("open");

  const finalRow = years.nth(29).locator('[data-payment="360"]');
  await expect(finalRow).toContainText("0.00");
  await expect(finalRow.locator("td").last()).toHaveText("0.00");

  const table = years.nth(0).locator("table");
  await expect(table.locator("caption")).toHaveText(
    "Monthly installments for year 1",
  );
  await expect(table.locator("th[scope='col']")).toHaveCount(6);
  await expect(table.locator("tbody th[scope='row']").first()).toHaveText("1");
});

test("handles zero-interest loans", async ({ page }) => {
  await page.goto("/emi-calculator");
  await calculate(page, {
    amount: "12000",
    rate: "0",
    tenure: "12",
    unit: "months",
  });

  await expect(emi(page)).toHaveText("1,000.00");
  await expect(principal(page)).toHaveText("12,000.00");
  await expect(interest(page)).toHaveText("0.00");
  await expect(total(page)).toHaveText("12,000.00");
  await expect(schedule(page).locator("details")).toHaveCount(1);
  await expect(
    schedule(page).locator('[data-payment="12"] td').last(),
  ).toHaveText("0.00");
});

test("validates inputs, fractional months, overflow, and recovery", async ({
  page,
}) => {
  await page.goto("/emi-calculator");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-amount]")).toBeVisible();
  await expect(page.locator("[data-error-text-amount]")).toHaveText(
    "Enter a valid number.",
  );
  await expect(page.locator("[data-error-rate]")).toBeVisible();
  await expect(page.locator("[data-error-tenure]")).toBeVisible();

  await calculate(page, { amount: "12000", rate: "1.1", tenure: "1.1" });
  await expect(page.locator("[data-error-tenure]")).toBeVisible();
  await expect(page.locator("[data-error-text-tenure]")).toHaveText(
    "The tenure must resolve to a whole number of months.",
  );
  await expect(schedule(page)).toBeHidden();

  await amount(page).fill("0");
  await rate(page).fill("-1");
  await tenure(page).fill("0");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-amount]")).toHaveText(
    "Enter a loan amount greater than zero.",
  );
  await expect(page.locator("[data-error-text-rate]")).toHaveText(
    "Enter an interest rate of 0 or more.",
  );
  await expect(page.locator("[data-error-text-tenure]")).toHaveText(
    "Enter a tenure between 1 and 1,200 whole months.",
  );

  await calculate(page, {
    amount: "1e308",
    rate: "6",
    tenure: "30",
  });
  await expect(page.locator("[data-error-general]")).toBeVisible();
  await expect(page.locator("[data-error-text-general]")).toHaveText(
    "The result is outside the supported numeric range. Try smaller values.",
  );
  await expect(schedule(page)).toBeHidden();

  await amount(page).fill("10000");
  await expect(page.locator("[data-error-general]")).toBeHidden();
  await rate(page).fill("7");
  await tenure(page).fill("5");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(emi(page)).not.toHaveText("—");
  await expect(page.locator("[data-error-general]")).toBeHidden();
});

test("copies the summary with accessible feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/emi-calculator");
  await calculate(page, { amount: "100000", rate: "6", tenure: "30" });

  await expect(copy(page)).toBeEnabled();
  await copy(page).click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "Loan amount: 100,000.00\nMonthly EMI: 599.55\nPrincipal: 100,000.00\nTotal interest: 115,838.19\nTotal repayment: 215,838.19\nTenure: 360 months",
  );
});

test("is keyboard operable and exposes focus rings", async ({
  page,
  browserName,
}) => {
  await page.goto("/emi-calculator");

  await tabTo(page, browserName, amount(page));
  await ring(amount(page));
  await page.keyboard.type("100000");
  await tabTo(page, browserName, rate(page));
  await page.keyboard.type("6");
  await tabTo(page, browserName, tenure(page));
  await page.keyboard.type("30");
  await page.keyboard.press("Enter");

  await expect(emi(page)).toHaveText("599.55");
  await expect(schedule(page)).toBeVisible();
});

test("links to the loan and calculator category", async ({ page }) => {
  await page.goto("/emi-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /Loan Calculator/ }),
  ).toHaveAttribute("href", "/loan-calculator/");
  await expect(
    related.getByRole("link", { name: /Percentage Calculator/ }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(
    related.getByRole("link", { name: /Compound Interest Calculator/ }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );
});

test("exposes canonical, breadcrumb, and WebApplication structured data", async ({
  page,
}) => {
  await page.goto("/emi-calculator");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/emi-calculator/",
  );
  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );

  expect(documents).toHaveLength(2);
  expect(
    documents.find((document) => document["@type"] === "BreadcrumbList"),
  ).toMatchObject({
    itemListElement: [
      { name: "Home", item: "https://appkitx.com/" },
      { name: "EMI Calculator" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "EMI Calculator",
    url: "https://appkitx.com/emi-calculator/",
    inLanguage: "en",
  });

  expect(
    await schedule(page).evaluate(
      (element) => element.closest("[aria-live]") !== null,
    ),
    "the schedule must not be wrapped in a live region",
  ).toBe(false);
});

test("the Spanish page is localized and computes", async ({ page }) => {
  await page.goto("/es/emi-calculator");

  await expect(page).toHaveTitle("Calculadora de EMI — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de EMI",
  );
  await expect(page.getByLabel("Importe del préstamo")).toBeVisible();
  await expect(page.getByLabel("Unidad del plazo")).toHaveValue("years");

  await page.getByLabel("Importe del préstamo").fill("60000");
  await page.getByLabel("Tipo de interés anual (%)").fill("7.5");
  await page.getByLabel("Plazo del préstamo", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(emi(page)).toHaveText("1202,28");
  await expect(interest(page)).toHaveText("12.136,61");
  await expect(total(page)).toHaveText("72.136,61");
  await expect(
    page.getByRole("heading", { name: "Calendario de amortización" }),
  ).toBeVisible();
  await expect(schedule(page).locator("summary").first()).toContainText(
    "Año 1",
  );
  await expect(
    page.getByRole("button", { name: "Copiar resumen" }),
  ).toBeEnabled();

  await page.getByLabel("Plazo del préstamo", { exact: true }).fill("1.1");
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.locator("[data-error-text-tenure]")).toHaveText(
    "El plazo debe resolverse en un número entero de meses.",
  );

  await page.screenshot({
    path: "test-results/emi-calculator-es.png",
    fullPage: true,
  });
});

test("keeps the summary and schedule usable at 320px in both locales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, amountLabel, rateLabel, tenureLabel, calculateLabel] of [
    [
      "/emi-calculator/",
      "Loan amount",
      "Annual interest rate (%)",
      "Loan tenure",
      "Calculate",
    ],
    [
      "/es/emi-calculator/",
      "Importe del préstamo",
      "Tipo de interés anual (%)",
      "Plazo del préstamo",
      "Calcular",
    ],
  ] as const) {
    await page.goto(path);
    await page.getByLabel(amountLabel, { exact: true }).fill("100000");
    await page.getByLabel(rateLabel, { exact: true }).fill("6");
    await page.getByLabel(tenureLabel, { exact: true }).fill("30");
    await page.getByRole("button", { name: calculateLabel }).click();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    await expect(schedule(page).locator("details").first()).toBeVisible();
    const scroll = schedule(page).locator("[role='region']").first();
    await expect(scroll).toHaveAttribute("aria-label", /year 1|año 1/i);
    const box = await page
      .getByRole("button", { name: calculateLabel })
      .boundingBox();
    expect(box).not.toBeNull();
    if (box === null) throw new Error("Calculate has no box");
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
  }
});
