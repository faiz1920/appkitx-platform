import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { pressTab } from "./keyboard";

/*
 * M7 Phase 2 Date Calculator: exclusive day counts, the anchored
 * years/months/days breakdown, month-end clamping in add/subtract, localized
 * errors, mode switching, copy feedback, keyboard access, and Spanish
 * localization — all against the production build.
 */

const daysValue = (page: Page) => page.locator("[data-days-value]");
const breakdownValue = (page: Page) => page.locator("[data-breakdown-value]");
const dateValue = (page: Page) => page.locator("[data-date-value]");
const weekdayValue = (page: Page) => page.locator("[data-weekday-value]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy result" });

const selectMode = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const calculate = (page: Page, name = "Calculate") =>
  page.getByRole("button", { name }).click();

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, and empty state", async ({
  page,
}) => {
  await page.goto("/date-calculator");

  await expect(page).toHaveTitle("Date Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Date Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );

  await expect(page.getByLabel("Start date")).toBeVisible();
  await expect(page.getByLabel("End date")).toBeVisible();
  await expect(daysValue(page)).toHaveText("—");
  await expect(breakdownValue(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy(page)).toBeDisabled();
});

test("counts the days between two dates with a breakdown", async ({ page }) => {
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").fill("2026-03-01");
  await page.getByLabel("End date").fill("2026-03-15");
  await calculate(page);

  await expect(daysValue(page)).toHaveText("14 days");
  await expect(breakdownValue(page)).toHaveText(
    "0 years, 0 months, and 14 days",
  );
  await expect(caption(page)).toHaveText(
    "From March 1, 2026 to March 15, 2026.",
  );
  await expect(copy(page)).toBeEnabled();

  await page.screenshot({
    path: "test-results/date-calculator-en.png",
    fullPage: true,
  });
});

test("treats equal dates as zero and reversed dates as the same span", async ({
  page,
}) => {
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").fill("2026-03-15");
  await page.getByLabel("End date").fill("2026-03-15");
  await calculate(page);
  await expect(daysValue(page)).toHaveText("0 days");

  await page.getByLabel("Start date").fill("2026-03-15");
  await page.getByLabel("End date").fill("2026-03-01");
  await calculate(page);
  await expect(daysValue(page)).toHaveText("14 days");
  await expect(caption(page)).toHaveText(
    "From March 1, 2026 to March 15, 2026.",
  );
});

test("breaks month ends down with clamped month arithmetic", async ({
  page,
}) => {
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").fill("2025-01-31");
  await page.getByLabel("End date").fill("2025-02-28");
  await calculate(page);

  await expect(daysValue(page)).toHaveText("28 days");
  await expect(breakdownValue(page)).toHaveText("0 years, 1 month, and 0 days");
});

test("adds days and reports the resulting weekday", async ({ page }) => {
  await page.goto("/date-calculator");

  await selectMode(page, "Add or subtract");
  await page.getByLabel("Date", { exact: true }).fill("2026-03-01");
  await page.getByLabel("Amount").fill("30");
  await page.getByLabel("Unit").selectOption("days");
  await calculate(page);

  await expect(dateValue(page)).toHaveText("March 31, 2026");
  await expect(weekdayValue(page)).toHaveText("Tuesday");
  await expect(caption(page)).toHaveText(
    "Result of adding 30 days to March 1, 2026.",
  );
});

test("clamps month and year steps to the last valid day", async ({ page }) => {
  await page.goto("/date-calculator");

  await selectMode(page, "Add or subtract");
  await page.getByLabel("Date", { exact: true }).fill("2026-01-31");
  await page.getByLabel("Amount").fill("1");
  await page.getByLabel("Unit").selectOption("months");
  await calculate(page);

  await expect(dateValue(page)).toHaveText("February 28, 2026");
  await expect(weekdayValue(page)).toHaveText("Saturday");

  await page.getByLabel("Date", { exact: true }).fill("2024-01-31");
  await calculate(page);
  await expect(dateValue(page)).toHaveText("February 29, 2024");
  await expect(weekdayValue(page)).toHaveText("Thursday");

  await page.getByLabel("Date", { exact: true }).fill("2024-02-29");
  await page.getByLabel("Amount").fill("1");
  await page.getByLabel("Unit").selectOption("years");
  await calculate(page);
  await expect(dateValue(page)).toHaveText("February 28, 2025");
});

test("adds weeks as exact day counts", async ({ page }) => {
  await page.goto("/date-calculator");

  await selectMode(page, "Add or subtract");
  await page.getByLabel("Date", { exact: true }).fill("2026-01-01");
  await page.getByLabel("Amount").fill("2");
  await page.getByLabel("Unit").selectOption("weeks");
  await calculate(page);

  await expect(dateValue(page)).toHaveText("January 15, 2026");
});

test("subtracts with the same month-end clamping", async ({ page }) => {
  await page.goto("/date-calculator");

  await selectMode(page, "Add or subtract");
  await page.getByLabel("Date", { exact: true }).fill("2026-03-31");
  await page.getByLabel("Amount").fill("-1");
  await page.getByLabel("Unit").selectOption("months");
  await calculate(page);

  await expect(dateValue(page)).toHaveText("February 28, 2026");
  await expect(weekdayValue(page)).toHaveText("Saturday");
  await expect(caption(page)).toHaveText(
    "Result of subtracting 1 month from March 31, 2026.",
  );

  await page.getByLabel("Date", { exact: true }).fill("2024-03-31");
  await calculate(page);
  await expect(dateValue(page)).toHaveText("February 29, 2024");

  await page.getByLabel("Date", { exact: true }).fill("2026-03-01");
  await page.getByLabel("Amount").fill("-3");
  await page.getByLabel("Unit").selectOption("days");
  await calculate(page);
  await expect(dateValue(page)).toHaveText("February 26, 2026");
  await expect(weekdayValue(page)).toHaveText("Thursday");
  await expect(caption(page)).toHaveText(
    "Result of subtracting 3 days from March 1, 2026.",
  );
});

test("validates empty dates and invalid amounts inline", async ({ page }) => {
  await page.goto("/date-calculator");

  await calculate(page);
  await expect(page.locator("[data-error-text-start]")).toHaveText(
    "Enter a start date.",
  );
  await expect(page.locator("[data-error-text-end]")).toHaveText(
    "Enter an end date.",
  );
  await expect(page.getByLabel("Start date")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await selectMode(page, "Add or subtract");
  await calculate(page);
  await expect(page.locator("[data-error-text-date]")).toHaveText(
    "Enter a date.",
  );
  await expect(page.locator("[data-error-text-amount]")).toHaveText(
    "Enter a whole number.",
  );

  await page.getByLabel("Date", { exact: true }).fill("2026-03-01");
  await page.getByLabel("Amount").fill("1.5");
  await calculate(page);
  await expect(page.locator("[data-error-text-amount]")).toHaveText(
    "Enter a whole number.",
  );
  await expect(dateValue(page)).toHaveText("—");
});

test("switching modes swaps the fields and resets the result", async ({
  page,
}) => {
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").fill("2026-03-01");
  await page.getByLabel("End date").fill("2026-03-15");
  await calculate(page);
  await expect(daysValue(page)).toHaveText("14 days");

  await selectMode(page, "Add or subtract");
  await expect(page.getByLabel("Date", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Start date")).toBeHidden();
  await expect(page.getByLabel("End date")).toBeHidden();
  await expect(dateValue(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy(page)).toBeDisabled();

  await selectMode(page, "Difference");
  await expect(page.getByLabel("Start date")).toBeVisible();
  await expect(daysValue(page)).toHaveText("—");
});

test("copies the result with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").fill("2026-03-01");
  await page.getByLabel("End date").fill("2026-03-15");
  await calculate(page);
  await copy(page).click();

  const success = page.locator("[data-copy-status-success]");
  await expect(success).toBeVisible();
  await expect(success).toContainText("Copied to clipboard.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "14 days between March 1, 2026 and March 15, 2026.\n" +
      "Years, months, days: 0 years, 0 months, and 14 days",
  );
});

test("shows the design-system focus ring and 44px targets", async ({
  page,
  browserName,
}) => {
  await page.goto("/date-calculator");

  await page.getByLabel("Start date").focus();
  await ring(page.getByLabel("Start date"));

  await selectMode(page, "Add or subtract");
  await page.getByLabel("Amount").focus();
  await ring(page.getByLabel("Amount"));

  for (const name of ["Calculate", "Reset"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    if (!box) throw new Error(`${name} button is not visible`);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  /* Cycle through Reset with the keyboard so :focus-visible applies. */
  await page.getByRole("button", { name: "Calculate" }).focus();
  await pressTab(page, browserName);
  await pressTab(page, browserName, { shift: true });
  await ring(page.getByRole("button", { name: "Calculate" }));
});

test("the Spanish page is localized and computes", async ({ page }) => {
  await page.goto("/es/date-calculator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de fechas",
  );
  await expect(page.getByLabel("Fecha de inicio")).toBeVisible();

  await page.getByLabel("Fecha de inicio").fill("2026-01-01");
  await page.getByLabel("Fecha de fin").fill("2026-03-01");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(daysValue(page)).toHaveText("59 días");
  await expect(breakdownValue(page)).toHaveText("0 años, 2 meses y 0 días");
  await expect(caption(page)).toHaveText(
    "De 1 de enero de 2026 a 1 de marzo de 2026.",
  );

  await selectMode(page, "Sumar o restar");
  await page.getByLabel("Fecha", { exact: true }).fill("2026-01-31");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Unidad").selectOption("months");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(dateValue(page)).toHaveText("28 de febrero de 2026");
  await expect(weekdayValue(page)).toHaveText("sábado");
  await expect(caption(page)).toHaveText(
    "Resultado de sumar 1 mes a 31 de enero de 2026.",
  );

  await page.getByLabel("Fecha", { exact: true }).fill("2026-03-31");
  await page.getByLabel("Cantidad").fill("-1");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(dateValue(page)).toHaveText("28 de febrero de 2026");
  await expect(caption(page)).toHaveText(
    "Resultado de restar 1 mes a 31 de marzo de 2026.",
  );

  await page.screenshot({
    path: "test-results/date-calculator-es.png",
    fullPage: true,
  });
});

test("keeps layout at 320px in both locales", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ["/date-calculator", "/es/date-calculator"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }
});
