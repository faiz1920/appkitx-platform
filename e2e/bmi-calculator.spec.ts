import { expect, test, type Locator, type Page } from "@playwright/test";
import { tabTo } from "./keyboard";

/*
 * BMI Calculator: metric and imperial reference values, all four adult
 * categories, unrounded classification at display boundaries, unit switching
 * with conversion/reset feedback, validation, clear, keyboard access,
 * localization, SEO, discovery, privacy, and 320px layout.
 */

const metricWeight = (page: Page) =>
  page.locator('[data-bmi-input="metricWeight"]');
const metricHeight = (page: Page) =>
  page.locator('[data-bmi-input="metricHeight"]');
const imperialWeight = (page: Page) =>
  page.locator('[data-bmi-input="imperialWeight"]');
const imperialFeet = (page: Page) =>
  page.locator('[data-bmi-input="imperialFeet"]');
const imperialInches = (page: Page) =>
  page.locator('[data-bmi-input="imperialInches"]');
const unitNote = (page: Page) => page.locator("[data-unit-note]");
const empty = (page: Page) => page.locator("[data-bmi-empty]");
const result = (page: Page) => page.locator("[data-bmi-result]");
const bmiValue = (page: Page) => page.locator("[data-bmi-value]");
const category = (page: Page) => page.locator("[data-bmi-category]");
const explanation = (page: Page) => page.locator("[data-bmi-explanation]");
const submit = (page: Page) =>
  page.locator("[data-bmi-form] button[type=submit]");
const clear = (page: Page) => page.locator("[data-reset]");
const error = (page: Page, field: string) =>
  page.locator(`[data-error-for="${field}"]`);

const selectSystem = async (page: Page, name: "Metric" | "Imperial") => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const calculateMetric = async (page: Page, weight: string, height: string) => {
  await metricWeight(page).fill(weight);
  await metricHeight(page).fill(height);
  await submit(page).click();
};

const calculateImperial = async (
  page: Page,
  weight: string,
  feet: string,
  inches: string,
) => {
  await imperialWeight(page).fill(weight);
  await imperialFeet(page).fill(feet);
  await imperialInches(page).fill(inches);
  await submit(page).click();
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with metric units, an empty result, and the health disclaimer", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");

  await expect(page).toHaveTitle("BMI Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "BMI Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("BMI Calculator")).toBeVisible();

  await expect(page.getByRole("radio", { name: "Metric" })).toBeChecked();
  await expect(metricWeight(page)).toBeVisible();
  await expect(metricHeight(page)).toBeVisible();
  await expect(imperialWeight(page)).toBeHidden();
  await expect(imperialFeet(page)).toBeHidden();

  await expect(empty(page)).toBeVisible();
  await expect(result(page)).toBeHidden();
  await expect(bmiValue(page)).toHaveText("—");
  await expect(
    page.getByText("BMI is a screening tool, not a diagnosis.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-bmi-segment]")).toHaveCount(4);
});

test("calculates the metric reference value and healthy category", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");
  await calculateMetric(page, "70", "175");

  await expect(result(page)).toBeVisible();
  await expect(empty(page)).toBeHidden();
  await expect(bmiValue(page)).toHaveText("22.9");
  await expect(category(page)).toHaveText("Healthy weight");
  await expect(explanation(page)).toContainText(
    "Within the standard adult screening range.",
  );

  const healthy = page.locator('[data-bmi-segment="healthy"]');
  await expect(healthy).toHaveClass(/bg-accent/);
  for (const name of ["underweight", "overweight", "obesity"]) {
    await expect(page.locator(`[data-bmi-segment="${name}"]`)).toHaveClass(
      /bg-surface-muted/,
    );
  }

  await page.screenshot({
    path: "test-results/bmi-calculator-metric.png",
    fullPage: true,
  });
});

