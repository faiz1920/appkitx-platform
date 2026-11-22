import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const currentAge = (page: Page) =>
  page.getByLabel("Current age", { exact: true });
const retirementAge = (page: Page) =>
  page.getByLabel("Retirement age", { exact: true });
const currentSavings = (page: Page) =>
  page.getByLabel("Current retirement savings", { exact: true });
const contribution = (page: Page) =>
  page.getByLabel("Monthly contribution", { exact: true });
const target = (page: Page) =>
  page.getByLabel("Target retirement corpus", { exact: true });
const rate = (page: Page) =>
  page.getByLabel("Expected annual return (%)", { exact: true });
const inflation = (page: Page) =>
  page.getByLabel("Expected annual inflation (%)", { exact: true });
const frequency = (page: Page) => page.getByLabel("Compounding frequency");
const timing = (page: Page) =>
  page.getByRole("switch", {
    name: "Contribute at the start of each month",
  });

const primary = (page: Page) => page.locator("[data-primary-value]");
const primaryLabel = (page: Page) => page.locator("[data-primary-label]");
const invested = (page: Page) => page.locator("[data-invested]");
const growth = (page: Page) => page.locator("[data-interest]");
const years = (page: Page) => page.locator("[data-years-projection]");
const realCorpus = (page: Page) => page.locator("[data-real-corpus]");
const requiredValue = (page: Page) => page.locator("[data-primary-value]");
const targetValue = (page: Page) => page.locator("[data-target]");
const currentValue = (page: Page) => page.locator("[data-current]");
const contributions = (page: Page) => page.locator("[data-contributions]");
const investedRequired = (page: Page) =>
  page.locator("[data-invested-required]");
const growthRequired = (page: Page) => page.locator("[data-interest-required]");
const projectedRequired = (page: Page) =>
  page.locator("[data-projected-required]");
const yearsRequired = (page: Page) => page.locator("[data-years-required]");
const realTarget = (page: Page) => page.locator("[data-real-target]");
const realProjected = (page: Page) => page.locator("[data-real-projected]");
const success = (page: Page) => page.locator("[data-success-message]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");
const table = (page: Page) => page.locator("[data-growth]");
const tableEmpty = (page: Page) => page.locator("[data-growth-empty]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy summary" });

const selectMode = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
};

const toggleTiming = async (page: Page) => {
  await timing(page).focus();
  await page.keyboard.press("Space");
};

const fillProjection = async (
  page: Page,
  values: {
    currentAge: string;
    retirementAge: string;
    savings: string;
    contribution: string;
    rate: string;
    inflation?: string;
    frequency?: string;
  },
) => {
  await currentAge(page).fill(values.currentAge);
  await retirementAge(page).fill(values.retirementAge);
  await currentSavings(page).fill(values.savings);
  await contribution(page).fill(values.contribution);
  await rate(page).fill(values.rate);
  if (values.inflation) await inflation(page).fill(values.inflation);
  if (values.frequency) {
    await frequency(page).selectOption(values.frequency);
  }
};

const fillRequired = async (
  page: Page,
  values: {
    currentAge: string;
    retirementAge: string;
    savings: string;
    target: string;
    rate: string;
    inflation?: string;
    frequency?: string;
  },
) => {
  await currentAge(page).fill(values.currentAge);
  await retirementAge(page).fill(values.retirementAge);
  await currentSavings(page).fill(values.savings);
  await target(page).fill(values.target);
  await rate(page).fill(values.rate);
  if (values.inflation) await inflation(page).fill(values.inflation);
  if (values.frequency) {
    await frequency(page).selectOption(values.frequency);
  }
};

const calculate = async (page: Page) => {
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
  await page.goto("/retirement-calculator");

  await expect(page).toHaveTitle("Retirement Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Retirement Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Retirement Calculator",
  );

  await expect(
    page.getByRole("radio", { name: "Projected corpus" }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Required monthly savings" }),
  ).not.toBeChecked();
  await expect(currentAge(page)).toHaveValue("");
  await expect(retirementAge(page)).toHaveValue("");
  await expect(currentSavings(page)).toHaveValue("");
  await expect(contribution(page)).toBeVisible();
  await expect(target(page)).toBeHidden();
  await expect(rate(page)).toHaveValue("");
  await expect(inflation(page)).toHaveValue("");
  await expect(frequency(page)).toHaveValue("monthly");
  await expect(timing(page)).not.toBeChecked();
  await expect(primaryLabel(page)).toHaveText("Projected retirement corpus");
  await expect(primary(page)).toHaveText("—");
  await expect(invested(page)).toHaveText("—");
  await expect(growth(page)).toHaveText("—");
  await expect(years(page)).toHaveText("—");
  await expect(realCorpus(page)).toBeHidden();
  await expect(success(page)).toBeHidden();
  await expect(copy(page)).toBeDisabled();
  await expect(tableEmpty(page)).toBeVisible();
  await expect(table(page)).toBeHidden();
  await expect(formula(page)).toHaveText(
    "FV = P × g^N + C × ((g^N − 1) ÷ i) × k",
  );
});

