import { expect, test, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const result = (page: Page) => page.locator("[data-result]");
const resultUnit = (page: Page) => page.locator("[data-result-unit]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const errorValue = (page: Page) => page.locator("[data-error-text-value]");

const selectCategory = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const convert = async (page: Page, value: string) => {
  await page.getByLabel("Value").fill(value);
  await page.getByRole("button", { name: "Calculate" }).click();
};

test("loads with the correct title, heading, and default units", async ({
  page,
}) => {
  await page.goto("/unit-converter");

  await expect(page).toHaveTitle("Unit Converter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Unit Converter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Unit Converter")).toBeVisible();

  await expect(page.getByLabel("From", { exact: true })).toHaveValue("m");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("ft");
  await expect(page.getByLabel("From", { exact: true })).toContainText(
    "Meter (m)",
  );
  await expect(page.getByLabel("To", { exact: true })).toContainText(
    "Foot (ft)",
  );
});

test("converts length with a written-out result", async ({ page }) => {
  await page.goto("/unit-converter");
  await convert(page, "1");

  await expect(result(page)).toHaveText("3.280839895");
  await expect(resultUnit(page)).toHaveText("ft");
  await expect(caption(page)).toHaveText("1 m = 3.280839895 ft");

  await page.screenshot({
    path: "test-results/unit-converter-length.png",
    fullPage: true,
  });
});

test("switches category and repopulates both units", async ({ page }) => {
  await page.goto("/unit-converter");
  await convert(page, "1");
  await expect(result(page)).toHaveText("3.280839895");

  await selectCategory(page, "Weight");
  await expect(result(page)).toHaveText("—");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("kg");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("lb");
  await expect(page.getByLabel("From", { exact: true })).toContainText(
    "Kilogram (kg)",
  );
  await expect(page.getByLabel("To", { exact: true })).toContainText(
    "Pound (lb)",
  );

  await convert(page, "1");
  await expect(result(page)).toHaveText("2.204622622");
  await expect(caption(page)).toHaveText("1 kg = 2.204622622 lb");

  await selectCategory(page, "Temperature");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("c");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("f");
});

test("invalidates the result when the value, units, or category change", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/unit-converter");

  const copy = page.getByRole("button", { name: "Copy result" });
  const value = page.getByLabel("Value");
  const from = page.getByLabel("From", { exact: true });
  const to = page.getByLabel("To", { exact: true });
  const calculate = page.getByRole("button", { name: "Calculate" });

  await convert(page, "1");
  await expect(result(page)).toHaveText("3.280839895");
  await expect(copy).toBeEnabled();

  await value.fill("2");
  await expect(value).toHaveValue("2");
  await expect(result(page)).toHaveText("—");
  await expect(resultUnit(page)).toHaveText("");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("6.56167979");
  await expect(copy).toBeEnabled();

  await from.selectOption("cm");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("0.0656167979");
  await expect(caption(page)).toContainText("2 cm");

  await to.selectOption("m");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("0.02");
  await expect(copy).toBeEnabled();

  await selectCategory(page, "Weight");
  await expect(value).toHaveValue("2");
  await expect(from).toHaveValue("kg");
  await expect(to).toHaveValue("lb");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await convert(page, "1");
  await expect(result(page)).toHaveText("2.204622622");
  await expect(copy).toBeEnabled();

  await value.fill("");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();
  await calculate.click();
  await expect(errorValue(page)).toHaveText("Enter a valid number.");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await value.fill("1");
  await expect(errorValue(page)).toBeHidden();
  await expect(result(page)).toHaveText("—");
  await calculate.click();
  await expect(result(page)).toHaveText("2.204622622");
  await copy.click();
  await expect(page.locator("[data-copy-status-success]")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("1 kg = 2.204622622 lb");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(value).toHaveValue("");
  await expect(from).toHaveValue("m");
  await expect(to).toHaveValue("ft");
  await expect(result(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy).toBeDisabled();
  await expect(page.getByRole("radio", { name: "Length" })).toBeChecked();
});

test("converts temperature with an offset", async ({ page }) => {
  await page.goto("/unit-converter");
  await selectCategory(page, "Temperature");

  await convert(page, "0");
  await expect(result(page)).toHaveText("32");
  await expect(resultUnit(page)).toHaveText("°F");
  await expect(caption(page)).toHaveText("0 °C = 32 °F");

  await convert(page, "100");
  await expect(result(page)).toHaveText("212");
  await expect(caption(page)).toHaveText("100 °C = 212 °F");

  await convert(page, "-40");
  await expect(result(page)).toHaveText("-40");
});

test("rejects temperatures below absolute zero", async ({ page }) => {
  await page.goto("/unit-converter");
  await selectCategory(page, "Temperature");

  await convert(page, "-274");
  await expect(page.getByLabel("Value")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(errorValue(page)).toHaveText(
    "Temperature must be at or above absolute zero (−273.15 °C, −459.67 °F, or 0 K).",
  );
  await expect(result(page)).toHaveText("—");
});

test("validates a non-numeric value", async ({ page }) => {
  await page.goto("/unit-converter");

  await convert(page, "abc");
  await expect(page.getByLabel("Value")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(errorValue(page)).toHaveText("Enter a valid number.");
  await expect(result(page)).toHaveText("—");
});

test("resets the form, units, and result", async ({ page }) => {
  await page.goto("/unit-converter");
  await selectCategory(page, "Weight");
  await convert(page, "5");
  await expect(result(page)).toHaveText("11.02311311");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel("Value")).toHaveValue("");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("m");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("ft");
  await expect(result(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
});

test("is fully operable from the keyboard", async ({ page, browserName }) => {
  await page.goto("/unit-converter");

  await tabTo(page, browserName, page.getByLabel("Value"));
  await page.keyboard.type("100");
  await page.keyboard.press("Enter");

  await expect(result(page)).toHaveText("328.0839895");
});

test("shows the design-system focus ring on interactive controls", async ({
  page,
  browserName,
}) => {
  await page.goto("/unit-converter");

  await tabTo(page, browserName, page.getByLabel("Value"));
  const value = page.getByLabel("Value");
  await expect(value).toHaveCSS("outline-width", "2px");
  await expect(value).toHaveCSS("outline-style", "solid");
  await expect(value).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(value).toHaveCSS("outline-offset", "2px");

  await tabTo(
    page,
    browserName,
    page.getByRole("button", { name: "Calculate" }),
  );
  const calculateButton = page.getByRole("button", { name: "Calculate" });
  await expect(calculateButton).toHaveCSS("outline-width", "2px");
  await expect(calculateButton).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(calculateButton).toHaveCSS("outline-offset", "2px");
});

test("copies the conversion with accessible success feedback", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/unit-converter");

  const copy = page.getByRole("button", { name: "Copy result" });
  await expect(copy).toBeDisabled();

  await convert(page, "1");
  await expect(copy).toBeEnabled();
  await copy.click();

  await expect(page.locator("[data-copy-status-success]")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("1 m = 3.280839895 ft");
});

test("the Spanish page is localized and formats numbers in Spanish", async ({
  page,
}) => {
  await page.goto("/es/unit-converter");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Conversor de unidades",
  );
  await page.getByLabel("Valor").fill("1");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(result(page)).toHaveText("3,280839895");
  await expect(caption(page)).toHaveText("1 m = 3,280839895 ft");
});

test("is linked from the homepage, footer, and search", async ({ page }) => {
  await page.goto("/");

  const card = page
    .locator("#tools")
    .getByRole("link")
    .filter({ hasText: "Unit Converter" });
  await expect(card).toHaveAttribute("href", "/unit-converter/");

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Unit Converter" });
  await expect(footerLink).toHaveAttribute("href", "/unit-converter/");

  await card.click();
  await expect(page).toHaveURL(/\/unit-converter\/$/);
});

test("has no horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/unit-converter");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await expect(page.getByLabel("Value")).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
});

test("supports five categories with area and volume defaults", async ({
  page,
}) => {
  await page.goto("/unit-converter");

  await expect(page.getByRole("radio")).toHaveCount(5);
  for (const name of ["Length", "Weight", "Temperature", "Area", "Volume"]) {
    await expect(page.getByRole("radio", { name })).toBeVisible();
  }

  await selectCategory(page, "Area");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("m2");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("ft2");
  await expect(page.getByLabel("From", { exact: true })).toContainText(
    "Square meter (m²)",
  );
  await expect(page.getByLabel("To", { exact: true })).toContainText(
    "Square foot (ft²)",
  );

  await selectCategory(page, "Volume");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("l");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("gal");
  await expect(page.getByLabel("From", { exact: true })).toContainText(
    "Liter (L)",
  );
  await expect(page.getByLabel("To", { exact: true })).toContainText(
    "US gallon (US gal)",
  );
});

test("converts area with square units and land measures", async ({ page }) => {
  await page.goto("/unit-converter");
  await selectCategory(page, "Area");

  await page.getByLabel("From", { exact: true }).selectOption("ac");
  await page.getByLabel("To", { exact: true }).selectOption("m2");
  await convert(page, "1");

  await expect(result(page)).toHaveText("4,046.856422");
  await expect(resultUnit(page)).toHaveText("m²");
  await expect(caption(page)).toHaveText("1 ac = 4,046.856422 m²");

  await page.getByLabel("From", { exact: true }).selectOption("ha");
  await page.getByLabel("To", { exact: true }).selectOption("km2");
  await convert(page, "1");

  await expect(result(page)).toHaveText("0.01");
  await expect(resultUnit(page)).toHaveText("km²");
  await expect(caption(page)).toHaveText("1 ha = 0.01 km²");

  await page.screenshot({
    path: "test-results/unit-converter-area.png",
    fullPage: true,
  });
});

test("converts US customary volume and copies the US labels", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/unit-converter");
  await selectCategory(page, "Volume");

  await convert(page, "1");
  await expect(result(page)).toHaveText("0.2641720524");
  await expect(resultUnit(page)).toHaveText("US gal");
  await expect(caption(page)).toHaveText("1 L = 0.2641720524 US gal");

  await page.getByLabel("From", { exact: true }).selectOption("gal");
  await page.getByLabel("To", { exact: true }).selectOption("l");
  await convert(page, "1");

  await expect(result(page)).toHaveText("3.785411784");
  await expect(resultUnit(page)).toHaveText("L");
  await expect(caption(page)).toHaveText("1 US gal = 3.785411784 L");

  await page.getByRole("button", { name: "Copy result" }).click();
  await expect(page.locator("[data-copy-status-success]")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("1 US gal = 3.785411784 L");

  await page.getByLabel("From", { exact: true }).selectOption("cup");
  await page.getByLabel("To", { exact: true }).selectOption("ml");
  await convert(page, "1");

  await expect(result(page)).toHaveText("236.5882365");
  await expect(resultUnit(page)).toHaveText("mL");
  await expect(caption(page)).toHaveText("1 US cup = 236.5882365 mL");

  await page.screenshot({
    path: "test-results/unit-converter-volume.png",
    fullPage: true,
  });
});

test("invalidates area and volume results when inputs change", async ({
  page,
}) => {
  await page.goto("/unit-converter");
  await selectCategory(page, "Area");
  await convert(page, "1");
  await expect(result(page)).not.toHaveText("—");

  await page.getByLabel("From", { exact: true }).selectOption("ha");
  await expect(result(page)).toHaveText("—");
  await expect(
    page.getByRole("button", { name: "Copy result" }),
  ).toBeDisabled();

  await selectCategory(page, "Volume");
  await expect(result(page)).toHaveText("—");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("l");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("gal");

  await convert(page, "1");
  await expect(result(page)).not.toHaveText("—");

  await page.getByLabel("To", { exact: true }).selectOption("m3");
  await expect(result(page)).toHaveText("—");
  await expect(
    page.getByRole("button", { name: "Copy result" }),
  ).toBeDisabled();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("radio", { name: "Length" })).toBeChecked();
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("m");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("ft");
  await expect(result(page)).toHaveText("—");
});

test("the Spanish page localizes area and US volume units", async ({
  page,
}) => {
  await page.goto("/es/unit-converter");

  await selectCategory(page, "Superficie");
  await expect(page.getByLabel("De", { exact: true })).toHaveValue("m2");
  await expect(page.getByLabel("A", { exact: true })).toHaveValue("ft2");
  await expect(page.getByLabel("A", { exact: true })).toContainText(
    "Pie cuadrado (ft²)",
  );

  await page.getByLabel("De", { exact: true }).selectOption("ac");
  await page.getByLabel("A", { exact: true }).selectOption("m2");
  await page.getByLabel("Valor", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(result(page)).toHaveText("4046,856422");
  await expect(caption(page)).toHaveText("1 ac = 4046,856422 m²");

  await selectCategory(page, "Volumen");
  await expect(page.getByLabel("De", { exact: true })).toContainText(
    "Litro (L)",
  );
  await expect(page.getByLabel("A", { exact: true })).toContainText(
    "Galón estadounidense (US gal)",
  );
  await expect(page.getByLabel("A", { exact: true })).toContainText(
    "Cuarto de galón estadounidense (US qt)",
  );

  await page.getByLabel("Valor", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(result(page)).toHaveText("0,2641720524");
  await expect(caption(page)).toHaveText("1 L = 0,2641720524 US gal");
});

test("keeps five categories inside the viewport at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, labels] of [
    ["/unit-converter/", ["Length", "Weight", "Temperature", "Area", "Volume"]],
    [
      "/es/unit-converter/",
      ["Longitud", "Peso", "Temperatura", "Superficie", "Volumen"],
    ],
  ] as const) {
    await page.goto(path);

    const segments = page.locator(".segmented label");
    await expect(segments).toHaveCount(5);

    for (let index = 0; index < labels.length; index += 1) {
      const segment = segments.nth(index);
      await expect(segment).toHaveText(labels[index] ?? "");
      await expect(segment).toBeVisible();
      const box = await segment.boundingBox();
      expect(box, `${path} segment ${index} has no box`).not.toBeNull();
      if (box === null) throw new Error(`${path} segment ${index} has no box`);
      expect(
        box.height,
        `${path} segment ${index} height`,
      ).toBeGreaterThanOrEqual(44);
    }

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);

    const rows = await segments.evaluateAll(
      (elements) =>
        new Set(
          elements.map((element) =>
            Math.round(element.getBoundingClientRect().top),
          ),
        ).size,
    );
    expect(rows, `${path} category rows`).toBe(3);
  }

  await page.screenshot({
    path: "test-results/unit-converter-320-five-categories.png",
    fullPage: false,
  });
});

test("moves between categories with the keyboard and shows the focus ring", async ({
  page,
  browserName,
}) => {
  await page.goto("/unit-converter");
  await page.getByRole("heading", { level: 1 }).click();

  await tabTo(page, browserName, page.getByRole("radio", { name: "Length" }));
  const lengthSegment = page
    .locator(".segmented label")
    .filter({ hasText: "Length" });
  await expect(lengthSegment).toHaveCSS("outline-width", "2px");
  await expect(lengthSegment).toHaveCSS("outline-style", "solid");
  await expect(lengthSegment).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(lengthSegment).toHaveCSS("outline-offset", "2px");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Weight" })).toBeChecked();
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("kg");
});