test("shows all four adult categories", async ({ page }) => {
  await page.goto("/bmi-calculator");

  for (const item of [
    { weight: "50", height: "170", value: "17.3", label: "Underweight" },
    { weight: "70", height: "175", value: "22.9", label: "Healthy weight" },
    { weight: "80", height: "170", value: "27.7", label: "Overweight" },
    { weight: "90", height: "170", value: "31.1", label: "Obesity" },
  ]) {
    await calculateMetric(page, item.weight, item.height);
    await expect(bmiValue(page)).toHaveText(item.value);
    await expect(category(page)).toHaveText(item.label);
  }
});

test("classifies from the unrounded BMI at display boundaries", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");

  await calculateMetric(page, "72.14", "170");
  await expect(bmiValue(page)).toHaveText("25.0");
  await expect(category(page)).toHaveText("Healthy weight");

  await calculateMetric(page, "86.6", "170");
  await expect(bmiValue(page)).toHaveText("30.0");
  await expect(category(page)).toHaveText("Overweight");
});

test("calculates the imperial reference value", async ({ page }) => {
  await page.goto("/bmi-calculator");
  await selectSystem(page, "Imperial");
  await expect(metricWeight(page)).toBeHidden();
  await calculateImperial(page, "154", "5", "9");

  await expect(result(page)).toBeVisible();
  await expect(bmiValue(page)).toHaveText("22.7");
  await expect(category(page)).toHaveText("Healthy weight");
});

test("switching units converts complete measurements and clears the result", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");
  await calculateMetric(page, "70", "175");
  await expect(bmiValue(page)).toHaveText("22.9");

  await selectSystem(page, "Imperial");
  await expect(result(page)).toBeHidden();
  await expect(unitNote(page)).toHaveText(
    "Measurements converted to the selected units. Select Calculate to update the result.",
  );
  await expect(imperialWeight(page)).toHaveValue("154.32");
  await expect(imperialFeet(page)).toHaveValue("5");
  await expect(imperialInches(page)).toHaveValue("8.9");

  await submit(page).click();
  await expect(bmiValue(page)).toHaveText("22.9");

  await selectSystem(page, "Metric");
  await expect(unitNote(page)).toHaveText(
    "Measurements converted to the selected units. Select Calculate to update the result.",
  );
  await expect(metricWeight(page)).toHaveValue("70");
  await expect(metricHeight(page)).toHaveValue("175.01");

  await submit(page).click();
  await expect(bmiValue(page)).toHaveText("22.9");
});

test("resets fields with feedback when unit switching cannot convert", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");
  await metricWeight(page).fill("70");
  await selectSystem(page, "Imperial");

  await expect(unitNote(page)).toHaveText(
    "Units changed. Enter the measurements in the new units.",
  );
  await expect(imperialWeight(page)).toHaveValue("");
  await expect(imperialFeet(page)).toHaveValue("");
  await expect(imperialInches(page)).toHaveValue("");
  await expect(result(page)).toBeHidden();

  await selectSystem(page, "Metric");
  await expect(metricWeight(page)).toHaveValue("");
  await expect(metricHeight(page)).toHaveValue("");

  await metricWeight(page).fill("70");
  await metricHeight(page).fill("abc");
  await selectSystem(page, "Imperial");
  await expect(unitNote(page)).toHaveText(
    "Units changed. Enter the measurements in the new units.",
  );
  await expect(imperialWeight(page)).toHaveValue("");
  await expect(imperialFeet(page)).toHaveValue("");
  await expect(imperialInches(page)).toHaveValue("");

  await selectSystem(page, "Metric");
  await expect(metricWeight(page)).toHaveValue("");
  await expect(metricHeight(page)).toHaveValue("");
});

test("validates metric input and preserves entered values", async ({
  page,
}) => {
  await page.goto("/bmi-calculator");
  await submit(page).click();

  await expect(error(page, "metricWeight")).toContainText("Enter your weight.");
  await expect(error(page, "metricHeight")).toContainText("Enter your height.");
  await expect(metricWeight(page)).toBeFocused();
  await expect(result(page)).toBeHidden();

  await calculateMetric(page, "10", "175");
  await expect(error(page, "metricWeight")).toContainText(
    "Enter a weight between 20 and 400 kg.",
  );
  await expect(metricWeight(page)).toHaveValue("10");
  await expect(metricHeight(page)).toHaveValue("175");

  await calculateMetric(page, "70", "99");
  await expect(error(page, "metricHeight")).toContainText(
    "Enter a height between 100 and 250 cm.",
  );
  await expect(metricHeight(page)).toBeFocused();

  await calculateMetric(page, "abc", "175");
  await expect(error(page, "metricWeight")).toContainText(
    "Enter a valid weight.",
  );
  await expect(metricWeight(page)).toHaveValue("abc");
  await expect(metricHeight(page)).toHaveValue("175");
});

