import { expect, test, type Locator, type Page } from "@playwright/test";
import { tabTo } from "./keyboard";

/*
 * GPA Calculator: weighted reference values, credit weighting, zero-point
 * grades, decimal credits, course add/remove/limit, custom scales, scale
 * validation, invalidated selections, result display, clear/reset,
 * accessibility, localization, SEO, privacy, and 320px layout.
 */

const rows = (page: Page) => page.locator("[data-course-row]");
const row = (page: Page, index: number) => rows(page).nth(index);
const credits = (page: Page, index: number) =>
  row(page, index).locator("[data-course-credits]");
const grade = (page: Page, index: number) =>
  row(page, index).locator("[data-course-grade]");
const courseName = (page: Page, index: number) =>
  row(page, index).locator("[data-course-name]");
const points = (page: Page, index: number) =>
  row(page, index).locator("[data-course-points]");
const formError = (page: Page) => page.locator("[data-form-error]");
const submit = (page: Page) =>
  page.locator("[data-gpa-form] button[type=submit]");
const reset = (page: Page) => page.locator("[data-reset]");
const addCourse = (page: Page) =>
  page.getByRole("button", { name: "Add course" });
const empty = (page: Page) => page.locator("[data-gpa-empty]");
const result = (page: Page) => page.locator("[data-gpa-result]");
const gpaValue = (page: Page) => page.locator("[data-gpa-value]");
const totalCredits = (page: Page) => page.locator("[data-total-credits]");
const courseCount = (page: Page) => page.locator("[data-course-count]");
const resultScale = (page: Page) => page.locator("[data-result-scale]");
const activeScaleDisplay = (page: Page) =>
  page.locator("[data-active-scale-display]");
const activeScaleMap = (page: Page) => page.locator("[data-active-scale-map]");

const scaleEditor = (page: Page) => page.locator("[data-scale-editor]");
const scaleRows = (page: Page) => page.locator("[data-scale-grade-row]");
const scaleName = (page: Page) => page.locator("[data-scale-name]");
const scaleMax = (page: Page) => page.locator("[data-scale-max]");
const scaleErrors = (page: Page) => page.locator("[data-scale-errors]");
const scaleStatus = (page: Page) => page.locator("[data-scale-status]");

const fillCourse = async (
  page: Page,
  index: number,
  creditValue: string,
  gradeValue: string,
  name = "",
) => {
  if (name !== "") await courseName(page, index).fill(name);
  await credits(page, index).fill(creditValue);
  if (gradeValue !== "") await grade(page, index).selectOption(gradeValue);
};

const calculate = async (page: Page) => {
  await submit(page).click();
  await page.waitForTimeout(150);
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with three course rows, the default scale, and an empty result", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");

  await expect(page).toHaveTitle("GPA Calculator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "GPA Calculator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("GPA Calculator")).toBeVisible();

  await expect(rows(page)).toHaveCount(3);
  await expect(grade(page, 0).locator("option")).toHaveCount(14);
  await expect(activeScaleDisplay(page)).toContainText("4.0 letter scale");
  await expect(activeScaleDisplay(page)).toContainText("maximum 4.0");
  await expect(activeScaleMap(page)).toContainText("A+ 4.0");
  await expect(empty(page)).toBeVisible();
  await expect(result(page)).toBeHidden();
  await expect(addCourse(page)).toBeEnabled();
  await expect(scaleEditor(page)).not.toHaveAttribute("open", "");
  await expect(page.getByText("Calculated locally")).toBeVisible();

  await page.screenshot({
    path: "test-results/gpa-calculator-empty.png",
    fullPage: true,
  });
});

test("calculates a single course", async ({ page }) => {
  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "3", "A");
  await expect(points(page, 0)).toHaveText("4.0 points");

  await calculate(page);

  await expect(result(page)).toBeVisible();
  await expect(empty(page)).toBeHidden();
  await expect(gpaValue(page)).toHaveText("4.00");
  await expect(totalCredits(page)).toHaveText("3");
  await expect(courseCount(page)).toHaveText("1 course");
  await expect(resultScale(page)).toContainText("4.0 letter scale");
});

test("calculates a weighted mixed-credit GPA", async ({ page }) => {
  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "3", "A");
  await fillCourse(page, 1, "4", "B");
  await fillCourse(page, 2, "3", "C");
  await calculate(page);

  await expect(gpaValue(page)).toHaveText("3.00");
  await expect(totalCredits(page)).toHaveText("10");
  await expect(courseCount(page)).toHaveText("3 courses");

  await page.screenshot({
    path: "test-results/gpa-calculator-weighted.png",
    fullPage: true,
  });
});