test("projects Scenario A and reconciles the annual table", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "6",
  });
  await calculate(page);

  await expect(primary(page)).toHaveText("803,386.28");
  await expect(invested(page)).toHaveText("230,000.00");
  await expect(growth(page)).toHaveText("573,386.28");
  await expect(years(page)).toHaveText("30 years");
  await expect(caption(page)).toHaveText(
    "Projected corpus of 803,386.28 at age 60.",
  );
  await expect(formula(page)).toHaveText(
    "6% nominal = 0.5% per month after compounding.",
  );
  await expect(copy(page)).toBeEnabled();
  await expect(tableEmpty(page)).toBeHidden();
  await expect(table(page)).toBeVisible();

  const rows = table(page).locator("tbody tr[data-year]");
  await expect(rows).toHaveCount(30);
  await expect(rows.first()).toHaveAttribute("data-age", "31");
  await expect(rows.first().locator("th")).toHaveText("Age 31");
  await expect(rows.last()).toHaveAttribute("data-age", "60");
  await expect(rows.last().locator("th")).toHaveText("Age 60");
  await expect(rows.last().locator("td").last()).toHaveText("803,386.28");
  await expect(
    table(page).locator("tbody tr[data-year='1'] td").nth(2),
  ).toHaveText("6,000.00");

  const tableElement = table(page).locator("table");
  await expect(tableElement.locator("caption")).toHaveText(
    "Annual retirement projection",
  );
  await expect(tableElement.locator("th[scope='col']")).toHaveCount(6);
  await expect(
    tableElement.locator("tbody th[scope='row']").first(),
  ).toHaveText("Age 31");

  await page.screenshot({
    path: "test-results/retirement-calculator-en.png",
    fullPage: true,
  });
});

test("projects Scenario B at 8% nominal", async ({ page }) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "8",
  });
  await calculate(page);

  await expect(primary(page)).toHaveText("1,291,966.21");
  await expect(invested(page)).toHaveText("230,000.00");
  await expect(growth(page)).toHaveText("1,061,966.21");
  await expect(table(page).locator("tbody tr[data-year]")).toHaveCount(30);
});

test("handles Scenario G — a zero return", async ({ page }) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "35",
    savings: "50000",
    contribution: "1000",
    rate: "0",
  });
  await calculate(page);

  await expect(primary(page)).toHaveText("110,000.00");
  await expect(invested(page)).toHaveText("110,000.00");
  await expect(growth(page)).toHaveText("0.00");
  await expect(years(page)).toHaveText("5 years");
  await expect(table(page).locator("tbody tr[data-year]")).toHaveCount(5);
  await expect(
    table(page).locator("tbody tr[data-year='1'] td").nth(3),
  ).toHaveText("0.00");
  await expect(
    table(page).locator("tbody tr[data-year='5'] td").last(),
  ).toHaveText("110,000.00");
});

test("values beginning-of-month contributions above end-of-month", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "6",
  });
  await calculate(page);
  await expect(primary(page)).toHaveText("803,386.28");

  await toggleTiming(page);
  await expect(timing(page)).toBeChecked();
  await calculate(page);

  const beginning = money((await primary(page).textContent()) ?? "");
  expect(beginning).toBeGreaterThan(803386.28);
  await expect(primary(page)).not.toHaveText("803,386.28");
  await expect(growth(page)).not.toHaveText("573,386.28");
});

test("supports all five compounding frequencies", async ({ page }) => {
  await page.goto("/retirement-calculator");

  const values: number[] = [];
  for (const option of [
    "annual",
    "semiannual",
    "quarterly",
    "monthly",
    "daily",
  ] as const) {
    await fillProjection(page, {
      currentAge: "30",
      retirementAge: "60",
      savings: "50000",
      contribution: "500",
      rate: "8",
      frequency: option,
    });
    await calculate(page);
    values.push(money((await primary(page).textContent()) ?? ""));
  }

  for (let index = 1; index < values.length; index += 1) {
    expect(values[index]).toBeGreaterThan(values[index - 1] ?? 0);
  }
});

