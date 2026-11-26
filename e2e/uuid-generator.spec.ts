import { expect, test, type Locator, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

/*
 * UUID Generator: cryptographic v4 output, one and many values, per-value
 * and batch copy, quantity validation, display-only formatting, the
 * unsupported-browser state, localization, SEO, discovery, and 320px layout.
 */

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const quantity = (page: Page) => page.getByLabel("How many UUIDs");
const rows = (page: Page) => page.locator("[data-uuid-list] li");
const values = (page: Page) => page.locator("[data-uuid-value]");
const generate = (page: Page) =>
  page.getByRole("button", { name: "Generate UUIDs" });
const clear = (page: Page) => page.getByRole("button", { name: "Clear" });
const copyAll = (page: Page) => page.getByRole("button", { name: "Copy all" });
const count = (page: Page) => page.locator("[data-uuid-count]");
const empty = (page: Page) => page.locator("[data-uuid-empty]");
const feedback = (page: Page) => page.locator("[data-uuid-feedback]");

const generateBatch = async (page: Page, amount: number) => {
  await quantity(page).fill(String(amount));
  await generate(page).click();
  await expect(rows(page)).toHaveCount(amount);
};

const ring = async (locator: Locator) => {
  await expect(locator).toHaveCSS("outline-width", "2px");
  await expect(locator).toHaveCSS("outline-style", "solid");
  await expect(locator).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(locator).toHaveCSS("outline-offset", "2px");
};

test("loads with the empty state and no automatic generation", async ({
  page,
}) => {
  await page.goto("/uuid-generator");

  await expect(page).toHaveTitle("UUID Generator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "UUID Generator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("UUID Generator")).toBeVisible();

  await expect(quantity(page)).toHaveValue("5");
  await expect(
    page.getByRole("switch", { name: "Uppercase" }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("switch", { name: "Remove hyphens" }),
  ).not.toBeChecked();

  await expect(rows(page)).toHaveCount(0);
  await expect(empty(page)).toBeVisible();
  await expect(copyAll(page)).toBeDisabled();
  await expect(count(page)).toHaveText("");
  await expect(feedback(page)).toBeHidden();
});

test("generates one canonical UUID v4", async ({ page }) => {
  await page.goto("/uuid-generator");
  await generateBatch(page, 1);

  const value = (await values(page).first().innerText()).trim();
  expect(value).toMatch(UUID_V4);
  expect(value).toBe(value.toLowerCase());

  await expect(count(page)).toHaveText("1 UUID generated");
  await expect(empty(page)).toBeHidden();
  await expect(copyAll(page)).toBeEnabled();

  await page.screenshot({
    path: "test-results/uuid-generator-en.png",
    fullPage: true,
  });
});

test("generates a batch of 100 unique UUIDs", async ({ page }) => {
  await page.goto("/uuid-generator");
  await generateBatch(page, 100);

  await expect(count(page)).toHaveText("100 UUIDs generated");
  const all = await values(page).allInnerTexts();
  expect(all).toHaveLength(100);
  expect(new Set(all).size).toBe(100);
  for (const value of all) expect(value).toMatch(UUID_V4);
});

test("validates the quantity from 1 to 100", async ({ page }) => {
  await page.goto("/uuid-generator");
  const error = page.locator('[data-error-for="quantity"]');

  for (const invalid of ["0", "101", "1.5"]) {
    await quantity(page).fill(invalid);
    await generate(page).click();

    await expect(error).toContainText("Enter a whole number from 1 to 100.");
    await expect(quantity(page)).toHaveAttribute("aria-invalid", "true");
    await expect(quantity(page)).toBeFocused();
    await expect(rows(page)).toHaveCount(0);
  }

  await quantity(page).fill("2");
  await expect(error).toBeHidden();
  await expect(quantity(page)).not.toHaveAttribute("aria-invalid");

  await generate(page).click();
  await expect(rows(page)).toHaveCount(2);
});

test("copies one value from its row button", async ({ page, browserName }) => {
  await prepareClipboard(page, browserName);
  await page.goto("/uuid-generator");
  await generateBatch(page, 2);

  const target = (await values(page).nth(1).innerText()).trim();
  const button = page.getByRole("button", { name: "Copy UUID 2" });
  await button.click();

  await expect(feedback(page)).toBeVisible();
  await expect(feedback(page)).toHaveText("Copied to clipboard.");
  await expect(feedback(page)).toHaveClass(/text-success/);
  await expect(button.locator("[data-uuid-copied-icon]")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(target);
});

test("copies the whole batch newline-separated", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/uuid-generator");
  await generateBatch(page, 3);

  const all = await values(page).allInnerTexts();
  await copyAll(page).click();

  await expect(feedback(page)).toHaveText("Copied to clipboard.");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(all.join("\n"));
});

test("reports a clipboard failure without losing the values", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("permission denied")),
      },
    });
  });
  await page.goto("/uuid-generator");
  await generateBatch(page, 1);

  await copyAll(page).click();

  await expect(feedback(page)).toBeVisible();
  await expect(feedback(page)).toHaveText(
    "Copy failed — select the value and copy it manually.",
  );
  await expect(feedback(page)).toHaveClass(/text-error/);
  await expect(rows(page)).toHaveCount(1);
});