test("keeps zero-point grades in the weighted average", async ({ page }) => {
  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "3", "A");
  await fillCourse(page, 1, "3", "F");
  await calculate(page);

  await expect(gpaValue(page)).toHaveText("2.00");
  await expect(totalCredits(page)).toHaveText("6");
  await expect(courseCount(page)).toHaveText("2 courses");
});

test("supports decimal credit hours and two-decimal rounding", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "1.5", "A");
  await fillCourse(page, 1, "2.5", "B");
  await calculate(page);

  await expect(gpaValue(page)).toHaveText("3.38");
  await expect(totalCredits(page)).toHaveText("4");
});

test("applies a custom scale and resets to the default scale", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");
  await scaleEditor(page).locator("summary").click();
  await scaleName(page).fill("5.0 example");
  await scaleMax(page).fill("5.0");

  await page.getByRole("button", { name: "Add grade" }).click();
  const added = scaleRows(page).last();
  await added.locator("[data-scale-grade-name]").fill("S");
  await added.locator("[data-scale-points]").fill("5.0");
  await page.getByRole("button", { name: "Apply scale" }).click();

  await expect(scaleStatus(page)).toHaveText("Grading scale applied.");
  await expect(activeScaleDisplay(page)).toHaveText(
    "5.0 example · maximum 5.0",
  );
  await expect(activeScaleMap(page)).toContainText("S 5.0");
  await expect(grade(page, 0).locator('option[value="S"]')).toHaveCount(1);

  await fillCourse(page, 0, "3", "S");
  await expect(points(page, 0)).toHaveText("5.0 points");
  await calculate(page);
  await expect(gpaValue(page)).toHaveText("5.00");
  await expect(resultScale(page)).toHaveText("5.0 example · maximum 5.0");

  await page.getByRole("button", { name: "Reset to default" }).click();
  await expect(activeScaleDisplay(page)).toContainText("4.0 letter scale");
  await expect(result(page)).toBeHidden();
  await expect(grade(page, 0)).toHaveValue("");
  await expect(row(page, 0).locator("[data-course-grade-error]")).toContainText(
    "This grade is no longer in the active scale.",
  );
  await expect(scaleStatus(page)).toContainText(
    "Default 4.0 scale restored. Re-select the grades marked below.",
  );
});

test("rejects invalid scale edits and preserves the active scale", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");
  await scaleEditor(page).locator("summary").click();

  await scaleName(page).fill("");
  await page.getByRole("button", { name: "Apply scale" }).click();
  await expect(scaleErrors(page)).toContainText("Enter a scale name.");
  await expect(activeScaleDisplay(page)).toContainText("4.0 letter scale");

  await scaleName(page).fill("Custom scale");
  await scaleRows(page).nth(1).locator("[data-scale-grade-name]").fill("A+");
  await page.getByRole("button", { name: "Apply scale" }).click();
  await expect(scaleErrors(page)).toContainText("Grade labels must be unique.");

  await page.getByRole("button", { name: "Reset to default" }).click();
  await scaleRows(page).nth(0).locator("[data-scale-points]").fill("5.0");
  await page.getByRole("button", { name: "Apply scale" }).click();
  await expect(scaleErrors(page)).toContainText(
    "Grade points cannot exceed the scale maximum of 4.0.",
  );
  await expect(activeScaleDisplay(page)).toContainText("4.0 letter scale");
});

test("marks selected grades invalidated when the scale changes", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "3", "A");
  await scaleEditor(page).locator("summary").click();
  await scaleRows(page).nth(1).locator("[data-scale-grade-name]").fill("A*");
  await page.getByRole("button", { name: "Apply scale" }).click();

  await expect(grade(page, 0)).toHaveValue("");
  await expect(row(page, 0).locator("[data-course-grade-error]")).toContainText(
    "This grade is no longer in the active scale.",
  );
  await expect(result(page)).toBeHidden();

  await grade(page, 0).selectOption("A*");
  await calculate(page);
  await expect(gpaValue(page)).toHaveText("4.00");
});

