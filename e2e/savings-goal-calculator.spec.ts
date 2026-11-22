import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const target = (page: Page) => page.getByLabel("Savings goal", { exact: true });
const current = (page: Page) =>
  page.getByLabel("Current savings", { exact: true });
const rate = (page: Page) =>
  page.getByLabel("Annual interest rate (%)", { exact: true });
const duration = (page: Page) =>
  page.getByLabel("Target duration", { exact: true });
const durationUnit = (page: Page) => page.getByLabel("Duration unit");
const frequency = (page: Page) => page.getByLabel("Compounding frequency");
const timing = (page: Page) =>
  page.getByRole("switch", {
    name: "Contribute at the start of each month",
  });
const required = (page: Page) => page.locator("[data-required-monthly]");
const targetValue = (page: Page) => page.locator("[data-target]");
const currentValue = (page: Page) => page.locator("[data-current]");
const contributions = (page: Page) => page.locator("[data-contributions]");
const interest = (page: Page) => page.locator("[data-interest]");
const finalValue = (page: Page) => page.locator("[data-final]");
const remaining = (page: Page) => page.locator("[data-remaining]");
const progress = (page: Page) => page.locator("[data-progress]");
const success = (page: Page) => page.locator("[data-success-message]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");
const growth = (page: Page) => page.locator("[data-growth]");
const growthEmpty = (page: Page) => page.locator("[data-growth-empty]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy summary" });

const calculate = async (
  page: Page,
  values: {
    target: string;
    current: string;
    rate: string;
    duration: string;
    unit?: string;
    frequency?: string;
  },
) => {
  await target(page).fill(values.target);
  await current(page).fill(values.current);
  await rate(page).fill(values.rate);
  await duration(page).fill(values.duration);
  if (values.unit) await durationUnit(page).selectOption(values.unit);
  if (values.frequency) await frequency(page).selectOption(values.frequency);
  await page.getByRole("button", { name: "Calculate" }).click();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

const money = (value: string) => Number(value.replace(/,/g, ""));

test("loads with the correct title, defaults, and empty state", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");

  await expect(page).toHaveTitle("Savings Goal Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Savings Goal Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Savings Goal Calculator",
  );

  await expect(durationUnit(page)).toHaveValue("years");
  await expect(frequency(page)).toHaveValue("monthly");
  await expect(timing(page)).not.toBeChecked();
  await expect(required(page)).toHaveText("—");
  await expect(targetValue(page)).toHaveText("—");
  await expect(currentValue(page)).toHaveText("—");
  await expect(contributions(page)).toHaveText("—");
  await expect(interest(page)).toHaveText("—");
  await expect(finalValue(page)).toHaveText("—");
  await expect(remaining(page)).toHaveText("—");
  await expect(progress(page)).toHaveText("—");
  await expect(success(page)).toBeHidden();
  await expect(copy(page)).toBeDisabled();
  await expect(growthEmpty(page)).toBeVisible();
  await expect(growth(page)).toBeHidden();
  await expect(formula(page)).toHaveText("C = (FV − P × g^N) × i ÷ (g^N − 1)");
});

test("computes a zero-interest savings plan and annual table", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "70000",
    current: "10000",
    rate: "0",
    duration: "5",
  });

  await expect(required(page)).toHaveText("1,000.00");
  await expect(targetValue(page)).toHaveText("70,000.00");
  await expect(currentValue(page)).toHaveText("10,000.00");
  await expect(contributions(page)).toHaveText("60,000.00");
  await expect(interest(page)).toHaveText("0.00");
  await expect(finalValue(page)).toHaveText("70,000.00");
  await expect(remaining(page)).toHaveText("60,000.00");
  await expect(progress(page)).toHaveText("14.3%");
  await expect(success(page)).toBeHidden();
  await expect(caption(page)).toHaveText("70,000.00 goal over 60 months.");
  await expect(formula(page)).toHaveText(
    "0% nominal = 0% per month after compounding.",
  );
  await expect(copy(page)).toBeEnabled();
  await expect(growthEmpty(page)).toBeHidden();
  await expect(growth(page)).toBeVisible();

  const rows = growth(page).locator("tbody tr[data-year]");
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toHaveAttribute("data-months", "12");
  await expect(rows.first()).toContainText("Year 1");
  await expect(rows.first()).toContainText("10,000.00");
  await expect(rows.first()).toContainText("12,000.00");
  await expect(rows.last()).toContainText("Year 5");
  await expect(rows.last()).toContainText("70,000.00");
  await expect(rows.last()).toContainText("100%");

  const table = growth(page).locator("table");
  await expect(table.locator("caption")).toHaveText("Annual savings plan");
  await expect(table.locator("th[scope='col']")).toHaveCount(6);
  await expect(table.locator("tbody th[scope='row']").first()).toHaveText(
    "Year 1",
  );

  await page.screenshot({
    path: "test-results/savings-goal-calculator-en.png",
    fullPage: true,
  });
});

