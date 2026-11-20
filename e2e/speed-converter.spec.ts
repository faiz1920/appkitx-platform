import { expect, test, type Page } from "@playwright/test";
import { prepareClipboard } from "./clipboard";
import { tabTo } from "./keyboard";

const result = (page: Page) => page.locator("[data-result]");
const resultUnit = (page: Page) => page.locator("[data-result-unit]");
const caption = (page: Page) => page.locator("[data-result-caption]");
const errorValue = (page: Page) => page.locator("[data-error-text-value]");

/*
 * Exact decimal form of Number.MAX_VALUE. Exponent notation is avoided in E2E
 * because WebKit computes 10 ** 308 one ULP high, which would reject the input
 * before the conversion under test.
 */
const maxFiniteInput = BigInt(Number.MAX_VALUE).toString();

const convert = async (page: Page, value: string) => {
  await page.getByLabel("Speed", { exact: true }).fill(value);
  await page.getByRole("button", { name: "Calculate" }).click();
};

const observeErrorMutations = (page: Page) =>
  page.evaluate(() => {
    const element = document.querySelector("[data-error-value]");
    if (!element) throw new Error("Speed error region is missing");

    const state = { count: 0 };
    const observer = new MutationObserver((records) => {
      state.count += records.length;
    });
    observer.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    const target = window as Window & {
      __speedErrorState?: { count: number };
      __speedErrorObserver?: MutationObserver;
    };
    target.__speedErrorState = state;
    target.__speedErrorObserver = observer;
  });

const stopObservingErrorMutations = (page: Page) =>
  page.evaluate(() => {
    const target = window as Window & {
      __speedErrorState?: { count: number };
      __speedErrorObserver?: MutationObserver;
    };
    target.__speedErrorObserver?.disconnect();
    return target.__speedErrorState?.count ?? 0;
  });

test("loads with the correct title, heading, and default units", async ({
  page,
}) => {
  await page.goto("/speed-converter");

  await expect(page).toHaveTitle("Speed Converter — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Speed Converter",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("Speed Converter")).toBeVisible();

  await expect(page.getByLabel("From", { exact: true })).toHaveValue("kmh");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("mph");
  await expect(page.getByLabel("From", { exact: true })).toContainText(
    "Kilometer per hour (km/h)",
  );
  await expect(page.getByLabel("To", { exact: true })).toContainText(
    "Mile per hour (mph)",
  );
  await expect(
    page.getByLabel("From", { exact: true }).locator("option"),
  ).toHaveCount(5);
  await expect(
    page.getByLabel("To", { exact: true }).locator("option"),
  ).toHaveCount(5);
});

test("converts kilometers per hour to miles per hour", async ({ page }) => {
  await page.goto("/speed-converter");
  await convert(page, "100");

  await expect(result(page)).toHaveText("62.13711922");
  await expect(resultUnit(page)).toHaveText("mph");
  await expect(caption(page)).toHaveText("100 km/h = 62.13711922 mph");

  await page.screenshot({
    path: "test-results/speed-converter.png",
    fullPage: true,
  });
});

test("converts in the opposite direction", async ({ page }) => {
  await page.goto("/speed-converter");
  await page.getByLabel("From", { exact: true }).selectOption("mph");
  await page.getByLabel("To", { exact: true }).selectOption("kmh");

  await convert(page, "60");
  await expect(result(page)).toHaveText("96.56064");
  await expect(resultUnit(page)).toHaveText("km/h");
  await expect(caption(page)).toHaveText("60 mph = 96.56064 km/h");
});

test("converts meters per second, feet per second, and knots", async ({
  page,
}) => {
  await page.goto("/speed-converter");

  await page.getByLabel("From", { exact: true }).selectOption("ms");
  await page.getByLabel("To", { exact: true }).selectOption("kmh");
  await convert(page, "1");
  await expect(result(page)).toHaveText("3.6");
  await expect(caption(page)).toHaveText("1 m/s = 3.6 km/h");

  await page.getByLabel("From", { exact: true }).selectOption("kn");
  await page.getByLabel("To", { exact: true }).selectOption("kmh");
  await convert(page, "1");
  await expect(result(page)).toHaveText("1.852");
  await expect(caption(page)).toHaveText("1 kn = 1.852 km/h");

  await page.getByLabel("From", { exact: true }).selectOption("fts");
  await page.getByLabel("To", { exact: true }).selectOption("ms");
  await convert(page, "10");
  await expect(result(page)).toHaveText("3.048");
  await expect(caption(page)).toHaveText("10 ft/s = 3.048 m/s");
});

