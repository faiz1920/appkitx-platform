import { expect, test, type Page } from "@playwright/test";
import { locales } from "../src/i18n/config";
import { PREFERENCE_STORAGE_KEY } from "../src/i18n/preferences";

/*
 * M4 language behavior: the switcher, explicit-choice persistence, the
 * disabled-by-default browser-language detection, and Spanish end-to-end
 * rendering — all against the production build served by `wrangler dev`.
 */

const switcher = (page: Page) =>
  page.locator("[data-language-switcher]:visible");
const summary = (page: Page) => switcher(page).locator("summary");

const focusSwitcherSummary = async (page: Page) => {
  for (let attempt = 0; attempt < 12; attempt++) {
    const focused = await page.evaluate(
      () =>
        document.activeElement?.matches("[data-language-switcher] summary") ??
        false,
    );
    if (focused) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("could not focus the language switcher summary via Tab");
};

test("the switcher shows a visible label, the current language, and 44px targets", async ({
  page,
}) => {
  await page.goto("/");

  await expect(summary(page)).toContainText("Language: English");
  const box = await summary(page).boundingBox();
  if (!box) throw new Error("switcher summary is not visible");
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);

  await summary(page).click();
  await expect(switcher(page).locator("nav")).toBeVisible();
  await expect(switcher(page).locator("[data-locale-choice]")).toHaveCount(
    Object.keys(locales).length,
  );
  await expect(switcher(page).locator('[aria-current="true"]')).toHaveAttribute(
    "data-locale-choice",
    "en",
  );
  await expect(
    switcher(page).getByRole("link", { name: /Español/ }),
  ).toHaveAttribute("href", "/es/");
  await expect(
    switcher(page).getByRole("link", { name: /English/ }),
  ).toHaveAttribute("href", "/");

  await page.screenshot({
    path: "test-results/language-switcher-en.png",
  });
});

test("the switcher links to canonical trailing-slash page URLs", async ({
  page,
}) => {
  await page.goto("/percentage-calculator/");
  await summary(page).click();

  await expect(
    switcher(page).locator('[data-locale-choice="en"]'),
  ).toHaveAttribute("href", "/percentage-calculator/");
  await expect(
    switcher(page).locator('[data-locale-choice="es"]'),
  ).toHaveAttribute("href", "/es/percentage-calculator/");

  await page.goto("/es/calculators/");
  await summary(page).click();

  await expect(
    switcher(page).locator('[data-locale-choice="en"]'),
  ).toHaveAttribute("href", "/calculators/");
  await expect(
    switcher(page).locator('[data-locale-choice="es"]'),
  ).toHaveAttribute("href", "/es/calculators/");
});

test("the switcher marks provisional translations without hiding the language", async ({
  page,
}) => {
  await page.goto("/");
  await summary(page).click();

  const spanish = switcher(page).locator('[data-locale-choice="es"]');
  await expect(spanish).toHaveAttribute(
    "data-translation-status",
    "provisional",
  );
  await expect(spanish.locator("[data-provisional-caption]")).toHaveText(
    "Traducción provisional",
  );
  await expect(spanish.locator("[data-provisional-caption]")).toHaveAttribute(
    "lang",
    "es",
  );
  await expect(spanish).toContainText("Español");

  const english = switcher(page).locator('[data-locale-choice="en"]');
  await expect(english).toHaveAttribute("data-translation-status", "source");
  await expect(english.locator("[data-provisional-caption]")).toHaveCount(0);

  await page.goto("/es/");
  await summary(page).click();
  const current = switcher(page).locator('[data-locale-choice="es"]');
  await expect(current).toHaveAttribute("aria-current", "true");
  await expect(current.locator("[data-provisional-caption]")).toHaveText(
    "Traducción provisional",
  );
});

