import { expect, test, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const monthly = (page: Page) => page.locator("[data-monthly]");
const interest = (page: Page) => page.locator("[data-interest]");
const total = (page: Page) => page.locator("[data-total]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");

const calculate = async (
  page: Page,
  amount: string,
  rate: string,
  term: string,
) => {
  await page.getByLabel("Loan amount").fill(amount);
  await page.getByLabel("Annual interest rate (%)").fill(rate);
  await page.getByLabel("Loan term", { exact: true }).fill(term);
  await page.getByRole("button", { name: "Calculate" }).click();
};

test("loads with the correct title, heading, and default term unit", async ({
  page,
}) => {
  await page.goto("/loan-calculator");

  await expect(page).toHaveTitle("Loan Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Loan Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Loan Calculator")).toBeVisible();

  await expect(page.getByLabel("Term unit")).toHaveValue("years");
  await expect(monthly(page)).toHaveText("—");
});

test("computes the monthly payment, interest, and total", async ({ page }) => {
  await page.goto("/loan-calculator");
  await calculate(page, "100000", "6", "30");

  await expect(monthly(page)).toHaveText("599.55");
  await expect(interest(page)).toHaveText("115,838.19");
  await expect(total(page)).toHaveText("215,838.19");
  await expect(caption(page)).toHaveText("100,000.00 at 6% over 360 months.");
  await expect(formula(page)).toHaveText("6% ÷ 12 = 0.5% per month");

  await page.screenshot({
    path: "test-results/loan-calculator.png",
    fullPage: true,
  });
});

test("supports a term entered in months", async ({ page }) => {
  await page.goto("/loan-calculator");
  await page.getByLabel("Term unit").selectOption("months");
  await calculate(page, "12000", "0", "12");

  await expect(monthly(page)).toHaveText("1,000.00");
  await expect(interest(page)).toHaveText("0.00");
  await expect(total(page)).toHaveText("12,000.00");
  await expect(caption(page)).toHaveText("12,000.00 at 0% over 12 months.");
  await expect(formula(page)).toHaveText("0% ÷ 12 = 0% per month");
});

test("validates every field accessibly without clamping", async ({ page }) => {
  await page.goto("/loan-calculator");

  const amount = page.getByLabel("Loan amount");
  const rate = page.getByLabel("Annual interest rate (%)");
  const term = page.getByLabel("Loan term", { exact: true });
  const errorAmount = page.locator("[data-error-text-amount]");
  const errorRate = page.locator("[data-error-text-rate]");
  const errorTerm = page.locator("[data-error-text-term]");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(amount).toHaveAttribute("aria-invalid", "true");
  await expect(rate).toHaveAttribute("aria-invalid", "true");
  await expect(term).toHaveAttribute("aria-invalid", "true");
  await expect(errorAmount).toHaveText("Enter a valid number.");
  await expect(errorRate).toHaveText("Enter a valid number.");
  await expect(errorTerm).toHaveText("Enter a valid number.");

  await amount.fill("-5");
  await rate.fill("-1");
  await term.fill("0");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(errorAmount).toHaveText(
    "Enter a loan amount greater than zero.",
  );
  await expect(errorRate).toHaveText("Enter an interest rate of 0 or more.");
  await expect(errorTerm).toHaveText(
    "Enter a term between 1 month and 1,200 months (100 years).",
  );

  await amount.fill("50000");
  await rate.fill("7.5");
  await term.fill("101");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(errorTerm).toHaveText(
    "Enter a term between 1 month and 1,200 months (100 years).",
  );
  await expect(monthly(page)).toHaveText("—");
});

test("rejects ambiguous separators with the localized format error", async ({
  page,
}) => {
  await page.goto("/loan-calculator");

  await page.getByLabel("Loan amount").fill("1,23,456");
  await page.getByLabel("Annual interest rate (%)").fill("6");
  await page.getByLabel("Loan term", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.getByLabel("Loan amount")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("[data-error-text-amount]")).toHaveText(
    "Check the number format: use one decimal separator, for example 19.99.",
  );
});

test("resets inputs and results", async ({ page }) => {
  await page.goto("/loan-calculator");
  await calculate(page, "100000", "6", "30");
  await expect(monthly(page)).toHaveText("599.55");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel("Loan amount")).toHaveValue("");
  await expect(page.getByLabel("Term unit")).toHaveValue("years");
  await expect(monthly(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(formula(page)).toHaveText(
    "EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)",
  );
});

test("is fully operable from the keyboard", async ({ page, browserName }) => {
  await page.goto("/loan-calculator");

  await tabTo(page, browserName, page.getByLabel("Loan amount"));
  await page.keyboard.type("100000");
  await tabTo(page, browserName, page.getByLabel("Annual interest rate (%)"));
  await page.keyboard.type("6");
  await tabTo(page, browserName, page.getByLabel("Loan term", { exact: true }));
  await page.keyboard.type("30");
  await page.keyboard.press("Enter");

  await expect(monthly(page)).toHaveText("599.55");
});

test("shows the design-system focus ring on interactive controls", async ({
  page,
  browserName,
}) => {
  await page.goto("/loan-calculator");

  const amount = page.getByLabel("Loan amount");
  await tabTo(page, browserName, amount);
  await expect(amount).toHaveCSS("outline-width", "2px");
  await expect(amount).toHaveCSS("outline-style", "solid");
  await expect(amount).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(amount).toHaveCSS("outline-offset", "2px");
});

test("copies all three results with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/loan-calculator");

  const copy = page.getByRole("button", { name: "Copy result" });
  await expect(copy).toBeDisabled();

  await calculate(page, "100000", "6", "30");
  await expect(copy).toBeEnabled();
  await copy.click();

  await expect(page.locator("[data-copy-status-success]")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe(
    "Monthly payment: 599.55\nTotal interest: 115,838.19\nTotal payable: 215,838.19",
  );
});

test("links to the other calculators through related tools", async ({
  page,
}) => {
  await page.goto("/loan-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("link", { name: /EMI Calculator/ }),
  ).toHaveAttribute("href", "/emi-calculator/");
  await expect(
    related.getByRole("link", { name: /Percentage Calculator/ }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(
    related.getByRole("link", { name: /Discount Calculator/ }),
  ).toHaveAttribute("href", "/discount-calculator/");
  await expect(related.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );
});

test("the Spanish page is localized and formats money in Spanish", async ({
  page,
}) => {
  await page.goto("/es/loan-calculator");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de préstamos",
  );

  await page.getByLabel("Importe del préstamo").fill("60000");
  await page.getByLabel("Tipo de interés anual (%)").fill("7.5");
  await page.getByLabel("Plazo del préstamo", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(monthly(page)).toHaveText("1202,28");
  await expect(interest(page)).toHaveText("12.136,61");
  await expect(total(page)).toHaveText("72.136,61");
  await expect(caption(page)).toHaveText(
    "60.000,00 al 7,5 % durante 60 meses.",
  );
});

test("is linked from the homepage and the footer", async ({ page }) => {
  await page.goto("/");

  const card = page
    .locator("#tools")
    .getByRole("link")
    .filter({ hasText: "Loan Calculator" });
  await expect(card).toHaveAttribute("href", "/loan-calculator/");

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Loan Calculator" });
  await expect(footerLink).toHaveAttribute("href", "/loan-calculator/");

  await card.click();
  await expect(page).toHaveURL(/\/loan-calculator\/$/);
});

test("has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/loan-calculator");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await expect(page.getByLabel("Loan amount")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
});
