import { expect, test, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const finalPrice = (page: Page) => page.locator("[data-final-price]");
const savings = (page: Page) => page.locator("[data-savings]");
const resultCaption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");

const calculate = async (page: Page, price: string, percent: string) => {
  await page.getByLabel("Original price").fill(price);
  await page.getByLabel("Discount percentage (%)").fill(percent);
  await page.getByRole("button", { name: "Calculate" }).click();
};

test("loads with the correct title, heading, and breadcrumb", async ({
  page,
}) => {
  await page.goto("/discount-calculator");

  await expect(page).toHaveTitle("Discount Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Discount Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Discount Calculator")).toBeVisible();
});

test("computes the savings and final price with a substituted formula", async ({
  page,
}) => {
  await page.goto("/discount-calculator");
  await calculate(page, "100", "20");

  await expect(finalPrice(page)).toHaveText("80");
  await expect(savings(page)).toHaveText("20");
  await expect(resultCaption(page)).toHaveText("20% off 100.");
  await expect(formula(page)).toHaveText(
    "discount = (100 × 20) ÷ 100 = 20 · final = 100 − 20 = 80",
  );

  await page.screenshot({
    path: "test-results/discount-calculator.png",
    fullPage: true,
  });
});

test("handles decimal prices and percentages", async ({ page }) => {
  await page.goto("/discount-calculator");
  await calculate(page, "19.99", "15");

  await expect(finalPrice(page)).toHaveText("16.99");
  await expect(savings(page)).toHaveText("3");
  await expect(formula(page)).toHaveText(
    "discount = (19.99 × 15) ÷ 100 = 3 · final = 19.99 − 3 = 16.99",
  );
});

test("parses grouped English input without changing the result", async ({
  page,
}) => {
  await page.goto("/discount-calculator");
  await calculate(page, "1,234.56", "10");

  await expect(finalPrice(page)).toHaveText("1,111.1");
  await expect(savings(page)).toHaveText("123.46");
});

test("handles zero price, zero discount, and a full discount", async ({
  page,
}) => {
  await page.goto("/discount-calculator");

  await calculate(page, "100", "0");
  await expect(finalPrice(page)).toHaveText("100");
  await expect(savings(page)).toHaveText("0");

  await calculate(page, "100", "100");
  await expect(finalPrice(page)).toHaveText("0");
  await expect(savings(page)).toHaveText("100");

  await calculate(page, "0", "25");
  await expect(finalPrice(page)).toHaveText("0");
  await expect(savings(page)).toHaveText("0");
});

test("validates inputs accessibly without clamping", async ({ page }) => {
  await page.goto("/discount-calculator");

  const price = page.getByLabel("Original price");
  const percent = page.getByLabel("Discount percentage (%)");
  const errorPrice = page.locator("[data-error-text-price]");
  const errorPercent = page.locator("[data-error-text-percent]");

  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(price).toHaveAttribute("aria-invalid", "true");
  await expect(percent).toHaveAttribute("aria-invalid", "true");
  await expect(errorPrice).toHaveText("Enter a valid number.");
  await expect(errorPercent).toHaveText("Enter a valid number.");

  await price.fill("-5");
  await percent.fill("150");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(errorPrice).toHaveText("Enter a price of 0 or more.");
  await expect(errorPercent).toHaveText("Enter a discount between 0 and 100.");

  await price.fill("80");
  await percent.fill("25");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(price).not.toHaveAttribute("aria-invalid", "true");
  await expect(percent).not.toHaveAttribute("aria-invalid", "true");
  await expect(finalPrice(page)).toHaveText("60");
});

test("rejects ambiguous separators with the localized format error", async ({
  page,
}) => {
  await page.goto("/discount-calculator");

  await page.getByLabel("Original price").fill("1,23,456");
  await page.getByLabel("Discount percentage (%)").fill("15");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(page.getByLabel("Original price")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("[data-error-text-price]")).toHaveText(
    "Check the number format: use one decimal separator, for example 19.99.",
  );
  await expect(finalPrice(page)).toHaveText("—");
});

