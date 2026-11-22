import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const initial = (page: Page) =>
  page.getByLabel("Initial investment", { exact: true });
const rate = (page: Page) =>
  page.getByLabel("Annual interest rate (%)", { exact: true });
const duration = (page: Page) =>
  page.getByLabel("Investment duration", { exact: true });
const durationUnit = (page: Page) => page.getByLabel("Duration unit");
const frequency = (page: Page) => page.getByLabel("Compounding frequency");
const contribution = (page: Page) =>
  page.getByLabel("Monthly contribution", { exact: true });
const timing = (page: Page) =>
  page.getByRole("switch", {
    name: "Contribute at the start of each month",
  });
const finalValue = (page: Page) => page.locator("[data-final-value]");
const initialValue = (page: Page) => page.locator("[data-initial]");
const contributionsValue = (page: Page) => page.locator("[data-contributions]");
const investedValue = (page: Page) => page.locator("[data-invested]");
const interestValue = (page: Page) => page.locator("[data-interest]");
const investedShare = (page: Page) => page.locator("[data-invested-share]");
const interestShare = (page: Page) => page.locator("[data-interest-share]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");
const growth = (page: Page) => page.locator("[data-growth]");
const growthEmpty = (page: Page) => page.locator("[data-growth-empty]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy summary" });

const calculate = async (
  page: Page,
  values: {
    initial: string;
    rate: string;
    duration: string;
    unit?: string;
    frequency?: string;
    contribution?: string;
  },
) => {
  await initial(page).fill(values.initial);
  await rate(page).fill(values.rate);
  await duration(page).fill(values.duration);
  if (values.unit) await durationUnit(page).selectOption(values.unit);
  if (values.frequency) await frequency(page).selectOption(values.frequency);
  if (values.contribution !== undefined) {
    await contribution(page).fill(values.contribution);
  }
  await page.getByRole("button", { name: "Calculate" }).click();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, defaults, and empty state", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");

  await expect(page).toHaveTitle("Compound Interest Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Compound Interest Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Compound Interest Calculator",
  );

  await expect(durationUnit(page)).toHaveValue("years");
  await expect(frequency(page)).toHaveValue("monthly");
  await expect(timing(page)).not.toBeChecked();
  await expect(finalValue(page)).toHaveText("—");
  await expect(initialValue(page)).toHaveText("—");
  await expect(contributionsValue(page)).toHaveText("—");
  await expect(investedValue(page)).toHaveText("—");
  await expect(interestValue(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
  await expect(growthEmpty(page)).toBeVisible();
  await expect(growth(page)).toBeHidden();
  await expect(formula(page)).toHaveText("A = P × (1 + r/m)^(m×t)");
});

test("computes a lump-sum annual projection and its growth table", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");
  await calculate(page, {
    initial: "10000",
    rate: "8",
    duration: "10",
    frequency: "annual",
  });

  await expect(finalValue(page)).toHaveText("21,589.25");
  await expect(initialValue(page)).toHaveText("10,000.00");
  await expect(contributionsValue(page)).toHaveText("0.00");
  await expect(investedValue(page)).toHaveText("10,000.00");
  await expect(interestValue(page)).toHaveText("11,589.25");
  await expect(investedShare(page)).toContainText("46.319%");
  await expect(interestShare(page)).toContainText("53.681%");
  await expect(caption(page)).toHaveText("10,000.00 at 8% over 120 months.");
  await expect(formula(page)).toHaveText(
    "8% nominal = 0.643% per month after compounding.",
  );
  await expect(copy(page)).toBeEnabled();
  await expect(growthEmpty(page)).toBeHidden();
  await expect(growth(page)).toBeVisible();

  const rows = growth(page).locator("tbody tr[data-year]");
  await expect(rows).toHaveCount(10);
  await expect(rows.first()).toHaveAttribute("data-months", "12");
  await expect(rows.first()).toContainText("Year 1");
  await expect(rows.first()).toContainText("10,000.00");
  await expect(rows.first()).toContainText("800.00");
  await expect(rows.first()).toContainText("10,800.00");
  await expect(rows.last()).toContainText("Year 10");
  await expect(rows.last()).toContainText("21,589.25");

  const table = growth(page).locator("table");
  await expect(table.locator("caption")).toHaveText(
    "Year-by-year investment growth",
  );
  await expect(table.locator("th[scope='col']")).toHaveCount(5);
  await expect(table.locator("tbody th[scope='row']").first()).toHaveText(
    "Year 1",
  );

  await page.screenshot({
    path: "test-results/compound-interest-calculator-en.png",
    fullPage: true,
  });
});

