import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";

const expression = (page: Page) =>
  page.getByLabel("Expression", { exact: true });
const result = (page: Page) => page.locator("[data-result]");
const resultCaption = (page: Page) => page.locator("[data-result-caption]");
const copy = (page: Page) => page.getByRole("button", { name: "Copy result" });
const historyItems = (page: Page) => page.locator("[data-history] li");
const historyEmpty = (page: Page) => page.locator("[data-history-empty]");
const error = (page: Page) => page.locator("[data-error]");
const errorText = (page: Page) => page.locator("[data-error-text]");

const calculate = (page: Page, name = "Equals") =>
  page.getByRole("button", { name, exact: true }).click();

const selectAngle = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name, exact: true })).toBeChecked();
};

const useResult = (page: Page, index = 0) =>
  page.getByRole("button", { name: /^Use result:/ }).nth(index);

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the correct title, heading, angle mode, and empty state", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expect(page).toHaveTitle("Scientific Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Scientific Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    "Scientific Calculator",
  );

  await expect(page.getByRole("radio", { name: "Degrees" })).toBeChecked();
  await expect(expression(page)).toBeVisible();
  await expect(expression(page)).toHaveAttribute(
    "aria-describedby",
    "scientific-hint-expression scientific-error-expression",
  );
  await expect(result(page)).toHaveText("—");
  await expect(resultCaption(page)).toHaveText("Results appear here");
  await expect(copy(page)).toBeDisabled();
  await expect(historyEmpty(page)).toBeVisible();
  await expect(historyItems(page)).toHaveCount(0);

  await page.screenshot({
    path: "test-results/scientific-calculator-en.png",
    fullPage: true,
  });
});

test("evaluates precedence, parentheses, powers, and percentages", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expression(page).fill("2+3*4");
  await expression(page).press("Enter");
  await expect(result(page)).toHaveText("14");
  await expect(resultCaption(page)).toHaveText("2+3*4 = 14");

  await expression(page).fill("(2+3)*4");
  await calculate(page);
  await expect(result(page)).toHaveText("20");

  await expression(page).fill("2^3^2");
  await calculate(page);
  await expect(result(page)).toHaveText("512");

  await expression(page).fill("-2^2");
  await calculate(page);
  await expect(result(page)).toHaveText("-4");

  await expression(page).fill("50%");
  await calculate(page);
  await expect(result(page)).toHaveText("0.5");
});

test("evaluates scientific operations from the expression and keypad", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expression(page).fill("sqrt(81)");
  await calculate(page);
  await expect(result(page)).toHaveText("9");

  await expression(page).fill("root(3, 27)");
  await calculate(page);
  await expect(result(page)).toHaveText("3");

  await expression(page).fill("5!");
  await calculate(page);
  await expect(result(page)).toHaveText("120");

  await expression(page).fill("ln(e)");
  await calculate(page);
  await expect(result(page)).toHaveText("1");

  await expression(page).fill("cos(90)");
  await calculate(page);
  await expect(result(page)).toHaveText("0");

  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "7", exact: true }).click();
  await page.getByRole("button", { name: "Square", exact: true }).click();
  await calculate(page);
  await expect(expression(page)).toHaveValue("7^2");
  await expect(result(page)).toHaveText("49");

  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "Nth root", exact: true }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "Comma", exact: true }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.getByRole("button", { name: "7", exact: true }).click();
  await page
    .getByRole("button", { name: "Close parenthesis", exact: true })
    .click();
  await calculate(page);
  await expect(expression(page)).toHaveValue("root(3,27)");
  await expect(result(page)).toHaveText("3");
});

test("switches angle mode and applies it to direct and inverse functions", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expression(page).fill("sin(90)");
  await calculate(page);
  await expect(result(page)).toHaveText("1");

  await selectAngle(page, "Radians");
  await expect(result(page)).toHaveText("—");

  await expression(page).fill("sin(pi/2)");
  await calculate(page);
  await expect(result(page)).toHaveText("1");

  await expression(page).fill("asin(0.5)");
  await calculate(page);
  await expect(result(page)).toHaveText("0.523598775598");

  await selectAngle(page, "Degrees");
  await expression(page).fill("asin(0.5)");
  await calculate(page);
  await expect(result(page)).toHaveText("30");
});

test("supports keyboard entry, Escape clearing, and focus rings", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expression(page).focus();
  await ring(expression(page));
  await expression(page).fill("");
  await page.keyboard.type("sin(30)+2^3");
  await page.keyboard.press("Enter");
  await expect(result(page)).toHaveText("8.5");

  await page.keyboard.press("Escape");
  await expect(expression(page)).toHaveValue("");
  await expect(result(page)).toHaveText("—");
  await expect(expression(page)).toBeFocused();
});