test("computes a positive-interest plan and reconciles the final balance", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "100000",
    current: "10000",
    rate: "8",
    duration: "5",
    frequency: "monthly",
  });

  await expect(required(page)).toHaveText("1,158.21");
  await expect(targetValue(page)).toHaveText("100,000.00");
  await expect(currentValue(page)).toHaveText("10,000.00");
  await expect(contributions(page)).toHaveText("69,492.60");
  await expect(interest(page)).toHaveText("20,507.49");
  await expect(finalValue(page)).toHaveText("100,000.09");
  await expect(remaining(page)).toHaveText("90,000.00");
  await expect(progress(page)).toHaveText("10%");
  await expect(success(page)).toBeHidden();
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(5);
  await expect(
    growth(page).locator("tbody tr[data-year='5'] td").last(),
  ).toHaveText("100%");
  await expect(
    growth(page).locator("tbody tr[data-year='5'] td").nth(3),
  ).toHaveText("100,000.09");
});

test("beginning-of-month savings require a lower contribution", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "100000",
    current: "10000",
    rate: "8",
    duration: "5",
    frequency: "monthly",
  });
  await expect(required(page)).toHaveText("1,158.21");

  await timing(page).focus();
  await page.keyboard.press("Space");
  await expect(timing(page)).toBeChecked();
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(required(page)).toHaveText("1,150.54");
  await expect(finalValue(page)).toHaveText("100,000.11");
  await expect(required(page)).not.toHaveText("1,158.21");
  await expect(success(page)).toBeHidden();
});

test("supports all compounding frequencies", async ({ page }) => {
  await page.goto("/savings-goal-calculator");

  const requiredValues: number[] = [];
  for (const option of [
    "annual",
    "semiannual",
    "quarterly",
    "monthly",
    "daily",
  ] as const) {
    await calculate(page, {
      target: "100000",
      current: "10000",
      rate: "8",
      duration: "5",
      frequency: option,
    });
    const value = money((await required(page).textContent()) ?? "");
    requiredValues.push(value);
    expect(
      money((await finalValue(page).textContent()) ?? ""),
    ).toBeGreaterThanOrEqual(100000);
  }

  for (let index = 1; index < requiredValues.length; index += 1) {
    expect(requiredValues[index]).toBeLessThan(requiredValues[index - 1] ?? 0);
  }
});

test("shows goal-achieved and interest-only success states", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "50000",
    current: "60000",
    rate: "5",
    duration: "5",
  });

  await expect(required(page)).toHaveText("0.00");
  await expect(progress(page)).toHaveText("100%");
  await expect(remaining(page)).toHaveText("0.00");
  await expect(success(page)).toBeVisible();
  await expect(success(page)).toContainText(
    "Your current savings already meet this goal.",
  );
  await expect(finalValue(page)).toHaveText("77,001.52");
  await expect(interest(page)).toHaveText("17,001.52");
  await expect(contributions(page)).toHaveText("0.00");

  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "15000",
    current: "10000",
    rate: "10",
    duration: "5",
  });

  await expect(required(page)).toHaveText("0.00");
  await expect(progress(page)).toHaveText("66.7%");
  await expect(remaining(page)).toHaveText("0.00");
  await expect(success(page)).toBeVisible();
  await expect(success(page)).toContainText(
    "No monthly savings required — your current savings are projected to reach the goal through interest alone.",
  );
  await expect(finalValue(page)).toHaveText("16,453.09");
  await expect(interest(page)).toHaveText("6,453.09");
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(5);
  await expect(
    growth(page).locator("tbody tr[data-year]").last(),
  ).toContainText("100%");
});

test("supports a partial final year", async ({ page }) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "50000",
    current: "10000",
    rate: "6",
    duration: "2.5",
    frequency: "quarterly",
  });

  await expect(required(page)).toHaveText("1,189.86");
  await expect(finalValue(page)).toHaveText("50,000.02");
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(3);
  await expect(growth(page).locator("tbody tr[data-year='3']")).toHaveAttribute(
    "data-months",
    "6",
  );
  await expect(growth(page).locator("tbody tr[data-year='3'] th")).toHaveText(
    "Year 3 (6 months)",
  );
});