test("applies every supported compounding frequency", async ({ page }) => {
  await page.goto("/compound-interest-calculator");

  const expected = [
    ["annual", "21,589.25"],
    ["semiannual", "21,911.23"],
    ["quarterly", "22,080.40"],
    ["monthly", "22,196.40"],
    ["daily", "22,253.46"],
  ] as const;

  for (const [option, value] of expected) {
    await calculate(page, {
      initial: "10000",
      rate: "8",
      duration: "10",
      frequency: option,
    });
    await expect(finalValue(page)).toHaveText(value);
    await expect(interestValue(page)).not.toHaveText("—");
  }
});

test("computes monthly contributions and beginning-of-month timing", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");
  await calculate(page, {
    initial: "10000",
    rate: "8",
    duration: "10",
    frequency: "monthly",
    contribution: "1000",
  });

  await expect(timing(page)).not.toBeChecked();
  await expect(finalValue(page)).toHaveText("205,142.44");
  await expect(initialValue(page)).toHaveText("10,000.00");
  await expect(contributionsValue(page)).toHaveText("120,000.00");
  await expect(investedValue(page)).toHaveText("130,000.00");
  await expect(interestValue(page)).toHaveText("75,142.44");
  await expect(caption(page)).toHaveText(
    "10,000.00 at 8% over 120 months, with 1,000.00 monthly.",
  );

  await timing(page).focus();
  await page.keyboard.press("Space");
  await expect(timing(page)).toBeChecked();
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(finalValue(page)).toHaveText("206,362.08");
  await expect(investedValue(page)).toHaveText("130,000.00");
  await expect(interestValue(page)).toHaveText("76,362.08");
  await expect(finalValue(page)).not.toHaveText("205,142.44");
});

test("validates inputs, fractional months, overflow, and recovery", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-principal]")).toHaveText(
    "Enter a valid number.",
  );
  await expect(page.locator("[data-error-text-rate]")).toHaveText(
    "Enter a valid number.",
  );
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "Enter a valid number.",
  );
  await expect(growth(page)).toBeHidden();

  await initial(page).fill("-1");
  await rate(page).fill("-1");
  await duration(page).fill("0");
  await contribution(page).fill("-1");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-principal]")).toHaveText(
    "Enter an initial investment of 0 or more.",
  );
  await expect(page.locator("[data-error-text-rate]")).toHaveText(
    "Enter an interest rate of 0 or more.",
  );
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "Enter a duration between 1 and 1,200 whole months.",
  );
  await expect(page.locator("[data-error-text-contribution]")).toHaveText(
    "Enter a monthly contribution of 0 or more.",
  );

  await initial(page).fill("0");
  await rate(page).fill("6");
  await duration(page).fill("5");
  await contribution(page).fill("0");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-principal]")).toHaveText(
    "Enter an initial investment or a monthly contribution greater than zero.",
  );

  await initial(page).fill("10000");
  await duration(page).fill("1.1");
  await contribution(page).fill("0");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "The duration must resolve to a whole number of months.",
  );
  await expect(growth(page)).toBeHidden();

  await duration(page).fill("1.5");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(2);
  await expect(growth(page).locator("tbody tr[data-year='2']")).toHaveAttribute(
    "data-months",
    "6",
  );
  await expect(growth(page).locator("tbody tr[data-year='2'] th")).toHaveText(
    "Year 2 (6 months)",
  );

  await initial(page).fill("1000");
  await duration(page).fill("1");
  await durationUnit(page).selectOption("months");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(growth(page).locator("tbody tr[data-year='1'] th")).toHaveText(
    "Year 1 (1 month)",
  );

  await initial(page).fill("1e308");
  await duration(page).fill("360");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-error-text-general]")).toHaveText(
    "The result is outside the supported numeric range. Try smaller values.",
  );
  await expect(finalValue(page)).toHaveText("—");
  await expect(growth(page)).toBeHidden();

  await initial(page).fill("10000");
  await expect(page.locator("[data-error-general]")).toBeHidden();
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(finalValue(page)).not.toHaveText("—");
  await expect(growth(page)).toBeVisible();
});