test("resets inputs and results", async ({ page }) => {
  await page.goto("/discount-calculator");
  await calculate(page, "100", "20");
  await expect(finalPrice(page)).toHaveText("80");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel("Original price")).toHaveValue("");
  await expect(page.getByLabel("Discount percentage (%)")).toHaveValue("");
  await expect(finalPrice(page)).toHaveText("—");
  await expect(savings(page)).toHaveText("—");
  await expect(resultCaption(page)).toHaveText("Results appear here");
  await expect(formula(page)).toHaveText(
    "discount = (price × percent) ÷ 100 · final = price − discount",
  );
});

test("is fully operable from the keyboard", async ({ page, browserName }) => {
  await page.goto("/discount-calculator");

  await tabTo(page, browserName, page.getByLabel("Original price"));
  await page.keyboard.type("100");
  await tabTo(page, browserName, page.getByLabel("Discount percentage (%)"));
  await page.keyboard.type("20");
  await page.keyboard.press("Enter");

  await expect(finalPrice(page)).toHaveText("80");
});

test("shows the design-system focus ring on interactive controls", async ({
  page,
  browserName,
}) => {
  await page.goto("/discount-calculator");

  await tabTo(page, browserName, page.getByLabel("Original price"));
  const price = page.getByLabel("Original price");
  await expect(price).toHaveCSS("outline-width", "2px");
  await expect(price).toHaveCSS("outline-style", "solid");
  await expect(price).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(price).toHaveCSS("outline-offset", "2px");

  const calculateButton = page.getByRole("button", { name: "Calculate" });
  await tabTo(page, browserName, calculateButton);
  await expect(calculateButton).toHaveCSS("outline-width", "2px");
  await expect(calculateButton).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(calculateButton).toHaveCSS("outline-offset", "2px");
});

test("copies both results with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/discount-calculator");

  const copy = page.getByRole("button", { name: "Copy result" });
  await expect(copy).toBeDisabled();

  await calculate(page, "100", "20");
  await expect(copy).toBeEnabled();

  await copy.click();

  await expect(page.locator("[data-copy-status-success]")).toBeVisible();
  await expect(page.locator("[data-copy-status-success]")).toContainText(
    "Copied to clipboard.",
  );
  await expect(resultCaption(page)).toHaveText("20% off 100.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.replace(/\r\n/g, "\n")).toBe("Final price: 80\nYou save: 20");
});

test("links between both calculators through related tools", async ({
  page,
}) => {
  await page.goto("/discount-calculator");

  const related = page.locator("section").filter({ hasText: "Related tools" });
  await expect(
    related.getByRole("heading", { name: "Related tools" }),
  ).toBeVisible();
  const toPercentage = related.getByRole("link", {
    name: /Percentage Calculator/,
  });
  await expect(toPercentage).toHaveAttribute("href", "/percentage-calculator/");

  await toPercentage.click();
  await expect(page).toHaveURL(/\/percentage-calculator\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Percentage Calculator",
  );

  const back = page.locator("section").filter({ hasText: "Related tools" });
  const toDiscount = back.getByRole("link", { name: /Discount Calculator/ });
  await expect(toDiscount).toHaveAttribute("href", "/discount-calculator/");
  await toDiscount.click();
  await expect(page).toHaveURL(/\/discount-calculator\/$/);
});

test("is linked from the homepage and the footer", async ({ page }) => {
  await page.goto("/");

  const card = page
    .locator("#tools")
    .getByRole("link")
    .filter({ hasText: "Discount Calculator" });
  await expect(card).toHaveAttribute("href", "/discount-calculator/");

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Discount Calculator" });
  await expect(footerLink).toHaveAttribute("href", "/discount-calculator/");

  await card.click();
  await expect(page).toHaveURL(/\/discount-calculator\/$/);
});

test("has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/discount-calculator");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await expect(page.getByLabel("Original price")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
});