test("validates imperial feet and inches", async ({ page }) => {
  await page.goto("/bmi-calculator");
  await selectSystem(page, "Imperial");
  await submit(page).click();

  await expect(error(page, "imperialWeight")).toContainText(
    "Enter your weight.",
  );
  await expect(error(page, "imperialFeet")).toContainText(
    "Enter the feet part of your height.",
  );
  await expect(error(page, "imperialInches")).toContainText(
    "Enter the inches part of your height.",
  );

  await calculateImperial(page, "154", "5", "12");
  await expect(error(page, "imperialInches")).toContainText(
    "Inches must be between 0 and 11.",
  );
  await expect(imperialInches(page)).toBeFocused();

  await calculateImperial(page, "154", "5.5", "9");
  await expect(error(page, "imperialFeet")).toContainText(
    "Enter feet as a whole number.",
  );

  await calculateImperial(page, "154", "3", "0");
  await expect(error(page, "imperialFeet")).toContainText(
    "Enter a height between about 3 ft 3 in and 8 ft 2 in.",
  );
});

test("clear resets fields and returns focus", async ({ page }) => {
  await page.goto("/bmi-calculator");
  await calculateMetric(page, "70", "175");
  await expect(result(page)).toBeVisible();

  await clear(page).click();

  await expect(metricWeight(page)).toHaveValue("");
  await expect(metricHeight(page)).toHaveValue("");
  await expect(result(page)).toBeHidden();
  await expect(empty(page)).toBeVisible();
  await expect(page.getByRole("radio", { name: "Metric" })).toBeChecked();
  await expect(metricWeight(page)).toBeFocused();
});

test("is keyboard operable and keeps 44px targets with focus rings", async ({
  page,
  browserName,
}) => {
  await page.goto("/bmi-calculator");

  await tabTo(page, browserName, metricWeight(page));
  await ring(metricWeight(page));
  await metricWeight(page).fill("70");

  await page.keyboard.press(
    browserName === "webkit" ? "Shift+Alt+Tab" : "Shift+Tab",
  );
  const metricRadio = page.getByRole("radio", { name: "Metric" });
  await expect(metricRadio).toBeFocused();
  await ring(metricRadio.locator(".."));

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Imperial" })).toBeChecked();
  await expect(imperialWeight(page)).toBeVisible();

  await imperialWeight(page).fill("154");
  await imperialFeet(page).fill("5");
  await imperialInches(page).fill("9");
  await tabTo(page, browserName, submit(page));
  await ring(submit(page));
  await page.keyboard.press("Enter");
  await expect(bmiValue(page)).toHaveText("22.7");

  for (const button of [submit(page), clear(page)]) {
    const box = await button.boundingBox();
    if (!box) throw new Error("button is not visible");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  const segment = page.locator(".segmented label").first();
  const segmentBox = await segment.boundingBox();
  if (!segmentBox) throw new Error("unit segment is not visible");
  expect(segmentBox.height).toBeGreaterThanOrEqual(44);
});

test("the Spanish page is localized and parses decimal commas", async ({
  page,
}) => {
  await page.goto("/es/bmi-calculator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de IMC",
  );
  await expect(page.getByLabel("Peso (kg)")).toBeVisible();
  await expect(page.getByLabel("Altura (cm)")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Métrico" })).toBeChecked();
  await expect(
    page.getByText("El IMC es una herramienta de cribado, no un diagnóstico.", {
      exact: true,
    }),
  ).toBeVisible();

  await calculateMetric(page, "70,5", "175");
  await expect(bmiValue(page)).toHaveText("23,0");
  await expect(category(page)).toHaveText("Peso saludable");

  await clear(page).click();
  await calculateMetric(page, "70", "175");
  await expect(bmiValue(page)).toHaveText("22,9");

  await selectSystem(page, "Imperial");
  await expect(unitNote(page)).toHaveText(
    "Medidas convertidas a las unidades seleccionadas. Pulsa Calcular para actualizar el resultado.",
  );
  await expect(imperialWeight(page)).toHaveValue("154,32");
  await expect(imperialFeet(page)).toHaveValue("5");
  await expect(imperialInches(page)).toHaveValue("8,9");

  await page.screenshot({
    path: "test-results/bmi-calculator-es.png",
    fullPage: true,
  });
});

test("keeps both unit forms usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/bmi-calculator");

  await calculateMetric(page, "70", "175");
  await expect(result(page)).toBeVisible();
  let overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(bmiValue(page)).toBeVisible();

  await selectSystem(page, "Imperial");
  await calculateImperial(page, "154", "5", "9");
  await expect(bmiValue(page)).toHaveText("22.7");
  overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(imperialFeet(page)).toBeVisible();
  await expect(imperialInches(page)).toBeVisible();

  await page.goto("/es/bmi-calculator");
  await calculateMetric(page, "70", "175");
  overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.screenshot({
    path: "test-results/bmi-calculator-320.png",
    fullPage: true,
  });
});