test("adds, removes, and limits courses", async ({ page }) => {
  await page.goto("/gpa-calculator");
  await expect(rows(page)).toHaveCount(3);

  await row(page, 2).locator("[data-remove-course]").click();
  await expect(rows(page)).toHaveCount(2);
  await row(page, 1).locator("[data-remove-course]").click();
  await expect(rows(page)).toHaveCount(1);
  await expect(row(page, 0).locator("[data-remove-course]")).toBeDisabled();

  await addCourse(page).click();
  await expect(rows(page)).toHaveCount(2);
  await expect(row(page, 0).locator("[data-remove-course]")).toBeEnabled();

  await reset(page).click();
  await expect(rows(page)).toHaveCount(3);
  for (let index = 0; index < 27; index += 1) {
    await addCourse(page).click();
  }
  await expect(rows(page)).toHaveCount(30);
  await expect(addCourse(page)).toBeDisabled();
  await row(page, 29).locator("[data-remove-course]").click();
  await expect(rows(page)).toHaveCount(29);
  await expect(addCourse(page)).toBeEnabled();
});

test("validates course rows without showing a partial GPA", async ({
  page,
}) => {
  await page.goto("/gpa-calculator");
  await submit(page).click();
  await expect(formError(page)).toContainText(
    "Add at least one course with credits and a grade.",
  );
  await expect(credits(page, 0)).toBeFocused();
  await expect(result(page)).toBeHidden();

  await courseName(page, 0).fill("Biology");
  await submit(page).click();
  await expect(
    row(page, 0).locator("[data-course-credits-error]"),
  ).toContainText("Enter credit hours.");
  await expect(row(page, 0).locator("[data-course-grade-error]")).toContainText(
    "Select a grade.",
  );
  await expect(courseName(page, 0)).toHaveValue("Biology");

  await fillCourse(page, 0, "0", "A");
  await submit(page).click();
  await expect(
    row(page, 0).locator("[data-course-credits-error]"),
  ).toContainText("Enter valid credit hours.");

  await fillCourse(page, 0, "31", "A");
  await submit(page).click();
  await expect(
    row(page, 0).locator("[data-course-credits-error]"),
  ).toContainText("Enter credit hours between 0.1 and 30.");

  await fillCourse(page, 0, "abc", "A");
  await submit(page).click();
  await expect(
    row(page, 0).locator("[data-course-credits-error]"),
  ).toContainText("Enter valid credit hours.");
  await expect(credits(page, 0)).toHaveValue("abc");

  await fillCourse(page, 0, "3", "A");
  await fillCourse(page, 1, "3", "");
  await courseName(page, 1).fill("Partial course");
  await submit(page).click();
  await expect(row(page, 1).locator("[data-course-grade-error]")).toContainText(
    "Select a grade.",
  );
  await expect(result(page)).toBeHidden();

  await grade(page, 1).selectOption("B");
  await calculate(page);
  await expect(gpaValue(page)).toHaveText("3.50");
  await expect(courseCount(page)).toHaveText("2 courses");
});

test("reset restores courses and the default scale", async ({ page }) => {
  await page.goto("/gpa-calculator");
  await scaleEditor(page).locator("summary").click();
  await scaleName(page).fill("Custom");
  await page.getByRole("button", { name: "Apply scale" }).click();
  await fillCourse(page, 0, "3", "A");
  await calculate(page);
  await expect(result(page)).toBeVisible();

  await reset(page).click();

  await expect(rows(page)).toHaveCount(3);
  await expect(credits(page, 0)).toHaveValue("");
  await expect(grade(page, 0)).toHaveValue("");
  await expect(result(page)).toBeHidden();
  await expect(empty(page)).toBeVisible();
  await expect(activeScaleDisplay(page)).toContainText("4.0 letter scale");
  await expect(scaleEditor(page)).not.toHaveAttribute("open", "");
  await expect(credits(page, 0)).toBeFocused();
});