test("validates inputs, fractional months, overflow, and recovery", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-target]")).toHaveText(
    "Enter a savings goal greater than zero.",
  );
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "Enter a target duration between 1 and 1,200 whole months.",
  );
  await expect(growth(page)).toBeHidden();

  await calculate(page, {
    target: "-1",
    current: "-1",
    rate: "-1",
    duration: "0",
  });
  await expect(page.locator("[data-error-text-target]")).toHaveText(
    "Enter a savings goal greater than zero.",
  );
  await expect(page.locator("[data-error-text-current]")).toHaveText(
    "Enter current savings of 0 or more.",
  );
  await expect(page.locator("[data-error-text-rate]")).toHaveText(
    "Enter an interest rate of 0 or more.",
  );
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "Enter a target duration between 1 and 1,200 whole months.",
  );

  await calculate(page, {
    target: "10000",
    current: "0",
    rate: "0",
    duration: "1.1",
  });
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "The duration must resolve to a whole number of months.",
  );
  await expect(growth(page)).toBeHidden();

  await calculate(page, {
    target: "10000",
    current: "0",
    rate: "0",
    duration: "1",
    unit: "months",
  });
  await expect(required(page)).toHaveText("10,000.00");
  await expect(growth(page).locator("tbody tr[data-year='1'] th")).toHaveText(
    "Year 1 (1 month)",
  );

  await calculate(page, {
    target: "120000",
    current: "0",
    rate: "0",
    duration: "1200",
    unit: "months",
  });
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(100);

  await calculate(page, {
    target: "120000",
    current: "0",
    rate: "0",
    duration: "1201",
    unit: "months",
  });
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "Enter a target duration between 1 and 1,200 whole months.",
  );

  await calculate(page, {
    target: "1000",
    current: "0",
    rate: "1e308",
    duration: "5",
  });
  await expect(page.locator("[data-error-text-general]")).toHaveText(
    "The result is outside the supported numeric range. Try smaller values.",
  );
  await expect(required(page)).toHaveText("—");
  await expect(growth(page)).toBeHidden();

  await calculate(page, {
    target: "70000",
    current: "10000",
    rate: "0",
    duration: "5",
    unit: "years",
  });
  await expect(required(page)).toHaveText("1,000.00");
  await expect(page.locator("[data-error-general]")).toBeHidden();
});

test("clears stale results when inputs change", async ({ page }) => {
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "70000",
    current: "10000",
    rate: "0",
    duration: "5",
  });
  await expect(required(page)).toHaveText("1,000.00");

  await rate(page).fill("1");
  await expect(required(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
  await expect(growth(page)).toBeHidden();
  await expect(growthEmpty(page)).toBeVisible();

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(required(page)).not.toHaveText("—");
  await expect(growth(page)).toBeVisible();
});

test("copies the summary, resets, and is keyboard operable", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/savings-goal-calculator");
  await calculate(page, {
    target: "70000",
    current: "10000",
    rate: "0",
    duration: "5",
  });

  await copy(page).click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "Savings goal: 70,000.00\nCurrent savings: 10,000.00\nAnnual interest rate: 0%\nCompounding: Monthly\nDuration: 60 months\nContribution timing: End of month\nRequired monthly savings: 1,000.00\nTotal contributions: 60,000.00\nInterest earned: 0.00\nProjected final savings: 70,000.00",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(target(page)).toHaveValue("");
  await expect(required(page)).toHaveText("—");
  await expect(growth(page)).toBeHidden();
  await expect(target(page)).toBeFocused();

  await page.goto("/savings-goal-calculator");
  await tabTo(page, browserName, target(page));
  await ring(target(page));
  await page.keyboard.type("70000");
  await tabTo(page, browserName, current(page));
  await page.keyboard.type("10000");
  await tabTo(page, browserName, rate(page));
  await page.keyboard.type("0");
  await tabTo(page, browserName, duration(page));
  await page.keyboard.type("5");
  await page.keyboard.press("Enter");

  await expect(required(page)).toHaveText("1,000.00");
  await expect(growth(page)).toBeVisible();
});

test("stays usable at 320px with an internally scrolling table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, labels] of [
    [
      "/savings-goal-calculator/",
      {
        target: "Savings goal",
        current: "Current savings",
        rate: "Annual interest rate (%)",
        duration: "Target duration",
        calculate: "Calculate",
      },
    ],
    [
      "/es/savings-goal-calculator/",
      {
        target: "Objetivo de ahorro",
        current: "Ahorros actuales",
        rate: "Tipo de interés anual (%)",
        duration: "Plazo del objetivo",
        calculate: "Calcular",
      },
    ],
  ] as const) {
    await page.goto(path);
    await page.getByLabel(labels.target, { exact: true }).fill("70000");
    await page.getByLabel(labels.current, { exact: true }).fill("10000");
    await page.getByLabel(labels.rate, { exact: true }).fill("0");
    await page.getByLabel(labels.duration, { exact: true }).fill("5");
    await page.getByRole("button", { name: labels.calculate }).click();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    const region = growth(page);
    await expect(region).toBeVisible();
    const metrics = await region.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);

    const box = await page
      .getByRole("button", { name: labels.calculate })
      .boundingBox();
    expect(box).not.toBeNull();
    if (box === null) throw new Error("Calculate has no box");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.screenshot({
    path: "test-results/savings-goal-calculator-320.png",
    fullPage: false,
  });
});