test("never transmits or stores generated values", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/uuid-generator");
  await generateBatch(page, 5);
  const generated = (await values(page).allInnerTexts()).map((value) =>
    value.trim(),
  );

  await page.getByText("Uppercase", { exact: true }).click();
  await page.getByText("Remove hyphens", { exact: true }).click();
  await page.waitForTimeout(300);

  for (const value of generated) {
    expect(
      requests.some((request) => request.includes(value)),
      "UUIDs must never appear in a request URL or body",
    ).toBe(false);
  }

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "UUID generation must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({
      local: localStorage,
      session: sessionStorage,
    }),
  );
  for (const value of generated) expect(storage).not.toContain(value);
});

test("formatting never regenerates the identifiers", async ({ page }) => {
  await page.goto("/uuid-generator");
  await generateBatch(page, 2);

  const original = await values(page).allInnerTexts();
  const uppercase = page.getByRole("switch", { name: "Uppercase" });
  const compact = page.getByRole("switch", { name: "Remove hyphens" });

  await page.getByText("Uppercase", { exact: true }).click();
  await expect(uppercase).toBeChecked();
  expect(await values(page).allInnerTexts()).toEqual(
    original.map((value) => value.toUpperCase()),
  );

  await page.getByText("Remove hyphens", { exact: true }).click();
  await expect(compact).toBeChecked();
  const compactValues = await values(page).allInnerTexts();
  expect(compactValues).toEqual(
    original.map((value) => value.replace(/-/g, "").toUpperCase()),
  );
  for (const value of compactValues) expect(value).toMatch(/^[0-9A-F]{32}$/);

  await expect(count(page)).toHaveText("2 UUIDs generated");

  await page.getByText("Uppercase", { exact: true }).click();
  await page.getByText("Remove hyphens", { exact: true }).click();
  await expect(uppercase).not.toBeChecked();
  await expect(compact).not.toBeChecked();
  expect(await values(page).allInnerTexts()).toEqual(original);
});

test("clear resets the results and returns focus to the quantity", async ({
  page,
}) => {
  await page.goto("/uuid-generator");
  await generateBatch(page, 3);

  await clear(page).click();

  await expect(rows(page)).toHaveCount(0);
  await expect(empty(page)).toBeVisible();
  await expect(copyAll(page)).toBeDisabled();
  await expect(count(page)).toHaveText("");
  await expect(feedback(page)).toBeHidden();
  await expect(quantity(page)).toBeFocused();
});

test("disables generation when Web Crypto is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, "randomUUID", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.crypto, "getRandomValues", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/uuid-generator");

  const alert = page.locator("[data-uuid-unsupported]");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveAttribute("role", "alert");
  await expect(alert).toContainText("Web Crypto is unavailable");
  await expect(alert).toContainText(
    "Try a current version of Chrome, Firefox, Safari, or Edge.",
  );
  await expect(generate(page)).toBeDisabled();
  await expect(empty(page)).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
});