test("solves Scenario C — required monthly savings, end of month", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await selectMode(page, "Required monthly savings");

  await expect(primaryLabel(page)).toHaveText("Required monthly savings");
  await expect(contribution(page)).toBeHidden();
  await expect(target(page)).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "Required monthly savings" }),
  ).toBeChecked();

  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "1000000",
    rate: "6",
  });
  await calculate(page);

  await expect(requiredValue(page)).toHaveText("695.73");
  await expect(targetValue(page)).toHaveText("1,000,000.00");
  await expect(currentValue(page)).toHaveText("50,000.00");
  await expect(contributions(page)).toHaveText("250,462.80");
  await expect(investedRequired(page)).toHaveText("300,462.80");
  await expect(growthRequired(page)).toHaveText("699,537.21");
  await expect(projectedRequired(page)).toHaveText("1,000,000.01");
  await expect(yearsRequired(page)).toHaveText("30 years");
  await expect(success(page)).toBeHidden();
  await expect(caption(page)).toHaveText(
    "695.73 per month to reach 1,000,000.00 by age 60.",
  );
  await expect(page.locator("[data-result-projection]")).toBeHidden();
  await expect(table(page).locator("tbody tr[data-year]")).toHaveCount(30);

  const finalBalance = money(
    (await table(page)
      .locator("tbody tr[data-year]")
      .last()
      .locator("td")
      .last()
      .textContent()) ?? "",
  );
  expect(finalBalance).toBeGreaterThanOrEqual(1_000_000);
});

test("solves Scenario D — required monthly savings, beginning of month", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await selectMode(page, "Required monthly savings");
  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "1000000",
    rate: "6",
  });
  await calculate(page);
  await expect(requiredValue(page)).toHaveText("695.73");

  await toggleTiming(page);
  await expect(timing(page)).toBeChecked();
  await calculate(page);

  await expect(requiredValue(page)).toHaveText("692.27");
  const finalBalance = money(
    (await table(page)
      .locator("tbody tr[data-year]")
      .last()
      .locator("td")
      .last()
      .textContent()) ?? "",
  );
  expect(finalBalance).toBeGreaterThanOrEqual(1_000_000);
});

test("shows the already-covered and growth-only success states", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await selectMode(page, "Required monthly savings");

  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "40000",
    rate: "6",
  });
  await calculate(page);
  await expect(requiredValue(page)).toHaveText("0.00");
  await expect(success(page)).toBeVisible();
  await expect(success(page)).toContainText(
    "Your current retirement savings already meet the target. No monthly contribution is required under these assumptions.",
  );

  await page.goto("/retirement-calculator");
  await selectMode(page, "Required monthly savings");
  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "250000",
    rate: "6",
  });
  await calculate(page);
  await expect(requiredValue(page)).toHaveText("0.00");
  await expect(projectedRequired(page)).toHaveText("301,128.76");
  await expect(success(page)).toBeVisible();
  await expect(success(page)).toContainText(
    "No monthly contribution required — your current savings are projected to reach the target through growth alone.",
  );
  await expect(
    table(page).locator("tbody tr[data-year]").last().locator("td").last(),
  ).toHaveText("301,128.76");
});

test("adds Scenario E and F inflation-adjusted values without changing nominal ones", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "6",
    inflation: "2.5",
  });
  await calculate(page);

  await expect(primary(page)).toHaveText("803,386.28");
  await expect(realCorpus(page)).toBeVisible();
  await expect(realCorpus(page)).toHaveText("383,008.53");
  await expect(table(page).locator("tbody tr[data-year]")).toHaveCount(30);

  await inflation(page).fill("");
  await calculate(page);
  await expect(realCorpus(page)).toBeHidden();

  await page.goto("/retirement-calculator");
  await selectMode(page, "Required monthly savings");
  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "1000000",
    rate: "6",
    inflation: "2.5",
  });
  await calculate(page);

  await expect(targetValue(page)).toHaveText("1,000,000.00");
  await expect(requiredValue(page)).toHaveText("695.73");
  await expect(projectedRequired(page)).toHaveText("1,000,000.01");
  await expect(realTarget(page)).toHaveText("476,742.69");
  await expect(realProjected(page)).toBeVisible();
});