test("is keyboard operable and keeps 44px targets with focus rings", async ({
  page,
  browserName,
}) => {
  await page.goto("/gpa-calculator");

  await tabTo(page, browserName, credits(page, 0));
  await ring(credits(page, 0));
  await credits(page, 0).fill("3");

  await tabTo(page, browserName, grade(page, 0));
  await ring(grade(page, 0));
  await grade(page, 0).selectOption("A");
  await tabTo(page, browserName, submit(page));
  await ring(submit(page));
  await page.keyboard.press("Enter");
  await expect(gpaValue(page)).toHaveText("4.00");

  for (const button of [
    submit(page),
    reset(page),
    addCourse(page),
    row(page, 0).locator("[data-remove-course]"),
  ]) {
    const box = await button.boundingBox();
    if (!box) throw new Error("button is not visible");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await scaleEditor(page).locator("summary").click();
  const summaryBox = await scaleEditor(page).locator("summary").boundingBox();
  if (!summaryBox) throw new Error("scale summary is not visible");
  expect(summaryBox.height).toBeGreaterThanOrEqual(44);
});

test("the Spanish page is localized and calculates with decimal commas", async ({
  page,
}) => {
  await page.goto("/es/gpa-calculator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Calculadora de GPA",
  );
  await expect(page.getByLabel("Nombre del curso 1 (opcional)")).toBeVisible();
  await expect(page.getByLabel("Créditos 1")).toBeVisible();
  await expect(grade(page, 0)).toBeVisible();
  await expect(activeScaleDisplay(page)).toContainText("Escala de letras 4.0");
  await expect(page.getByText("Calculado localmente")).toBeVisible();

  await fillCourse(page, 0, "1,5", "A");
  await fillCourse(page, 1, "2,5", "B");
  await calculate(page);

  await expect(gpaValue(page)).toHaveText("3,38");
  await expect(totalCredits(page)).toHaveText("4");
  await expect(courseCount(page)).toHaveText("2 cursos");

  await scaleEditor(page).locator("summary").click();
  await expect(
    page.getByText("Personalizar escala de calificación"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Aplicar escala" }),
  ).toBeVisible();

  await page.screenshot({
    path: "test-results/gpa-calculator-es.png",
    fullPage: true,
  });
});

test("keeps course rows and the scale editor usable at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/gpa-calculator");

  await fillCourse(page, 0, "3", "A");
  await fillCourse(page, 1, "4", "B");
  await calculate(page);
  await expect(result(page)).toBeVisible();

  let overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await scaleEditor(page).locator("summary").click();
  await expect(scaleName(page)).toBeVisible();
  await expect(scaleRows(page).first()).toBeVisible();
  overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.screenshot({
    path: "test-results/gpa-calculator-320.png",
    fullPage: true,
  });
});

test("exposes canonical, alternates, structured data, and sitemap entries", async ({
  page,
  request,
}) => {
  await page.goto("/gpa-calculator/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/gpa-calculator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/gpa-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/gpa-calculator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://appkitx.com/gpa-calculator/");

  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );

  const application = documents.find(
    (document) => document["@type"] === "WebApplication",
  );
  expect(application).toMatchObject({
    name: "GPA Calculator",
    url: "https://appkitx.com/gpa-calculator/",
    applicationCategory: "UtilitiesApplication",
    isAccessibleForFree: true,
    inLanguage: "en",
  });
  expect(
    documents.find((document) => document["@type"] === "BreadcrumbList"),
  ).toBeDefined();

  await page.goto("/es/gpa-calculator/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/es/gpa-calculator/",
  );

  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls).toHaveLength(88);
  expect(urls).toContain("https://appkitx.com/gpa-calculator/");
  expect(urls).toContain("https://appkitx.com/es/gpa-calculator/");
  expect(sitemap).not.toContain("pc-builder");

  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);
});

test("is discoverable from the Calculators category, homepage, search, and related tools", async ({
  page,
}) => {
  await page.goto("/calculators/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /GPA Calculator/ }),
  ).toHaveAttribute("href", "/gpa-calculator/");

  await page.goto("/es/calculators/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Calculadora de GPA/ }),
  ).toHaveAttribute("href", "/es/gpa-calculator/");

  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "GPA Calculator" }),
  ).toHaveAttribute("href", "/gpa-calculator/");

  await page.waitForLoadState("load");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await page.locator("[data-search-input]").fill("gpa");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("GPA Calculator");
  await expect(page.getByRole("option")).toHaveAttribute(
    "href",
    "/gpa-calculator/",
  );

  await page.goto("/gpa-calculator/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Percentage Calculator/ }),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(
    page.getByRole("main").locator('.prose a[href="/percentage-calculator/"]'),
  ).toHaveCount(1);
});

test("never transmits or stores course data or GPA", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/gpa-calculator");
  await fillCourse(page, 0, "13.7", "A", "private-course-4f8a");
  await calculate(page);
  await expect(result(page)).toBeVisible();
  await page.waitForTimeout(300);

  expect(
    requests.some((request) => request.includes("private-course-4f8a")),
    "course names must never appear in a request URL or body",
  ).toBe(false);
  expect(
    requests.some((request) => request.includes("13.7")),
    "credit hours must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "GPA calculation must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: localStorage,
      session: sessionStorage,
    }),
  );
  expect(storage).not.toContain("private-course-4f8a");
  expect(storage).not.toContain("13.7");
});