test("covers the approved zero-interest and partial-year scenarios", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");
  await calculate(page, {
    initial: "10000",
    rate: "0",
    duration: "5",
    contribution: "1000",
  });

  await expect(finalValue(page)).toHaveText("70,000.00");
  await expect(initialValue(page)).toHaveText("10,000.00");
  await expect(contributionsValue(page)).toHaveText("60,000.00");
  await expect(investedValue(page)).toHaveText("70,000.00");
  await expect(interestValue(page)).toHaveText("0.00");
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(5);

  await calculate(page, {
    initial: "10000",
    rate: "6",
    duration: "2.5",
    frequency: "quarterly",
    contribution: "0",
  });
  await expect(finalValue(page)).toHaveText("11,605.41");
  await expect(growth(page).locator("tbody tr[data-year]")).toHaveCount(3);
  await expect(growth(page).locator("tbody tr[data-year='3']")).toHaveAttribute(
    "data-months",
    "6",
  );
  await expect(growth(page).locator("tbody tr[data-year='3'] th")).toHaveText(
    "Year 3 (6 months)",
  );
});

test("clears stale results when inputs change", async ({ page }) => {
  await page.goto("/compound-interest-calculator");
  await calculate(page, {
    initial: "10000",
    rate: "8",
    duration: "10",
    frequency: "annual",
  });
  await expect(finalValue(page)).toHaveText("21,589.25");

  await rate(page).fill("9");
  await expect(finalValue(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
  await expect(growth(page)).toBeHidden();
  await expect(growthEmpty(page)).toBeVisible();

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(finalValue(page)).not.toHaveText("—");
  await expect(growth(page)).toBeVisible();
});

test("copies the summary, resets, and is keyboard operable", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/compound-interest-calculator");
  await calculate(page, {
    initial: "10000",
    rate: "8",
    duration: "10",
    frequency: "annual",
  });

  await copy(page).click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "Initial investment: 10,000.00\nAnnual interest rate: 8%\nCompounding: Annually\nDuration: 120 months\nFinal value: 21,589.25\nTotal invested: 10,000.00\nInterest earned: 11,589.25",
  );

  await contribution(page).fill("1000");
  await frequency(page).selectOption("monthly");
  await page.getByRole("button", { name: "Calculate" }).click();
  await copy(page).click();
  const contributionCopy = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(contributionCopy.replace(/\r\n/g, "\n")).toBe(
    "Initial investment: 10,000.00\nMonthly contribution: 1,000.00\nTotal contributions: 120,000.00\nContribution timing: End of month\nAnnual interest rate: 8%\nCompounding: Monthly\nDuration: 120 months\nFinal value: 205,142.44\nTotal invested: 130,000.00\nInterest earned: 75,142.44",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(initial(page)).toHaveValue("");
  await expect(finalValue(page)).toHaveText("—");
  await expect(growth(page)).toBeHidden();
  await expect(initial(page)).toBeFocused();

  await page.goto("/compound-interest-calculator");
  await tabTo(page, browserName, initial(page));
  await ring(initial(page));
  await page.keyboard.type("10000");
  await tabTo(page, browserName, rate(page));
  await page.keyboard.type("8");
  await tabTo(page, browserName, duration(page));
  await page.keyboard.type("10");
  await page.keyboard.press("Enter");

  await expect(finalValue(page)).toHaveText("22,196.40");
  await expect(growth(page)).toBeVisible();
});

test("stays usable at 320px with an internally scrolling table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, labels] of [
    [
      "/compound-interest-calculator/",
      {
        initial: "Initial investment",
        rate: "Annual interest rate (%)",
        duration: "Investment duration",
        calculate: "Calculate",
      },
    ],
    [
      "/es/compound-interest-calculator/",
      {
        initial: "Inversión inicial",
        rate: "Tipo de interés anual (%)",
        duration: "Duración de la inversión",
        calculate: "Calcular",
      },
    ],
  ] as const) {
    await page.goto(path);
    await page.getByLabel(labels.initial, { exact: true }).fill("10000");
    await page.getByLabel(labels.rate, { exact: true }).fill("8");
    await page.getByLabel(labels.duration, { exact: true }).fill("10");
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
    path: "test-results/compound-interest-calculator-320.png",
    fullPage: false,
  });
});