test("switches modes without mixing fields or stale results", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");
  await expect(contribution(page)).toBeVisible();
  await expect(target(page)).toBeHidden();

  await currentAge(page).fill("30");
  await retirementAge(page).fill("60");
  await currentSavings(page).fill("50000");
  await contribution(page).fill("500");
  await rate(page).fill("6");
  await calculate(page);
  await expect(primary(page)).toHaveText("803,386.28");

  await selectMode(page, "Required monthly savings");
  await expect(primary(page)).toHaveText("—");
  await expect(success(page)).toBeHidden();
  await expect(table(page)).toBeHidden();
  await expect(contribution(page)).toBeHidden();
  await expect(target(page)).toBeVisible();
  await expect(currentAge(page)).toHaveValue("30");
  await expect(retirementAge(page)).toHaveValue("60");
  await expect(currentSavings(page)).toHaveValue("50000");
  await expect(rate(page)).toHaveValue("6");
  await expect(formula(page)).toHaveText(
    "C = (T − P × g^N) × i ÷ ((g^N − 1) × k)",
  );

  await selectMode(page, "Projected corpus");
  await expect(contribution(page)).toBeVisible();
  await expect(contribution(page)).toHaveValue("500");
  await expect(target(page)).toBeHidden();
  await expect(primary(page)).toHaveText("—");
});

test("validates inputs, relationships, and overflow, then recovers", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");

  await calculate(page);
  await expect(page.locator("[data-error-text-current-age]")).toHaveText(
    "Enter a current age between 18 and 99.",
  );
  await expect(page.locator("[data-error-text-retirement-age]")).toHaveText(
    "Enter a retirement age between 19 and 100.",
  );
  await expect(table(page)).toBeHidden();

  await fillProjection(page, {
    currentAge: "17",
    retirementAge: "101",
    savings: "-1",
    contribution: "-1",
    rate: "-1",
    inflation: "-1",
  });
  await calculate(page);
  await expect(page.locator("[data-error-text-current-age]")).toHaveText(
    "Enter a current age between 18 and 99.",
  );
  await expect(page.locator("[data-error-text-retirement-age]")).toHaveText(
    "Enter a retirement age between 19 and 100.",
  );
  await expect(page.locator("[data-error-text-current-savings]")).toHaveText(
    "Enter current retirement savings of 0 or more.",
  );
  await expect(page.locator("[data-error-text-contribution]")).toHaveText(
    "Enter a monthly contribution of 0 or more.",
  );
  await expect(page.locator("[data-error-text-rate]")).toHaveText(
    "Enter an expected annual return of 0 or more.",
  );
  await expect(page.locator("[data-error-text-inflation]")).toHaveText(
    "Enter an expected annual inflation rate of 0 or more.",
  );

  await fillProjection(page, {
    currentAge: "30.5",
    retirementAge: "60",
    savings: "0",
    contribution: "0",
    rate: "0",
  });
  await calculate(page);
  await expect(page.locator("[data-error-text-current-age]")).toHaveText(
    "Enter a current age between 18 and 99.",
  );

  await inflation(page).fill("");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "25",
    savings: "0",
    contribution: "0",
    rate: "0",
  });
  await calculate(page);
  await expect(page.locator("[data-error-text-retirement-age]")).toHaveText(
    "Retirement age must be later than current age.",
  );

  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "0",
    contribution: "0",
    rate: "0",
  });
  await calculate(page);
  await expect(page.locator("[data-error-text-general]")).toHaveText(
    "Enter current retirement savings or a monthly contribution greater than zero.",
  );

  await selectMode(page, "Required monthly savings");
  await expect(page.locator("[data-error-text-general]")).toBeHidden();
  await currentAge(page).fill("30");
  await retirementAge(page).fill("60");
  await currentSavings(page).fill("0");
  await rate(page).fill("6");
  await calculate(page);
  await expect(page.locator("[data-error-text-target]")).toHaveText(
    "Enter a target retirement corpus greater than zero.",
  );
  await target(page).fill("0");
  await calculate(page);
  await expect(page.locator("[data-error-text-target]")).toHaveText(
    "Enter a target retirement corpus greater than zero.",
  );

  await target(page).fill("1000");
  await rate(page).fill("1e308");
  await calculate(page);
  await expect(page.locator("[data-error-text-general]")).toHaveText(
    "The result is outside the supported numeric range. Try smaller values.",
  );
  await expect(requiredValue(page)).toHaveText("—");
  await expect(table(page)).toBeHidden();

  await fillRequired(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    target: "1000000",
    rate: "6",
  });
  await calculate(page);
  await expect(requiredValue(page)).toHaveText("695.73");
  await expect(page.locator("[data-error-general]")).toBeHidden();
});