test("exposes canonical, alternates, structured data, and sitemap entries", async ({
  page,
  request,
}) => {
  await page.goto("/bmi-calculator/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/bmi-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/bmi-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/bmi-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://appkitx.com/bmi-calculator/");

  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );

  const application = documents.find(
    (document) => document["@type"] === "WebApplication",
  );
  expect(application).toMatchObject({
    name: "BMI Calculator",
    url: "https://appkitx.com/bmi-calculator/",
    applicationCategory: "UtilitiesApplication",
    isAccessibleForFree: true,
    inLanguage: "en",
  });
  for (const forbidden of [
    "medicalSpecialty",
    "healthCondition",
    "diagnosis",
    "aggregateRating",
    "offers",
  ]) {
    expect(application).not.toHaveProperty(forbidden);
  }
  expect(
    documents.find((document) => document["@type"] === "BreadcrumbList"),
  ).toBeDefined();

  await page.goto("/es/bmi-calculator/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/es/bmi-calculator/",
  );

  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls).toHaveLength(86);
  expect(urls).toContain("https://appkitx.com/bmi-calculator/");
  expect(urls).toContain("https://appkitx.com/es/bmi-calculator/");
  expect(sitemap).not.toContain("pc-builder");

  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);
});

test("is discoverable from the Calculators category, homepage, search, and related tools", async ({
  page,
}) => {
  await page.goto("/calculators/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /BMI Calculator/ }),
  ).toHaveAttribute("href", "/bmi-calculator/");

  await page.goto("/es/calculators/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Calculadora de IMC/ }),
  ).toHaveAttribute("href", "/es/bmi-calculator/");

  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "BMI Calculator" }),
  ).toHaveAttribute("href", "/bmi-calculator/");

  await page.waitForLoadState("load");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await page.locator("[data-search-input]").fill("bmi");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("BMI Calculator");
  await expect(page.getByRole("option")).toHaveAttribute(
    "href",
    "/bmi-calculator/",
  );

  await page.goto("/bmi-calculator/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Unit Converter/ }),
  ).toHaveAttribute("href", "/unit-converter/");
  await expect(
    page.getByRole("main").locator('.prose a[href="/unit-converter/"]'),
  ).toHaveCount(1);
});

test("never transmits or stores entered measurements", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/bmi-calculator");
  await calculateMetric(page, "77.7", "177.7");
  await expect(result(page)).toBeVisible();
  await page.waitForTimeout(300);

  expect(
    requests.some(
      (request) => request.includes("77.7") || request.includes("177.7"),
    ),
    "measurements must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "BMI calculation must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: localStorage,
      session: sessionStorage,
    }),
  );
  expect(storage).not.toContain("77.7");
  expect(storage).not.toContain("177.7");
});