test("the Spanish page is localized and formats money in Spanish", async ({
  page,
}) => {
  await page.goto("/es/compound-interest-calculator");

  await expect(page).toHaveTitle("Calculadora de interés compuesto — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de interés compuesto",
  );
  await expect(
    page.getByLabel("Inversión inicial", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Tipo de interés anual (%)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Duración de la inversión", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Frecuencia de capitalización")).toHaveValue(
    "monthly",
  );
  await expect(
    page.getByRole("switch", { name: "Aportar al inicio de cada mes" }),
  ).not.toBeChecked();

  await page.getByLabel("Inversión inicial", { exact: true }).fill("10000");
  await page.getByLabel("Tipo de interés anual (%)").fill("8");
  await page.getByLabel("Duración de la inversión", { exact: true }).fill("10");
  await page.getByLabel("Frecuencia de capitalización").selectOption("annual");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(finalValue(page)).toHaveText("21.589,25");
  await expect(initialValue(page)).toHaveText("10.000,00");
  await expect(interestValue(page)).toHaveText("11.589,25");
  await expect(
    page.getByRole("heading", { name: "Crecimiento anual" }),
  ).toBeVisible();
  await expect(growth(page).locator("tbody tr[data-year='1'] th")).toHaveText(
    "Año 1",
  );
  await expect(
    page.getByRole("button", { name: "Copiar resumen" }),
  ).toBeEnabled();

  await page
    .getByLabel("Duración de la inversión", { exact: true })
    .fill("1.1");
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.locator("[data-error-text-duration]")).toHaveText(
    "La duración debe resolverse en un número entero de meses.",
  );

  await page.screenshot({
    path: "test-results/compound-interest-calculator-es.png",
    fullPage: true,
  });
});

test("links to related calculators and exposes SEO metadata", async ({
  page,
}) => {
  await page.goto("/compound-interest-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /Loan Calculator/ }),
  ).toHaveAttribute("href", "/loan-calculator/");
  await expect(
    related.getByRole("link", { name: /EMI Calculator/ }),
  ).toHaveAttribute("href", "/emi-calculator/");
  await expect(
    related.getByRole("link", { name: /Savings Goal Calculator/ }),
  ).toHaveAttribute("href", "/savings-goal-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/compound-interest-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://appkitx.com/compound-interest-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute(
    "href",
    "https://appkitx.com/es/compound-interest-calculator/",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Free compound interest calculator: project investment growth with optional monthly contributions, compare compounding frequencies, and see year-by-year interest and balances.",
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
      { name: "Compound Interest Calculator" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "Compound Interest Calculator",
    url: "https://appkitx.com/compound-interest-calculator/",
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
      .getByRole("link", { name: "Compound Interest Calculator" }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Compound Interest Calculator" }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");

  await page.goto("/calculators/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link")
      .filter({ hasText: "Compound Interest Calculator" }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");

  await page.goto("/");
  await page.keyboard.press("Control+k");
  const palette = page.locator("[data-search-palette]");
  await palette.locator("[data-search-input]").fill("compound");
  await expect(palette.getByRole("option")).toContainText(
    "Compound Interest Calculator",
  );
  await page.keyboard.press("Escape");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain(
    "https://appkitx.com/compound-interest-calculator",
  );
  expect(sitemapText).toContain(
    "https://appkitx.com/es/compound-interest-calculator",
  );
});

test("keeps the Loan and EMI calculators unchanged", async ({ page }) => {
  await page.goto("/loan-calculator");
  await page.getByLabel("Loan amount").fill("100000");
  await page.getByLabel("Annual interest rate (%)").fill("6");
  await page.getByLabel("Loan term", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-monthly]")).toHaveText("599.55");
  await expect(page.locator("[data-interest]")).toHaveText("115,838.19");
  await expect(page.locator("[data-total]")).toHaveText("215,838.19");

  await page.goto("/emi-calculator");
  await page.getByLabel("Loan amount", { exact: true }).fill("100000");
  await page.getByLabel("Annual interest rate (%)").fill("6");
  await page.getByLabel("Loan tenure", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-emi]")).toHaveText("599.55");
  await expect(page.locator("[data-total]")).toHaveText("215,838.19");
  await expect(page.locator("[data-schedule] tbody tr")).toHaveCount(360);
});