test("clears stale results when any input changes", async ({ page }) => {
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "6",
  });
  await calculate(page);
  await expect(primary(page)).toHaveText("803,386.28");

  await rate(page).fill("7");
  await expect(primary(page)).toHaveText("—");
  await expect(copy(page)).toBeDisabled();
  await expect(table(page)).toBeHidden();
  await expect(tableEmpty(page)).toBeVisible();

  await frequency(page).selectOption("daily");
  await expect(primary(page)).toHaveText("—");

  await calculate(page);
  await expect(primary(page)).not.toHaveText("—");
  await expect(table(page)).toBeVisible();
});

test("copies the summary, resets, and is keyboard operable", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/retirement-calculator");
  await fillProjection(page, {
    currentAge: "30",
    retirementAge: "60",
    savings: "50000",
    contribution: "500",
    rate: "6",
  });
  await calculate(page);

  await copy(page).click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "Retirement projection\nCurrent age: 30\nRetirement age: 60\nCurrent retirement savings: 50,000.00\nMonthly contribution: 500.00\nExpected annual return: 6%\nCompounding: Monthly\nContribution timing: End of month\nYears to retirement: 30 years\nProjected retirement corpus: 803,386.28\nTotal invested: 230,000.00\nProjected investment growth: 573,386.28",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(currentAge(page)).toHaveValue("");
  await expect(retirementAge(page)).toHaveValue("");
  await expect(currentSavings(page)).toHaveValue("");
  await expect(contribution(page)).toHaveValue("");
  await expect(rate(page)).toHaveValue("");
  await expect(inflation(page)).toHaveValue("");
  await expect(primary(page)).toHaveText("—");
  await expect(table(page)).toBeHidden();
  await expect(
    page.getByRole("radio", { name: "Projected corpus" }),
  ).toBeChecked();
  await expect(currentAge(page)).toBeFocused();

  await page.goto("/retirement-calculator");
  await tabTo(page, browserName, currentAge(page));
  await ring(currentAge(page));
  await page.keyboard.type("30");
  await tabTo(page, browserName, retirementAge(page));
  await page.keyboard.type("60");
  await tabTo(page, browserName, currentSavings(page));
  await page.keyboard.type("50000");
  await tabTo(page, browserName, contribution(page));
  await page.keyboard.type("500");
  await tabTo(page, browserName, rate(page));
  await page.keyboard.type("6");
  await page.keyboard.press("Enter");

  await expect(primary(page)).toHaveText("803,386.28");
  await expect(table(page)).toBeVisible();
});

test("stays usable at 320px with an internally scrolling table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, labels] of [
    [
      "/retirement-calculator/",
      {
        currentAge: "Current age",
        retirementAge: "Retirement age",
        savings: "Current retirement savings",
        contribution: "Monthly contribution",
        rate: "Expected annual return (%)",
        calculate: "Calculate",
      },
    ],
    [
      "/es/retirement-calculator/",
      {
        currentAge: "Edad actual",
        retirementAge: "Edad de jubilación",
        savings: "Ahorros actuales para la jubilación",
        contribution: "Aporte mensual",
        rate: "Rentabilidad anual esperada (%)",
        calculate: "Calcular",
      },
    ],
  ] as const) {
    await page.goto(path);
    await page.getByLabel(labels.currentAge, { exact: true }).fill("30");
    await page.getByLabel(labels.retirementAge, { exact: true }).fill("60");
    await page.getByLabel(labels.savings, { exact: true }).fill("50000");
    await page.getByLabel(labels.contribution, { exact: true }).fill("500");
    await page.getByLabel(labels.rate, { exact: true }).fill("6");
    await page.getByRole("button", { name: labels.calculate }).click();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    const region = table(page);
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
    path: "test-results/retirement-calculator-320.png",
    fullPage: false,
  });
});