test("the switcher is keyboard operable with the design-system focus ring", async ({
  page,
}) => {
  await page.goto("/");

  await focusSwitcherSummary(page);
  await expect(summary(page)).toBeFocused();
  await expect(summary(page)).toHaveCSS("outline-width", "2px");
  await expect(summary(page)).toHaveCSS("outline-style", "solid");
  await expect(summary(page)).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await expect(summary(page)).toHaveCSS("outline-offset", "2px");

  await page.keyboard.press("Enter");
  await expect(switcher(page).locator("nav")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(switcher(page).locator("nav")).not.toBeVisible();
  await expect(summary(page)).toBeFocused();
});

test("choosing a language preserves the page and stores the explicit choice", async ({
  page,
}) => {
  await page.goto("/percentage-calculator/");
  await summary(page).click();
  await switcher(page).locator('[data-locale-choice="es"]').click();

  await expect(page).toHaveURL(/\/es\/percentage-calculator\/$/);
  expect(
    await page.evaluate(
      (key) => window.localStorage.getItem(key),
      PREFERENCE_STORAGE_KEY,
    ),
  ).toBe("es");
  await expect(summary(page)).toContainText("Idioma: Español");
});

test("an explicit choice takes precedence on later visits, both directions", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(
    (key) => window.localStorage.setItem(key, "es"),
    PREFERENCE_STORAGE_KEY,
  );
  await page.goto("/");
  await expect(page).toHaveURL(/\/es\/$/);

  await page.evaluate(
    (key) => window.localStorage.setItem(key, "en"),
    PREFERENCE_STORAGE_KEY,
  );
  await page.goto("/es/");
  await expect(page).toHaveURL(/\/$/);
});

test("a stored choice keeps canonical non-root URLs in both directions", async ({
  page,
}) => {
  await page.goto("/percentage-calculator/");
  await page.evaluate(
    (key) => window.localStorage.setItem(key, "es"),
    PREFERENCE_STORAGE_KEY,
  );
  await page.goto("/percentage-calculator/");
  await expect(page).toHaveURL(/\/es\/percentage-calculator\/$/);

  await page.evaluate(
    (key) => window.localStorage.setItem(key, "en"),
    PREFERENCE_STORAGE_KEY,
  );
  await page.goto("/es/percentage-calculator/");
  await expect(page).toHaveURL(/\/percentage-calculator\/$/);
});

test("invalid stored choices are ignored and cleaned up", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    (key) => window.localStorage.setItem(key, "fr"),
    PREFERENCE_STORAGE_KEY,
  );
  await page.goto("/");

  await expect(page).toHaveURL(/\/$/);
  await expect(summary(page)).toContainText("Language: English");
  expect(
    await page.evaluate(
      (key) => window.localStorage.getItem(key),
      PREFERENCE_STORAGE_KEY,
    ),
  ).toBeNull();
});

test("indexable pages ship no browser-language detection code", async ({
  request,
}) => {
  for (const path of ["/", "/es/"]) {
    const response = await request.get(path);
    const html = await response.text();
    expect(html, `${path} must keep the stored-choice script`).toContain(
      "appkitx.locale",
    );
    expect(
      html,
      `${path} must not contain detection code while disabled`,
    ).not.toContain("navigator.languages");
  }
});

test.describe("with a Spanish browser and no stored choice", () => {
  test.use({ locale: "es-ES" });

  test("the first visit stays English because detection ships disabled", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Free tools for everyday work.",
    );
  });
});

test.describe("with a French browser and no stored choice", () => {
  test.use({ locale: "fr-FR" });

  test("the fallback stays English", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Free tools for everyday work.",
    );
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("localized pages render and the switcher still navigates", async ({
    page,
  }) => {
    await page.goto("/es/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Herramientas gratis para el día a día.",
    );
    await expect(summary(page)).toContainText("Idioma: Español");

    await summary(page).click();
    await switcher(page).locator('[data-locale-choice="en"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Free tools for everyday work.",
    );
  });
});

