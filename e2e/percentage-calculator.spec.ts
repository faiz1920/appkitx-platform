import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const resultValue = (page: Page) => page.locator("[data-result-value]");
const resultCaption = (page: Page) => page.locator("[data-result-caption]");
const formula = (page: Page) => page.locator("[data-formula]");

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

const selectMode = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

test("loads with the correct title, heading, and breadcrumb", async ({
  page,
}) => {
  await page.goto("/percentage-calculator");

  await expect(page).toHaveTitle("Percentage Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Percentage Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Percentage Calculator")).toBeVisible();
});

test("computes X% of Y with a substituted formula", async ({ page }) => {
  await page.goto("/percentage-calculator");

  await page.getByLabel("Percentage (X%)").fill("25");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("20");
  await expect(resultCaption(page)).toHaveText("25% of 80.");
  await expect(formula(page)).toHaveText("(25 ÷ 100) × 80 = 20");

  await page.screenshot({
    path: "test-results/percentage-calculator.png",
    fullPage: true,
  });
});

test("computes what percent one number is of another", async ({ page }) => {
  await page.goto("/percentage-calculator");

  await selectMode(page, "What %");
  await page.getByLabel("Part (X)").fill("20");
  await page.getByLabel("Whole (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("25%");
  await expect(formula(page)).toHaveText("(20 ÷ 80) × 100 = 25");
});

test("computes percentage increase, decrease, and no change", async ({
  page,
}) => {
  await page.goto("/percentage-calculator");

  await selectMode(page, "% change");
  const from = page.getByLabel("From (original value)");
  const to = page.getByLabel("To (new value)");
  const calculate = page.getByRole("button", { name: "Calculate" });

  await from.fill("80");
  await to.fill("100");
  await calculate.click();
  await expect(resultValue(page)).toHaveText("25% increase");

  await from.fill("100");
  await to.fill("80");
  await calculate.click();
  await expect(resultValue(page)).toHaveText("20% decrease");

  await from.fill("80");
  await calculate.click();
  await expect(resultValue(page)).toHaveText("0%");
  await expect(resultCaption(page)).toHaveText("No change from 80 to 80.");
});

test("explains undefined baselines for division by zero and percent change", async ({
  page,
}) => {
  await page.goto("/percentage-calculator");

  await selectMode(page, "What %");
  await page.getByLabel("Part (X)").fill("20");
  await page.getByLabel("Whole (Y)").fill("0");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("Undefined");
  await expect(resultCaption(page)).toHaveText(
    "Can't divide by 0 — the whole must not be zero.",
  );

  await selectMode(page, "% change");
  await page.getByLabel("From (original value)").fill("0");
  await page.getByLabel("To (new value)").fill("50");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("Undefined");
  await expect(resultCaption(page)).toHaveText(
    "Can't compute a percentage change from 0 — the original value must not be zero.",
  );

  await page.getByLabel("From (original value)").fill("-50");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("Undefined");
  await expect(resultCaption(page)).toHaveText(
    "Percentage change is undefined for a negative original value — use a positive starting value.",
  );

  await page.getByLabel("From (original value)").fill("25");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(resultValue(page)).toHaveText("100% increase");
});

test("shows inline validation for empty or invalid inputs", async ({
  page,
}) => {
  await page.goto("/percentage-calculator");

  const inputA = page.getByLabel("Percentage (X%)");
  const inputB = page.getByLabel("Value (Y)");

  await inputA.fill("25");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(inputB).toHaveAttribute("aria-invalid", "true");
  await expect(inputA).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid number.")).toBeVisible();

  await inputB.fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(inputB).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid number.")).toBeHidden();
  await expect(resultValue(page)).toHaveText("20");
});

test("rejects ambiguous separators with the localized format error", async ({
  page,
}) => {
  await page.goto("/percentage-calculator");

  const inputA = page.getByLabel("Percentage (X%)");
  await inputA.fill("1,23,456");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();

  await expect(inputA).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText(
      "Check the number format: use one decimal separator, for example 19.99.",
    ),
  ).toBeVisible();
  await expect(resultValue(page)).toHaveText("—");
});