test("the Spanish page is localized and formats money in Spanish", async ({
  page,
}) => {
  await page.goto("/es/retirement-calculator");

  await expect(page).toHaveTitle("Calculadora de jubilación — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de jubilación",
  );
  await expect(page.getByLabel("Edad actual", { exact: true })).toBeVisible();
  await expect(
    page.getByLabel("Edad de jubilación", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Ahorros actuales para la jubilación", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Aporte mensual", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Rentabilidad anual esperada (%)", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Frecuencia de capitalización")).toHaveValue(
    "monthly",
  );
  await expect(
    page.getByRole("switch", { name: "Aportar al inicio de cada mes" }),
  ).not.toBeChecked();

  await page.getByLabel("Edad actual", { exact: true }).fill("30");
  await page.getByLabel("Edad de jubilación", { exact: true }).fill("60");
  await page
    .getByLabel("Ahorros actuales para la jubilación", { exact: true })
    .fill("50000");
  await page.getByLabel("Aporte mensual", { exact: true }).fill("500");
  await page
    .getByLabel("Rentabilidad anual esperada (%)", { exact: true })
    .fill("6");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(primary(page)).toHaveText("803.386,28");
  await expect(years(page)).toHaveText("30 años");
  await expect(caption(page)).toHaveText(
    "Capital proyectado de 803.386,28 a los 60 años.",
  );
  await expect(
    page.getByRole("heading", { name: "Proyección anual de la jubilación" }),
  ).toBeVisible();
  await expect(table(page).locator("tbody tr[data-year='1'] th")).toHaveText(
    "Edad 31",
  );

  await page
    .locator(".segmented label")
    .filter({ hasText: "Ahorro mensual necesario" })
    .click();
  await page
    .getByLabel("Capital objetivo para la jubilación", { exact: true })
    .fill("1000000");
  await page
    .getByLabel("Inflación anual esperada (%)", { exact: true })
    .fill("2.5");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(primary(page)).toHaveText("695,73");
  await expect(projectedRequired(page)).toHaveText("1.000.000,01");
  await expect(realTarget(page)).toHaveText("476.742,69");
  await expect(
    page.getByRole("button", { name: "Copiar resumen" }),
  ).toBeEnabled();

  await page.getByLabel("Edad actual", { exact: true }).fill("17");
  await page.getByRole("button", { name: "Calcular" }).click();
  await expect(page.locator("[data-error-text-current-age]")).toHaveText(
    "Escribe una edad actual entre 18 y 99.",
  );

  await page.screenshot({
    path: "test-results/retirement-calculator-es.png",
    fullPage: true,
  });
});

test("links to related calculators and exposes SEO metadata", async ({
  page,
}) => {
  await page.goto("/retirement-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /Compound Interest Calculator/ }),
  ).toHaveAttribute("href", "/compound-interest-calculator/");
  await expect(
    related.getByRole("link", { name: /Savings Goal Calculator/ }),
  ).toHaveAttribute("href", "/savings-goal-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/retirement-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/retirement-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/retirement-calculator/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Free retirement calculator: project your retirement corpus from current savings and monthly contributions, or find the monthly savings needed to reach a target.",
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
      { name: "Retirement Calculator" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "Retirement Calculator",
    url: "https://appkitx.com/retirement-calculator/",
    inLanguage: "en",
  });
});

test("is linked from the homepage, category, footer, search, and sitemap", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "Retirement Calculator" }),
  ).toHaveAttribute("href", "/retirement-calculator/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Retirement Calculator" }),
  ).toHaveAttribute("href", "/retirement-calculator/");

  await page.goto("/calculators/");
  const card = page
    .getByRole("main")
    .getByRole("link")
    .filter({ hasText: "Retirement Calculator" });
  await expect(card).toHaveAttribute("href", "/retirement-calculator/");
  await expect(card).toContainText("Projected retirement corpus");

  await page.goto("/es/calculators/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link")
      .filter({ hasText: "Calculadora de jubilación" }),
  ).toHaveAttribute("href", "/es/retirement-calculator/");

  await page.goto("/");
  await page.keyboard.press("Control+k");
  const palette = page.locator("[data-search-palette]");
  await palette.locator("[data-search-input]").fill("retirement");
  await expect(palette.getByRole("option")).toContainText(
    "Retirement Calculator",
  );
  await page.keyboard.press("Escape");

  const sitemap = await page.request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://appkitx.com/retirement-calculator");
  expect(sitemapText).toContain("https://appkitx.com/es/retirement-calculator");
});

test("keeps Compound, Loan, EMI, and Savings Goal calculators unchanged", async ({
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

  await page.goto("/savings-goal-calculator");
  await page.getByLabel("Savings goal", { exact: true }).fill("70000");
  await page.getByLabel("Current savings", { exact: true }).fill("10000");
  await page.getByLabel("Annual interest rate (%)").fill("0");
  await page.getByLabel("Target duration", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.locator("[data-required-monthly]")).toHaveText("1,000.00");
});

test("keeps the PC Builder development-only and unlisted", async ({
  request,
}) => {
  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);

  const sitemap = await request.get("/sitemap-0.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("pc-builder");
});