test("is keyboard operable and keeps 44px targets with focus rings", async ({
  page,
  browserName,
}) => {
  await page.goto("/uuid-generator");

  await tabTo(page, browserName, quantity(page));
  await ring(quantity(page));
  await quantity(page).fill("2");

  const uppercase = page.getByRole("switch", { name: "Uppercase" });
  await tabTo(page, browserName, uppercase);
  await ring(uppercase.locator(".."));
  await page.keyboard.press("Space");
  await expect(uppercase).toBeChecked();

  await tabTo(page, browserName, generate(page));
  await ring(generate(page));
  await page.keyboard.press("Enter");

  await expect(rows(page)).toHaveCount(2);
  const formatted = await values(page).allInnerTexts();
  for (const value of formatted) expect(value).toMatch(/^[0-9A-F-]+$/);

  for (const button of [generate(page), clear(page), copyAll(page)]) {
    const box = await button.boundingBox();
    if (!box) throw new Error("button is not visible");
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  const switchLabel = page.locator("label:has(#uuid-uppercase)");
  const toggleBox = await switchLabel.boundingBox();
  if (!toggleBox) throw new Error("switch is not visible");
  expect(toggleBox.height).toBeGreaterThanOrEqual(44);
});

test("the Spanish page is localized and generates UUIDs", async ({ page }) => {
  await page.goto("/es/uuid-generator");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Generador de UUID",
  );
  await expect(page.getByLabel("Cuántos UUID")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Mayúsculas" })).toBeVisible();
  await expect(
    page.getByRole("switch", { name: "Quitar guiones" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generar UUID" }),
  ).toBeVisible();
  await expect(page.getByText("Aún no hay UUID")).toBeVisible();

  await page.getByLabel("Cuántos UUID").fill("2");
  await page.getByRole("button", { name: "Generar UUID" }).click();

  await expect(rows(page)).toHaveCount(2);
  await expect(count(page)).toHaveText("2 UUID generados");
  await expect(page.getByRole("button", { name: "Copiar todo" })).toBeEnabled();

  await page.screenshot({
    path: "test-results/uuid-generator-es.png",
    fullPage: true,
  });
});

test("keeps generated values inside the viewport at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });

  for (const path of ["/uuid-generator", "/es/uuid-generator"]) {
    await page.goto(path);
    await page.locator("#uuid-quantity").fill("5");
    await page.locator("[data-uuid-generate]").click();
    await expect(rows(page)).toHaveCount(5);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
    await expect(values(page).first()).toBeVisible();
    await expect(page.locator("[data-uuid-copy-all]")).toBeVisible();
  }
});

test("exposes canonical, alternates, structured data, and sitemap entries", async ({
  page,
  request,
}) => {
  await page.goto("/uuid-generator/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/uuid-generator/",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", "https://appkitx.com/uuid-generator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="es"]'),
  ).toHaveAttribute("href", "https://appkitx.com/es/uuid-generator/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute("href", "https://appkitx.com/uuid-generator/");

  const documents = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "")),
    );

  const breadcrumb = documents.find(
    (document) => document["@type"] === "BreadcrumbList",
  );
  expect(breadcrumb).toBeDefined();

  const application = documents.find(
    (document) => document["@type"] === "WebApplication",
  );
  expect(application).toMatchObject({
    name: "UUID Generator",
    url: "https://appkitx.com/uuid-generator/",
    applicationCategory: "UtilitiesApplication",
    isAccessibleForFree: true,
    inLanguage: "en",
  });
  expect(application).not.toHaveProperty("aggregateRating");
  expect(application).not.toHaveProperty("offers");

  await page.goto("/es/uuid-generator/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://appkitx.com/es/uuid-generator/",
  );

  const sitemap = await (await request.get("/sitemap-0.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls).toHaveLength(84);
  expect(urls).toContain("https://appkitx.com/uuid-generator/");
  expect(urls).toContain("https://appkitx.com/es/uuid-generator/");
  expect(sitemap).not.toContain("pc-builder");

  expect((await request.get("/pc-builder/")).status()).toBe(404);
  expect((await request.get("/es/pc-builder/")).status()).toBe(404);
});

test("is discoverable from the category, homepage, and search", async ({
  page,
}) => {
  await page.goto("/developer-tools/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /UUID Generator/ }),
  ).toHaveAttribute("href", "/uuid-generator/");

  await page.goto("/es/developer-tools/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Generador de UUID/ }),
  ).toHaveAttribute("href", "/es/uuid-generator/");

  await page.goto("/");
  await expect(
    page.locator("#tools").getByRole("link", { name: "UUID Generator" }),
  ).toHaveAttribute("href", "/uuid-generator/");

  await page.waitForLoadState("load");
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-search-palette]")).toBeVisible();
  await page.locator("[data-search-input]").fill("uuid");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("UUID Generator");
  await expect(page.getByRole("option")).toHaveAttribute(
    "href",
    "/uuid-generator/",
  );
});