test("resets inputs, result, and mode", async ({ page }) => {
  await page.goto("/percentage-calculator");

  await selectMode(page, "% change");
  await page.getByLabel("From (original value)").fill("80");
  await page.getByLabel("To (new value)").fill("100");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(resultValue(page)).toHaveText("25% increase");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByRole("radio", { name: "X% of Y" })).toBeChecked();
  await expect(page.getByLabel("Percentage (X%)")).toHaveValue("");
  await expect(page.getByLabel("Value (Y)")).toHaveValue("");
  await expect(resultValue(page)).toHaveText("—");
  await expect(resultCaption(page)).toHaveText("Results appear here");
  await expect(formula(page)).toHaveText("(X ÷ 100) × Y");
});

test("is fully operable from the keyboard", async ({ page, browserName }) => {
  await page.goto("/percentage-calculator");

  const firstRadio = page.getByRole("radio", { name: "X% of Y" });
  await firstRadio.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "What %" })).toBeChecked();

  await tabTo(page, browserName, page.getByLabel("Part (X)"));
  await page.keyboard.type("20");
  await tabTo(page, browserName, page.getByLabel("Whole (Y)"));
  await page.keyboard.type("80");
  await page.keyboard.press("Enter");

  await expect(resultValue(page)).toHaveText("25%");
});

test("shows the design-system focus ring on interactive controls", async ({
  page,
  browserName,
}) => {
  await page.goto("/percentage-calculator");

  const label = page.locator(".segmented label").first();
  await tabTo(page, browserName, page.getByRole("radio", { name: "X% of Y" }));
  await ring(label);

  await tabTo(page, browserName, page.getByLabel("Percentage (X%)"));
  await ring(page.getByLabel("Percentage (X%)"));

  const calculate = page.getByRole("button", { name: "Calculate" });
  await tabTo(page, browserName, calculate);
  await ring(calculate);
});

test("copies the result with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/percentage-calculator");

  const copy = page.getByRole("button", { name: "Copy result" });
  const success = page.locator("[data-copy-status-success]");
  const failure = page.locator("[data-copy-status-error]");

  await expect(copy).toBeDisabled();
  await expect(page.locator("[data-copy-done]")).toBeHidden();

  await page.getByLabel("Percentage (X%)").fill("25");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(copy).toBeEnabled();

  await copy.click();
  await copy.click(); // rapid repeat must stay safe

  await expect(success).toBeVisible();
  await expect(success).toContainText("Copied to clipboard.");
  await expect(page.locator("[data-copy-done]")).toBeVisible();
  await expect(failure).toBeHidden();
  await expect(resultCaption(page)).toHaveText("25% of 80.");

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("20");
});

test("reports a copy failure when the Clipboard API is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/percentage-calculator");

  await page.getByLabel("Percentage (X%)").fill("25");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();
  await page.getByRole("button", { name: "Copy result" }).click();

  const failure = page.locator("[data-copy-status-error]");
  await expect(failure).toBeVisible();
  await expect(failure).toContainText(
    "Copy failed — select the result text and copy it manually.",
  );
  await expect(page.locator("[data-copy-status-success]")).toBeHidden();
  await expect(page.locator("[data-copy-done]")).toBeHidden();
});

test("reports a copy failure when the clipboard write is rejected", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("permission denied")),
      },
      configurable: true,
    });
  });
  await page.goto("/percentage-calculator");

  await page.getByLabel("Percentage (X%)").fill("25");
  await page.getByLabel("Value (Y)").fill("80");
  await page.getByRole("button", { name: "Calculate" }).click();
  await page.getByRole("button", { name: "Copy result" }).click();

  const failure = page.locator("[data-copy-status-error]");
  await expect(failure).toBeVisible();
  await expect(page.locator("[data-copy-status-success]")).toBeHidden();

  await page.getByLabel("Value (Y)").fill("40");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(failure).toBeHidden();
});

test("has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/percentage-calculator");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  for (const name of ["X% of Y", "What %", "% change"]) {
    await expect(page.getByRole("radio", { name })).toBeAttached();
  }
  await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
});