test("validates a non-numeric value", async ({ page }) => {
  await page.goto("/speed-converter");

  await convert(page, "abc");
  await expect(page.getByLabel("Speed", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(errorValue(page)).toHaveText("Enter a valid number.");
  await expect(result(page)).toHaveText("—");
});

test("validates an empty value", async ({ page }) => {
  await page.goto("/speed-converter");

  await convert(page, "");
  await expect(page.getByLabel("Speed", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(errorValue(page)).toHaveText("Enter a valid number.");
  await expect(result(page)).toHaveText("—");
});

test("announces one accessible error and clears it on correction or reset", async ({
  page,
}) => {
  await page.goto("/speed-converter");

  const input = page.getByLabel("Speed", { exact: true });
  const error = page.locator("[data-error-value]");
  const errorText = page.locator("[data-error-text-value]");
  const calculate = page.getByRole("button", { name: "Calculate" });

  await expect(error).toHaveAttribute("role", "alert");
  await expect(error).toHaveAttribute("aria-atomic", "true");
  await expect(error).toBeHidden();

  await convert(page, "abc");
  await expect(error).toBeVisible();
  await expect(errorText).toHaveText("Enter a valid number.");
  await expect(input).toHaveAttribute("aria-invalid", "true");

  await observeErrorMutations(page);

  await calculate.click();
  await page.waitForTimeout(50);
  const duplicateMutations = await stopObservingErrorMutations(page);
  expect(
    duplicateMutations,
    "repeated invalid submissions must not rewrite the same alert",
  ).toBe(0);

  await input.fill("100");
  await expect(error).toBeHidden();
  await expect(errorText).toHaveText("");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(result(page)).toHaveText("—");

  await calculate.click();
  await expect(result(page)).toHaveText("62.13711922");
  await expect(error).toBeHidden();

  await input.fill("abc");
  await calculate.click();
  await expect(error).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(error).toBeHidden();
  await expect(errorText).toHaveText("");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

test("resets the form, units, and result", async ({ page }) => {
  await page.goto("/speed-converter");
  await page.getByLabel("From", { exact: true }).selectOption("mph");
  await page.getByLabel("To", { exact: true }).selectOption("kmh");
  await convert(page, "60");
  await expect(result(page)).toHaveText("96.56064");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel("Speed", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("From", { exact: true })).toHaveValue("kmh");
  await expect(page.getByLabel("To", { exact: true })).toHaveValue("mph");
  await expect(result(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
});

test("invalidates the result when the value or units change", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/speed-converter");

  const copy = page.getByRole("button", { name: "Copy result" });
  const value = page.getByLabel("Speed", { exact: true });
  const from = page.getByLabel("From", { exact: true });
  const to = page.getByLabel("To", { exact: true });
  const calculate = page.getByRole("button", { name: "Calculate" });

  await convert(page, "100");
  await expect(result(page)).toHaveText("62.13711922");
  await expect(copy).toBeEnabled();

  await value.fill("200");
  await expect(result(page)).toHaveText("—");
  await expect(resultUnit(page)).toHaveText("");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("124.2742384");
  await expect(copy).toBeEnabled();

  await from.selectOption("ms");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("447.3872584");
  await expect(caption(page)).toContainText("200 m/s");

  await to.selectOption("kmh");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  await calculate.click();
  await expect(result(page)).toHaveText("720");
  await expect(copy).toBeEnabled();

  await from.selectOption("kmh");
  await to.selectOption("mph");
  await value.fill("100");
  await calculate.click();
  await expect(result(page)).toHaveText("62.13711922");
  await copy.click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("100 km/h = 62.13711922 mph");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(value).toHaveValue("");
  await expect(from).toHaveValue("kmh");
  await expect(to).toHaveValue("mph");
  await expect(result(page)).toHaveText("—");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy).toBeDisabled();
});

test("reports numeric overflow without showing or copying a non-finite result", async ({
  page,
  browserName,
}) => {
  await prepareClipboard(page, browserName);
  await page.goto("/speed-converter");

  const input = page.getByLabel("Speed", { exact: true });
  const from = page.getByLabel("From", { exact: true });
  const to = page.getByLabel("To", { exact: true });
  const copy = page.getByRole("button", { name: "Copy result" });
  const error = page.locator("[data-error-value]");
  const errorText = page.locator("[data-error-text-value]");
  const overflowMessage =
    "The converted value is outside the supported numeric range. Try a value closer to zero.";

  /* A previous valid payload proves overflow does not reuse stale clipboard text. */
  await convert(page, "100");
  await expect(copy).toBeEnabled();
  await copy.click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "100 km/h = 62.13711922 mph",
  );

  /* m/s to km/h multiplies by 3.6, so the largest finite input overflows. */
  await from.selectOption("ms");
  await to.selectOption("kmh");
  await convert(page, maxFiniteInput);

  await expect(error).toBeVisible();
  await expect(error).toHaveAttribute("role", "alert");
  await expect(errorText).toHaveText(overflowMessage);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(result(page)).toHaveText("—");
  await expect(resultUnit(page)).toHaveText("");
  await expect(caption(page)).toHaveText("Results appear here");
  await expect(copy).toBeDisabled();
  await expect(page.getByText("Copied to clipboard.")).toBeHidden();
  await expect(result(page)).not.toContainText("Infinity");
  await expect(result(page)).not.toContainText("NaN");

  /* Repeating the same overflow must not re-announce the identical alert. */
  await observeErrorMutations(page);
  await page.getByRole("button", { name: "Calculate" }).click();
  await page.waitForTimeout(50);
  expect(
    await stopObservingErrorMutations(page),
    "repeated overflow submissions must not rewrite the same alert",
  ).toBe(0);

  /* Even a forced press on the disabled control must not write a failed result. */
  await copy.click({ force: true }).catch(() => undefined);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "100 km/h = 62.13711922 mph",
  );

  /* Editing clears the overflow error and the stale result. */
  await input.fill(`-${maxFiniteInput}`);
  await expect(error).toBeHidden();
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  /* Negative overflow is reported the same way. */
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(errorText).toHaveText(overflowMessage);
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();

  /* A later valid conversion recovers. */
  await input.fill("36");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(error).toBeHidden();
  await expect(result(page)).toHaveText("129.6");
  await expect(caption(page)).toHaveText("36 m/s = 129.6 km/h");
  await expect(copy).toBeEnabled();

  /* Reset clears a visible overflow error and the result. */
  await convert(page, maxFiniteInput);
  await expect(error).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(error).toBeHidden();
  await expect(errorText).toHaveText("");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(result(page)).toHaveText("—");
  await expect(copy).toBeDisabled();
});

test("is fully operable from the keyboard", async ({ page, browserName }) => {
  await page.goto("/speed-converter");

  await tabTo(page, browserName, page.getByLabel("Speed", { exact: true }));
  await page.keyboard.type("100");
  await page.keyboard.press("Enter");

  await expect(result(page)).toHaveText("62.13711922");
});

test("shows the design-system focus ring on interactive controls", async ({
  page,
  browserName,
}) => {
  await page.goto("/speed-converter");

  await tabTo(page, browserName, page.getByLabel("Speed", { exact: true }));
  const value = page.getByLabel("Speed", { exact: true });
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
  await page.goto("/speed-converter");

  const copy = page.getByRole("button", { name: "Copy result" });
  await expect(copy).toBeDisabled();

  await convert(page, "100");
  await expect(copy).toBeEnabled();
  await copy.click();
  await expect(page.getByText("Copied to clipboard.")).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe("100 km/h = 62.13711922 mph");
});

test("uses the localized page and formats numbers for Spanish", async ({
  page,
}) => {
  await page.goto("/es/speed-converter");

  await expect(page).toHaveTitle("Conversor de velocidad — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Conversor de velocidad",
  );
  await expect(page.getByLabel("Velocidad")).toBeVisible();
  await expect(page.getByLabel("De", { exact: true })).toHaveValue("kmh");
  await expect(page.getByLabel("A", { exact: true })).toHaveValue("mph");

  await page.getByLabel("Velocidad").fill("100");
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(result(page)).toHaveText("62,13711922");
  await expect(caption(page)).toHaveText("100 km/h = 62,13711922 mph");

  await page.getByLabel("Velocidad").fill("abc");
  await page.getByRole("button", { name: "Calcular" }).click();

  const error = page.locator("[data-error-value]");
  await expect(error).toHaveAttribute("role", "alert");
  await expect(error).toBeVisible();
  await expect(error).toHaveText("Introduce un número válido.");
  await expect(page.getByLabel("Velocidad")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await page.getByLabel("De", { exact: true }).selectOption("ms");
  await page.getByLabel("A", { exact: true }).selectOption("kmh");
  await page.getByLabel("Velocidad").fill(maxFiniteInput);
  await page.getByRole("button", { name: "Calcular" }).click();

  await expect(error).toBeVisible();
  await expect(error).toHaveText(
    "El valor convertido está fuera del rango numérico admitido. Prueba con un valor más cercano a cero.",
  );
  await expect(result(page)).toHaveText("—");
  await expect(
    page.getByRole("button", { name: "Copiar resultado" }),
  ).toBeDisabled();
});

test("fits a 320px viewport without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/speed-converter");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByLabel("Speed", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate" })).toBeVisible();
});