test("the Spanish page is localized and formats money in Spanish", async ({
  page,
}) => {
  await page.goto("/es/savings-goal-calculator");

  await expect(page).toHaveTitle("Calculadora de objetivo de ahorro — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de objetivo de ahorro",
  );
  await expect(
    page.getByLabel("Objetivo de ahorro", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Ahorros actuales", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Tipo de interés anual (%)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Plazo del objetivo", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Frecuencia de capitalización")).toHaveValue(
    "monthly",
  );
  await expect(
    page.getByRole("switch", { name: "Aportar al inicio de cada mes" }),
  ).not.toBeChecked();

  await page.getByLabel("Objetivo de ahorro", { exact: true }).fill("100000");
  await page.getByLabel("Ahorros actuales", { exact: true }).fill("10000");
  await page.getByLabel("Tipo de interés anual (%)").fill("8");
  await page.getByLabel("Plazo del objetivo", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(required(page)).toHaveText("1158,21");
  await expect(finalValue(page)).toHaveText("100.000,09");
  await expect(interest(page)).toHaveText("20.507,49");
  await expect(progress(page)).toHaveText("10\u00a0%");
  await expect(
    page.getByRole("heading", { name: "Plan de ahorro anual" }),
  ).toBeVisible();
  await expect(growth(page).locator("tbody tr[data-year='1'] th")).toHaveText(
    "Año 1",
  );
  await expect(
    page.getByRole("button", { name: "Copiar resumen" }),
  ).toBeEnabled();

  await page.getByLabel("Plazo del objetivo", { exact: true }).fill("1.1");
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "El plazo debe resolverse en un número entero de meses.",
  );

  await page.screenshot({
    path: "test-results/savings-goal-calculator-es.png",
    fullPage: true,
  });
});

test("links to related calculators and exposes SEO metadata", async ({
  page,
}) => {
  await page.goto("/savings-goal-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /Compound Interest Calculator/ }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");
  await expect(
    related.getByRole("link", { name: /Percentage Calculator/ }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/savings-goal-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/savings-goal-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/savings-goal-calculator/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Free savings goal calculator: find the monthly amount you need to save to reach a target, with optional interest and a year-by-year savings plan.",
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
      { name: "Savings Goal Calculator" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "Savings Goal Calculator",
    url: "https://appkitx.com/savings-goal-calculator/",
    inLanguage: "en",
  });
});

test("is linked from the homepage, category, footer, search, and sitemap", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .locator("#tools")
      .getByRole("link", { name: "Savings Goal Calculator" }),
  ).toHaveAttribute("href", "/savings-goal-calculator/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Savings Goal Calculator" }),
  ).toHaveAttribute("href", "/savings-goal-calculator/");

  await page.goto("/calculators/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link")
      .filter({ hasText: "Savings Goal Calculator" }),
  ).toHaveAttribute("href", "/savings-goal-calculator/");

  await page.goto("/");
  await page.keyboard.press("Control+k");
  const palette = page.locator("[data-search-palette]");
  await palette.locator("[data-search-input]").fill("savings goal");
  await expect(palette.getByRole("option")).toContainText(
    "Savings Goal Calculator",
  );
  await page.keyboard.press("Escape");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://appkitx.com/savings-goal-calculator");
  expect(sitemapText).toContain(
    "https://appkitx.com/es/savings-goal-calculator",
  );
});

test("keeps the Compound, Loan, and EMI calculators unchanged", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");
  await page.getByLabel("Initial investment", { exact: true }).fill("10000");
  await page.getByLabel("Annual interest rate (%)").fill("8");
  await page.getByLabel("Investment duration", { exact: true }).fill("10");
  await page.getByLabel("Compounding frequency").selectOption("annual");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-final-value]")).toHaveText("21,589.25");

  await page.goto("/loan-calculator");
  await page.getByLabel("Loan amount").fill("100000");
  await page.getByLabel("Annual interest rate (%)").fill("6");
  await page.getByLabel("Loan term", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-monthly]")).toHaveText("599.55");
  await expect(page.locator("[data-interest]")).toHaveText("115,838.19");

  await page.goto("/emi-calculator");
  await page.getByLabel("Loan amount", { exact: true }).fill("100000");
  await page.getByLabel("Annual interest rate (%)").fill("6");
  await page.getByLabel("Loan tenure", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-emi]")).toHaveText("599.55");
  await expect(page.locator("[data-schedule] tbody tr")).toHaveCount(360);
});