test("keeps session history and reuses expressions and results", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expression(page).fill("2+3");
  await calculate(page);
  await expression(page).fill("4*5");
  await calculate(page);

  await expect(historyItems(page)).toHaveCount(2);
  await expect(historyEmpty(page)).toBeHidden();
  await expect(historyItems(page).nth(0)).toContainText("4*5");
  await expect(historyItems(page).nth(0)).toContainText("20");

  await page
    .getByRole("button", { name: /^Use expression:/ })
    .first()
    .click();
  await expect(expression(page)).toHaveValue("4*5");

  await useResult(page).click();
  await expect(expression(page)).toHaveValue("20");
  await expression(page).press("End");
  await page.keyboard.type("+1");
  await expression(page).press("Enter");
  await expect(result(page)).toHaveText("21");
  await expect(historyItems(page)).toHaveCount(3);
});

test("copies the result with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/scientific-calculator");

  await expression(page).fill("1/8");
  await calculate(page);
  await expect(copy(page)).toBeEnabled();
  await copy(page).click();

  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("0.125");
});

test("shows accessible errors, adds no history, and recovers", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await calculate(page);
  await expect(error(page)).toHaveAttribute("role", "alert");
  await expect(errorText(page)).toHaveText("Enter an expression.");
  await expect(expression(page)).toHaveAttribute("aria-invalid", "true");
  await expect(result(page)).toHaveText("—");

  await expression(page).fill("1/0");
  await calculate(page);
  await expect(errorText(page)).toHaveText("Division by zero is undefined.");

  await expression(page).fill("171!");
  await calculate(page);
  await expect(errorText(page)).toHaveText(
    "Factorial is defined only for whole numbers from 0 to 170.",
  );

  await expression(page).fill("10^400");
  await calculate(page);
  await expect(errorText(page)).toHaveText(
    "The result is outside the supported numeric range.",
  );

  await expression(page).fill("tan(90)");
  await calculate(page);
  await expect(errorText(page)).toHaveText(
    "This operation is undefined for those values.",
  );

  await expression(page).fill("2+");
  await calculate(page);
  await expect(errorText(page)).toHaveText(
    "Check the expression and try again.",
  );
  await expect(historyItems(page)).toHaveCount(0);

  await expression(page).fill("2+2");
  await expect(error(page)).toBeHidden();
  await calculate(page);
  await expect(result(page)).toHaveText("4");
  await expect(error(page)).toBeHidden();
  await expect(expression(page)).not.toHaveAttribute("aria-invalid", "true");
});

test("exposes canonical, breadcrumb, and WebApplication structured data", async ({
  page,
}) => {
  await page.goto("/scientific-calculator");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/scientific-calculator/",
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
      { name: "Scientific Calculator" },
    ],
  });
  expect(
    documents.find((document) => document["@type"] === "WebApplication"),
  ).toMatchObject({
    name: "Scientific Calculator",
    url: "https://appkitx.com/scientific-calculator/",
    inLanguage: "en",
  });

  await expect(
    page.getByRole("main").getByRole("link", { name: /Percentage Calculator/ }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(page.getByRole("link", { name: "See all" })).toHaveAttribute(
    "href",
    "/calculators/",
  );
});

test("the Spanish page is localized and calculates", async ({ page }) => {
  await page.goto("/es/scientific-calculator");

  await expect(page).toHaveTitle("Calculadora científica — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora científica",
  );
  await expect(page.getByRole("radio", { name: "Grados" })).toBeChecked();
  await expect(page.getByLabel("Expresión", { exact: true })).toBeVisible();

  await page.getByLabel("Expresión", { exact: true }).fill("2+3*4");
  await page.getByRole("button", { name: "Igual", exact: true }).click();
  await expect(result(page)).toHaveText("14");
  await expect(resultCaption(page)).toHaveText("2+3*4 = 14");

  await page.getByLabel("Expresión", { exact: true }).fill("1/0");
  await page.getByRole("button", { name: "Igual", exact: true }).click();
  await expect(errorText(page)).toHaveText(
    "La división por cero no está definida.",
  );
  await expect(
    page.getByRole("button", { name: "Copiar resultado" }),
  ).toBeDisabled();

  await page.screenshot({
    path: "test-results/scientific-calculator-es.png",
    fullPage: true,
  });
});

test("keeps the keypad and history usable at 320px in both locales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of [
    "/scientific-calculator/",
    "/es/scientific-calculator/",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    const keys = page.locator("[data-function-key]");
    const keyCount = await keys.count();
    expect(keyCount).toBeGreaterThan(20);
    for (let index = 0; index < keyCount; index += 1) {
      const box = await keys.nth(index).boundingBox();
      expect(box).not.toBeNull();
      if (box === null) throw new Error("Key has no box");
      expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
      expect(Math.round(box.width)).toBeGreaterThanOrEqual(44);
    }

    const field = page.getByLabel(
      path.startsWith("/es") ? "Expresión" : "Expression",
      { exact: true },
    );
    await field.fill("2+2");
    await field.press("Enter");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  }
});