test("localized pages and the switcher keep layout at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of [
    "/",
    "/es/",
    "/es/percentage-calculator/",
    "/es/calculators/",
    "/es/base64-encoder/",
    "/es/developer-tools/",
    "/es/date-calculator/",
    "/es/age-calculator/",
    "/es/date-time/",
  ]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(0);
  }

  await page.goto("/es/");
  await page.getByRole("banner").getByRole("button", { name: "Menú" }).click();
  const drawerSwitcher = page.locator("#global-menu [data-language-switcher]");
  await expect(drawerSwitcher).toBeVisible();
  await drawerSwitcher.locator("summary").click();
  await expect(
    drawerSwitcher.locator('[data-locale-choice="en"]'),
  ).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  await page.screenshot({
    path: "test-results/switcher-320-es.png",
  });
});

test("the discount calculator computes end to end in Spanish", async ({
  page,
}) => {
  await page.goto("/es/discount-calculator/");

  await page.getByLabel("Precio original").fill("100");
  await page.getByLabel("Porcentaje de descuento (%)").fill("20");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-final-price]")).toHaveText("80");
  await expect(page.locator("[data-savings]")).toHaveText("20");
  await expect(page.locator("[data-result-caption]")).toHaveText(
    "20 % de descuento sobre 100.",
  );
  await expect(page.locator("[data-formula]")).toHaveText(
    "descuento = (100 × 20) ÷ 100 = 20 · final = 100 − 20 = 80",
  );
});

test("decimal results format with Spanish conventions", async ({ page }) => {
  await page.goto("/es/discount-calculator/");

  await page.getByLabel("Precio original").fill("19.99");
  await page.getByLabel("Porcentaje de descuento (%)").fill("15");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-final-price]")).toHaveText("16,99");
  await expect(page.locator("[data-savings]")).toHaveText("3");
});

test("a Spanish decimal comma is parsed as a decimal, not as thousands", async ({
  page,
}) => {
  await page.goto("/es/discount-calculator/");

  await page.getByLabel("Precio original").fill("19,99");
  await page.getByLabel("Porcentaje de descuento (%)").fill("15");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-final-price]")).toHaveText("16,99");
  await expect(page.locator("[data-savings]")).toHaveText("3");
  await expect(page.locator("[data-result-caption]")).toHaveText(
    "15 % de descuento sobre 19,99.",
  );
});

test("grouped Spanish input is parsed without losing the decimal part", async ({
  page,
}) => {
  await page.goto("/es/discount-calculator/");

  await page.getByLabel("Precio original").fill("12.345,67");
  await page.getByLabel("Porcentaje de descuento (%)").fill("10");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-final-price]")).toHaveText("11.111,1");
  await expect(page.locator("[data-savings]")).toHaveText("1234,57");
  await expect(page.locator("[data-result-caption]")).toHaveText(
    "10 % de descuento sobre 12.345,67.",
  );
});

test("ambiguous number separators show the localized error instead of a result", async ({
  page,
}) => {
  await page.goto("/es/discount-calculator/");

  await page.getByLabel("Precio original").fill("1.23.456");
  await page.getByLabel("Porcentaje de descuento (%)").fill("15");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-error-price]")).toBeVisible();
  await expect(page.locator("[data-error-text-price]")).toHaveText(
    "Revisa el formato del número: usa un solo separador decimal, por ejemplo 19,99.",
  );
  await expect(page.locator("[data-final-price]")).toHaveText("—");
});

test("the percentage calculator works in Spanish", async ({ page }) => {
  await page.goto("/es/percentage-calculator/");

  await page.getByLabel("Porcentaje (X %)").fill("25");
  await page.getByLabel("Valor (Y)").fill("80");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-result-value]")).toHaveText("20");
  await expect(page.locator("[data-result-caption]")).toHaveText("25 % de 80.");
  await expect(page.locator("[data-formula]")).toHaveText(
    "(25 ÷ 100) × 80 = 20",
  );

  await page.getByLabel("Porcentaje (X %)").fill("2,5");
  await page.getByLabel("Valor (Y)").fill("80");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(page.locator("[data-result-value]")).toHaveText("2");
  await expect(page.locator("[data-result-caption]")).toHaveText(
    "2,5 % de 80.",
  );

  await page.screenshot({
    path: "test-results/es-percentage-calculator.png",
    fullPage: true,
  });
});
